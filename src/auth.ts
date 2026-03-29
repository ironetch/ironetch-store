import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import AzureADProvider from "next-auth/providers/azure-ad"
import bcrypt from "bcrypt"
import fs from "fs"
import path from "path"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    } as any),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          const dataPath = path.join(process.cwd(), 'src/data/users.json');
          if (!fs.existsSync(dataPath)) return null;
          const fileData = fs.readFileSync(dataPath, 'utf8');
          const users = JSON.parse(fileData);
          
          const user = users.find((u: any) => u.email === credentials.email);
          if (!user) return null;
          
          const passwordsMatch = await bcrypt.compare(credentials.password as string, user.passwordHash);
          if (passwordsMatch) {
            return { id: user.id, email: user.email, name: user.name };
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
})
