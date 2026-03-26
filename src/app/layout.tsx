import type { Metadata } from "next";
import "@/styles/variables.css";
import "./globals.css";
import Footer from "@/components/footer/footer";
import Header from "@/components/header/header";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Quiz-a-nator NEXT",
  description: "A quiz app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
