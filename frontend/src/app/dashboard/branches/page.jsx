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
    <div className="container mx-auto h-[500px] flex flex-col px-1">
      <ToastProvider />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-1">
        <h1 className="self-start text-left text-lg md:text-[15px] font-bold">
          Branch
        </h1>

        <div className="flex w-full md:w-auto items-center gap-2">
          <div className="relative">
            <svg
              className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
              placeholder="Search Baranch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-amber-200 rounded pl-8 pr-3 py-1 text-sm
             focus:outline-none focus:ring-1 focus:ring-amber-200"
            />
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="button px-4 py-1.5 text-sm font-semibold
            bg-amber-500 text-white rounded-lg hover:bg-amber-600"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-1">
          <div className="bg-white w-full max-w-3xl rounded shadow-md mb-21">
            <div className="flex justify-end p-1 border-b">
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-3">
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border p-2 rounded">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Branch Name"
                    className="border border-amber-300 p-1 rounded text-sm"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="border border-amber-300 p-1 rounded text-sm"
                    required
                  />

                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Address"
                    className="border border-amber-300 p-1 rounded text-sm"
                    required
                  />
                  <input
                    name="mobile_number"
                    value={form.mobile_number}
                    onChange={(e) => {
                      // Allow only numbers and max length of 10
                      const value = e.target.value;
                      if (/^\d*$/.test(value) && value.length <= 10) {
                        handleChange(e);
                      }
                    }}
                    placeholder="Mobile Number"
                    className="border border-amber-300 p-1 rounded text-sm"
                    required
                  />

                  <RestaurantDropdown
                    restaurants={restaurants}
                    value={form.restaurant_id}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex justify-end gap-2 sticky bottom-0 bg-white pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="formCancleButton px-3 py-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="formButton px-3 py-1 bg-amber-600 text-white rounded-lg"
                  >
                    {loading ? "Saving..." : editId ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="min-h-0 bg-white rounded border shadow-sm overflow-hidden">
        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
          <table className="min-w-full border-collapse table-fixed">
            <thead className="sticky top-0 bg-amber-100 uppercase text-sm font-bold text-black z-10">
              <tr>
                <th className="border px-4 py-2 text-left">SN</th>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Email</th>

                <th className="border px-4 py-2 text-left">Address</th>
                <th className="border px-4 py-2 text-left">Phone</th>
                <th className="border px-4 py-2 text-left">Restaurant</th>
                <th className="border px-2 py-2 text-end">Action</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-400">
                    {search
                      ? " Baranch not match search"
                      : " Baranch not found"}
                  </td>
                </tr>
              ) : (
                filteredBranches.map((b, index) => (
                  <tr key={b.reference_id} className="hover:bg-gray-50">
                    <td className="px-2 py-1 border">{index + 1}</td>
                    <td className="border px-4 py-1">{b.name}</td>
                    <td className="border px-4 py-1">{b.email}</td>

                    <td className="border px-4 py-1">{b.address}</td>
                    <td className="border px-4 py-1">{b.mobile_number}</td>
                    <td className="border px-4 py-1">{b.restaurant_name}</td>
                    <td className="border px-2 py-1">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleEdit(b)}
                          className="p-1 text-amber-600 hover:bg-amber-100 rounded-full"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(b)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <TrashIcon className="w-4 h-4" />
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
  );
}
