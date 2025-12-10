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
    <div className="max-w-xl mx-auto mt-6 p-5 border rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Admin Register</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="First Name"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Last Name"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Mobile Number"
          value={form.mobile_number}
          onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
        />

        {/* Restaurant Dropdown */}
        <select
          className="w-full border p-2 rounded"
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

        {/* Branch Dropdown (filtered) */}
        <select
          className="w-full border p-2 rounded"
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

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Register Admin
        </button>
      </form>
    </div>
  );
}
