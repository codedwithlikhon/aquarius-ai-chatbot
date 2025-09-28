import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";

import { createGuestUser, getUser } from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";
import { verifyPassword } from "@/lib/security/bcrypt";
import { getDummyPassword } from "@/lib/security/dummy-password";

import { authConfig } from "./auth.config";

export type UserType = "guest" | "regular";

type CredentialsAuthorizePayload = {
  email?: unknown;
  password?: unknown;
};

const normalizeCredential = (value: unknown, label: string): string => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ChatSDKError(
      "bad_request:auth",
      `${label} is required to sign in.`
    );
  }

  return value.trim();
};

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession["user"];
  }

  // biome-ignore lint/nursery/useConsistentTypeDefinitions: "Required"
  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize(credentials: CredentialsAuthorizePayload | undefined) {
        if (!credentials) {
          return null;
        }

        const normalizedEmail = normalizeCredential(credentials.email, "Email");
        const normalizedPassword = normalizeCredential(
          credentials.password,
          "Password"
        );

        const users = await getUser(normalizedEmail);

        if (users.length === 0) {
          const dummyPassword = await getDummyPassword();
          await verifyPassword(normalizedPassword, dummyPassword);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          return null;
        }

        const passwordsMatch = await verifyPassword(
          normalizedPassword,
          user.password
        );

        if (!passwordsMatch) {
          return null;
        }

        const { password: _password, ...userWithoutPassword } = user;

        return { ...userWithoutPassword, type: "regular" };
      },
    }),
    Credentials({
      id: "guest",
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: "guest" };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }

      return session;
    },
  },
});
