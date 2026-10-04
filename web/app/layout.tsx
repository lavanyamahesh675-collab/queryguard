import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QueryGuard | Relational Wire Proxy & N+1 Interceptor',
  description: 'Zero-dependency PostgreSQL wire-level proxy and N+1 query explosion interceptor with real-time telemetry.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080B10] text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
