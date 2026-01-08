"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";

import "@/styles/customButtons.css";
import ToastProvider from "@/components/ToastProvider";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      const res = await fetch(`${API_URL}/api/item-categories/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setCategories(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Login again!");

      const payload = { name: categoryName, description };
      const url = editId
        ? `${API_URL}/api/item-categories/${editId}/`
        : `${API_URL}/api/item-categories/`;
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Failed to save");

      toast.success(editId ? "Category updated!" : "Category created!");
      closeModal();
      fetchCategories();
    } catch (err) {
      toast.error(err.message || "Error saving category");
    }
    setLoading(false);
  };

  const handleEdit = (cat) => {
    setEditId(cat.reference_id);
    setCategoryName(cat.name);
    setDescription(cat.description || "");
    setShowForm(true);
  };

  const closeModal = () => {
    setShowForm(false);
    setEditId(null);
    setCategoryName("");
    setDescription("");
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteCategory) return;
  
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${API_URL}/api/item-categories/${deleteCategory.reference_id}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Token ${token}` },
        }
      );
  
      if (!res.ok) throw new Error("Delete failed");
  
      toast.success("Category deleted!");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Delete failed");
    } finally {
      setShowDeleteModal(false);
      setDeleteCategory(null);
    }
  };
  
  return (
    <div className="container mx-auto h-[500px] flex flex-col font-sans px-1  ">
      <ToastProvider />

      <div className="flex flex-col md:flex-row items-center justify-between gap-2 py-0 my-0 mb-1">
        <h1 className="self-start text-left text-lg md:text-[15px] font-bold">
          Categorie
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
              placeholder="Search Category..."
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
              <span className="font-semibold">{deleteCategory?.name}</span>?
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
          <div className="bg-white w-full max-w-md lg:max-w-lg rounded shadow-md overflow-hidden animate-in fade-in zoom-in duration-200 lg:mb-7">
            <div className="flex justify-end items-end p-1 border-b  border-gray-100">
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-3 space-y-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 ">
                  Name
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Beverages"
                  className="border p-1 w-full text-sm border-amber-300  rounded focus:outline-none focus:ring-1 focus:ring-amber-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description..."
                  rows={3}
                  className="border p-1 w-full text-sm border-amber-300  rounded focus:outline-none focus:ring-1 focus:ring-amber-200"
                />
              </div>

              <div className="flex justify-end ">
                <button
                  type="button"
                  onClick={closeModal}
                  className="formCancleButton px-3 py-1 border-2 cursor-pointer text-gray-600 hover:bg-gray-100 rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="formButton bg-amber-600 text-white px-6  rounded-lg  hover:bg-amber-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="min-h-0 bg-white rounded border shadow-sm overflow-hidden">
        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
          <table className="min-w-full border-collapse table-fixed">
            <thead className="sticky top-0 bg-green-700 uppercase text-sm font-bold text-black z-10">
              <tr>
                <th className="w-1/12 border px-4 py-2 text-left">SN</th>
                <th className="w-1/3 border  px-6 py-2 text-left">Name</th>
                <th className="w-1/2 border  px-6 py-2 text-left">
                  Description
                </th>
                <th className="w-1/8 border  px-2 py-2 text-end pr-4">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-6 text-gray-400 border "
                  >
                    {search
                      ? "categories not match your search"
                      : "categories not found"}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat, index) => (
                  <tr
                    key={cat.reference_id}
                    className="hover:bg-gray-50/50 transition "
                  >
                    <td className=" px-4 py-1 border">{index + 1}</td>

                    <td className=" px-6 py-1 border  truncate">{cat.name}</td>

                    <td className=" px-6 py-1 border ">
                      <div className="max-h-10 overflow-y-auto pr-1 custom-scrollbar text-gray-600 italic">
                        {cat.description || "-"}
                      </div>
                    </td>

                    <td className=" px-2 py-1 border ">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-1 text-amber-600 hover:bg-amber-100 rounded-full transition"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteCategory(cat);
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
    </div>
  );
}
