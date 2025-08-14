import NextAuth, { type DefaultSession, CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { z } from "zod";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";

// Extend session type
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: { id: string } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // store sessions in DB
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {}, // server actions + FormData bypass this
      authorize: async (raw) => {
        // Validate input with Zod
        const parsed = z
          .object({
            email: z.email(),
            password: z.string().min(8),
          })
          .safeParse(raw);

        if (!parsed.success) throw new CredentialsSignin("Invalid input");
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) throw new CredentialsSignin("No user found with this email");
        if (!user.passwordHash)
          throw new CredentialsSignin("Invalid credentials");

        const valid = await compare(password, user.passwordHash);
        if (!valid) throw new CredentialsSignin("Invalid password");

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    // Add OAuth providers here later (Google, GitHub, etc.)
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) session.user.id = token.sub!;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  secret: process.env.AUTH_SECRET,
});
