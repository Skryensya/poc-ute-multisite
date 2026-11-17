import type { Metadata } from "next";
import { headers } from "next/headers";
import { hostFrom, resolveTenant } from "@/lib/tenants";
import { getHomeDataCached } from "@/lib/strapi";
import Providers from "@/components/Providers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = resolveTenant(hostFrom(await headers()));
  if (!tenant) return { title: "No encontrado" };
  const { site } = await getHomeDataCached(tenant);
  return { title: site.title, description: site.description };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-white text-slate-800 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
