import { generateId } from "ai";

import { hashPassword } from "../security/bcrypt";

let cachedDummyPasswordPromise: Promise<string> | null = null;

export const generateHashedPassword = async (
  password: string,
  cost?: number
): Promise<string> => {
  return hashPassword(password, cost);
};

const createDummyPassword = (): Promise<string> => {
  return hashPassword(generateId());
};

export const generateDummyPassword = async (): Promise<string> => {
  if (!cachedDummyPasswordPromise) {
    cachedDummyPasswordPromise = createDummyPassword();
  }

  return cachedDummyPasswordPromise;
};
