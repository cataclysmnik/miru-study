import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { AcademicProvider } from "@/components/academic-provider";
import { AIProvider } from "@/components/ai-provider";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Miru — Personal Academic Workspace & Learning OS",
  description: "Mindful, syllabus-aware personal academic operating system for university scholars.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AcademicProvider>
              <AIProvider>
                <AppShell>{children}</AppShell>
              </AIProvider>
            </AcademicProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
