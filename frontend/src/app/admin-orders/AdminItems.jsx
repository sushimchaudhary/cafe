import { useState, useEffect } from "react";

export default function AdminItems() {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({
        item_name: "",
        category: "",
        type: "quantity_only",
        price: "",
        halfPrice: "",
        pricePerKg: "",
        description: "",
        image: "",
        is_available: true,
    });
    const [editId, setEditId] = useState(null);
    const [categories, setCategories] = useState([
        "Coffee",
        "Chowmin",
        "Meat",
        "Mains",
        "Starters",
    ]);
    const [newCategory, setNewCategory] = useState("");
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

    // Load items from localStorage
    useEffect(() => {
        const savedItems = JSON.parse(localStorage.getItem("menuItems") || "[]");
        setItems(savedItems);
    }, []);

    // ⭐ FIXED IMAGE UPLOAD — Convert to Base64
    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setForm({ ...form, image: reader.result }); // Base64 string
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
        let updatedItems;

        // ⭐ Base64 already stored
        let finalImage = form.image;

        if (editId) {
            updatedItems = items.map((i) =>
                i.id === editId ? { ...form, image: finalImage, id: editId } : i
            );
        } else {
            updatedItems = [...items, { ...form, image: finalImage, id: Date.now() }];
        }

        setItems(updatedItems);
        localStorage.setItem("menuItems", JSON.stringify(updatedItems));

        setForm({
            item_name: "",
            category: "",
            type: "quantity_only",
            price: "",
            halfPrice: "",
            pricePerKg: "",
            description: "",
            image: "",
            is_available: true,
        });
        setEditId(null);
        setShowNewCategoryInput(false);
    };

    const editItem = (item) => {
        setForm(item);
        setEditId(item.id);
        setShowNewCategoryInput(false);
    };

    const deleteItem = (id) => {
        const filtered = items.filter((i) => i.id !== id);
        setItems(filtered);
        localStorage.setItem("menuItems", JSON.stringify(filtered));
    };

    const handleAddNewCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            setCategories([...categories, newCategory.trim()]);
            setForm({ ...form, category: newCategory.trim() });
            setNewCategory("");
            setShowNewCategoryInput(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">🍽️ Admin Item Management</h2>

            {/* Form Card */}
            <div className="bg-white shadow-xl rounded-2xl p-8 mb-8 border border-gray-100">
                <h4 className="text-xl font-semibold mb-6 text-gray-700">
                    {editId ? "✏️ Edit Item" : "➕ Add New Item"}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Item Name */}
                    <div>
                        <label className="block font-medium mb-2 text-gray-600">Item Name</label>
                        <input
                            type="text"
                            placeholder="Item Name"
                            value={form.item_name}
                            onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block font-medium mb-2 text-gray-600">Category</label>
                        {!showNewCategoryInput ? (
                            <select
                                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                value={form.category}
                                onChange={(e) => {
                                    if (e.target.value === "__new__") {
                                        setShowNewCategoryInput(true);
                                        setForm({ ...form, category: "" });
                                    } else {
                                        setForm({ ...form, category: e.target.value });
                                    }
                                }}
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat, i) => (
                                    <option key={i} value={cat}>{cat}</option>
                                ))}
                                <option value="__new__">➕ Add New Category</option>
                            </select>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="New Category"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
                                />
                                <button
                                    className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 shadow-md transition"
                                    onClick={handleAddNewCategory}
                                >
                                    Add
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block font-medium mb-2 text-gray-600">Type</label>
                        <select
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value })}
                        >
                            <option value="quantity_only">Quantity Only</option>
                            <option value="half_full">Half / Full</option>
                            <option value="kg">KG</option>
                        </select>
                    </div>

                    {/* Price Fields */}
                    {form.type === "quantity_only" && (
                        <div>
                            <label className="block font-medium mb-2 text-gray-600">Price</label>
                            <input
                                type="number"
                                placeholder="Price"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            />
                        </div>
                    )}

                    {form.type === "half_full" && (
                        <>
                            <div>
                                <label className="block font-medium mb-2 text-gray-600">Full Price</label>
                                <input
                                    type="number"
                                    placeholder="Full Price"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-2 text-gray-600">Half Price</label>
                                <input
                                    type="number"
                                    placeholder="Half Price"
                                    value={form.halfPrice}
                                    onChange={(e) => setForm({ ...form, halfPrice: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                />
                            </div>
                        </>
                    )}

                    {form.type === "kg" && (
                        <div>
                            <label className="block font-medium mb-2 text-gray-600">Price Per KG</label>
                            <input
                                type="number"
                                placeholder="Price Per KG"
                                value={form.pricePerKg}
                                onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            />
                        </div>
                    )}

                    {/* Description */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block font-medium mb-2 text-gray-600">Description</label>
                        <textarea
                            placeholder="Optional description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block font-medium mb-2 text-gray-600">Upload Image</label>
                        <input type="file" onChange={handleImage} className="w-full" />

                        {/* Image Preview (Base64 works always) */}
                        {form.image && (
                            <img
                                src={form.image}
                                alt="preview"
                                className="w-32 h-32 object-cover rounded-xl shadow-lg mt-2"
                            />
                        )}
                    </div>

                    {/* Availability */}
                    <div className="flex items-center mt-4 gap-2">
                        <input
                            type="checkbox"
                            checked={form.is_available}
                            onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700">Available</span>
                    </div>

                    {/* Submit Button */}
                    <div className="col-span-1 md:col-span-2 text-right mt-6">
                        <button
                            onClick={handleSubmit}
                            className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow-md hover:bg-blue-700 transition"
                        >
                            {editId ? "Update Item" : "Add Item"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <h3 className="text-xl font-bold mb-4 text-gray-700">📋 Items List</h3>
            <div className="overflow-x-auto bg-white shadow-xl rounded-2xl p-4 border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-800 text-white rounded-t-xl">
                        <tr>
                            <th className="px-4 py-2 text-left rounded-tl-xl">Image</th>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Category</th>
                            <th className="px-4 py-2 text-left">Type</th>
                            <th className="px-4 py-2 text-left">Price</th>
                            <th className="px-4 py-2 text-left">Available</th>
                            <th className="px-4 py-2 text-left rounded-tr-xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-2">
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.item_name}
                                            className="w-16 h-16 object-cover rounded-xl shadow-sm"
                                        />
                                    )}
                                </td>
                                <td className="px-4 py-2">{item.item_name}</td>
                                <td className="px-4 py-2">{item.category}</td>
                                <td className="px-4 py-2">{item.type}</td>
                                <td className="px-4 py-2">
                                    {item.type === "quantity_only" && item.price}
                                    {item.type === "half_full" && `${item.price} / ${item.halfPrice}`}
                                    {item.type === "kg" && item.pricePerKg}
                                </td>
                                <td className="px-4 py-2">{item.is_available ? "Yes" : "No"}</td>
                                <td className="px-4 py-2 flex gap-2">
                                    <button
                                        className="bg-yellow-400 text-black px-3 py-1 rounded-xl hover:bg-yellow-500 shadow-sm transition"
                                        onClick={() => editItem(item)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="bg-red-500 text-white px-3 py-1 rounded-xl hover:bg-red-600 shadow-sm transition"
                                        onClick={() => deleteItem(item.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center py-6 text-gray-400">
                                    No items added yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
