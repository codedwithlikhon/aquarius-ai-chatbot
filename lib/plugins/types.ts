import type { UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import type { z } from "zod";
import type { ChatMessage } from "@/lib/types";

export type PluginExecutionContext = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

/**
 * @interface PluginInstance
 * @description The actual plugin object with its definition and execute method.
 */
export interface PluginInstance<T extends z.ZodObject<any> = z.ZodObject<any>> {
  name: string;
  description: string;
  inputSchema: T;
  execute: (params: z.infer<T>) => Promise<any>;
}

/**
 * @type Plugin
 * @description Defines the standard contract for any agent-executable tool.
 * It's a function that receives the execution context and returns a PluginInstance.
 */
export type Plugin<T extends z.ZodObject<any> = z.ZodObject<any>> = (
  context: PluginExecutionContext
) => PluginInstance<T>;