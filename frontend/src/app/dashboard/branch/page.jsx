"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BranchPage() {
  const [branches, setBranches] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({ name: "", address: "", mobile_number: "", restaurant_id: "" });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/restaurants/`, { headers: { "Content-Type": "application/json", Authorization: `Token ${token}` } });
      const data = await res.json();
      setRestaurants(data.data || []);
    } catch (err) { console.log("FETCH RESTAURANTS ERROR:", err); }
  };

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/branches/`, { headers: { "Content-Type": "application/json", Authorization: `Token ${token}` } });
      const data = await res.json();
      // Map restaurant_id object to reference_id for consistent frontend usage
      const mappedBranches = (data.data || []).map(b => ({
        ...b,
        restaurant_id: typeof b.restaurant_id === "object" ? b.restaurant_id.reference_id : b.restaurant_id
      }));
      setBranches(mappedBranches);
    } catch (err) { console.log("FETCH BRANCHES ERROR:", err); }
  };

  useEffect(() => { fetchRestaurants(); fetchBranches(); }, []);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { name, address, mobile_number, restaurant_id } = form;
    if (!name || !address || !mobile_number || !restaurant_id) { setMessage("All fields are required"); setLoading(false); return; }
    if (mobile_number.length > 10) { setMessage("Mobile number max 10 digits"); setLoading(false); return; }

    try {
      const token = localStorage.getItem("adminToken");
      const url = editId ? `${API_URL}/api/branches/${editId}/` : `${API_URL}/api/branches/`;
      const method = editId ? "PATCH" : "POST";

      const payload = { reference_id: editId ? undefined : uuidv4(), name: name.trim(), address: address.trim(), mobile_number: mobile_number.trim(), restaurant_id };
      if (editId) delete payload.reference_id;

      console.log("📦 PAYLOAD SENT:", payload);
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Token ${token}` }, body: JSON.stringify(payload) });
      const data = await res.json();
      console.log("🔵 BACKEND RESPONSE:", data);

      if (!res.ok || data.response_code === "1") { setMessage(data?.errors ? JSON.stringify(data.errors) : data?.response || "Error"); }
      else { setMessage(editId ? "Updated!" : "Created!"); setForm({ name: "", address: "", mobile_number: "", restaurant_id: "" }); setShowModal(false); setEditId(null); fetchBranches(); }
    } catch (err) { console.log("SUBMIT ERROR:", err); setMessage("Network Error"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (b) => {
    if (!confirm("Delete this branch?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/branches/${b.reference_id}/`, { method: "DELETE", headers: { Authorization: `Token ${token}` } });
      if (!res.ok) { console.log("DELETE FAILED:", await res.text()); alert("Delete failed"); }
      else { fetchBranches(); }
    } catch (err) { console.log("DELETE ERROR:", err); alert("Network error"); }
  };

  const handleEdit = (b) => { setForm({ name: b.name, address: b.address, mobile_number: b.mobile_number, restaurant_id: b.restaurant_id }); setEditId(b.reference_id); setShowModal(true); };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-amber-600">Branches</h1>
      <button onClick={() => { setForm({ name: "", address: "", mobile_number: "", restaurant_id: "" }); setEditId(null); setShowModal(true); }} className="mb-6 bg-amber-500 text-white px-5 py-2 rounded-lg shadow">+ Create Branch</button>

      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="bg-amber-400 text-white">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Address</th>
              <th className="px-6 py-3 text-left">Phone</th>
              <th className="px-6 py-3 text-left">Restaurant</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>

         <tbody>
  {branches.map((b, i) => {
    // restaurant_id string UUID भए restaurants array बाट name lookup गर्नु
    const restaurantName =
      b.restaurant_id && typeof b.restaurant_id === "string"
        ? restaurants.find(r => r.reference_id === b.restaurant_id)?.name || "-"
        : "-";

    return (
      <tr key={b.reference_id || i} className="border-b">
        <td className="px-6 py-3">{b.name}</td>
        <td className="px-6 py-3">{b.address}</td>
        <td className="px-6 py-3">{b.mobile_number}</td>
        <td className="px-6 py-3">{restaurantName}</td>
        <td className="px-6 py-3 flex gap-3">
          <button
            onClick={() => handleEdit(b)}
            className="px-3 py-1 bg-amber-500 text-white rounded"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(b)}
            className="px-3 py-1 bg-red-500 text-white rounded"
          >
            Delete
          </button>
        </td>
      </tr>
    );
  })}
</tbody>

        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">{editId ? "Edit Branch" : "Create Branch"}</h2>
            {message && <p className="text-red-500">{message}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" maxLength={100} required className="w-full border p-2 rounded" />
              <input name="address" value={form.address} onChange={handleChange} placeholder="Address" maxLength={100} required className="w-full border p-2 rounded" />
              <input name="mobile_number" value={form.mobile_number} onChange={handleChange} placeholder="Mobile Number" maxLength={10} required className="w-full border p-2 rounded" />
              <select name="restaurant_id" value={form.restaurant_id} onChange={handleChange} required className="w-full border p-2 rounded">
                <option value="">Select Restaurant</option>
                {restaurants.map(r => <option key={r.reference_id} value={r.reference_id}>{r.name}</option>)}
              </select>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded">{loading ? "Saving..." : editId ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
