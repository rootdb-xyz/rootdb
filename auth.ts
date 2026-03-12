import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import type { NextRequest } from "next/server";

const hasGithub = !!(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);
const hasSecret = !!process.env.AUTH_SECRET;

export const authConfigured = hasGithub && hasSecret;

const stubResponse = () =>
  new Response(
    JSON.stringify({
      error: "Auth not configured",
      hint: "Add AUTH_SECRET, AUTH_GITHUB_ID, AUTH_GITHUB_SECRET to .env.local",
    }),
    { status: 503, headers: { "Content-Type": "application/json" } }
  );

const stubHandler = (_req: NextRequest) => stubResponse();
const stubAuth = async () => null;

const {
  handlers: realHandlers,
  auth: realAuth,
  signIn: realSignIn,
  signOut: realSignOut,
} = authConfigured
  ? NextAuth({
      providers: [
        GitHub({
          clientId: process.env.AUTH_GITHUB_ID!,
          clientSecret: process.env.AUTH_GITHUB_SECRET!,
        }),
      ],
      callbacks: {
        async jwt({ token, profile }) {
          if (profile?.login) token.username = profile.login;
          return token;
        },
        async session({ session, token }) {
          if (token.sub) session.user.id = token.sub;
          if (token.username) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (session.user as any).username = token.username;
          }
          return session;
        },
      },
    })
  : {
      handlers: { GET: stubHandler, POST: stubHandler },
      auth: stubAuth,
      signIn: stubAuth,
      signOut: stubAuth,
    };

export const handlers = realHandlers;
export const auth = realAuth;
export const signIn = realSignIn;
export const signOut = realSignOut;