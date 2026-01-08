"use client";

import { Trash2, Edit2, X } from "lucide-react";
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
    <div className=" mx-auto min-h-screen font-sans p-4 bg-[#ddf4e2]">
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

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3">
          <div className="bg-white w-full max-w-3xl lg:max-w-3xl rounded shadow-md overflow-hidden animate-in fade-in zoom-in duration-200 lg:mb-20">
            <div className="flex justify-end p-1 border-b">
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto pt-2 px-2 space-y-1">
              <form onSubmit={handleSubmit} className="space-y-1">
                <div>
                  <label className="block mb-1 text-sm">Menu Date</label>
                  <input
                    type="date"
                    value={form.menu_date}
                    onChange={(e) =>
                      setForm({ ...form, menu_date: e.target.value })
                    }
                    className="w-full placeholder:text-sm border border-amber-300 p-1 rounded focus:outline-none focus:ring-1 focus:ring-amber-200"
                    required
                  />
                </div>

                {form.categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2 border p-1 rounded items-center"
                  >
                    <input
                      type="text"
                      placeholder="Name"
                      value={cat.name}
                      onChange={(e) =>
                        handleCategoryChange(idx, "name", e.target.value)
                      }
                      className="border p-1 text-sm border-amber-300  rounded focus:outline-none focus:ring-1 focus:ring-amber-200"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={cat.price}
                      onChange={(e) =>
                        handleCategoryChange(idx, "price", e.target.value)
                      }
                      className="border p-1 text-sm border-amber-300  rounded focus:outline-none focus:ring-1 focus:ring-amber-200"
                      required
                    />
                    <select
                      value={cat.item_category}
                      onChange={(e) =>
                        handleCategoryChange(
                          idx,
                          "item_category",
                          e.target.value
                        )
                      }
                      className="border p-1 text-sm border-amber-300  rounded focus:outline-none focus:ring-1 focus:ring-amber-200"
                      required
                    >
                      <option value="">Select Category</option>
                      {categoriesList.map((c) => (
                        <option key={c.reference_id} value={c.reference_id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={cat.unit}
                      onChange={(e) =>
                        handleCategoryChange(idx, "unit", e.target.value)
                      }
                      className="border p-1 text-sm  border-amber-300  rounded focus:outline-none focus:ring-1 focus:ring-amber-200"
                      required
                    >
                      <option value="">Select Unit</option>
                      {units.map((u) => (
                        <option key={u.reference_id} value={u.reference_id}>
                          {u.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-4 ">
                      <input
                        type="file"
                        accept="image/*"
                        id={`upload-${idx}`}
                        onChange={(e) => handleCategoryImage(idx, e)}
                        className="hidden"
                      />
                      <label
                        htmlFor={`upload-${idx}`}
                        className="border p-1 text-sm border-amber-300 w-full  rounded focus:outline-none focus:ring-1 focus:ring-amber-200"
                      >
                        {cat.imagePreview ? (
                          <img
                            src={cat.imagePreview}
                            className="w-full h-20 object-cover rounded"
                          />
                        ) : (
                          "Upload"
                        )}
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategoryForm(idx)}
                        className="text-red-600"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between  p-2 border-t bg-white sticky bottom-0">
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="
    flex items-center justify-center 
    h-[24px] w-[80px] px-4 mt-2
    bg-amber-500 hover:shadow-amber-500
    text-black text-sm cursor-pointer
    rounded shadow-sm
    transition active:scale-95
  "
                  >
                    Add
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    onClick={handleSubmit}
                    className="formButton px-3 py-1 bg-amber-600 text-white rounded-lg"
                  >
                    {loading
                      ? "Saving..."
                      : editingMenuId
                        ? "Update"
                        : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="flex-1 min-h-0 bg-white rounded-sm border border-[#236B28]/20 shadow-sm overflow-hidden">
        <div className="overflow-y-auto max-h-[450px] custom-scrollbar">
          <table className="min-w-full border-collapse table-fixed text-[12px]">
            <thead className="sticky top-0 bg-[#EAF5EA] uppercase text-[11px] font-semibold text-[#236B28] z-10">
              <tr>
                <th className="w-1/15 border-b border-[#236B28]/20 px-4 py-2 text-left">SN</th>
                <th className="w-1/7 border-b border-[#236B28]/20 px-6 py-2 text-left">Date</th>
                <th className="w-1/5 border-b border-[#236B28]/20 px-6 py-2 text-left">Name</th>
                <th className="w-1/7 border-b border-[#236B28]/20 px-6 py-2 text-left">Price</th>
                <th className="w-1/7 border-b border-[#236B28]/20 px-4 py-2 text-left">Category</th>
                <th className="w-1/7 border-b border-[#236B28]/20 px-2 py-2 text-left">Unit</th>
                <th className="w-1/12 border-b border-[#236B28]/20 px-2 py-2 text-left">Image</th>
                <th className="w-1/12 border-b border-[#236B28]/20 px-2 py-2 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="text-[12px] text-slate-700">
              {filteredMenus.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-gray-400 border-b"
                  >
                    {search ? "Menu not matching your search" : "Menu not found"}
                  </td>
                </tr>
              ) : (
                filteredMenus.map((menu, index) => (
                  <tr
                    key={menu.reference_id}
                    className="hover:bg-[#F3FBF5] transition"
                  >
                    <td className="border-b px-4 py-2">{index + 1}</td>
                    <td className="border-b px-4 py-2">{menu.menu_date}</td>
                    <td className="border-b px-4 py-2 font-medium text-slate-800">
                      {menu.name}
                    </td>
                    <td className="border-b px-4 py-2">{menu.price}</td>
                    <td className="border-b px-4 py-2">
                      {getCategoryName(menu.item_category)}
                    </td>
                    <td className="border-b px-4 py-2">
                      {getUnitName(menu.unit)}
                    </td>

                    {/* IMAGE (unchanged component) */}
                    <MenuImageHover src={menu.image || menu.image_url} />

                    {/* ACTION */}
                    <td className="border-b px-2 py-2">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEditMenu(menu)}
                          className="p-1.5 text-[#236B28] bg-[#EAF5EA]
                    hover:bg-[#236B28] hover:text-white rounded-md transition"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteMenu(menu);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 text-red-500 bg-red-50
                    hover:bg-red-500 hover:text-white rounded-md transition"
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
  );
}