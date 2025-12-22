"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import ToastProvider from "@/components/ToastProvider";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import AdminHeader from "../../../components/AdminHeader";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const FRONTEND_URL = process.env.NEXT_PUBLIC_CLIENT_URL;

export default function TableManager() {
  const [tables, setTables] = useState([]);
  const [tableName, setTableName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openQr, setOpenQr] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("")

  
  // ---------------- Fetch Tables ----------------
  const fetchTables = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return toast.error("Login first!");

      const res = await fetch(`${API_URL}/api/tables/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      console.log("GET /api/tables/ response:", data);

      if (!res.ok || data.response_code !== "0") {
        throw new Error(data.response || "Failed to fetch tables");
      }

      console.log("Tables from API:", data.data);


      data.data.forEach(t => {
        if (!t.qr_code_url) console.warn("Missing QR URL for table:", t.table_number);
      });
      // Generate QR codes for display
      const tablesWithQR = await Promise.all(
        (data.data || []).map(async (t) => {
          let token = t.token;
          if (!token && t.qr_code_url) {
            token = new URL(t.qr_code_url).searchParams.get("token");
          }

          const qrUrl = token ? `${FRONTEND_URL}/menu?token=${token}` : null;
          let qrBase64 = null;
          if (qrUrl) {
            qrBase64 = await QRCode.toDataURL(qrUrl);
          }

          return { ...t, qr_code: qrBase64, token_number: token };
        })
      );

      setTables(tablesWithQR);
    } catch (err) {
      toast.error(err.message || "Failed to load tables");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // ---------------- Generate QR for Submit ----------------
  const generateQRCode = async (token) => {
    if (!token) return "";
    try {
      const url = `${FRONTEND_URL}/menu?token=${token}`;
      const qrData = await QRCode.toDataURL(url);
      return qrData;
    } catch (err) {
      toast.error("QR generate failed");
      console.error("QR generation failed:", err);
      return "";
    }
  };

  // ---------------- Reset Form ----------------
  const resetForm = () => {
    setTableName("");
    setCapacity("");
    setLocation("");
    setEditId(null);
  };

  // ---------------- Submit Table ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tableName || !capacity) {
      toast.error("Table number and capacity required");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Login required");

      const tableToken = editId
        ? tables.find((t) => t.reference_id === editId)?.token_number
        : Date.now().toString();

      const qr = await generateQRCode(tableToken);

      const formData = new FormData();
      formData.append("table_number", tableName);
      formData.append("capacity", capacity);
      if (location) formData.append("location", location);
      formData.append("qr_code", qr);
      formData.append("token", tableToken);

      // ✅ Send table_id if editing
      if (editId) formData.append("table_id", editId);

      const url = editId
        ? `${API_URL}/api/tables/${editId}/`
        : `${API_URL}/api/tables/`;
      const method = editId ? "PATCH" : "POST";

      console.log("Submitting table form:", Object.fromEntries(formData));

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Token ${token}` },
        body: formData,
      });

      const data = await res.json();
      console.log(`${method} response:`, data);

      if (!res.ok || data.response_code !== "0") {
        const msg = Object.values(data.errors || {}).flat().join(" | ");
        throw new Error(msg || "Failed to save table");
      }

      toast.success(editId ? "Table updated!" : "Table added!");
      resetForm();
      fetchTables();
    } catch (err) {
      toast.error(err.message || "Failed to save table");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Edit Table ----------------
  const handleEdit = (t) => {
    setEditId(t.reference_id);
    setTableName(t.table_number);
    setCapacity(t.capacity || "");
    setLocation(t.location || "");
    setShowForm(true);
  };

  // ---------------- Delete Table ----------------
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this table?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/tables/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");
      toast.success("Table deleted!");
      fetchTables();
    } catch (err) {
      toast.error("Delete failed");
      console.error(err);
    }
  };


  return (
    <div className="min-h-screen">
      <AdminHeader />
      <div className="flex flex-row items-center justify-between px-4 sm:px-6 md:px-10 py-3 gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 leading-tight truncate">
            Tables Management
          </h1>
        </div>

        <div className="flex-shrink-0 ml-4">
          <button
            onClick={() => {
              setTableName("");
              setCapacity("");
              setLocation("");
              setEditId(null);
              setShowForm(true);
            }}
            className="flex items-center font-bold justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow-lg transition duration-300 cursor-pointer"
          >
            + Create
          </button>
        </div>
      </div>

      <div className="p-4 md:p-3 min-h-screen font-roboto">
        <ToastProvider />

        <div className="overflow-x-auto rounded border border-blue-200">
          <table className="min-w-full border-collapse">
            <thead className="bg-blue-50 uppercase text-sm">
              <tr>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Table
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Capacity
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Location
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  QR
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tables.map((t, i) => (
                <tr
                  key={t.reference_id || i}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="border px-4 py-2">Table {t.table_number}</td>
                  <td className="border px-4 py-2">{t.capacity || "-"}</td>
                  <td className="border px-4 py-2">{t.location || "-"}</td>
                  <td className="border px-4 py-2">
                    {t.qr_code ? (
                      <img
                        src={t.qr_code}
                        onClick={(e) => setOpenQr(t?.qr_code)}
                        alt="QR Code"
                        className="w-12 h-12 sm:w-10 sm:h-10 md:w-8 md:h-8 lg:w-10 lg:h-10 object-contain cursor-pointer"
                      />
                    ) : (
                      <span className="text-gray-400">No QR</span>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => handleEdit(t)}
                        className="text-blue-600 hover:bg-blue-100 p-2 rounded"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.reference_id)}
                        className="text-red-600 hover:bg-red-100 p-2 rounded"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
              setEditId(null);
              setTableName("");
              setCapacity("");
              setLocation("");
            }
          }}
        >
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 animate-fadeIn relative">
            <button
              onClick={() => {
                setShowForm(false);
                setEditId(null);
                setTableName("");
                setCapacity("");
                setLocation("");
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4 text-blue-700">
              {editId ? "Edit Table" : "Add Table"}
            </h2>

            {message && <p className="text-red-500 mb-2">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Table Number
                </label>
                <input
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Location (optional)
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                    setTableName("");
                    setCapacity("");
                    setLocation("");
                  }}
                  className="px-2 py-2 border border-red-500 rounded-lg font-medium hover:bg-red-100 w-full sm:w-auto text-sm sm:text-base cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600  hover:bg-blue-700 text-white rounded-lg shadow w-full sm:w-auto text-sm sm:text-base font-medium cursor-pointer"
                >
                  {loading ? "Saving..." : editId ? "Update" : "Create "}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {openQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setOpenQr(null)}
        >
          <div
            className="bg-white p-4 rounded-lg max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={openQr}
              alt="QR Preview"
              className="w-full h-auto object-contain"
            />

            <button
              onClick={() => setOpenQr(null)}
              className="mt-4 w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

