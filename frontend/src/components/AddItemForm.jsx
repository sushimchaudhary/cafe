"use client";

import { Trash2, Edit2, X, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ToastProvider from "./ToastProvider";
import { useRef } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import "../styles/customButtons.css";
import MenuImageHover from "./ImageHover";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminMenuManager() {
  const formRef = useRef(null);
  const [units, setUnits] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [menus, setMenus] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteMenu, setDeleteMenu] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [form, setForm] = useState({
    menu_date: "",
    categories: [
      { name: "", price: "", item_category: "", unit: "", imageFile: null },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const resetForm = () => {
    setForm({
      menu_date: "",
      categories: [
        {
          name: "",
          price: "",
          item_category: "",
          unit: "",
          imageFile: null,
          imagePreview: null,
        },
      ],
    });
    setEditingMenuId(null);
  };

  // --- Fetch Units & Categories ---
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
      console.error(err);
      toast.error("Failed to fetch units");
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      const res = await fetch(`${API_URL}/api/item-categories/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setCategoriesList(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch categories");
    }
  };

  const fetchMenus = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;
      const res = await fetch(`${API_URL}/api/menus/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      console.log("Menus API Data:", data);
      if (data.data && data.data.length > 0) {
        console.log("Sample menu item_category:", data.data[0].item_category);
        console.log(
          "Sample menu item_category type:",
          typeof data.data[0].item_category
        );
        console.log("Sample menu unit:", data.data[0].unit);
        console.log("Sample menu unit type:", typeof data.data[0].unit);
      }
      setMenus(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch menus");
    }
  };

  useEffect(() => {
    fetchUnits();
    fetchCategories();
    fetchMenus();
  }, []);

  const extractIdFromString = (value) => {
    if (typeof value === "string" && value.includes("object")) {
      const match = value.match(/\((\d+)\)/);
      return match ? match[1] : null;
    }
    return null;
  };

  const getCategoryName = (itemCategory) => {
    if (!itemCategory) return "N/A";

    if (typeof itemCategory === "object" && itemCategory !== null) {
      if (itemCategory.name) return itemCategory.name;

      if (itemCategory.item_category && itemCategory.item_category.name) {
        return itemCategory.item_category.name;
      }

      const lookupId = itemCategory.reference_id || itemCategory.id;
      if (lookupId) {
        const found = categoriesList.find(
          (c) =>
            c.reference_id === lookupId ||
            (c.id && String(c.id) === String(lookupId))
        );
        if (found) return found.name;
      }
    }

    if (typeof itemCategory === "string" && itemCategory) {
      const found = categoriesList.find((c) => c.reference_id === itemCategory);
      if (found) return found.name;

      const extractedId = extractIdFromString(itemCategory);
      if (extractedId) {
        const foundById = categoriesList.find((c) => {
          if (c.id && String(c.id) === extractedId) return true;
          if (c.reference_id === extractedId) return true;
          return false;
        });
        if (foundById) return foundById.name;
      }
    }

    return "N/A";
  };

  const getUnitName = (unit) => {
    if (!unit) return "N/A";

    if (typeof unit === "object" && unit !== null) {
      if (unit.name) return unit.name;

      if (unit.unit && unit.unit.name) {
        return unit.unit.name;
      }

      const lookupId = unit.reference_id || unit.id;
      if (lookupId) {
        const found = units.find(
          (u) =>
            u.reference_id === lookupId ||
            (u.id && String(u.id) === String(lookupId))
        );
        if (found) return found.name;
      }
    }

    if (typeof unit === "string" && unit) {
      const found = units.find((u) => u.reference_id === unit);
      if (found) return found.name;

      const extractedId = extractIdFromString(unit);
      if (extractedId) {
        const foundById = units.find((u) => {
          if (u.id && String(u.id) === extractedId) return true;
          if (u.reference_id === extractedId) return true;
          return false;
        });
        if (foundById) return foundById.name;
      }
    }

    return "N/A";
  };

  const handleCategoryChange = (index, field, value) => {
    const updated = [...form.categories];
    updated[index][field] = value;
    setForm({ ...form, categories: updated });
  };

  const handleCategoryImage = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 1024 * 1024;

    if (file.size > MAX_SIZE) {
      toast.error("Image size must be less than 1MB");
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      e.target.value = "";
      return;
    }

    const updated = [...form.categories];
    updated[index].imageFile = file;
    updated[index].imagePreview = URL.createObjectURL(file);
    setForm({ ...form, categories: updated });
  };

  const handleAddCategory = () => {
    setForm({
      ...form,
      categories: [
        ...form.categories,
        { name: "", price: "", item_category: "", unit: "", imageFile: null },
      ],
    });
  };

  const handleDeleteCategoryForm = (index) => {
    const updated = form.categories.filter((_, i) => i !== index);
    setForm({ ...form, categories: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      if (!token) throw new Error("Login again!");

      const formData = new FormData();

      if (editingMenuId) {
        const cat = form.categories[0];

        formData.append("menu_date", form.menu_date);
        formData.append("name", cat.name);
        formData.append("price", cat.price);
        formData.append("item_category", cat.item_category);
        formData.append("unit", cat.unit);

        if (cat.imageFile) {
          formData.append("image", cat.imageFile);
        }
      } else {
        formData.append("menu_date", form.menu_date);

        form.categories.forEach((cat, index) => {
          const categoryJSON = {
            name: cat.name,
            price: cat.price,
            item_category: cat.item_category,
            unit: cat.unit,
          };
          formData.append(`items[${index}][name]`, cat.name);
          formData.append(`items[${index}][price]`, cat.price);
          formData.append(`items[${index}][item_category]`, cat.item_category);
          formData.append(`items[${index}][unit]`, cat.unit);

          if (cat.imageFile) {
            formData.append(`items[${index}][image]`, cat.imageFile);
          }
        });
        for (let pair of formData.entries()) {
          console.log(pair[0], pair[1]);
        }
      }

      const url = editingMenuId
        ? `${API_URL}/api/menus/${editingMenuId}/`
        : `${API_URL}/api/menus/`;

      const method = editingMenuId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      const resData = await res.json();

      if (!res.ok || resData.response_code !== "0") {
        throw new Error(resData.message || "Save failed");
      }

      toast.success(editingMenuId ? "Menu updated!" : "Menu created!");

      setForm({
        menu_date: "",
        categories: [
          { name: "", price: "", item_category: "", unit: "", imageFile: null },
        ],
      });

      setEditingMenuId(null);
      setShowForm(false);
      fetchMenus();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error saving menu");
    }

    setLoading(false);
  };

  const handleEditMenu = (menu) => {
    setEditingMenuId(menu.reference_id);

    setForm({
      menu_date: menu.menu_date || "",
      categories: [
        {
          name: menu.name || "",
          price: menu.price || "",
          item_category: menu.item_category,
          unit: menu.unit,
          imageFile: null,
          imagePreview: menu.image || menu.image_url || null,
        },
      ],
    });

    setShowForm(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteMenu) return;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${API_URL}/api/menus/${deleteMenu.reference_id}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Token ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete menu");

      toast.success("Menu deleted!");
      fetchMenus();
    } catch (err) {
      toast.error(err.message || "Delete failed");
      console.error(err);
    } finally {
      setShowDeleteModal(false);
      setDeleteMenu(null);
    }
  };

  const filteredMenus = menus.filter(
    (menu) =>
      menu.name?.toLowerCase().includes(search.toLowerCase()) ||
      getCategoryName(menu.item_category)
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
    setShowForm(false);
  };
  return (
    <div className="container mx-auto min-h-screen font-sans px-1">
      <ToastProvider />

      <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-1">
        <h1 className="self-start text-left text-lg md:text-[15px] font-bold">
          Menu
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
              placeholder="Search Menu..."
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
              Are you sure you want to delete menu item{" "}
              <span className="font-semibold">{deleteMenu?.name}</span>?
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
  <div className="fixed inset-0 z-50 flex items-center justify-center pl-15 bg-black/40 p-3">
    <div className="bg-white w-auto max-w-4xl rounded shadow-md overflow-hidden animate-in fade-in zoom-in duration-200">
      
      {/* HEADER */}
      <div className="flex justify-between items-center p-2 border-b sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">Menu Categories</span>
        </div>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-400 hover:text-red-500 transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* MENU DATE */}
      <div className="p-3 border-b">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Menu Date
        </label>
        <input
          type="date"
          value={form.menu_date}
          onChange={(e) =>
            setForm({ ...form, menu_date: e.target.value })
          }
          className="w-full border border-amber-300 p-2 rounded focus:outline-none focus:ring-1 focus:ring-amber-200"
          required
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto max-h-[60vh] custom-scrollbar p-3">
        <table className="min-w-auto border-collapse table-auto">
          <thead className="sticky top-0 bg-[#236B28] text-white text-[10px] font-semibold">
            <tr>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Price</th>
              <th className="border px-2 py-1">Category</th>
              <th className="border px-2 py-1">Unit</th>
              <th className="border px-2 py-1">Image</th>
              <th className="border px-2 py-1">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {form.categories.map((cat, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                {/* Name */}
                <td className="border px-2 py-1">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => handleCategoryChange(idx, "name", e.target.value)}
                    className="w-[150px] border px-1 py-1 rounded focus:outline-none focus:ring-1 focus:ring-amber-200"
                    required
                  />
                </td>

                {/* Price */}
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    value={cat.price}
                    onChange={(e) => handleCategoryChange(idx, "price", e.target.value)}
                    className="w-[150px] border px-1 py-1 rounded focus:outline-none focus:ring-1 focus:ring-amber-200"
                    required
                  />
                </td>

                {/* Category */}
                <td className="border px-2 py-1">
                  <select
                    value={cat.item_category}
                    onChange={(e) => handleCategoryChange(idx, "item_category", e.target.value)}
                    className="w-full border px-1 py-1 rounded focus:outline-none focus:ring-1 focus:ring-amber-200"
                    required
                  >
                    <option value="">Select Category</option>
                    {categoriesList.map((c) => (
                      <option key={c.reference_id} value={c.reference_id}>{c.name}</option>
                    ))}
                  </select>
                </td>

                {/* Unit */}
                <td className="border px-2 py-1">
                  <select
                    value={cat.unit}
                    onChange={(e) => handleCategoryChange(idx, "unit", e.target.value)}
                    className="w-full border px-1 py-1 rounded focus:outline-none focus:ring-1 focus:ring-amber-200"
                    required
                  >
                    <option value="">Select Unit</option>
                    {units.map((u) => (
                      <option key={u.reference_id} value={u.reference_id}>{u.name}</option>
                    ))}
                  </select>
                </td>

                {/* Image */}
                <td className="border px-2 py-1">
                  <input
                    type="file"
                    accept="image/*"
                    id={`upload-${idx}`}
                    onChange={(e) => handleCategoryImage(idx, e)}
                    className="hidden"
                  />
                  <label
                    htmlFor={`upload-${idx}`}
                    className="w-full px-1 py-1 rounded text-sm text-center cursor-pointer border border-dashed border-amber-300 hover:bg-amber-50 transition"
                  >
                    {cat.imagePreview ? (
                      <img
                        src={cat.imagePreview}
                        className="w-full h-16 object-cover rounded"
                      />
                    ) : (
                      "Upload"
                    )}
                  </label>
                </td>

                {/* Action */}
                <td className="border px-2 py-1 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteCategoryForm(idx)}
                      className="p-1 rounded hover:bg-red-100 transition"
                      title="Delete"
                    >
                      <X size={20} className="text-red-600 hover:text-red-800" />
                    </button>

                    {idx === form.categories.length - 1 && (
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="p-1 rounded hover:bg-green-100 transition"
                        title="Add Category"
                      >
                        <Plus size={20} className="text-green-600 hover:text-green-800" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SUBMIT */}
      <div className="flex justify-end p-3 border-t bg-white sticky bottom-0">
        <button
          type="submit"
          disabled={loading}
          onClick={handleSubmit}
          className="formButton px-4 py-2 bg-[#236B28] text-white rounded-lg hover:bg-green-800 transition"
        >
          {loading ? "Saving..." : editingMenuId ? "Update" : "Create"}
        </button>
      </div>
    </div>
  </div>
)}


      {/* TABLE */}
      <div className="flex-1 min-h-0 bg-white rounded border shadow-sm overflow-hidden">
        <div className="overflow-y-auto max-h-[450px] custom-scrollbar">
          <table className="min-w-full border-collapse table-fixed">
            <thead className="sticky top-0 bg-amber-100 uppercase text-sm font-bold text-black z-10">
              <tr>
                <th className="w-1/15 border px-4 py-2 text-left">SN</th>
                <th className="w-1/7 border px-6 py-2 text-left">Date</th>
                <th className="w-1/5 border px-6 py-2 text-left">Name</th>
                <th className="w-1/7 border px-6 py-2 text-left">Price</th>
                <th className="w-1/7 border px-4 py-2 text-left">Category</th>
                <th className="w-1/7 border px-2 py-2 text-left">Unit</th>
                <th className="w-1/12 border px-2 py-2 text-left">Image</th>
                <th className="w-1/12 border px-2 py-2 text-left">Action</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {filteredMenus.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-6 text-gray-400 border "
                  >
                    {search
                      ? "menu not match your search"
                      : "menu not found"}
                  </td>
                </tr>
              ) : (
                filteredMenus.map((menu, index) => (
                  <tr
                    key={menu.reference_id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="border px-4">{index + 1}</td>
                    <td className="border px-4">{menu.menu_date}</td>
                    <td className="border px-4">{menu.name}</td>
                    <td className="border px-4">{menu.price}</td>
                    <td className="border px-4">
                      {getCategoryName(menu.item_category)}
                    </td>
                    <td className="border px-4 ">{getUnitName(menu.unit)}</td>
                    <MenuImageHover src={menu.image || menu.image_url} />

                    {/* <td className="border px-4 ">
                      {menu.image || menu.image_url ? (
                        <img
                          src={menu.image || menu.image_url}
                          className="w-5 h-5 object-cover rounded"
                        />
                      ) : (
                        "No Image"
                      )}
                    </td> */}
                    <td className="px-2  border">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEditMenu(menu)}
                          className="p-1 text-amber-600 hover:bg-amber-100 rounded-full transition"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteMenu(menu);
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
