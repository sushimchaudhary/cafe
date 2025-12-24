"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, LogIn, User } from "lucide-react";
import toast from "react-hot-toast";
import ToastProvider from "@/components/ToastProvider";

const AdminLoginPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      router.replace("/");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic Auth Header
      const authHeader = "Basic " + btoa(`${username}:${password}`);

      // Login request
      const res = await fetch(`${API_URL}/api/user/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (!res.ok || !data?.is_staff) {
        toast.error("Invalid credentials or not admin!");
        setLoading(false);
        return;
      }

      localStorage.setItem("adminToken", data.token || "");
      localStorage.setItem("username", username || "");  
      
      localStorage.setItem("first_name", data.first_name || "");
      localStorage.setItem("last_name", data.last_name || "");
      localStorage.setItem("email", data.email || "");
      localStorage.setItem("mobile_number", data.mobile_number || "");

      localStorage.setItem("restaurant_id", data.restaurant_id || "");
      localStorage.setItem("restaurant_name", data.restaurant_name || "");

      localStorage.setItem("branch_id", data.branch_id || "");
      localStorage.setItem("branch_name", data.branch_name || "");

      localStorage.setItem(
        "is_superuser",
        data.is_superuser ? "true" : "false"
      );

      // Try fetching admin details (use available admins API) to populate missing fields
      try {
        const userId = data.user_id || data.userId || data.user || null;
        if (userId) {
          const profileRes = await fetch(
            `${API_URL}/api/user/admins/${userId}/`,
            {
              headers: { Authorization: `Token ${data.token}` },
            }
          );

          if (profileRes.ok) {
            const profileJson = await profileRes.json();
            const src = profileJson?.response || profileJson?.data || profileJson;

            const firstName = src?.first_name || src?.firstName || data.first_name || "";
            const lastName = src?.last_name || src?.lastName || data.last_name || "";
            const emailAddr = src?.email || data.email || "";
            const mobile = src?.mobile_number || src?.mobile || data.mobile_number || "";
            const restaurantName = src?.restaurant_name || src?.restaurant || localStorage.getItem("restaurant_name") || "";
            const branchName = src?.branch_name || src?.branch || localStorage.getItem("branch_name") || "";

            if (firstName) localStorage.setItem("first_name", firstName);
            if (lastName) localStorage.setItem("last_name", lastName);
            if (emailAddr) localStorage.setItem("email", emailAddr);
            if (mobile) localStorage.setItem("mobile_number", mobile);
            if (restaurantName) localStorage.setItem("restaurant_name", restaurantName);
            if (branchName) localStorage.setItem("branch_name", branchName);
          }
        }
      } catch (err) {
        console.warn("Admin detail fetch failed:", err);
      }

      if (data.is_superuser) {
        const r = await fetch(`${API_URL}/api/restaurants/`, {
          headers: { Authorization: `Token ${data.token}` },
        });
        const rData = await r.json();
        const restaurantData = rData.data || [];
        localStorage.setItem("restaurants", JSON.stringify(restaurantData));
      } else if (data.restaurant_id) {
        const r = await fetch(
          `${API_URL}/api/restaurants/${data.restaurant_id}/`,
          {
            headers: { Authorization: `Token ${data.token}` },
          }
        );
        const rData = await r.json();
        const restaurantData = rData.response ? [rData.response] : [];
        localStorage.setItem("restaurants", JSON.stringify(restaurantData));

        if (restaurantData.length > 0) {
          localStorage.setItem(
            "restaurant_id",
            restaurantData[0].id || restaurantData[0]._id
          );
        }
      }

      if (data.is_superuser) {
        const b = await fetch(`${API_URL}/api/branches/`, {
          headers: { Authorization: `Token ${data.token}` },
        });
        const bData = await b.json();
        const branchData = bData.data || [];
        localStorage.setItem("branches", JSON.stringify(branchData));
      } else if (data.branch_id) {
        const b = await fetch(`${API_URL}/api/branches/${data.branch_id}/`, {
          headers: { Authorization: `Token ${data.token}` },
        });
        const bData = await b.json();
        const branchData = bData.response ? [bData.response] : [];
        localStorage.setItem("branches", JSON.stringify(branchData));

        if (branchData.length > 0) {
          localStorage.setItem(
            "branch_id",
            branchData[0].id || branchData[0]._id
          );
        }
      }

      toast.success("Login successful!");
      if (data.is_superuser) {
        router.push("/dashboard/restaurants");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 px-4 py-8">
      <ToastProvider />
      <svg
        className="absolute inset-0 w-full h-full top-0 left-0 opacity-[0.25] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="momo-pattern"
            x="0"
            y="0"
            width="150"
            height="150"
            patternUnits="userSpaceOnUse"
          >
            {/* Momo dumpling with fold details */}
            <g transform="translate(35, 50)">
              <ellipse
                cx="0"
                cy="8"
                rx="18"
                ry="5"
                fill="#d97706"
                opacity="0.3"
              />
              <circle cx="0" cy="0" r="15" fill="#f59e0b" opacity="0.4" />
              <path
                d="M -12 0 Q 0 -8 12 0"
                stroke="#d97706"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M -10 -2 Q 0 -10 10 -2"
                stroke="#d97706"
                strokeWidth="1.5"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M -8 -4 Q 0 -12 8 -4"
                stroke="#d97706"
                strokeWidth="1"
                fill="none"
                opacity="0.4"
              />
              {/* Steam */}
              <path
                d="M -8 -18 Q -6 -25 -8 -32"
                stroke="#f59e0b"
                strokeWidth="2"
                fill="none"
                opacity="0.3"
                strokeLinecap="round"
              />
              <path
                d="M 0 -20 Q 2 -27 0 -34"
                stroke="#f59e0b"
                strokeWidth="2"
                fill="none"
                opacity="0.3"
                strokeLinecap="round"
              />
              <path
                d="M 8 -18 Q 10 -25 8 -32"
                stroke="#f59e0b"
                strokeWidth="2"
                fill="none"
                opacity="0.3"
                strokeLinecap="round"
              />
            </g>

            {/* Decorative plate with food */}
            <g transform="translate(100, 100)">
              <ellipse
                cx="0"
                cy="0"
                rx="25"
                ry="8"
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
                opacity="0.4"
              />
              <ellipse
                cx="0"
                cy="-2"
                rx="28"
                ry="6"
                fill="#f59e0b"
                opacity="0.2"
              />
              <circle cx="-8" cy="-8" r="6" fill="#d97706" opacity="0.4" />
              <circle cx="0" cy="-10" r="6" fill="#d97706" opacity="0.4" />
              <circle cx="8" cy="-8" r="6" fill="#d97706" opacity="0.4" />
            </g>

            {/* Fork and spoon icons */}
            <g transform="translate(115, 35)" opacity="0.25">
              <rect x="0" y="0" width="1.5" height="25" fill="#d97706" />
              <circle cx="0.75" cy="-2" r="2" fill="#d97706" />
              <circle cx="0.75" cy="-6" r="2" fill="#d97706" />
              <circle cx="0.75" cy="-10" r="2" fill="#d97706" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#momo-pattern)" />
      </svg>

      <div className="z-10 bg-white/90 rounded-2xl shadow-2xl p-8 md:p-10 w-full max-w-md border border-amber-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-3xl font-bold text-amber-600 mb-2">
            Admin Login
          </h2>
          <p className="text-gray-600 text-sm">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="w-full pl-11 pr-4 py-3 border border-amber-300 rounded-xl
              focus:ring-2 focus:ring-amber-400 focus:border-amber-400
              outline-none transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full pl-11 pr-12 py-3 border border-amber-300 rounded-xl
              focus:ring-2 focus:ring-amber-400 focus:border-amber-400
              outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-3 rounded-xl
          font-semibold shadow-lg transition duration-300
          hover:bg-amber-700 focus:ring-2 focus:ring-amber-400
          disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Login
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
