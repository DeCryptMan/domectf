import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Honeypot from "@/components/security/Honeypot";
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'CyberDome | CTF Platform',
  description: 'National Level Cybersecurity Competition Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="bg-bg text-text-main min-h-screen antialiased selection:bg-accent/30 selection:text-white">
        <Honeypot />
        {children}

      </body>
    </html>
  );
}