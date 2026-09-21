import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.profileImage,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.picture = user.image;
      }

      if (trigger === "update" && session) {
        const nextImage =
          typeof session.image === "string" || session.image === null
            ? session.image
            : session.user?.image;

        if (nextImage !== undefined) {
          token.picture = nextImage;
        }

        if (typeof session.name === "string") {
          token.name = session.name;
        } else if (typeof session.user?.name === "string") {
          token.name = session.user.name;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id;
      }
      if (session.user) {
        session.user.image =
          typeof token.picture === "string" ? token.picture : null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/Auth/Login",
  },
});
