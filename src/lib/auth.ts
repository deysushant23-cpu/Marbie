import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";


export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        idToken: { label: "ID Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.idToken) return null;

        try {
          // Verify the Firebase ID Token using Google Identity Toolkit REST API
          // This avoids needing firebase-admin and a service account JSON!
          const apiKey = "AIzaSyCzBIYqsgYaQLessLcPDla3gxsK1sGAhe0";
          const verifyRes = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken: credentials.idToken }),
            }
          );
          
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.users || verifyData.users.length === 0) {
            console.error("Firebase ID Token Verification failed:", verifyData);
            return null;
          }

          const firebaseUser = verifyData.users[0];
          const phoneNumber = firebaseUser.phoneNumber; // e.g. "+919876543210"

          if (!phoneNumber) return null;

          // Look up or create the user in the database
          let user = await prisma.user.findFirst({
            where: { phone: phoneNumber },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                phone: phoneNumber,
                name: `User ${phoneNumber.slice(-4)}`, // Default name based on last 4 digits
              },
            });
          }

          return user;
        } catch (error) {
          console.error("Phone Auth Error:", error);
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).phone = token.phone as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
