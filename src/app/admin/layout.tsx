import { cookies } from "next/headers";
import AdminLayoutClient from "@/components/AdminLayoutClient";
import AdminLogin from "@/components/AdminLogin";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");

  // If no token is found, we render the Login screen immediately on the server.
  // This completely restricts access without relying on redirects.
  if (!token) {
    return (
      <div className="app-container">
        <main style={{ width: "100%", margin: 0, padding: 0 }}>
          <AdminLogin />
        </main>
      </div>
    );
  }

  // If authenticated, render the actual Admin Layout with sidebar
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
