"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Store, Building2, Table, LogOut, UndoDotIcon, Cat } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  const [adminName, setAdminName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [branchName, setBranchName] = useState("");

 useEffect(() => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    console.log("No token found, redirecting to login");
    router.push("/");
    return;
  }

  // 🔥 Fetch stored info
  const username = localStorage.getItem("username");
  const restaurant_id = localStorage.getItem("restaurant_id");
  const branch_id = localStorage.getItem("branch_id");

  console.log("Dashboard localStorage:", {
    username,
    restaurant_id,
    branch_id,
  });

  setAdminName(username || "Admin");
  setRestaurantName(restaurant_id || "N/A");
  setBranchName(branch_id || "N/A");
}, []);


// useEffect(() => {
//   const token = localStorage.getItem("adminToken");

//   if (!token) {
//     router.push("/");
//     return;
//   }

//   const username = localStorage.getItem("username");
//   const restaurant_id = localStorage.getItem("restaurant_id");
//   const branch_id = localStorage.getItem("branch_id");

//   setAdminName(username || "Admin");

//   // 🔍 Fetch Restaurant Object by ID
//   if (restaurant_id) {
//     fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/restaurants/${restaurant_id}/`, {
//       headers: {
//         Authorization: `Token ${token}`,
//       },
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("Restaurant Object:", data); // 👈 FULL OBJECT HERE
//         setRestaurantName(data?.name || "N/A");
//       })
//       .catch((err) => console.log("Restaurant Error:", err));
//   }

//   // 🔍 Fetch Branch Object by ID
//   if (branch_id) {
//     fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/branches/${branch_id}/`, {
//       headers: {
//         Authorization: `Token ${token}`,
//       },
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("Branch Object:", data); // 👈 FULL OBJECT HERE
//         setBranchName(data?.name || "N/A");
//       })
//       .catch((err) => console.log("Branch Error:", err));
//   }
// }, []);


  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-amber-600 text-white p-6 space-y-6">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

        <nav className="space-y-2">
          <button
            className="flex items-center gap-3 p-3 rounded hover:bg-amber-700 w-full text-left"
            onClick={() => router.push("/dashboard")}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>

          <button
            className="flex items-center gap-3 p-3 rounded hover:bg-amber-700 w-full text-left"
            onClick={() => router.push("/dashboard/restaurants")}
          >
            <Store size={20} /> Restaurants
          </button>

          <button
            className="flex items-center gap-3 p-3 rounded hover:bg-amber-700 w-full text-left"
            onClick={() => router.push("/dashboard/branches")}
          >
            <Building2 size={20} /> Branches
          </button>
          <button
            className="flex items-center gap-3 p-3 rounded hover:bg-amber-700 w-full text-left"
            onClick={() => router.push("/dashboard/menus")}
          >
            <Table size={20} /> Menus
          </button>

          <button
            className="flex items-center gap-3 p-3 rounded hover:bg-amber-700 w-full text-left"
            onClick={() => router.push("/dashboard/table-management")}
          >
            <Table size={20} /> Tables
          </button>


          <button
            className="flex items-center gap-3 p-3 rounded hover:bg-amber-700 w-full text-left"
            onClick={() => router.push("/dashboard/units")}
          >
            <UndoDotIcon size={20} /> Units
          </button>

          <button
            className="flex items-center gap-3 p-3 rounded hover:bg-amber-700 w-full text-left"
            onClick={() => router.push("/dashboard/category")}
          >
            <Cat size={20} /> categories
          </button>

          <button
            className="flex items-center gap-3 p-3 rounded bg-red-500 mt-10 hover:bg-red-600 w-full text-left"
            onClick={handleLogout}
          >
            <LogOut size={20} /> <a href="/auth/login">logout</a>
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-amber-700">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome, <strong>{adminName}</strong>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-amber-600">Restaurant</h3>
            <p className="text-gray-700 mt-1">{restaurantName}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-amber-600">Branch</h3>
            <p className="text-gray-700 mt-1">{branchName}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-amber-600">Role</h3>
            <p className="text-gray-700 mt-1">Admin</p>
          </div>
        </div>
      </main>
    </div>
  );
}
