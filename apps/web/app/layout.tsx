import { Providers } from "@/components/providers";
import { siteConfig } from "@/config/site";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import "./globals.css";

import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
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
        url: "/landing.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/landing.png"],
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
    <html lang="en" className={`${geistMono.variable}`}>
      <body
        className={`${geistMono.className} font-sans antialiased min-h-screen bg-background`}
        suppressHydrationWarning
      >
        <Providers>
          <NextTopLoader color="var(--primary)" showSpinner={false} />
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
                fontFamily: "var(--font-mono), monospace",
                color: "var(--foreground)",
                letterSpacing: "0.05em",
                fontSize: ".95rem",
                borderRadius: "var(--radius)",
                padding: "1.25em",
              },
              classNames: {
                error:
                  "border-destructive/30 bg-destructive/5 text-destructive",
                success: "border-primary/30 bg-primary/5 text-primary",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
