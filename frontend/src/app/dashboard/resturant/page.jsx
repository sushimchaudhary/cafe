"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RestaurantPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({
    name: "",
    address: "",
    mobile_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  // ================== HANDLE INPUT CHANGE ==================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================== FETCH RESTAURANTS ==================
  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/restaurants/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      const data = await res.json();
      console.log("RAW API DATA:", data);

      // Rename reference_id to restaurant_id
      const restaurantsList = (Array.isArray(data) ? data : data?.data || []).map(
        (r) => ({
          restaurant_id: r.reference_id,
          name: r.name,
          address: r.address,
          mobile_number: r.mobile_number,
        })
      );

      console.log("Restaurants list with restaurant_id:", restaurantsList);

      setRestaurants(restaurantsList);
    } catch (error) {
      console.log("FETCH ERROR:", error);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // ================== SUBMIT CREATE/EDIT ==================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("adminToken");

      const url = editId
        ? `${API_URL}/api/restaurants/${editId}/`
        : `${API_URL}/api/restaurants/`;

      const method = editId ? "PATCH" : "POST";

      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        mobile_number: form.mobile_number.trim(),
      };

      console.log("Payload to API:", payload);

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
          data?.errors
            ? JSON.stringify(data.errors)
            : data?.response || "Something went wrong"
        );
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

  // ================== DELETE ==================
  const handleDelete = async (restaurant) => {
    const idToDelete = restaurant.restaurant_id;
    console.log("Deleting ID:", idToDelete);

    if (!idToDelete) {
      alert("ID not found! Cannot delete.");
      return;
    }

    if (!confirm("Delete this restaurant?")) return;

    try {
      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${API_URL}/api/restaurants/${idToDelete}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!res.ok) {
        console.log("DELETE FAILED:", await res.text());
        alert("Delete failed");
      } else {
        console.log("Deleted successfully!");
        fetchRestaurants();
      }
    } catch (error) {
      console.log("DELETE ERROR:", error);
    }
  };

  // ================== EDIT ==================
  const handleEdit = (r) => {
    setForm({
      name: r.name,
      address: r.address,
      mobile_number: r.mobile_number,
    });

    setEditId(r.restaurant_id);
    setShowModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-amber-600">Restaurants</h1>

      {/* CREATE BUTTON */}
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

      {/* TABLE */}
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
              <tr key={r.restaurant_id || index} className="border-b">
                <td className="px-6 py-3">{r.name}</td>
                <td className="px-6 py-3">{r.address}</td>
                <td className="px-6 py-3">{r.mobile_number}</td>

                <td className="px-6 py-3 flex gap-3">
                  <button
                    onClick={() => handleEdit(r)}
                    className="px-3 py-1 bg-amber-500 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              {editId ? "Edit Restaurant" : "Create Restaurant"}
            </h2>

            {message && <p className="text-red-500">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label>Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              <div>
                <label>Address</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>

              <div>
                <label>Mobile Number</label>
                <input
                  name="mobile_number"
                  value={form.mobile_number}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
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
                  disabled={loading}
                  className="px-4 py-2 bg-amber-500 text-white rounded"
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
