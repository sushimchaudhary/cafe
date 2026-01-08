"use client";

import ToastProvider from "@/components/ToastProvider";
import { Lock, Mail, MapPin, Phone, User, UserPlus, Eye, EyeOff, Building2, Landmark } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminRegisterPage({
  adminData = null,
  refreshAdmins,
  closeModal,
}) {
  const [restaurants, setRestaurants] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [adminToken, setAdminToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      const data = await res.json();
      setRestaurants(data.data || []);
    } catch (err) {
      toast.error("Failed to fetch restaurants.");
    }
  };

  const fetchBranches = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/branches/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setBranches(data.data || []);
    } catch (err) {
      toast.error("Failed to fetch branches.");
    }
  };

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
        username: adminData.username || "",
        password: "",
        first_name: adminData.first_name || "",
        last_name: adminData.last_name || "",
        email: adminData.email || "",
        mobile_number: adminData.mobile_number || "",
        address: adminData.address || "",
        restaurant: adminData.restaurant?.reference_id || "",
        branch: adminData.branch?.reference_id || "",
      });
    }
  }, [adminData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminToken) return toast.error("Admin token missing!");

    try {
      let res;
      if (adminData?.reference_id) {
        res = await fetch(`${API_URL}/api/user/admins/${adminData.reference_id}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${adminToken}`,
          },
          body: JSON.stringify(form),
        });
      } else {
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
      if (!res.ok) return toast.error(data.response || "Failed to register");

      toast.success(adminData ? "Admin updated!" : "Admin registered successfully!");

      // Refresh Table
      if (refreshAdmins) refreshAdmins();
      
      // Close Modal safely
      if (closeModal) closeModal();

    } catch (err) {
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <ToastProvider />
      
      <div className="relative w-full max-w-[500px] bg-white rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <UserPlus className="text-[#1C4D21] w-5 h-5" />
            <h2 className="text-[16px] font-semibold text-gray-800">
              {adminData ? "Edit Admin Account" : "Admin Registration"}
            </h2>
          </div>
          {closeModal && (
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg viewBox="64 64 896 896" width="1.2em" height="1.2em" fill="currentColor"><path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path></svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[13px] text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">*</span>Username
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1C4D21]" size={14} />
                  <input
                    type="text"
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                    className="w-full pl-9 pr-3 py-1.5 text-[14px] border border-gray-300 rounded focus:border-[#1C4D21] outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[13px] text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">*</span>Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1C4D21]" size={14} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!adminData}
                    className="w-full pl-9 pr-10 py-1.5 text-[14px] border border-gray-300 rounded focus:border-[#1C4D21] outline-none transition-all placeholder:text-gray-300"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[13px] text-gray-700">First Name</label>
                <input
                  type="text"
                  placeholder="First name"
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  required
                  className="w-full px-3 py-1.5 text-[14px] border border-gray-300 rounded focus:border-[#1C4D21] outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[13px] text-gray-700">Last Name</label>
                <input
                  type="text"
                  placeholder="Last name"
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  required
                  className="w-full px-3 py-1.5 text-[14px] border border-gray-300 rounded focus:border-[#1C4D21] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[13px] text-gray-700">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1C4D21]" size={14} />
                <input
                  type="email"
                  placeholder="example@mail.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full pl-9 pr-3 py-1.5 text-[14px] border border-gray-300 rounded focus:border-[#1C4D21] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[13px] text-gray-700">Mobile</label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1C4D21]" size={14} />
                  <input
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={form.mobile_number}
                    onChange={(e) => setForm({ ...form, mobile_number: e.target.value.replace(/\D/g, "") })}
                    required
                    className="w-full pl-9 pr-3 py-1.5 text-[14px] border border-gray-300 rounded focus:border-[#1C4D21] outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[13px] text-gray-700">Address</label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1C4D21]" size={14} />
                  <input
                    type="text"
                    placeholder="City, Street"
                    value={form.address || ""}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full pl-9 pr-3 py-1.5 text-[14px] border border-gray-300 rounded focus:border-[#1C4D21] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[13px] text-gray-700">Restaurant</label>
                <div className="relative group">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  <select
                    value={form.restaurant}
                    onChange={(e) => setForm({ ...form, restaurant: e.target.value })}
                    required
                    className="w-full pl-9 pr-2 py-1.5 text-[14px] border border-gray-300 rounded bg-white hover:border-[#1C4D21] outline-none cursor-pointer"
                  >
                    <option value="">Select</option>
                    {restaurants.map((r) => (
                      <option key={r.reference_id} value={r.reference_id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[13px] text-gray-700">Branch</label>
                <div className="relative group">
                  <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  <select
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    required
                    className="w-full pl-9 pr-2 py-1.5 text-[14px] border border-gray-300 rounded bg-white hover:border-[#1C4D21] outline-none cursor-pointer"
                  >
                    <option value="">Select</option>
                    {filteredBranches.map((b) => (
                      <option key={b.reference_id} value={b.reference_id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-1.5 border border-gray-300 rounded text-[14px] text-gray-600 hover:border-[#1C4D21] hover:text-[#1C4D21] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-1.5 bg-[#1C4D21] text-white rounded text-[14px] font-semibold hover:bg-[#143918] transition-all shadow-sm active:scale-95"
              >
                {adminData ? "Update Admin" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}