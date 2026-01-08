"use client";

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";

import "@/styles/customButtons.css";
import ToastProvider from "@/components/ToastProvider";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminMenuUnitPage() {
  const [units, setUnits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [unitName, setUnitName] = useState("");
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [deleteUnit, setDeleteUnit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const res = await fetch(`${API_URL}/api/units/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setUnits(data.data || []);
    } catch (err) {
      toast.error("Failed to fetch units");
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);
  const filteredUnits = useMemo(() => {
    return units.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [units, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!unitName.trim()) return toast.error("Unit name required");
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Login again");

      const payload = { name: unitName.trim() };
      const url = editId
        ? `${API_URL}/api/units/${editId}/`
        : `${API_URL}/api/units/`;
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      toast.success(editId ? "Unit updated!" : "Unit created!");
      closeModal();
      fetchUnits();
    } catch (err) {
      toast.error(err.message);
    }

    setLoading(false);
  };

  const handleEdit = (unit) => {
    setEditId(unit.reference_id);
    setUnitName(unit.name);
    setShowForm(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteUnit) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/units/${deleteUnit.reference_id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Unit deleted!");
      fetchUnits();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setShowDeleteModal(false);
      setDeleteUnit(null);
    }
  };

  const closeModal = () => {
    setShowForm(false);
    setEditId(null);
    setUnitName("");
  };

  return (
    <div className="container mx-auto h-[500px] flex flex-col font-sans px-1">
      <ToastProvider />

      <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-1">
        <h1 className="self-start text-left text-lg md:text-[15px] font-bold">
          Unit
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
              placeholder="Search Unit..."
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
            <h2 className="text-lg font-bold text-red-600 mb-3">Confirm Delete</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <span className="font-semibold">{deleteUnit?.name}</span>?
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

     

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
          <div className="bg-white w-full max-w-md lg:max-w-lg rounded shadow-md overflow-hidden animate-in fade-in zoom-in duration-200 lg:mb-34">
            {/* Header */}
            <div className="flex justify-end p-1 border-b border-gray-100">
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="p-2 space-y-1">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Unit Name
                </label>
                <input
                  type="text"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  placeholder="e.g. Kg, Plate, Piece"
                  className="border p-1 w-full text-sm border-amber-300 rounded
            focus:outline-none focus:ring-1 focus:ring-amber-200"
                  required
                />
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end ">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="formCancleButton px-3 py-1"
                >
                  Cancel
                </button>

                <button type="submit" disabled={loading} className="formButton">
                  {loading ? "Saving..." : editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UNIT TABLE */}
      <div className="min-h-0 bg-white rounded border shadow-sm overflow-hidden">
        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
          <table className="min-w-full border-collapse table-fixed">
            <thead className="sticky top-0 bg-green-100 uppercase text-sm font-bold text-black z-10">
              <tr>
                <th className="w-1/12 border px-4 py-2 text-left">SN</th>
                <th className="w-3/4 border px-6 py-2 text-left">Name</th>
                <th className="w-1/8 border px-6 py-2 text-end pr-4">Action</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-400">
                    {search ? "units not match search" : "unit not found"}
                  </td>
                </tr>
              ) : (
                filteredUnits.map((u, index) => (
                  <tr
                    key={u.reference_id}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-4 py-1 border">{index + 1}</td>

                    <td className="px-4 py-1 border">{u.name}</td>

                    <td className="px-2 py-1 border">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(u)}
                          className="p-1 text-amber-600 hover:bg-amber-100 rounded-full transition"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteUnit(u);
                            setShowDeleteModal(true);
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full transition"
                          title="Delete"
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
