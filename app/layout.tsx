import type { Metadata } from "next";
import { inter } from "@/app/ui/fonts";
import "./globals.css";
import Footer from "@/app/ui/footer";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import Header from "@/app/ui/header";

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "An expense tracker that uses AI to categorize your expenses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.className}`}
        >
          <Header />
          <main className="min-h-[100vh]">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
