"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BranchPage() {
  const [branches, setBranches] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    address: "",
    mobile_number: "",
    restaurant_id: "", // backend expects this field
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ---------------- Fetch Restaurants ----------------
  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${API_URL}/api/restaurants/`, {
        headers: { Authorization: `Token ${token}` },
      });

      const data = await res.json();

      const restaurantsList = (
        Array.isArray(data) ? data : data?.data || []
      ).map((r) => ({
        restaurant_id: r.reference_id,
        restaurant_name: r.name,
      }));

      setRestaurants(restaurantsList);
      return restaurantsList;
    } catch (err) {
      console.log("FETCH RESTAURANTS ERROR:", err);
      return [];
    }
  };

  // ---------------- Fetch Branches ----------------
  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const restaurantsList = restaurants.length ? restaurants : await fetchRestaurants();

      const res = await fetch(`${API_URL}/api/branches/`, {
        headers: { Authorization: `Token ${token}` },
      });

      const data = await res.json();

      const branchesList = (Array.isArray(data) ? data : data?.data || []).map((b) => {
        const restaurant = restaurantsList.find((r) => r.restaurant_id === b.restaurant);
        return {
          branch_id: b.reference_id || b.id || b._id,
          name: b.name,
          address: b.address,
          mobile_number: b.mobile_number,
          restaurant_id: b.restaurant,
          restaurant_name: restaurant ? restaurant.restaurant_name : "",
        };
      });

      setBranches(branchesList);
    } catch (err) {
      console.log("FETCH BRANCHES ERROR:", err);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // ---------------- Create / Update Branch ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("adminToken");

      const url = editId
        ? `${API_URL}/api/branches/${editId}/`
        : `${API_URL}/api/branches/`;
      const method = editId ? "PATCH" : "POST";

      const payload = {
        name: form.name,
        address: form.address,
        mobile_number: form.mobile_number,
        restaurant_id: form.restaurant_id,
      };

      console.log("Submitting payload:", payload);

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("SUBMIT RESPONSE:", data);

      if (!res.ok || data.response_code === "1") {
        setMessage(
          data?.errors ? JSON.stringify(data.errors) : data?.response || "Error"
        );
      } else {
        setMessage(editId ? "Branch Updated!" : "Branch Created!");
        setShowModal(false);
        setEditId(null);
        setForm({
          name: "",
          address: "",
          mobile_number: "",
          restaurant_id: "",
        });
        fetchBranches();
      }
    } catch (err) {
      console.log("SUBMIT ERROR:", err);
      setMessage("Network Error");
    }

    setLoading(false);
  };

  // ---------------- Delete Branch ----------------
  const handleDelete = async (branch) => {
    const idToDelete = branch.branch_id;
    if (!idToDelete) return alert("ID not found!");

    if (!confirm("Delete this branch?")) return;

    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${API_URL}/api/branches/${idToDelete}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });

      if (!res.ok) {
        console.log("DELETE FAILED:", await res.text());
        alert("Delete failed");
      } else {
        fetchBranches();
      }
    } catch (err) {
      console.log("DELETE ERROR:", err);
    }
  };

  // ---------------- Edit Modal Fill ----------------
  const handleEdit = (b) => {
    setForm({
      name: b.name,
      address: b.address,
      mobile_number: b.mobile_number,
      restaurant_id: b.restaurant_id || "",
    });
    setEditId(b.branch_id);
    setShowModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-amber-600 mb-6">Branches</h1>

      <button
        onClick={() => {
          setForm({
            name: "",
            address: "",
            mobile_number: "",
            restaurant_id: "",
          });
          setEditId(null);
          setShowModal(true);
        }}
        className="mb-6 bg-amber-500 text-white px-5 py-2 rounded-lg shadow hover:bg-amber-600 transition"
      >
        + Create Branch
      </button>

      {/* Table */}
      <div className="overflow-x-auto shadow bg-white rounded-lg">
        <table className="w-full">
          <thead className="bg-amber-400 text-white">
            <tr>
              <th className="px-6 py-3 text-left">Branch Name</th>
              <th className="px-6 py-3 text-left">Address</th>
              <th className="px-6 py-3 text-left">Contact</th>
              <th className="px-6 py-3 text-left">Restaurant</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {branches.map((b) => (
              <tr key={b.branch_id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3">{b.name}</td>
                <td className="px-6 py-3">{b.address}</td>
                <td className="px-6 py-3">{b.mobile_number}</td>
                <td className="px-6 py-3">
                  {b.restaurant_name || "-"}
                </td>

                <td className="px-6 py-3 flex gap-3">
                  <button
                    onClick={() => handleEdit(b)}
                    className="px-3 py-1 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(b)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-amber-600">
              {editId ? "Edit Branch" : "Create Branch"}
            </h2>

            {message && <p className="mb-2 text-red-500">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Branch Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  className="w-full border p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  className="w-full border p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-1">Contact Number</label>
                <input
                  type="text"
                  name="mobile_number"
                  value={form.mobile_number}
                  onChange={handleChange}
                  maxLength={10}
                  pattern="\d{10}"
                  title="Enter 10 digit number"
                  required
                  className="w-full border p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-1">Select Restaurant</label>
                <select
                  name="restaurant_id"
                  value={form.restaurant_id || ""}
                  onChange={handleChange}
                  required
                  className="w-full border p-2 rounded-lg"
                >
                  <option value="">-- Choose Restaurant --</option>
                  {restaurants.map((r) => (
                    <option key={r.restaurant_id} value={r.restaurant_id}>
                      {r.restaurant_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
                >
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
