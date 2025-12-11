"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminRegisterPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [adminToken, setAdminToken] = useState("");

  const [form, setForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    mobile_number: "",
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

  // Fetch Restaurants
  const fetchRestaurants = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/restaurants/`, {
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

      const data = await res.json();
      setRestaurants(data.data || []);
    } catch (err) {
      console.error("FETCH RESTAURANTS ERROR:", err);
      toast.error("Failed to fetch restaurants.");
    }
  };

  // Fetch Branches
  const fetchBranches = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/branches/`, {
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

      const data = await res.json();
      setBranches(data.data || []);
    } catch (err) {
      console.error("FETCH BRANCHES ERROR:", err);
      toast.error("Failed to fetch branches.");
    }
  };

  // Filter branches based on selected restaurant
useEffect(() => {
  if (form.restaurant) {
    const filtered = branches.filter((b) => {
      const branchRestaurantId = 
        typeof b.restaurant_id === "object" && b.restaurant_id !== null
          ? b.restaurant_id.reference_id
          : b.restaurant_id;

      return String(branchRestaurantId) === String(form.restaurant);
    });
    setFilteredBranches(filtered);
  } else {
    setFilteredBranches([]);
  }

  // Reset branch selection when restaurant changes
  setForm((prev) => ({ ...prev, branch: "" }));
}, [form.restaurant, branches]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!adminToken) return toast.error("Admin token missing!");

    if (!form.username || !form.password || !form.restaurant || !form.branch) {
      return toast.error("Please fill all required fields.");
    }

    try {
      const res = await fetch(`${API_URL}/api/user/admins/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${adminToken}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Backend Error:", data);
        return toast.error(data.response || "Registration failed");
      }

      toast.success("Admin registered successfully!");

      // Reset form
      setForm({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        mobile_number: "",
        restaurant: "",
        branch: "",
      });
    } catch (err) {
      console.error("Frontend Error:", err);
      toast.error(err.message);
    }
  };

  return (
<div className="min-h-screen bg-amber-50 from-amber-50 to-white flex items-center justify-center  px-3">
  <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-4 md:p-5">
    {/* Heading */}
    <h2 className="text-3xl md:text-4xl font-bold text-amber-600 text-center mb-8">
      Admin Register
    </h2>

    {/* Form */}
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Username & Password */}
      <input
        type="text"
        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        required
      />
      <input
        type="password"
        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
      />

      {/* First & Last Name */}
      <input
        type="text"
        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        placeholder="First Name"
        value={form.first_name}
        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
      />
      <input
        type="text"
        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        placeholder="Last Name"
        value={form.last_name}
        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
      />

      {/* Mobile Number */}
      <input
        type="text"
        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 md:col-span-2"
        placeholder="Mobile Number"
        value={form.mobile_number}
        onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
      />

      {/* Restaurant & Branch */}
      <select
        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        value={form.restaurant}
        onChange={(e) => setForm({ ...form, restaurant: e.target.value })}
        required
      >
        <option value="">Select Restaurant</option>
        {restaurants.map((r) => (
          <option key={r.reference_id} value={r.reference_id}>
            {r.name}
          </option>
        ))}
      </select>

      <select
        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        value={form.branch}
        onChange={(e) => setForm({ ...form, branch: e.target.value })}
        required
      >
        <option value="">Select Branch</option>
        {filteredBranches.map((b) => (
          <option key={b.reference_id} value={b.reference_id}>
            {b.name}
          </option>
        ))}
      </select>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full md:col-span-2 bg-amber-500 text-white p-3 rounded-lg hover:bg-amber-600 transition-colors font-semibold"
      >
        Register Admin
      </button>
    </form>

    {/* Login Link */}
    <p className="mt-6 text-center text-gray-500">
      Already have an account?{" "}
      <a href="/auth/login" className="text-amber-500 hover:underline">
        Log in
      </a>
    </p>
  </div>
</div>



  );
}
