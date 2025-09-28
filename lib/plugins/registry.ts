import {
  createDocumentPlugin,
  getWeatherPlugin,
  requestSuggestionsPlugin,
  updateDocumentPlugin,
} from "./core";
import { browserCUAPlugin } from "./cua";
import type { Plugin } from "./types";

/**
 * @const pluginRegistry
 * @description A list of all available plugin factories for the agent.
 * The orchestrator uses this list to instantiate plugins with the
 * necessary context and find the correct tool to execute.
 */
export const pluginRegistry: Plugin[] = [
  createDocumentPlugin,
  getWeatherPlugin,
  requestSuggestionsPlugin,
  updateDocumentPlugin,
  browserCUAPlugin,
];