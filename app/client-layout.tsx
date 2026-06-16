"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Header } from "@/components/layout/header";
// import { Header5 as Header } from "@/components/layout/header5";  
import { Footer } from "@/components/layout/footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <AuthProvider>
      <QueryProvider>
        {!isAdminPage && <Header />}
        <main className="flex-1">{children}</main>
        {!isAdminPage && <Footer />}
      </QueryProvider>
    </AuthProvider>
  );
}