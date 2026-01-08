"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

import AdminRegisterPage from "@/app/auth/register/page";

import ToastProvider from "@/components/ToastProvider";
import "@/styles/customButtons.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [branches, setBranches] = useState([]);
  const [adminToken, setAdminToken] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteAdmin, setDeleteAdmin] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Open edit modal
  const openEditModal = (admin) => {
    setEditAdmin(admin);
    setShowEditModal(true);
  };

  // Initial fetch
  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      toast.error("Admin token missing. Please login!");
      return;
    }

    setAdminToken(token);
    fetchAdmins(token);
    fetchRestaurants(token);
    fetchBranches(token);
  }, []);

  // Fetch admins
  const fetchAdmins = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/user/admins/`, {
        headers: { Authorization: `Token ${token}` },
      });

      console.log("Raw Response:", res);
      const data = await res.json();

      if (!res.ok) throw new Error(data.response || "Failed to fetch admins");

      // Always ensure array
      console.log("Admins:", data.data);

      setAdmins(data.data || []);
    } catch (err) {
      console.error("Fetch admins error:", err);
      toast.error("Failed to fetch admins");
    }
  };

  // Fetch restaurants
  const fetchRestaurants = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/restaurants/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.response || "Failed to fetch restaurants");
      setRestaurants(data.data || []);
    } catch (err) {
      console.error("Fetch restaurants error:", err);
      toast.error("Failed to fetch restaurants");
    }
  };

  // Fetch branches
  const fetchBranches = async (token) => {
    try {
      const res = await fetch(`${API_URL}/api/branches/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.response || "Failed to fetch branches");
      setBranches(data.data || []);
    } catch (err) {
      console.error("Fetch branches error:", err);
      toast.error("Failed to fetch branches");
    }
  };

  // Delete admin
  const handleDeleteConfirmed = async () => {
    if (!deleteAdmin) return;
  
    try {
      const res = await fetch(
        `${API_URL}/api/user/admins/${deleteAdmin.reference_id}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Token ${adminToken}` },
        }
      );
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.response || "Delete failed");
  
      toast.success("Admin deleted successfully!");
      setAdmins((prev) =>
        prev.filter((admin) => admin.reference_id !== deleteAdmin.reference_id)
      );
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error(err.message);
    } finally {
      setShowDeleteModal(false);
      setDeleteAdmin(null);
    }
  };
  

  return (
    <div className="container mx-auto h-[500px] flex flex-col px-1">
      <ToastProvider />

      <div className="px-2 sm:px-3 md:px-0 ">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-1">
          <h1 className="self-start text-left text-lg md:text-[15px] font-bold">
            All User
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
                placeholder="Search User..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-amber-200 rounded pl-8 pr-3 py-1 text-sm
             focus:outline-none focus:ring-1 focus:ring-amber-200"
              />
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="button px-4 py-1.5 text-sm font-semibold
            bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              Register
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
                <span className="font-semibold">{deleteAdmin?.username}</span>?
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

        {(showForm || showEditModal) && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowForm(false);
                setShowEditModal(false);
                setEditAdmin(null);
              }
            }}
          >
            <div className="rounded w-full max-w-2xl p-3  relative animate-fadeIn">
              <AdminRegisterPage
                adminData={editAdmin}
                admins={admins}
                adminToken={adminToken}
                restaurants={restaurants}
                branches={branches}
                refreshAdmins={fetchAdmins}
                closeModal={() => {
                  setShowForm(false);
                  setShowEditModal(false);
                  setEditAdmin(null);
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="min-h-0 bg-white rounded border shadow-sm overflow-hidden">
        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
          <table className="min-w-full border-collapse table-fixed">
            <thead className="sticky top-0 bg-amber-100 uppercase text-sm font-bold text-black z-10">
              <tr>
                <th className="px-4 py-2 text-left border w-1/14">SN</th>
                <th className="px-4 py-2 text-left border">Username</th>
                <th className="px-4 py-2 text-left border">Name</th>
                <th className="px-4 py-2 text-left border">Email</th>
                <th className="px-4 py-2 text-left border">Mobile</th>
                <th className="px-4 py-2 text-left border">Address</th>
                <th className="px-4 py-2 text-left border">Restaurant</th>
                <th className="px-4 py-2 text-left border">Branch</th>
                <th className="px-4 py-2 text-end border">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y text-sm divide-amber-100">
              {admins.filter((admin) => {
                if (!search) return true;

                const branchName = branches
                  .find(
                    (b) =>
                      b.reference_id === admin.branch ||
                      b.id === admin.branch ||
                      b._id === admin.branch
                  )
                  ?.name?.toLowerCase();

                return (
                  admin.username.toLowerCase().includes(search.toLowerCase()) ||
                  admin.first_name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                  admin.last_name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                  admin.email.toLowerCase().includes(search.toLowerCase()) ||
                  admin.mobile_number
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                  admin.address.toLowerCase().includes(search.toLowerCase()) ||
                  (branchName && branchName.includes(search.toLowerCase()))
                );
              }).length > 0 ? (
                admins
                  .filter((admin) => {
                    if (!search) return true;
                    const branchName = branches
                      .find(
                        (b) =>
                          b.reference_id === admin.branch ||
                          b.id === admin.branch ||
                          b._id === admin.branch
                      )
                      ?.name?.toLowerCase();
                    return (
                      admin.username
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      admin.first_name
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      admin.last_name
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      admin.email
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      admin.mobile_number
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      admin.address
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      (branchName && branchName.includes(search.toLowerCase()))
                    );
                  })
                  .map((admin, index) => (
                    <tr
                      key={admin.reference_id || index}
                      className="hover:bg-amber-50 transition duration-150"
                    >
                      <td className="px-2 py-1 border">{index + 1}</td>
                      <td className="px-2 py-1 border">{admin.username}</td>
                      <td className="px-2 py-1 border">
                        {admin.first_name} {admin.last_name}
                      </td>
                      <td className="px-2 py-1 border">{admin.email}</td>
                      <td className="px-2 py-1 border">
                        {admin.mobile_number}
                      </td>
                      <td className="px-2 py-1 border">{admin.address}</td>
                      <td className="px-2 py-1 border">
                      {admin.restaurant_name || "-"}

                      </td>
                      <td className="px-2 py-1 border">
                      {admin.branch_name || "-"}

                      </td>
                      <td className="px-2 py-1 border">
                        <div className="flex pl-3 justify-center ">
                          <button
                            title="Edit"
                            onClick={() => openEditModal(admin)}
                            className="p-1 text-amber-600 hover:bg-amber-100 rounded-full"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => {
                              setDeleteAdmin(admin);
                              setShowDeleteModal(true);
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    User not found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
