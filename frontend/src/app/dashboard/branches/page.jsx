"use client";

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

import ToastProvider from "@/components/ToastProvider";
import "@/styles/customButtons.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function RestaurantDropdown({ restaurants, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = restaurants.find((r) => r.reference_id === value);

  const rect = document
    .getElementById("restaurant-button")
    ?.getBoundingClientRect();

  return (
    <div className="relative">
      <button
        id="restaurant-button"
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-amber-300 p-1 rounded text-sm
        flex justify-between items-center
        focus:outline-none focus:ring-1 focus:ring-amber-200"
      >
        <span>{selected ? selected.name : "Select Restaurant"}</span>
        <span className="text-amber-500">▼</span>
      </button>

      {open &&
        createPortal(
          <ul
            className="absolute z-50 w-[200px] bg-white border border-amber-200 rounded shadow"
            style={{
              top: rect?.bottom + window.scrollY,
              left: rect?.left + window.scrollX,
            }}
          >
            {restaurants.map((r) => (
              <li
                key={r.reference_id}
                onClick={() => {
                  onChange({
                    target: { name: "restaurant_id", value: r.reference_id },
                  });
                  setOpen(false);
                }}
                className="px-3 py-2 text-sm hover:bg-amber-100 cursor-pointer"
              >
                {r.name}
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
}

/* ================= MAIN PAGE ================= */
export default function BranchPage() {
  const [branches, setBranches] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteBranch, setDeleteBranch] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    mobile_number: "",
    restaurant_id: "",
    email: "",
  });

  const confirmDelete = (b) => {
    setDeleteBranch(b);
    setShowDeleteModal(true);
  };
  /* ================= FETCH ================= */
  const fetchRestaurants = async () => {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`${API_URL}/api/restaurants/`, {
      headers: { Authorization: `Token ${token}` },
    });
    const data = await res.json();
    setRestaurants(data.data || []);
    return data.data || [];
  };

  const fetchBranches = async (restaurantList) => {
    const token = localStorage.getItem("adminToken");
    const res = await fetch(`${API_URL}/api/branches/`, {
      headers: { Authorization: `Token ${token}` },
    });
    const data = await res.json();

    const mapped = (data.data || []).map((b) => {
      const r = restaurantList.find(
        (x) => x.reference_id === b.restaurant_reference_id
      );
      return {
        ...b,
        restaurant_name: r?.name || "-",
      };
    });

    setBranches(mapped);
  };

  useEffect(() => {
    const load = async () => {
      const list = await fetchRestaurants();
      fetchBranches(list);
    };
    load();
  }, []);

  const filteredBranches = useMemo(() => {
    return branches.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [branches, search]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const closeModal = () => {
    setShowForm(false);
    setEditId(null);
    setForm({
      name: "",
      address: "",
      mobile_number: "",
      restaurant_id: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      const url = editId
        ? `${API_URL}/api/branches/${editId}/`
        : `${API_URL}/api/branches/`;
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Save failed");

      toast.success(editId ? "Updated!" : "Created!");
      closeModal();
      fetchBranches(restaurants);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (b) => {
    setEditId(b.reference_id);
    setForm({
      name: b.name,
      address: b.address,
      mobile_number: b.mobile_number,
      restaurant_id: b.restaurant_reference_id,
    });
    setShowForm(true);
  };

  const handleDeleteConfirmed = async (b) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/branches/${b.reference_id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");

      toast.success("Deleted!");
      fetchBranches(restaurants);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setShowDeleteModal(false);
      setDeleteBranch(null);
    }
  };

  /* ================= UI ================= */
  return (
  <>
      <div className="mx-auto min-h-screen font-sans p-4 bg-[#ddf4e2] ">
      <ToastProvider />

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-2">
        <h1 className="self-start text-left text-[15px] font-bold text-[#236B28]">
          Branch
        </h1>

        <div className="flex w-full md:w-auto items-center gap-2">
          <div className="relative">
            <svg
              className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#236B28]/60"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>

            <input
              type="text"
              placeholder="Search Branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-[#236B28]/30 rounded-md pl-8 pr-3 py-1 text-[12px]
        focus:outline-none focus:ring-1 focus:ring-[#236B28]/40"
            />
          </div>

          <button
            onClick={() => {
              setShowForm(true);
            }}
            className="flex items-center gap-1 px-4 py-1.5 text-[12px] font-semibold
      bg-[#236B28] text-white rounded-md shadow-sm hover:bg-[#1C5721] transition"
          >
            Create
          </button>
        </div>
      </div>

      {/* DELETE CONFIRM MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-md w-[90%] max-w-sm p-4">
            <h2 className="text-lg font-bold text-red-600 mb-3">
              Confirm Delete
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteBranch?.name}</span>?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirmed(deleteBranch)}
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[1px] p-4">
          <div className="bg-white w-full max-w-[440px] rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200" >

            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <h2 className="text-[14px] font-bold text-[#236B28] tracking-tight">
                {editId ? "Edit Branch" : "Add New Branch"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            <div className="p-4 bg-[#ddf4e2]/20">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 bg-white p-4 rounded-md border border-gray-200 shadow-sm">

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                      Branch Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter branch name"
                      className="w-full border border-gray-300 px-3 py-1.5 rounded text-[12px] outline-none focus:border-[#236B28] focus:ring-[2px] focus:ring-[#236B28]/10 transition-all placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="example@mail.com"
                      className="w-full border border-gray-300 px-3 py-1.5 rounded text-[12px] outline-none focus:border-[#236B28] focus:ring-[2px] focus:ring-[#236B28]/10 transition-all placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Location details"
                      className="w-full border border-gray-300 px-3 py-1.5 rounded text-[12px] outline-none focus:border-[#236B28] focus:ring-[2px] focus:ring-[#236B28]/10 transition-all placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="mobile_number"
                      value={form.mobile_number}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value) && value.length <= 10) {
                          handleChange(e);
                        }
                      }}
                      placeholder="98XXXXXXXX"
                      className="w-full border border-gray-300 px-3 py-1.5 rounded text-[12px] outline-none focus:border-[#236B28] focus:ring-[2px] focus:ring-[#236B28]/10 transition-all placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                      Select Restaurant <span className="text-red-500">*</span>
                    </label>

                    <div className="relative group">
                      <select
                        name="restaurant_id"
                        value={form.restaurant_id}
                        onChange={handleChange}
                        className="w-full appearance-none bg-white border border-gray-300 px-3 py-1.5 rounded text-[12px] outline-none 
                        focus:border-[#236B28] focus:ring-[2px] focus:ring-[#236B28]/10 transition-all cursor-pointer text-gray-700"
                        required
                      >
                        <option value="" disabled className="text-gray-400">
                          Please select a restaurant
                        </option>
                        {restaurants.map((res) => (
                          <option key={res.reference_id} value={res.reference_id}>
                            {res.name}
                          </option>
                        ))}
                      </select>

                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 group-focus-within:text-[#236B28]">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded text-[12px] font-medium hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-1.5 bg-[#236B28] text-white rounded text-[12px] font-semibold shadow-sm transition-all hover:bg-[#1C5721] active:scale-95 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : editId ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TABLE WRAPPER */}
      <div className="flex-1 min-h-0 bg-white rounded-md border border-gray-300 shadow-sm overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(100vh - 150px)' }}>
          <table className="min-w-full border-separate border-spacing-0 table-fixed text-[11px]">

            <thead className="sticky top-0 bg-[#fafafa] z-10">
              <tr>
                <th className="w-[40px] border-b border-r border-gray-200 px-2 py-1 text-left font-bold text-gray-700">SN</th>
                <th className="border-b border-r border-gray-200 px-2 py-1 text-left font-bold text-gray-700">Name</th>
                <th className="border-b border-r border-gray-200 px-2 py-1 text-left font-bold text-gray-700">Email</th>
                <th className="border-b border-r border-gray-200 px-2 py-1 text-left font-bold text-gray-700">Address</th>
                <th className="border-b border-r border-gray-200 px-2 py-1 text-left font-bold text-gray-700">Phone</th>
                <th className="border-b border-r border-gray-200 px-2 py-1 text-left font-bold text-gray-700">Restaurant</th>
                <th className="w-[80px] border-b border-gray-200 px-2 py-1 text-right font-bold text-gray-700">Action</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="bg-white">
              {filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400 border-b border-gray-200">
                    {search ? "Branch not matching your search" : "No branches found"}
                  </td>
                </tr>
              ) : (
                filteredBranches.map((b, index) => (
                  <tr key={b.reference_id} className="hover:bg-blue-50/30 transition-all">

                    <td className="border-b border-r border-gray-200 px-2 py-0.5 text-gray-500 text-center">
                      {index + 1}
                    </td>

                    <td className="border-b border-r border-gray-200 px-1 py-0.5">
                      <div className="border border-gray-200 rounded px-1 py-0.5 bg-gray-50/50 text-gray-800 font-medium truncate">
                        {b.name}
                      </div>
                    </td>

                    <td className="border-b border-r border-gray-200 px-2 py-0.5 text-gray-500 truncate">
                      {b.email}
                    </td>

                    <td className="border-b border-r border-gray-200 px-2 py-0.5 text-gray-500 truncate">
                      {b.address}
                    </td>

                    <td className="border-b border-r border-gray-200 px-2 py-0.5 text-gray-500">
                      {b.mobile_number}
                    </td>

                    <td className="border-b border-r border-gray-200 px-2 py-0.5">
                      <span className="text-[10px] px-1.5 py-0 border border-[#236B28]/20 rounded bg-[#ddf4e2]/30 text-[#236B28]">
                        {b.restaurant_name}
                      </span>
                    </td>

                    <td className="border-b border-gray-200 px-2 py-0.5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(b)}
                          className="p-1 text-blue-500 hover:scale-110 transition"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => confirmDelete(b)}
                          className="p-1 text-red-400 hover:scale-110 transition"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
    </>
  );
}
