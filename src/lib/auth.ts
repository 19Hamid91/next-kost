import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getSheetData } from "./google-sheets";

interface MasterUser {
  Username: string;
  Password: string;
  Nama?: string;
}

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
          const users = await getSheetData<MasterUser>('Master_User');
          const user = users.find((u) =>
            u.Username === credentials.username && u.Password === credentials.password
          );

          if (user) {
            return { id: user.Username, name: user.Nama || user.Username, email: user.Username };
          }
          return null;
        } catch (error) {
          console.error('[Auth.authorize]', error);
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
