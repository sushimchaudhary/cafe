"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, List, PlusCircle, Table, LayoutGrid } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false); // Desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false); // Mobile menu
  const dropdownRef = useRef(null);

  // Auto collapse on scroll for desktop
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth > 768) {
        setCollapsed(window.scrollY > 80);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside to close mobile sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  const sidebarWidth = collapsed ? "w-20" : "w-64";

  // Function to handle link click
  const handleLinkClick = () => {
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* MOBILE TOP TOGGLE BUTTON */}
      {!mobileOpen && (
        <div className="md:hidden fixed top-5 right-2 z-50">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-3 text-amber-800 rounded-full"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* SIDEBAR MAIN */}
      <div
        ref={dropdownRef}
        className={`
          fixed left-0 top-0 h-screen bg-white/80 backdrop-blur-xl shadow-xl border-r border-gray-200
          transition-all duration-300 ease-in-out z-40
          ${sidebarWidth}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* LOGO / HEADING */}
        <div className="p-2 flex items-center justify-between">
          <h2
            className={`text-2xl font-bold text-gray-800 transition-all duration-300 ${
              collapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            Admin
          </h2>

          {/* Mobile Close Button */}
          <div className="md:hidden">
            <button onClick={() => setMobileOpen(false)}>
              <X className="w-7 h-7 text-gray-700" />
            </button>
          </div>
        </div>

        {/* NAV LIST */}
        <nav className="flex flex-col gap-3 px-3 mt-3">
          <SidebarLink
            href="/dashboard/resturant"
            title="Resturant"
            icon={<Table />}
            collapsed={collapsed}
            active={pathname === "/dashboard/resturant"}
            onLinkClick={handleLinkClick}
          />

          <SidebarLink
            href="/dashboard/branch"
            title="Branch"
            icon={<LayoutGrid />}
            collapsed={collapsed}
            active={pathname === "/dashboard/branch"}
            onLinkClick={handleLinkClick}
          />

          <SidebarLink
            href="/dashboard"
            title="Orders Dashboard"
            icon={<List />}
            collapsed={collapsed}
            active={pathname === "/dashboard"}
            onLinkClick={handleLinkClick}
          />

          <SidebarLink
            href="/dashboard/add-items"
            title="Add Menu Item"
            icon={<PlusCircle />}
            collapsed={collapsed}
            active={pathname === "/dashboard/add-items"}
            onLinkClick={handleLinkClick}
          />

          <SidebarLink
            href="/dashboard/table-management"
            title="Add Table"
            icon={<Table />}
            collapsed={collapsed}
            active={pathname === "/dashboard/table-management"}
            onLinkClick={handleLinkClick}
          />

          <SidebarLink
            href="/dashboard/menu-category"
            title="Menu Categories"
            icon={<LayoutGrid />}
            collapsed={collapsed}
            active={pathname === "/dashboard/menu-category"}
            onLinkClick={handleLinkClick}
          />
        </nav>
      </div>
    </>
  );
}

function SidebarLink({ href, title, icon, collapsed, active, onLinkClick }) {
  return (
    <Link
      href={href}
      onClick={onLinkClick} // Auto close mobile menu on click
      className={`
        flex items-center gap-4 p-3 rounded-xl transition-all group
        ${
          active
            ? "bg-amber-100 text-amber-700 font-semibold"
            : "text-gray-700 hover:bg-gray-100"
        }
      `}
    >
      <span className="text-gray-800">{icon}</span>
      <span
        className={`
          transition-all duration-300 whitespace-nowrap
          ${
            collapsed
              ? "opacity-0 translate-x-5 w-0 overflow-hidden"
              : "opacity-100 translate-x-0 w-auto"
          }
        `}
      >
        {title}
      </span>
    </Link>
  );
}
