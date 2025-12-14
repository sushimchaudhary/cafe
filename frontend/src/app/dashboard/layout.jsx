"use client";

import { useRouter } from "next/navigation";
import DesktopSidebar from "./DesktopSidebar";
import MobileSidebar from "./MobileSidebar";


export default function DashboardLayout({ children }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <>
      <DesktopSidebar
        router={router}
        handleLogout={handleLogout}
      >
        {children}
      </DesktopSidebar>

      <MobileSidebar
        router={router}
        handleLogout={handleLogout}
      >
        {children}
      </MobileSidebar>
    </>
  );
}
