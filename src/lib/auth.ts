import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getSheetData } from "./google-sheets";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          const users = await getSheetData('Master_User');
          console.log("Auth Debug - Credentials:", { username: credentials.username });
          console.log("Auth Debug - Users from Sheet:", users);

          const user = users.find((u: any) =>
            u.Username === credentials.username && u.Password === credentials.password
          );

          if (user) {
            console.log("Auth Debug - User found:", user.Username);
            return { id: user.Username, name: user.Nama || user.Username, email: user.Username };
          }
          console.log("Auth Debug - No match found");
          return null;
        } catch (error) {
          console.error("Auth Error:", error);
          return null;
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
};
