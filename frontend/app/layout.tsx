import Providers from "@/components/providers/provider";
import { siteConfig } from "@/config/site";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: "SinghAstra",
      url: "https://github.com/SinghAstra",
    },
  ],
  creator: "SinghAstra",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: "/assets/landing.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/assets/landing.png"],
    creator: "@singhastra",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body
        className="antialiased min-h-screen bg-background font-grotesk "
        suppressHydrationWarning
      >
        <Providers>
          <NextTopLoader color="hsl(var(--primary))" showSpinner={false} />
          {children}
          <Toaster
            theme="dark"
            icons={{
              loading: (
                <Loader className="h-4 w-4 animate-spin text-muted-foreground" />
              ),
              error: <AlertCircle className="h-4 w-4 text-destructive" />,
              success: <CheckCircle className="h-4 w-4 text-primary" />,
            }}
            richColors={true}
            toastOptions={{
              style: {
                fontFamily: "Space Grotesk, monospace",
                color: "hsl(var(--foreground))",
                letterSpacing: "0.05em",
                fontSize: ".95rem",
                borderRadius: "var(--radius)",
                padding: "1.5em",
              },
              classNames: {
                error: "border-destructive/50 text-destructive",
                success: "border-primary/50 text-primary",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
