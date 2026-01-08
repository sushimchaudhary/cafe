"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import ToastProvider from "@/components/ToastProvider";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Download, X } from "lucide-react";
import "@/styles/customButtons.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const FRONTEND_URL = process.env.NEXT_PUBLIC_CLIENT_URL;

export default function TableManager() {
  const [tables, setTables] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [tableName, setTableName] = useState("");
  const [search, setSearch] = useState("");
  // const [capacity, setCapacity] = useState("");
  // const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openQr, setOpenQr] = useState(null);
  const [deleteTable, setDeleteTable] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  // ---------------- Fetch Tables ----------------
  const fetchTables = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return toast.error("Login first!");

      const res = await fetch(`${API_URL}/api/tables/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      if (!res.ok || data.response_code !== "0")
        throw new Error(data.response || "Failed to fetch tables");

      const tablesWithQR = await Promise.all(
        (data.data || []).map(async (t) => {
          let tokenNumber =
            t.token || new URL(t.qr_code_url || "").searchParams.get("token");
          const qrUrl = tokenNumber
            ? `${FRONTEND_URL}/menu?token=${tokenNumber}`
            : null;
          let qrBase64 = null;
          if (qrUrl) qrBase64 = await QRCode.toDataURL(qrUrl);
          return { ...t, qr_code: qrBase64, token_number: tokenNumber };
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

  const filteredTables = tables.filter((t) =>
    t.table_number.toString().includes(search.trim())
  );

  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  // ---------------- Form ----------------
  const resetForm = () => {
    setTableName("");
    // setCapacity("");
    // setLocation("");
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tableName) return toast.error("Table number required");
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Login required");

      const tableToken = editId
        ? tables.find((t) => t.reference_id === editId)?.token_number
        : Date.now().toString();

      const qr = tableToken
        ? await QRCode.toDataURL(`${FRONTEND_URL}/menu?token=${tableToken}`)
        : "";

      const formData = new FormData();
      formData.append("table_number", tableName);
      // formData.append("capacity", capacity);
      // if (location) formData.append("location", location);
      formData.append("qr_code", qr);
      formData.append("token", tableToken);
      if (editId) formData.append("table_id", editId);

      const url = editId
        ? `${API_URL}/api/tables/${editId}/`
        : `${API_URL}/api/tables/`;
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Token ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || data.response_code !== "0")
        throw new Error(data.response || "Failed to save table");

      toast.success(editId ? "Table updated!" : "Table added!");
      resetForm();
      setShowForm(false);
      fetchTables();
    } catch (err) {
      toast.error(err.message || "Failed to save table");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (t) => {
    setEditId(t.reference_id);
    setTableName(t.table_number);
    // setCapacity(t.capacity || "");
    // setLocation(t.location || "");
    setShowForm(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTable) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${API_URL}/api/tables/${deleteTable.reference_id}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Token ${token}` },
        }
      );
      if (!res.ok) throw new Error("Delete failed");

      toast.success("Table deleted!");
      fetchTables();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setShowDeleteModal(false);
      setDeleteTable(null);
    }
  };

  return (
    <div className="container mx-auto h-[500px] font-sans px-1">
      <ToastProvider />

      {/* HEADER + SEARCH */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-1">
        <h1 className="self-start text-left text-lg md:text-[15px] font-bold">
          Table
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
              placeholder="Search Table..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-amber-200 rounded pl-8 pr-3 py-1 text-sm
             focus:outline-none focus:ring-1 focus:ring-amber-200"
            />
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
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
              Are you sure you want to delete table{" "}
              <span className="font-semibold">{deleteTable?.table_number}</span>
              ?
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

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
          <div className="bg-white w-full max-w-md lg:max-w-lg rounded shadow-md overflow-hidden animate-in fade-in zoom-in duration-200 lg:mb-34">
            <div className="flex justify-end items-end p-1 border-b border-gray-100">
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-2 space-y-1">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Table
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="Table Number"
                  className="border w-full p-1 text-sm border-amber-300  rounded focus:outline-none focus:ring-1 focus:ring-amber-200"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="formCancleButton px-3 py-1 border-2 cursor-pointer text-gray-600 hover:bg-gray-100 rounded transition"
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

      {/* TABLE */}
      <div className="flex-1 min-h-0 bg-white rounded border shadow-sm overflow-hidden">
        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
          <table className="min-w-full border-collapse table-fixed">
            <thead className="sticky top-0 bg-amber-100 uppercase text-sm font-bold text-black z-10">
              <tr>
                <th className="w-1/12 border px-4 py-2 text-left">SN</th>

                <th className="w-1/4 border px-6 py-2 text-left">Table</th>
                <th className="w-1/4 border px-4 py-2 text-left">QR</th>
                <th className="w-1/15 border px-2 py-2 text-end pr-4">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {filteredTables.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-6 text-gray-400 border "
                  >
                    {searchQuery
                      ? "table not match your search"
                      : "table not found"}
                  </td>
                </tr>
              ) : (
                filteredTables.map((t, index) => (
                  <tr
                    key={t.reference_id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-1 border ">{index + 1}</td>

                    <td className="px-4 py-1 border">T {t.table_number}</td>
                    <td className="px-4 py-1 border  ">
                      {t.qr_code ? (
                        <img
                          src={t.qr_code}
                          alt="QR"
                          className="w-7 h-7  cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => setOpenQr(t.qr_code)}
                        />
                      ) : (
                        <span className="text-gray-400">No QR</span>
                      )}
                    </td>
                    <td className="px-2 py-1 border ">
                      <div className="flex justify-end ">
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-1 text-amber-600 hover:bg-amber-100 rounded-full transition"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTable(t);
                            setShowDeleteModal(true);
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full transition"
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

      {/* QR MODAL */}
      {openQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setOpenQr(null)}
        >
          <div
            className="relative bg-white p-4 rounded-lg max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Download Button Top Right */}
            <a
              href={openQr}
              download={`Table_${selectedTable?.table_number || "QR"}.png`}
              className="absolute top-2 right-2 text-gray-600 hover:text-amber-500"
              title="Download QR"
            >
              <Download className="h-5 w-5 cursor-pointer" />
            </a>

            {/* QR Image */}
            <img
              src={openQr}
              alt={`Table ${selectedTable?.table_number} QR`}
              className="w-full h-auto object-contain"
            />

            {/* Close Button */}
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
