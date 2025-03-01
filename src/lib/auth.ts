import { MongoDBAdapter } from "@auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import clientPromise from "./mongodb";
import dbConnect from "./db";
import User from "@/models/User";
import Session from "@/models/Session";
import AccessLog from "@/models/AccessLog";
import { getServerSession } from "next-auth";
import { getClientInfo } from "@/utils/client";

export const authConfig = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        await dbConnect();
        
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("Usuário não encontrado");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Senha incorreta");
        }

        // Terminate other active sessions
        await Session.updateMany(
          { userId: user._id, isActive: true },
          { isActive: false }
        );

        // Create new session
        const deviceInfo = getClientInfo(req);
        const session = await Session.create({
          userId: user._id,
          token: Math.random().toString(36).substring(7),
          deviceInfo
        });

        // Log access
        await AccessLog.create({
          userId: user._id,
          action: 'login',
          deviceInfo
        });

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          sessionToken: session.token
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.sessionToken = user.sessionToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.sessionToken = token.sessionToken;
      }

      // Verify if session is still active
      const activeSession = await Session.findOne({
        userId: token.id,
        token: token.sessionToken,
        isActive: true
      });

      if (!activeSession) {
        throw new Error("Session expired");
      }

      // Update last activity
      await Session.findByIdAndUpdate(activeSession._id, {
        lastActivity: new Date()
      });

      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const auth = () => getServerSession(authConfig);

export const isAdmin = async () => {
  const session = await auth();
  return session?.user?.role === "admin";
};

export const requireAuth = async (isAdminRequired = false) => {
  const session = await auth();
  
  if (!session) {
    throw new Error("Não autorizado");
  }

  if (isAdminRequired && session.user.role !== "admin") {
    throw new Error("Acesso restrito a administradores");
  }

  return session;
};