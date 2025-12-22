"use client";

import ToastProvider from "@/components/ToastProvider";
import { Lock, Mail, MapPin, Phone, User, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminRegisterPage({
  adminData = null,

  closeModal,
}) {
  const [restaurants, setRestaurants] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [adminToken, setAdminToken] = useState("");

  const [form, setForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile_number: "",
    address: "",
    restaurant: "",
    branch: "",
  });

  // Fetch token on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Admin token not found. Please login first.");
      return;
    }
    setAdminToken(token);

    fetchRestaurants(token);
    fetchBranches(token);
  }, []);

  const fetchRestaurants = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/restaurants/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      const data = await res.json();
      setRestaurants(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch restaurants.");
    }
  };

  const fetchBranches = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/branches/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch branches");
      const data = await res.json();
      setBranches(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch branches.");
    }
  };

  // Filter branches based on selected restaurant
  useEffect(() => {
    if (form.restaurant) {
      const filtered = branches.filter(
        (b) => b.restaurant_reference_id === form.restaurant
      );
      setFilteredBranches(filtered);
    } else {
      setFilteredBranches([]);
    }
    setForm((prev) => ({ ...prev, branch: "" }));
  }, [form.restaurant, branches]);

  useEffect(() => {
    if (adminData) {
      setForm({
        username: adminData.username,
        password: "", // leave empty for security
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        email: adminData.email,
        mobile_number: adminData.mobile_number,
        address: adminData.address,
        restaurant: adminData.restaurant,
        branch: adminData.branch,
      });
    } else {
      setForm({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        email: "",
        mobile_number: "",
        address: "",
        restaurant: "",
        branch: "",
      });
    }
  }, [adminData]);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!adminToken) return toast.error("Admin token missing!");
  //   const requiredFields = ["username","password","first_name","last_name","email","mobile_number", "address", "restaurant","branch"];
  //   for (let field of requiredFields) {
  //     if (!form[field]) return toast.error(`Please fill ${field}`);
  //   }

  //   try {
  //     const res = await fetch(`${API_URL}/api/user/admins/`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Token ${adminToken}`,
  //       },
  //       body: JSON.stringify(form),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       console.error("Backend Error:", data);
  //       return toast.error(data.response || "Registration failed");
  //     }

  //     toast.success("Admin registered successfully!");

  //     setForm({
  //       username: "",
  //       password: "",
  //       first_name: "",
  //       last_name: "",
  //       email: "",
  //       mobile_number: "",
  //       restaurant: "",
  //       branch: "",
  //     });
  //   } catch (err) {
  //     console.error("Frontend Error:", err);
  //     toast.error(err.message);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminToken) return toast.error("Admin token missing!");

    try {
      let res;
      if (adminData) {
        // Edit mode
        res = await fetch(`${API_URL}/api/user/admins/${adminData._id}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${adminToken}`,
          },
          body: JSON.stringify(form),
        });
      } else {
        // New admin
        res = await fetch(`${API_URL}/api/user/admins/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${adminToken}`,
          },
          body: JSON.stringify(form),
        });
      }

      const data = await res.json();
      if (!res.ok) return toast.error(data.response || "Failed");

      toast.success(adminData ? "Admin updated!" : "Admin registered!");

      // Refresh parent table
      refreshAdmins();
      closeModal();

      setForm({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        email: "",
        mobile_number: "",
        address: "",
        restaurant: "",
        branch: "",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-2xl">
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

      {/* Card */}
      <div
        className="z-10 bg-white/90 backdrop-blur rounded-2xl shadow-2xl
   sm:p-8 md:p-10  w-full max-w-3xl mx-2 sm:mx-4 md:mx-auto border border-amber-100"
      >
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1 sm:mb-2">
            Admin Register
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Create a new admin account
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              className="w-full pl-10 sm:pl-11 pr-4 py-3 border border-amber-300 rounded-xl
          focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full pl-10 sm:pl-11 pr-4 py-3 border border-amber-300 rounded-xl
          focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          {/* First Name */}
          <div className="relative">
            <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
            <input
              type="text"
              placeholder="First Name"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              required
              className="w-full pl-10 sm:pl-11 pr-4 py-3 border border-amber-300 rounded-xl
          focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          {/* Last Name */}
          <div className="relative">
            <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Last Name"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              required
              className="w-full pl-10 sm:pl-11 pr-4 py-3 border border-amber-300 rounded-xl
          focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full pl-10 sm:pl-11 pr-4 py-3 border border-amber-300 rounded-xl
          focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          {/* Address */}
          <div className="relative">
            <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Address"
              value={form.address || ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full pl-10 sm:pl-11 pr-4 py-3 border border-amber-300 rounded-xl
          focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          {/* Mobile */}
          <div className="relative sm:col-span-2">
            <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Mobile Number"
              value={form.mobile_number}
              onChange={(e) =>
                setForm({ ...form, mobile_number: e.target.value })
              }
              required
              className="w-full pl-10 sm:pl-11 pr-4 py-3 border border-amber-300 rounded-xl
          focus:ring-2 focus:ring-amber-400 outline-none"
            />
          </div>

          {/* Restaurant */}
          <select
            value={form.restaurant}
            onChange={(e) => setForm({ ...form, restaurant: e.target.value })}
            required
            className="w-full px-4 py-3 border border-amber-300 rounded-xl
        focus:ring-2 focus:ring-amber-400 outline-none"
          >
            <option value="">Select Restaurant</option>
            {restaurants.map((r) => (
              <option key={r.reference_id} value={r.reference_id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Branch */}
          <select
            value={form.branch}
            onChange={(e) => setForm({ ...form, branch: e.target.value })}
            required
            className="w-full px-4 py-3 border border-amber-300 rounded-xl
        focus:ring-2 focus:ring-amber-400 outline-none"
          >
            <option value="">Select Branch</option>
            {filteredBranches.map((b) => (
              <option key={b.reference_id} value={b.reference_id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Submit */}
          <button
            type="submit"
            className="sm:col-span-2 w-full bg-amber-600 text-white py-3 rounded-xl
        font-semibold shadow-lg hover:bg-amber-700 transition"
          >
            Register Admin
          </button>
        </form>
      </div>
    </div>
  );
}
