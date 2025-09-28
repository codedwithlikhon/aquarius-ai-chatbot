import { generateId } from "ai";
import { hashPassword } from "../security/bcrypt";

export const generateHashedPassword = (password: string): Promise<string> => {
  return hashPassword(password);
};

export const generateDummyPassword = (): Promise<string> => {
  const password = generateId();
  return generateHashedPassword(password);
};
