"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RestaurantPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({ name: "", address: "", mobile_number: "" });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/restaurants/`, {
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
      });
      const data = await res.json();
      setRestaurants(data.data || []);
    } catch (err) {
      console.log("FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!form.name || !form.address || !form.mobile_number) {
      setMessage("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const url = editId
        ? `${API_URL}/api/restaurants/${editId}/`
        : `${API_URL}/api/restaurants/`;
      const method = editId ? "PATCH" : "POST";

      // ✅ Create UUID only when creating new restaurant
      const payload = {
        reference_id: editId ? undefined : uuidv4(),
        name: form.name.trim(),
        address: form.address.trim(),
        mobile_number: form.mobile_number.trim(),
      };

      if (editId) delete payload.reference_id;

      console.log("📦 PAYLOAD SENT:", payload);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("🔵 BACKEND RESPONSE:", data);

      if (!res.ok || data.response_code === "1") {
        setMessage(data?.errors ? JSON.stringify(data.errors) : data?.response || "Error");
      } else {
        setMessage(editId ? "Updated!" : "Created!");
        setForm({ name: "", address: "", mobile_number: "" });
        setShowModal(false);
        setEditId(null);
        fetchRestaurants();
      }
    } catch (err) {
      console.log("SUBMIT ERROR:", err);
      setMessage("Network Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (r) => {
    if (!confirm("Delete this restaurant?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/restaurants/${r.reference_id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });

      if (!res.ok) {
        console.log("DELETE FAILED:", await res.text());
        alert("Delete failed");
      } else {
        fetchRestaurants();
      }
    } catch (err) {
      console.log("DELETE ERROR:", err);
      alert("Network error");
    }
  };

  const handleEdit = (r) => {
    setForm({ name: r.name, address: r.address, mobile_number: r.mobile_number });
    setEditId(r.reference_id);
    setShowModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-amber-600">Restaurants</h1>
      <button
        onClick={() => {
          setForm({ name: "", address: "", mobile_number: "" });
          setEditId(null);
          setShowModal(true);
        }}
        className="mb-6 bg-amber-500 text-white px-5 py-2 rounded-lg shadow"
      >
        + Create Restaurant
      </button>

      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="bg-amber-400 text-white">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Address</th>
              <th className="px-6 py-3 text-left">Phone</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r, index) => (
              <tr key={r.reference_id || index} className="border-b">
                <td className="px-6 py-3">{r.name}</td>
                <td className="px-6 py-3">{r.address}</td>
                <td className="px-6 py-3">{r.mobile_number}</td>
                <td className="px-6 py-3 flex gap-3">
                  <button onClick={() => handleEdit(r)} className="px-3 py-1 bg-amber-500 text-white rounded">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(r)} className="px-3 py-1 bg-red-500 text-white rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">{editId ? "Edit Restaurant" : "Create Restaurant"}</h2>
            {message && <p className="text-red-500">{message}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                maxLength={100}
                required
                className="w-full border p-2 rounded"
              />
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Address"
                maxLength={100}
                required
                className="w-full border p-2 rounded"
              />
              <input
                name="mobile_number"
                value={form.mobile_number}
                onChange={handleChange}
                placeholder="Mobile Number"
                maxLength={30}
                required
                className="w-full border p-2 rounded"
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded">
                  {loading ? "Saving..." : editId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
