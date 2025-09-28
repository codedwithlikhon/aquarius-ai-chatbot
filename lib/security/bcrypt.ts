import { ChatSDKError } from "../errors";

type BcryptModule = typeof import("@node-rs/bcrypt");

const EDGE_RUNTIME_KEY = "EdgeRuntime";

const runtimeCache: {
  module?: Promise<BcryptModule>;
} = {};

const isEdgeRuntime = () => {
  return (
    typeof (globalThis as { EdgeRuntime?: string })[EDGE_RUNTIME_KEY] ===
    "string"
  );
};

const loadBcryptModule = (): Promise<BcryptModule> => {
  if (!runtimeCache.module) {
    runtimeCache.module = isEdgeRuntime()
      ? (import("@node-rs/bcrypt-wasm32-wasi") as Promise<BcryptModule>)
      : import("@node-rs/bcrypt");
  }

  return runtimeCache.module;
};

export const hashPassword = async (
  password: string,
  cost: number
): Promise<string> => {
  try {
    const module = await loadBcryptModule();
    return await module.hash(password, cost);
  } catch (_error) {
    throw new ChatSDKError("bad_request:auth", "Failed to hash password.");
  }
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    const module = await loadBcryptModule();
    return await module.compare(password, hashedPassword);
  } catch (_error) {
    throw new ChatSDKError("bad_request:auth", "Failed to verify password.");
  }
};
