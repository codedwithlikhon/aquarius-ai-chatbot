import "server-only";

import { generateDummyPassword } from "@/lib/db/utils";

let cachedDummyPassword: string | null = null;

export const getDummyPassword = async (): Promise<string> => {
  if (!cachedDummyPassword) {
    cachedDummyPassword = await generateDummyPassword();
  }

  return cachedDummyPassword;
};
