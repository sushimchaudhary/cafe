// DashboardLayout.js
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import DesktopSidebar from "./DesktopSidebar";
import AdminHeader from "@/components/AdminHeader";
import ToastProvider from "@/components/ToastProvider";


export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSuperUser, setIsSuperUser] = useState(false);

  useEffect(() => {
    const superUserFlag = localStorage.getItem("is_superuser") === "true";
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    setIsSuperUser(superUserFlag);

    const superUserRoutes = ["/dashboard/restaurants", "/dashboard/branches"];
    const staffRoutes = [
      "/dashboard",
      "/dashboard/orders",
      "/dashboard/menus",
      "/dashboard/table-management",
      "/dashboard/units",
      "/dashboard/category",
    ];

    if (superUserFlag && staffRoutes.includes(pathname)) {
      router.push("/dashboard/restaurants");
    } else if (!superUserFlag && superUserRoutes.includes(pathname)) {
      router.push("/dashboard");
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/login");
  };

  return (
    <SidebarProvider>
      <DashboardContainer isSuperUser={isSuperUser} handleLogout={handleLogout}>
        <ToastProvider  position="top-right" reverseOrder={false} />
        {children}
      </DashboardContainer>
    </SidebarProvider>
  );
}

function DashboardContainer({ children, isSuperUser, handleLogout }) {
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <DesktopSidebar is_superuser={isSuperUser} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader
          title="Restaurant Management"
          toggleMobileSidebar={() => setCollapsed(!collapsed)}
        />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto  p-2">
          {children}
        </main>
      </div>
    </div>
  );
}
