import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TUDO | Your Productivity Companion",
    template: "%s | TUDO",
  },
  description:
    "Organize, prioritize, and conquer your tasks with TUDO - The ultimate todo app built with Next.js for seamless performance.",
  keywords: [
    "todo app",
    "productivity",
    "task management",
    "next.js",
    "organize tasks",
    "time management",
  ],
  authors: [
    {
      name: "Vinayak Gore",
      url: "https://yourwebsite.com",
    },
  ],
  creator: "Vinayak Gore",
  openGraph: {
    title: "TUDO | Your Productivity Companion",
    description: "Organize, prioritize, and conquer your tasks with TUDO",
    url: "https://tudo-app.vercel.app",
    siteName: "TUDO App",
    images: [
      {
        url: "https://tudo-app.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "TUDO App - Task Management",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TUDO | Your Productivity Companion",
    description: "Organize, prioritize, and conquer your tasks with TUDO",
    images: ["https://tudo-app.vercel.app/og-image.png"],
    creator: "@yourtwitterhandle",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <Toaster position="top-right" />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
