import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 365 * 24 * 60 * 60, // 1 year - persists until explicit sign out
  },
  jwt: {
    maxAge: 365 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      id: "phone-pin-otp",
      name: "Phone + PIN",
      credentials: {
        phone: { label: "Phone", type: "text" },
        verifiedToken: { label: "Verified Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.verifiedToken) return null;

        try {
          // Look up the OtpToken record that was marked as verified
          const otpRecord = await prisma.otpToken.findFirst({
            where: {
              phone: credentials.phone,
              expires: { gt: new Date() },
            },
            orderBy: { createdAt: "desc" },
          });

          if (!otpRecord) {
            console.error("No valid OTP record found for phone:", credentials.phone);
            return null;
          }

          // Verify the token matches what server issued
          const isTokenValid = await bcrypt.compare(
            `${credentials.phone}:verified`,
            credentials.verifiedToken
          );

          if (!isTokenValid) {
            console.error("Invalid verified token");
            return null;
          }

          // Clean up OTP record
          await prisma.otpToken.deleteMany({ where: { phone: credentials.phone } });

          // Upsert user
          let user = await prisma.user.findFirst({
            where: { phone: credentials.phone },
          });

          if (!user) {
            // New user — use data from the OTP record
            user = await prisma.user.create({
              data: {
                phone: credentials.phone,
                email: otpRecord.email ?? undefined,
                name: otpRecord.email
                  ? otpRecord.email.split("@")[0]
                  : `User ${credentials.phone.slice(-4)}`,
                pin: otpRecord.pinHash ?? undefined,
                joinDate: new Date().toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                }),
              },
            });
          }

          return user;
        } catch (error) {
          console.error("Auth Error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as any).phone;
        token.email = (user as any).email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).phone = token.phone as string;
        if (!session.user.email && token.email) {
          session.user.email = token.email as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
