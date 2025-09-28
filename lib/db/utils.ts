import { generateId } from "ai";
import { hashPassword } from "../security/bcrypt";

const BCRYPT_COST = 10 as const;

export const generateHashedPassword = (password: string): Promise<string> => {
  return hashPassword(password, BCRYPT_COST);
};

export const generateDummyPassword = (): Promise<string> => {
  const password = generateId();
  return generateHashedPassword(password);
};
