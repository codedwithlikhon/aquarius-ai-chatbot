# Computer-Using Agent Integration Guide

This project is designed to work with OpenAI's Computer-Using Agent (CUA) flows for browser-based automation. Use this guide when adding or updating computer-use features so that agents remain reliable and secure.

## Environment Setup
- **Sandbox the runtime.** Run the automation stack inside a container or VM with no host credentials (e.g., Docker with `env={}` and extensions disabled) to avoid prompt-injection side effects.
- **Browser automation.** Use Playwright (JavaScript or Python) with Chromium configured to disable file-system access and extensions. Launch windows at `1024x768` to match the prompts expected by the agent.
- **Non-browser workflows.** For desktop-style tasks, spin up an Ubuntu container with Xvfb, x11vnc, and xdotool. Expose port `5900` for VNC and execute actions via helper scripts that proxy model requests into xdotool commands.

## Agent Loop
1. **Initial request.** Call the `computer-use-preview` model with the `computer_use_preview` tool enabled, `truncation="auto"`, and an initial screenshot if available.
2. **Process responses.** The model returns `computer_call` actions (`click`, `scroll`, `type`, `keypress`, `wait`, or `screenshot`). Execute them against the active page or VM session.
3. **Send updates.** After each action, capture a fresh screenshot. Reply with a `computer_call_output` payload referencing the prior `call_id`.
4. **Repeat.** Continue until the model stops emitting `computer_call` items. Always include any `reasoning` items when chaining requests via `previous_response_id`.

## Safety Checks
- Monitor `pending_safety_checks` in each response. Before executing the next action, surface warnings (e.g., `malicious_instructions`, `irrelevant_domain`, `sensitive_domain`) to a human operator and include `acknowledged_safety_checks` in the follow-up request once approved.
- Keep the automation loop idle until the safety check is acknowledged to prevent unreviewed actions.

## Helper Implementations
- **Browser (Playwright JS/TS):** Map `click`, `scroll`, `keypress`, and `type` to the respective `page.mouse` and `page.keyboard` calls. Use `page.screenshot()` to capture state after each action.
- **Browser (Playwright Python):** Mirror the JS helpers using `page.mouse.click`, `page.evaluate("window.scrollBy(...)")`, and `page.screenshot()`.
- **Docker VM (Node.js):** Use `xdotool` via `docker exec` to simulate input. Maintain a helper that maps model button names to xdotool button IDs and handles scroll gestures via repeated clicks of buttons `4` and `5`.
- **Docker VM (Python):** Provide analogous helpers calling `xdotool` and `import -window root png:-` for screenshots.

## Operational Guidance
- Keep a human in the loop for high-risk interactions and sensitive domains.
- Log executed actions and screenshots for auditability; redact secrets before storage.
- Combine CUA outputs with Code Interpreter sessions when tasks require local computation or file handling—run Interpreter jobs in isolated sandboxes separate from the browser automation stack.
- Regularly review automation transcripts to refine guardrails and update the prompt templates used to launch agents.

