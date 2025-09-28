<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="/images/aquarius-logo-dark.svg">
    <img alt="Aquarius AI Copilot" src="/images/aquarius-logo-light.svg" width="160" height="160">
  </picture>
</p>

<h1 align="center">Aquarius AI Copilot Agent</h1>

<p align="center">
  Aquarius AI Copilot Agent is an open-source, production-grade multi-agent chat platform for computer-using agents, proudly crafted by <a href="https://t.me/likhonsheikh">Likhon Sheikh</a>.
</p>

<p align="center">
  <a href="https://chat-sdk.dev"><strong>Read Docs</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a>
</p>
<br/>

## Features

- **Agentic orchestration**
  - Modular multi-agent workflows with tool calling, artifact streaming, and resumable sessions
  - Sandbox-ready computer-using agents (CUA) with safety guards and audit trails
- **Next.js App Router foundation**
  - React Server Components, Server Actions, and optimized routing for production scale
  - Accessible UI built with [shadcn/ui](https://ui.shadcn.com) and [Tailwind CSS](https://tailwindcss.com)
- **AI SDK integration**
  - Unified API for LLM chat, function calls, and structured outputs
  - Works with xAI (default), OpenAI, Fireworks, and other gateway providers
- **Typed persistence**
  - [Neon Serverless Postgres](https://vercel.com/marketplace/neon) via Drizzle ORM helpers
  - Redis-backed streaming buffers and artifact storage with resumable recovery
- **Secure authentication**
  - [Auth.js](https://authjs.dev) guest and password flows with entitlements and rate limiting

## Model Providers

Aquarius AI Copilot Agent uses the [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) to access multiple AI models through a unified interface. The default configuration includes [xAI](https://x.ai) models (`grok-2-vision-1212`, `grok-3-mini`) routed through the gateway.

### AI Gateway Authentication

**For Vercel deployments**: Authentication is handled automatically via OIDC tokens.

**For non-Vercel deployments**: You need to provide an AI Gateway API key by setting the `AI_GATEWAY_API_KEY` environment variable in your `.env.local` file.

With the [AI SDK](https://ai-sdk.dev/docs/introduction), you can also switch to direct LLM providers like [OpenAI](https://openai.com), [Anthropic](https://anthropic.com), [Cohere](https://cohere.com/), and [many more](https://ai-sdk.dev/providers/ai-sdk-providers) with just a few lines of code.

## Deploy Your Own

You can deploy your own version of Aquarius AI Copilot Agent to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/templates/next.js/nextjs-ai-chatbot)

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Aquarius AI Copilot Agent. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various AI and authentication provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your Aquarius deployment should now be running on [localhost:3000](http://localhost:3000).
