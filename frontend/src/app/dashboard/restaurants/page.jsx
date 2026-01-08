"use client";

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { X } from "lucide-react";

import ToastProvider from "@/components/ToastProvider";
import "@/styles/customButtons.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RestaurantPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteRestaurant, setDeleteRestaurant] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    mobile_number: "",
  });

  /* ================= FETCH ================= */
  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const res = await fetch(`${API_URL}/api/restaurants/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setRestaurants(data.data || []);
    } catch {
      toast.error("Failed to fetch restaurants");
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  /* ================= SEARCH ================= */
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [restaurants, search]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.mobile_number) {
      return toast.error("All fields required");
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      const url = editId
        ? `${API_URL}/api/restaurants/${editId}/`
        : `${API_URL}/api/restaurants/`;
      const method = editId ? "PATCH" : "POST";

      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        mobile_number: form.mobile_number.trim(),
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      toast.success(editId ? "Updated!" : "Created!");
      closeModal();
      fetchRestaurants();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ACTIONS ================= */
  const handleEdit = (r) => {
    setEditId(r.reference_id);
    setForm({
      name: r.name,
      address: r.address,
      mobile_number: r.mobile_number,
    });
    setShowForm(true);
  };

  const handleDeleteConfirmed = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${API_URL}/api/restaurants/${deleteRestaurant.reference_id}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Token ${token}` },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Deleted!");
      fetchRestaurants(); // table refresh
    } catch (err) {
      toast.error(err.message);
    } finally {
      setShowDeleteModal(false);
      setDeleteRestaurant(null);
    }
  };

  const closeModal = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ name: "", address: "", mobile_number: "" });
  };

  return (
    <div className="container mx-auto h-[500px] flex flex-col px-1">
      <ToastProvider />

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-1">
        <h1 className="self-start text-left text-lg md:text-[15px] font-bold">
          Restaurant
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
              placeholder="Search Restaurant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-amber-200 rounded pl-8 pr-3 py-1 text-sm
             focus:outline-none focus:ring-1 focus:ring-amber-200"
            />
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="button flex items-center gap-1 px-4 py-1.5 text-sm font-semibold bg-amber-500 text-white rounded-lg shadow-sm hover:bg-amber-600 transition"
          >
            Create
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-md w-[90%] max-w-sm p-4">
            <h2 className="text-lg font-bold text-red-600 mb-3">
              Confirm Delete
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteRestaurant?.name}</span>?
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FORM MODAL ================= */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-1">
          <div className="bg-white w-full max-w-3xl rounded shadow-md animate-in fade-in zoom-in duration-200 mb-35">
            {/* Header */}
            <div className="flex justify-end p-1 border-b">
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[50vh] overflow-y-auto pt-2 px-3 space-y-2">
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border p-2 rounded">
                  <div>
                    <label className="block mb-1 text-sm">
                      Restaurant Name
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Restaurant Name"
                      className="w-full border border-amber-300 p-1 rounded text-sm
              focus:outline-none focus:ring-1 focus:ring-amber-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm">Address</label>
                    <input
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      placeholder="Address"
                      className="w-full border border-amber-300 p-1 rounded text-sm
              focus:outline-none focus:ring-1 focus:ring-amber-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm">Mobile Number</label>
                    <input
                      value={form.mobile_number}
                      maxLength={10}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          mobile_number: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder="Mobile Number"
                      className="w-full border border-amber-300 p-1 rounded text-sm
              focus:outline-none focus:ring-1 focus:ring-amber-200"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 p-1  bg-white sticky bottom-0">
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

      <div className="min-h-0 bg-white rounded border shadow-sm overflow-hidden">
        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
          <table className="min-w-full border-collapse table-fixed">
            <thead className="sticky top-0 bg-amber-100 uppercase text-sm font-bold text-black z-10">
              <tr>
                <th className="w-1/12 border px-4 py-2 text-left">SN</th>
                <th className="border px-4 py-2  text-left">Name</th>
                <th className="border px-4 py-2  text-left">Address</th>
                <th className="border px-4 py-2  text-left">Phone</th>
                <th className="w-1/8 border px-4 py-2 text-end">Action</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {filteredRestaurants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-400">
                    {search ? "restaurant not match search" : "resstaurant not found"}
                  </td>
                </tr>
              ) : (
                filteredRestaurants.map((r, index) => (
                  <tr key={r.reference_id} className="hover:bg-gray-50">
                    <td className="border px-4 py-1">{index + 1}</td>
                    <td className="border px-4 py-1">{r.name}</td>
                    <td className="border px-4 py-1">{r.address}</td>
                    <td className="border px-4 py-1">{r.mobile_number}</td>
                    <td className="border px-4 py-1">
                      <div className="flex justify-end ">
                        <button
                          onClick={() => handleEdit(r)}
                          className="p-1 text-amber-600 hover:bg-amber-100 rounded-full transition"
                        >
                          <PencilIcon className="w-4 h-4 " />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteRestaurant(r);
                            setShowDeleteModal(true);
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full transition"
                        >
                          <TrashIcon className="w-4 h-4 " />
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
