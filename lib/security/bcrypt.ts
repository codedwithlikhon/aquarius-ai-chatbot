import type { hash as hashNodeFn } from "@node-rs/bcrypt";
import type { hash as hashWasmFn } from "@node-rs/bcrypt-wasm32-wasi";
import { ChatSDKError } from "../errors";

// The node build exposes `compare` while the wasm build exposes `verify`.
type NodeBcryptModule = {
  hash: typeof hashNodeFn;
  compare: (password: string, hashedPassword: string) => Promise<boolean>;
};

type WasmBcryptModule = {
  hash: typeof hashWasmFn;
  verify: (password: string, hashedPassword: string) => Promise<boolean>;
};

type BcryptAdapter = {
  hash(password: string, cost: number): Promise<string>;
  compare(password: string, hashedPassword: string): Promise<boolean>;
};

const EDGE_RUNTIME_KEY = "EdgeRuntime";
const DEFAULT_COST = 10;
const MIN_COST = 4;
const MAX_COST = 31;

let cachedCost: number | null = null;

const runtimeCache: {
  module?: Promise<BcryptAdapter>;
} = {};

const isEdgeRuntime = (): boolean => {
  return (
    typeof (globalThis as { EdgeRuntime?: string })[EDGE_RUNTIME_KEY] ===
    "string"
  );
};

const parseBcryptCost = (): number => {
  const rawValue = process.env.BCRYPT_COST;

  if (!rawValue) {
    return DEFAULT_COST;
  }

  const parsed = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(parsed) || parsed < MIN_COST || parsed > MAX_COST) {
    console.warn(
      `Invalid BCRYPT_COST "${rawValue}". Falling back to default cost ${DEFAULT_COST}.`
    );

    return DEFAULT_COST;
  }

  return parsed;
};

const getNormalizedCost = (cost?: number): number => {
  const fallback = getBcryptCost();

  if (cost === undefined) {
    return fallback;
  }

  if (!Number.isInteger(cost) || cost < MIN_COST || cost > MAX_COST) {
    console.warn(
      `Received unsupported bcrypt cost "${cost}". Using ${fallback} instead.`
    );

    return fallback;
  }

  return cost;
};

const ensureNonEmptyString = (value: string, label: string): string => {
  if (value.length === 0) {
    throw new ChatSDKError("bad_request:auth", `${label} must not be empty.`);
  }

  return value;
};

const createNodeAdapter = (module: NodeBcryptModule): BcryptAdapter => ({
  hash(password, cost) {
    return module.hash(password, cost);
  },
  compare(password, hashedPassword) {
    return module.compare(password, hashedPassword);
  },
});

const createWasmAdapter = (module: WasmBcryptModule): BcryptAdapter => ({
  hash(password, cost) {
    return module.hash(password, cost);
  },
  compare(password, hashedPassword) {
    return module.verify(password, hashedPassword);
  },
});

const loadBcryptModule = (): Promise<BcryptAdapter> => {
  if (!runtimeCache.module) {
    runtimeCache.module = (async () => {
      if (isEdgeRuntime()) {
        const module = (await import(
          "@node-rs/bcrypt-wasm32-wasi"
        )) as WasmBcryptModule;
        return createWasmAdapter(module);
      }

      const module = (await import("@node-rs/bcrypt")) as NodeBcryptModule;
      return createNodeAdapter(module);
    })().catch((error) => {
      runtimeCache.module = undefined;
      throw error;
    });
  }

  return runtimeCache.module;
};

const getErrorCause = (error: unknown): string | undefined => {
  if (error instanceof ChatSDKError) {
    return error.cause;
  }

  if (error instanceof Error) {
    return error.message;
  }
};

export const getBcryptCost = (): number => {
  if (cachedCost === null) {
    cachedCost = parseBcryptCost();
  }

  return cachedCost;
};

export const hashPassword = async (
  password: string,
  cost?: number
): Promise<string> => {
  const normalizedPassword = ensureNonEmptyString(password, "Password");
  const normalizedCost = getNormalizedCost(cost);

  try {
    const module = await loadBcryptModule();
    return await module.hash(normalizedPassword, normalizedCost);
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:auth",
      getErrorCause(error) ?? "Failed to hash password."
    );
  }
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const normalizedPassword = ensureNonEmptyString(password, "Password");
  const normalizedHash = ensureNonEmptyString(
    hashedPassword,
    "Hashed password"
  );

  try {
    const module = await loadBcryptModule();
    return await module.compare(normalizedPassword, normalizedHash);
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:auth",
      getErrorCause(error) ?? "Failed to verify password."
    );
  }
};
