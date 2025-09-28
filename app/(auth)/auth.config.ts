import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/",
  },
  providers: [
    // added later in auth.ts since it wires in credential providers that depend on
    // server-side hashing utilities and should not be imported in edge-safe contexts
  ],
  callbacks: {},
} satisfies NextAuthConfig;
