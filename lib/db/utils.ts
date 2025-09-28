import { hash } from "@node-rs/bcrypt";
import { generateId } from "ai";
import { ChatSDKError } from "../errors";

const BCRYPT_COST = 10 as const;

export async function generateHashedPassword(password: string) {
  try {
    const hashedPassword = await hash(password, BCRYPT_COST);

    return hashedPassword;
  } catch (_error) {
    throw new ChatSDKError("bad_request:auth", "Failed to hash password.");
  }
}

export async function generateDummyPassword() {
  const password = generateId();
  const hashedPassword = await generateHashedPassword(password);

  return hashedPassword;
}
