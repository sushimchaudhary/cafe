"use client";

import { Trash2, Edit2, X } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ToastProvider from "./ToastProvider";
import { useRef } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminMenuManager() {
  const formRef = useRef(null);
  const [units, setUnits] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [menus, setMenus] = useState([]);
  const [tableToken, setTableToken] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableInfo, setTableInfo] = useState(null);

  const [form, setForm] = useState({
    menu_date: "",
    categories: [
      { name: "", price: "", item_category: "", unit: "", imageFile: null },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [showForm, setShowForm] = useState(false);


  const extractTokenFromUrl = (url) => {
    try {
      const params = new URL(url).searchParams;
      return params.get("token");
    } catch (err) {
      console.warn("Failed to extract token from URL:", err);
      return null;
    }
  };

  
 


  const fetchTableInfo = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/tables/?token=${token}`);
      const data = await res.json();
      console.log("Table info response:", data);

      if (data.data && data.data.length > 0) {
        setTableInfo(data.data[0]); // usually 1 table per token
        console.log("Set tableInfo:", data.data[0]);
      } else {
        toast.error("Invalid table token!");
      }
    } catch (err) {
      console.error("Fetch table info failed:", err);
      toast.error("Failed to fetch table info");
    }
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

  // Helper function to extract ID from string representations like "ItemCategory object (17)"
  const extractIdFromString = (value) => {
    if (typeof value === "string" && value.includes("object")) {
      const match = value.match(/\((\d+)\)/);
      return match ? match[1] : null;
    }
    return null;
  };

  // Helper function to get category name
  const getCategoryName = (itemCategory) => {
    if (!itemCategory) return "N/A";

    // If it's an object with name property
    if (typeof itemCategory === "object" && itemCategory !== null) {
      if (itemCategory.name) return itemCategory.name;
      // Check for nested properties
      if (itemCategory.item_category && itemCategory.item_category.name) {
        return itemCategory.item_category.name;
      }
      // Check if it has an id or reference_id we can use to lookup
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

    // If it's a string, try to find in list
    if (typeof itemCategory === "string" && itemCategory) {
      // First try direct match with reference_id
      const found = categoriesList.find((c) => c.reference_id === itemCategory);
      if (found) return found.name;

      // Try extracting ID from string representation like "ItemCategory object (17)"
      const extractedId = extractIdFromString(itemCategory);
      if (extractedId) {
        // Try to find by id (primary key) or reference_id
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

  // Helper function to get unit name
  const getUnitName = (unit) => {
    if (!unit) return "N/A";

    // If it's an object with name property
    if (typeof unit === "object" && unit !== null) {
      if (unit.name) return unit.name;
      // Check for nested properties
      if (unit.unit && unit.unit.name) {
        return unit.unit.name;
      }
      // Check if it has an id or reference_id we can use to lookup
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

    // If it's a string, try to find in list
    if (typeof unit === "string" && unit) {
      // First try direct match with reference_id
      const found = units.find((u) => u.reference_id === unit);
      if (found) return found.name;

      // Try extracting ID from string representation like "Unit object (7)"
      const extractedId = extractIdFromString(unit);
      if (extractedId) {
        // Try to find by id (primary key) or reference_id
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

  // --- Form Handlers ---
  const handleCategoryChange = (index, field, value) => {
    const updated = [...form.categories];
    updated[index][field] = value;
    setForm({ ...form, categories: updated });
  };

  const handleCategoryImage = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const updated = [...form.categories];
    updated[index].imageFile = file;
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

  useEffect(() => {
    const token = extractTokenFromUrl(window.location.href);
    setTableToken(token);
    console.log("Customer page tableToken:", token);

    if (token) fetchTableInfo(token);
  }, []);

  // --- Submit Menu ---
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     const token = localStorage.getItem("adminToken");
  //     if (!token) throw new Error("Login again!");

  //     const formData = new FormData();
  //     formData.append("menu_date", form.menu_date);

  //     form.categories.forEach((cat, index) => {
  //       const categoryJSON = {
  //         name: cat.name,
  //         price: cat.price,
  //         item_category: cat.item_category,
  //         unit: cat.unit,
  //       };
  //       formData.append(`items[${index}][name]`, cat.name);
  //       formData.append(`items[${index}][price]`, cat.price);
  //       formData.append(`items[${index}][item_category]`, cat.item_category);
  //       formData.append(`items[${index}][unit]`, cat.unit);

  //       if (cat.imageFile) {
  //         formData.append(`items[${index}][image]`, cat.imageFile);
  //       }
  //     });

  //     for (let pair of formData.entries()) {
  //       console.log(pair[0], pair[1]);
  //     }

  //     const url = editingMenuId
  //       ? `${API_URL}/api/menus/${editingMenuId}/`
  //       : `${API_URL}/api/menus/`;
  //     const method = editingMenuId ? "PATCH" : "POST";

  //     const res = await fetch(url, {
  //       method,
  //       headers: { Authorization: `Token ${token}` },
  //       body: formData,
  //     });

  //     const resData = await res.json();
  //     if (!res.ok || resData.response_code !== "0") {
  //       const errorMessages = Object.values(resData.errors || {})
  //         .flat()
  //         .join(" | ");
  //       throw new Error(errorMessages || "Failed to save menu");
  //     }

  //     toast.success(editingMenuId ? "Menu updated!" : "Menu created!");
  //     setForm({
  //       menu_date: "",
  //       categories: [
  //         { name: "", price: "", item_category: "", unit: "", imageFile: "" },
  //       ],
  //     });
  //     setEditingMenuId(null);
  //     fetchMenus();
  //   } catch (err) {
  //     console.error(err);
  //     toast.error(err.message || "Error saving menu");
  //   }
  //   setLoading(false);
  // };

  const handleSubmit = async () => {
    if (!tableInfo || !tableToken) {
      console.error("Missing table info or token!");
      toast.error("Table info is still loading. Try again.");
      return;
    }

    const table_id = tableInfo.id; // Use 'id', not reference_id
    const token_number = tableToken;

    const orderPayload = {
      table_id,
      token_number,
      items: cart.map((item) => ({
        menu_name: item.name,
        quantity: item.qty,
        item_price: parseFloat(item.price),
        total_price: parseFloat(item.price) * item.qty,
      })),
    };

    console.log("Submitting order payload:", orderPayload);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      console.log("Order response:", data);

      if (res.ok) {
        toast.success("Order submitted successfully!");
      } else {
        toast.error(data.message || "Order submission failed!");
      }
    } catch (err) {
      console.error("Order submit failed:", err);
      toast.error("Order submission failed!");
    }

    setLoading(false);
  };


  const handleEditMenu = (menu) => {
    setEditingMenuId(menu.reference_id);

    setForm({
      menu_date: menu.menu_date,
      categories: [
        {
          name: menu.name || "",
          price: menu.price || "",
          item_category: menu.item_category || "",
          unit: menu.unit || "",
          imageFile: null,
        },
      ],
    });

    if (formRef.current) {
      formRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleDeleteMenu = async (menuId) => {
    if (!confirm("Are you sure you want to delete this menu?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/menus/${menuId}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete menu");
      toast.success("Menu deleted!");
      fetchMenus();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Delete failed");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
    setShowForm(false);
  };
  return (
    <div className="container min-h-screen">
      <ToastProvider />

      {!showForm && (
        <div className="flex flex-row items-center justify-between px-4 sm:px-6 md:px-10 py-3 gap-4">
          {/* Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 leading-tight truncate">
              Menus Management
            </h1>
          </div>

          {/* Button */}
          <div className="flex-shrink-0 ml-4">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-bold shadow-lg transition duration-300 cursor-pointer"
            >
              + Create
            </button>
          </div>
        </div>
      )}

      {/* FORM */}
      {showForm && (
        <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-600">
              {editingMenuId ? "Edit Menu" : "Create Menu"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-600 hover:text-red-600 font-medium"
            >
              <X size={20} />
            </button>
          </div>

          <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
            {/* MENU DATE */}
            <div>
              <label className="block mb-2 font-semibold ">Menu Date</label>
              <input
                type="date"
                value={form.menu_date}
                onChange={(e) =>
                  setForm({ ...form, menu_date: e.target.value })
                }
                className="w-full border border-blue-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* CATEGORIES */}
            {form.categories.map((cat, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-4 border border-blue-200 p-4 rounded-lg shadow-sm items-center"
              >
                <input
                  type="text"
                  placeholder="Name"
                  value={cat.name}
                  onChange={(e) =>
                    handleCategoryChange(idx, "name", e.target.value)
                  }
                  className="w-full border border-blue-300 p-2 rounded-lg"
                  required
                />

                <input
                  type="number"
                  placeholder="Price"
                  value={cat.price}
                  onChange={(e) =>
                    handleCategoryChange(idx, "price", e.target.value)
                  }
                  className="w-full border border-blue-300 p-2 rounded-lg"
                  required
                />

                <select
                  value={cat.item_category}
                  onChange={(e) =>
                    handleCategoryChange(idx, "item_category", e.target.value)
                  }
                  className="w-full border border-blue-300 p-2 rounded-lg"
                  required
                >
                  <option value="">Select Item Category</option>
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
                  className="w-full border border-blue-300 p-2 rounded-lg"
                  required
                >
                  <option value="">Select Unit</option>
                  {units.map((u) => (
                    <option key={u.reference_id} value={u.reference_id}>
                      {u.name}
                    </option>
                  ))}
                </select>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCategoryImage(idx, e)}
                  className="w-full border border-blue-300 p-2 rounded-lg"
                />

                <button
                  type="button"
                  onClick={() => handleDeleteCategoryForm(idx)}
                  className="text-red-600 hover:text-red-800 flex justify-center"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddCategory}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
            >
              + Add Category
            </button>

            {/* SUBMIT */}
            <div className="text-right">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 w-full sm:w-auto"
              >
                {loading ? "Saving..." : editingMenuId ? "Update " : "Create "}
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="p-3">
        <div className="overflow-x-auto rounded border border-blue-200">
          <table className="min-w-full divide-y divide-blue-200">
            {/* Table Head */}
            <thead className="bg-blue-50 uppercase text-sm">
              <tr>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Menu Date
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Name
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Price
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Item Category
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Unit
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Image
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-blue-200 text-sm">
              {menus.map((menu) => (
                <tr
                  key={menu.reference_id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="border px-4 py-2">{menu.menu_date}</td>
                  <td className="border px-4 py-2">{menu.name}</td>
                  <td className="border px-4 py-2">{menu.price}</td>
                  <td className="border px-4 py-2">
                    {menu.item_category_name || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {menu.unit_name || "N/A"}
                  </td>
                  <td className="border px-4 py-2">
                    {menu.image || menu.image_url ? (
                      <img
                        src={menu.image || menu.image_url}
                        alt={menu.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded"
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>
                  <td className="px-4 py-2 flex justify-center gap-2">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => {
                          handleEditMenu(menu);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:bg-blue-100 p-2 rounded"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenu(menu.reference_id)}
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
    </div>
  );
}
