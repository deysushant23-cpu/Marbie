import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import MaintenanceScreen from "@/components/MaintenanceScreen";
import { AuthProvider } from "@/components/AuthProvider";
import WingmanChat from "@/components/WingmanChat";
import ReviewPromptPopup from "@/components/ReviewPromptPopup";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await prisma.siteConfig.findFirst();
  const isMaintenanceMode = config?.isMaintenanceMode || false;
  
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("marbie_admin_session");
  const isAdminLoggedin = adminSession?.value === "authenticated";

  if (isMaintenanceMode && !isAdminLoggedin) {
    return <MaintenanceScreen />;
  }

  return (
    <AuthProvider>
      <Navbar />
      {isMaintenanceMode && (
        <div style={{ backgroundColor: "var(--color-error)", color: "white", textAlign: "center", padding: "8px", position: "fixed", top: 0, left: 0, width: "100%", zIndex: 10000, fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em" }}>
          ⚠️ MAINTENANCE MODE IS ACTIVE (ADMIN PREVIEW)
        </div>
      )}
      <div style={{ paddingTop: isMaintenanceMode ? "112px" : "80px" }}>{children}</div>
      <WingmanChat />
      <ReviewPromptPopup />
      <Footer />
    </AuthProvider>
  );
}
