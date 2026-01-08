"use client";

import { Trash2, Edit2, X, Plus, ChevronDown } from "lucide-react";
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
    <>
      <div className="mx-auto min-h-screen font-sans p-4 bg-[#ddf4e2] ">
        <ToastProvider />

        <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-2">
          <h1 className="self-start text-left text-[15px] font-bold text-[#236B28]">
            Menu
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
                placeholder="Search Menu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-[#236B28]/30 rounded-md pl-8 pr-3 py-1 text-[12px]
        focus:outline-none focus:ring-1 focus:ring-[#236B28]/40"
              />
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-1 px-4 py-1.5 text-[12px] font-semibold
      bg-[#236B28] text-white rounded-md shadow-sm hover:bg-[#1C5721] transition"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[1px]">
            <div className="bg-white w-full max-w-2xl rounded shadow-lg overflow-hidden animate-in fade-in zoom-in duration-150 border border-gray-200">
              <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100 bg-white">
                <h2 className="text-[14px] font-semibold text-gray-800 tracking-tight">Menu Categorie</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-all p-1 hover:bg-gray-100 rounded"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </div>

              <div className="p-3">
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-[12px] text-gray-600 font-medium whitespace-nowrap">Menu Date:</label>
                  <input
                    type="date"
                    value={form.menu_date}
                    onChange={(e) => setForm({ ...form, menu_date: e.target.value })}
                    className="w-40 border border-gray-300 px-2 py-1 rounded hover:border-blue-400 focus:border-blue-500 outline-none transition-all text-[12px]"
                    required
                  />
                </div>

                <div className="overflow-hidden border border-gray-100 rounded">
                  <table className="w-full border-collapse">
                    <thead className="bg-[#fafafa] border-b border-gray-200">
                      <tr className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                        <th className="px-2 py-1.5 text-left border-r border-gray-100">Name</th>
                        <th className="px-2 py-1.5 text-left w-20 border-r border-gray-100">Price</th>
                        <th className="px-2 py-1.5 text-left border-r border-gray-100">Category</th>
                        <th className="px-2 py-1.5 text-left w-24 border-r border-gray-100">Unit</th>
                        <th className="px-2 py-1.5 text-center w-12 border-r border-gray-100">Img</th>
                        <th className="px-2 py-1.5 text-center w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {form.categories.map((cat, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                          <td className="p-1">
                            <input
                              type="text"
                              value={cat.name}
                              placeholder="Enter your menu name"
                              onChange={(e) => handleCategoryChange(idx, "name", e.target.value)}
                              className="w-full border border-gray-200 px-2 py-1 rounded text-[12px] focus:border-blue-400 outline-none transition-all"
                              required
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="number"
                              value={cat.price}
                              placeholder="0.00"
                              onChange={(e) => handleCategoryChange(idx, "price", e.target.value)}
                              className="w-full border border-gray-200 px-2 py-1 rounded text-[12px] focus:border-blue-400 outline-none transition-all"
                              required
                            />
                          </td>
                          <td className="p-1">
                            <div className="relative group">
                              <select
                                value={cat.item_category}
                                onChange={(e) => handleCategoryChange(idx, "item_category", e.target.value)}
                                className="w-full appearance-none bg-white border border-[#d9d9d9] hover:border-[#40a9ff] focus:border-[#40a9ff] focus:shadow-[0_0_0_2px_rgba(24,144,255,0.2)] px-2 py-1 pr-6 rounded text-[12px] transition-all outline-none cursor-pointer"
                                required
                              >
                                <option value="" disabled>Select</option>
                                {categoriesList.map((c) => (
                                  <option key={c.reference_id} value={c.reference_id}>{c.name}</option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-gray-400 group-hover:text-gray-500">
                                <ChevronDown size={12} />
                              </div>
                            </div>
                          </td>

                          <td className="p-1">
                            <div className="relative group">
                              <select
                                value={cat.unit}
                                onChange={(e) => handleCategoryChange(idx, "unit", e.target.value)}
                                className="w-full appearance-none bg-white border border-[#d9d9d9] hover:border-[#40a9ff] focus:border-[#40a9ff] focus:shadow-[0_0_0_2px_rgba(24,144,255,0.2)] px-2 py-1 pr-6 rounded text-[12px] transition-all outline-none cursor-pointer"
                                required
                              >
                                <option value="" disabled>Unit</option>
                                {units.map((u) => (
                                  <option key={u.reference_id} value={u.reference_id}>{u.name}</option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-gray-400 group-hover:text-gray-500">
                                <ChevronDown size={12} />
                              </div>
                            </div>
                          </td>
                          <td className="p-1 text-center">
                            <input type="file" id={`upload-${idx}`} onChange={(e) => handleCategoryImage(idx, e)} className="hidden" />
                            <label htmlFor={`upload-${idx}`} className="mx-auto w-6 h-6 flex items-center justify-center border border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500 bg-white">
                              {cat.imagePreview ? <img src={cat.imagePreview} className="w-full h-full object-cover rounded" /> : <Plus size={10} className="text-gray-400" />}
                            </label>
                          </td>
                          <td className="p-1 text-center">
                            <div className="flex justify-center items-center gap-1">
                              <button type="button" onClick={() => handleDeleteCategoryForm(idx)} className="p-1 text-gray-400 hover:text-red-500">
                                <X size={14} />
                              </button>
                              {idx === form.categories.length - 1 && (
                                <button type="button" onClick={handleAddCategory} className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                                  <Plus size={14} strokeWidth={3} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-2 px-4 py-2 border-t border-gray-100 bg-gray-50/50">

                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="px-4 py-1 bg-[#236B28] text-white rounded text-[12px] hover:bg-green-800 transition-all font-medium shadow-sm"
                >
                  {loading ? "saving..." : "save"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 bg-white rounded-md border border-gray-300 shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(100vh - 150px)' }}>
            <table className="min-w-full border-separate border-spacing-0 table-fixed text-[11px]">

              <thead className="sticky top-0 bg-[#fafafa] z-10">
                <tr>
                  {["SN", "Date", "Name", "Price", "Category", "Unit", "Image", "Action"].map((header, i) => (
                    <th
                      key={header}
                      className="border-b border-r border-gray-200 px-2 py-1 text-left font-bold text-gray-700 last:border-r-0"
                      style={{ width: header === "SN" ? "40px" : header === "Action" ? "80px" : "auto" }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white">
                {filteredMenus.map((menu, index) => (
                  <tr key={menu.reference_id} className="hover:bg-blue-50/30 transition-all">

                    <td className="border-b border-r border-gray-200 px-2 py-0.5 text-gray-600 last:border-r-0">{index + 1}</td>
                    <td className="border-b border-r border-gray-200 px-2 py-0.5 text-gray-500 last:border-r-0">{menu.menu_date}</td>

                    <td className="border-b border-r border-gray-200 px-1 py-0.5 last:border-r-0">
                      <div className="border border-gray-200 rounded px-1 py-0.5 bg-gray-50/50 text-gray-800 truncate">
                        {menu.name}
                      </div>
                    </td>

                    <td className="border-b border-r border-gray-200 px-1 py-0.5 last:border-r-0">
                      <div className="border border-gray-200 rounded px-1 py-0.5 text-center">
                        {menu.price}
                      </div>
                    </td>

                    <td className="border-b border-r border-gray-200 px-2 py-0.5 last:border-r-0">
                      <span className="text-[10px] px-1.5 py-0 border border-gray-200 rounded bg-white text-gray-500">
                        {getCategoryName(menu.item_category)}
                      </span>
                    </td>

                    <td className="border-b border-r border-gray-200 px-2 py-0.5 last:border-r-0 text-gray-500">
                      {getUnitName(menu.unit)}
                    </td>

                    <td className="border-b border-r border-gray-200 px-2 py-0.5 last:border-r-0">
                      <div className="w-6 h-6 rounded border border-gray-200 overflow-hidden mx-auto bg-gray-50">
                        <MenuImageHover src={menu.image || menu.image_url} />
                      </div>
                    </td>

                    <td className="border-b border-gray-200 px-2 py-0.5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditMenu(menu)} className="text-blue-500 hover:scale-110 transition">
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setDeleteMenu(menu); setShowDeleteModal(true); }}
                          className="text-red-400 hover:scale-110 transition"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </>
  );
}
