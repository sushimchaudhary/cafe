"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import ToastProvider from "@/components/ToastProvider";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import AdminHeader from "../../../components/AdminHeader";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const FRONTEND_URL = process.env. NEXT_PUBLIC_CLIENT_URL;

export default function TableManager() {
  const [tables, setTables] = useState([]);
  const [tableName, setTableName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openQr, setOpenQr] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [message] = useState("");

  // const fetchTables = async () => {
  //   console.log("Fetching tables...");
  //   try {
  //     const token = localStorage.getItem("adminToken");
  //     if (!token) {
  //       toast.error("Login first!");
  //       console.error("No admin token found!");
  //       return;
  //     }

  //     const res = await fetch(`${API_URL}/api/tables/`, {
  //       headers: { Authorization: `Token ${token}` },
  //     });
  //     console.log("GET /api/tables/ status:", res.status);

  //     const data = await res.json();
  //     console.log("GET /api/tables/ response:", data);

  //     if (!res.ok || data.response_code !== "0") {
  //       throw new Error(data.response || "Failed to fetch tables");
  //     }

  //     // Generate QR base64 for each table
  //     const tablesWithQR = await Promise.all(
  //       (data.data || []).map(async (t) => {
  //         if (t.qr_code_url) {
  //           try {
  //             const qrBase64 = await QRCode.toDataURL(t.qr_code_url);
  //             return { ...t, qr_code: qrBase64 };
  //           } catch (err) {
  //             console.error("QR generation error for table:", t, err);
  //             return t;
  //           }
  //         }
  //         return t;
  //       })
  //     );

  //     setTables(tablesWithQR);
  //   } catch (err) {
  //     toast.error(err.message || "Failed to load tables");
  //     console.error("Error fetching tables:", err);
  //   }
  // };


  const fetchTables = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/tables/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await res.json();
  
      const tablesWithQR = await Promise.all(
        (data.data || []).map(async (t) => {
          try {
           
            const tokenValue = t.token || t.reference_id || Date.now();
            const qrBase64 = await QRCode.toDataURL(`${FRONTEND_URL}/menu?table_token=${tokenValue}`);
            return { ...t, qr_code: qrBase64 };
          } catch (err) {
            console.error("QR generation error:", err);
            return t;
          }
        })
      );
  
      setTables(tablesWithQR);
    } catch (err) {
      toast.error("Failed to fetch tables");
      console.error(err);
    }
  };

  

  useEffect(() => {
    fetchTables();
  }, []);

  const generateQRCode = async (tableToken) => {
    try {
      const url = `${FRONTEND_URL}/menu?table_token=${tableToken}`;
      console.log("📎 QR URL:", url);

      const qrData = await QRCode.toDataURL(url);
      return qrData;
    } catch (err) {
      toast.error("QR generate failed");
      return "";
    }
  };

  const resetForm = () => {
    setTableName("");
    setCapacity("");
    setLocation("");
    setEditId(null);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!tableName || !capacity) {
    toast.error("Table number and capacity required");
    return;
  }

  setLoading(true);
  console.log(editId ? "Updating table..." : "Adding new table...");

  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Login required");

    // Table token: edit भएमा editId, new भएमा Date.now()
    const tableToken = editId || Date.now();

    // Frontend URL बाट QR generate
    const qr = await generateQRCode(tableToken);

    // FormData बनाउने
    const formData = new FormData();
    formData.append("table_number", tableName);
    formData.append("capacity", capacity);
    if (location) formData.append("location", location);
    formData.append("token", tableToken); // table token save गर्नु जरुरी
    formData.append("qr_code", qr); // QR code save

    const url = editId
      ? `${API_URL}/api/tables/${editId}/`
      : `${API_URL}/api/tables/`;
    const method = editId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Token ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || data.response_code !== "0") {
      const msg = Object.values(data.errors || {}).flat().join(" | ");
      throw new Error(msg || "Failed to save table");
    }

    toast.success(editId ? "Table updated!" : "Table added!");
    resetForm();
    fetchTables(); // refresh table list
  } catch (err) {
    toast.error(err.message || "Failed to save table");
    console.error("Error in handleSubmit:", err);
  } finally {
    setLoading(false);
  }
};


  //   const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!tableName || !capacity) {
  //     toast.error("Table number and capacity required");
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const adminToken = localStorage.getItem("adminToken");
  //     if (!adminToken) throw new Error("Login required");

  //     // Table token (integer)
  //     const tableToken = editId ? parseInt(editId, 10) : Date.now();

  //     // Generate QR code
  //     const qr = await generateQRCode(tableToken);

  //     // FormData
  //     const formData = new FormData();
  //     formData.append("table_number", tableName);
  //     formData.append("capacity", parseInt(capacity, 10));
  //     formData.append("location", location || "");
  //     formData.append("token", tableToken);
  //     formData.append("qr_code", qr); // base64 string

  //     const url = editId
  //       ? `${API_URL}/api/tables/${editId}/`
  //       : `${API_URL}/api/tables/`;
  //     const method = editId ? "PATCH" : "POST";

  //     const res = await fetch(url, {
  //       method,
  //       headers: {

  //       },
  //       body: formData,
  //     });

  //     const data = await res.json();
  //     if (!res.ok || data.response_code !== "0") {
  //       const msg = Object.values(data.errors || {}).flat().join(" | ");
  //       throw new Error(msg || "Failed to save table");
  //     }

  //     toast.success(editId ? "Table updated!" : "Table added!");
  //     resetForm();
  //     fetchTables();
  //   } catch (err) {
  //     toast.error(err.message || "Failed to save table");
  //     console.error("Error in handleSubmit:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleEdit = (t) => {
    console.log("Editing table:", t);
    setEditId(t.reference_id);
    setTableName(t.table_number);
    setCapacity(t.capacity || "");
    setLocation(t.location || "");
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this table?")) return;
    console.log("Deleting table ID:", id);

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_URL}/api/tables/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });

      console.log("DELETE response status:", res.status);
      if (!res.ok) throw new Error("Delete failed");

      toast.success("Table deleted!");
      fetchTables();
    } catch (err) {
      toast.error("Delete failed");
      console.error("Error deleting table:", err);
    }
  };

  return (
    <div className="min-h-screen">
      <AdminHeader />
      <div className="flex flex-row items-center justify-between px-4 sm:px-6 md:px-10 py-3 gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 leading-tight truncate">
            Tables Management
          </h1>
        </div>

        <div className="flex-shrink-0 ml-4">
          <button
            onClick={() => {
              setTableName("");
              setCapacity("");
              setLocation("");
              setEditId(null);
              setShowForm(true);
            }}
            className="flex items-center font-bold justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow-lg transition duration-300 cursor-pointer"
          >
            + Create
          </button>
        </div>
      </div>

      <div className="p-4 md:p-3 min-h-screen font-roboto">
        <ToastProvider />

        <div className="overflow-x-auto rounded border border-blue-200">
          <table className="min-w-full border-collapse">
            <thead className="bg-blue-50 uppercase text-sm">
              <tr>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Table
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Capacity
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Location
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  QR
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tables.map((t, i) => (
                <tr
                  key={t.reference_id || i}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="border px-4 py-2">Table {t.table_number}</td>
                  <td className="border px-4 py-2">{t.capacity || "-"}</td>
                  <td className="border px-4 py-2">{t.location || "-"}</td>
                  <td className="border px-4 py-2">
                    {t.qr_code ? (
                      <img
                        src={t.qr_code}
                        onClick={(e) => setOpenQr(t?.qr_code)}
                        alt="QR Code"
                        className="w-12 h-12 sm:w-10 sm:h-10 md:w-8 md:h-8 lg:w-10 lg:h-10 object-contain cursor-pointer"
                      />
                    ) : (
                      <span className="text-gray-400">No QR</span>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => handleEdit(t)}
                        className="text-blue-600 hover:bg-blue-100 p-2 rounded"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.reference_id)}
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

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
              setEditId(null);
              setTableName("");
              setCapacity("");
              setLocation("");
            }
          }}
        >
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 animate-fadeIn relative">
            <button
              onClick={() => {
                setShowForm(false);
                setEditId(null);
                setTableName("");
                setCapacity("");
                setLocation("");
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4 text-blue-700">
              {editId ? "Edit Table" : "Add Table"}
            </h2>

            {message && <p className="text-red-500 mb-2">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Table Number
                </label>
                <input
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Location (optional)
                </label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                    setTableName("");
                    setCapacity("");
                    setLocation("");
                  }}
                  className="px-2 py-2 border border-red-500 rounded-lg font-medium hover:bg-red-100 w-full sm:w-auto text-sm sm:text-base cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600  hover:bg-blue-700 text-white rounded-lg shadow w-full sm:w-auto text-sm sm:text-base font-medium cursor-pointer"
                >
                  {loading ? "Saving..." : editId ? "Update" : "Create "}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {openQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setOpenQr(null)}
        >
          <div
            className="bg-white p-4 rounded-lg max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={openQr}
              alt="QR Preview"
              className="w-full h-auto object-contain"
            />

            <button
              onClick={() => setOpenQr(null)}
              className="mt-4 w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



// "use client";

// import React, { useEffect, useState } from "react";
// import QRCode from "qrcode";
// import toast from "react-hot-toast";
// import ToastProvider from "@/components/ToastProvider";
// import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
// import AdminHeader from "@/components/AdminHeader";
// import { v4 as uuidv4 } from "uuid"; // UUID import

// const API_URL = process.env.NEXT_PUBLIC_API_URL;
// const FRONTEND_URL = process.env.NEXT_PUBLIC_CLIENT_URL;

// export default function TableManager() {
//   const [tables, setTables] = useState([]);
//   const [tableName, setTableName] = useState("");
//   const [capacity, setCapacity] = useState("");
//   const [location, setLocation] = useState("");
//   const [editId, setEditId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [openQr, setOpenQr] = useState(null);
//   const [showForm, setShowForm] = useState(false);

//   // Fetch tables & generate FRONTEND QR
//   const fetchTables = async () => {
//     try {
//       const token = localStorage.getItem("adminToken");
//       if (!token) return toast.error("Login required");

//       const res = await fetch(`${API_URL}/api/tables/`, {
//         headers: { Authorization: `Token ${token}` },
//       });

//       const data = await res.json();
//       if (!res.ok || data.response_code !== "0") {
//         throw new Error("Failed to fetch tables");
//       }

//       // Generate frontend URL QR
//       const tablesWithQR = await Promise.all(
//         data.data.map(async (t) => {
//           const frontendQrUrl = `${FRONTEND_URL}/menu?table_token=${t.token}`;
//           const qr = await QRCode.toDataURL(frontendQrUrl);
//           return { ...t, qr_code: qr };
//         })
//       );

//       setTables(tablesWithQR);
//     } catch (err) {
//       console.error(err);
//       toast.error("Table load failed");
//     }
//   };

//   useEffect(() => {
//     fetchTables();
//   }, []);

//   // Generate QR for frontend
//   const generateQRCode = async (token) => {
//     const url = `${FRONTEND_URL}/menu?table_token=${token}`;
//     return await QRCode.toDataURL(url);
//   };

//   const resetForm = () => {
//     setTableName("");
//     setCapacity("");
//     setLocation("");
//     setEditId(null);
//   };

//   // Create / Update table
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!tableName || !capacity) {
//       return toast.error("Table & capacity required");
//     }

//     try {
//       setLoading(true);
//       const token = localStorage.getItem("adminToken");

//       // Generate UUID token for new table
//       const tableToken = editId || uuidv4();
//       const qr = await generateQRCode(tableToken);

//       const formData = new FormData();
//       formData.append("table_number", tableName);
//       formData.append("capacity", capacity);
//       formData.append("location", location || "");
//       formData.append("token", tableToken);
//       formData.append("qr_code", qr);

//       const url = editId
//         ? `${API_URL}/api/tables/${editId}/`
//         : `${API_URL}/api/tables/`;

//       const res = await fetch(url, {
//         method: editId ? "PATCH" : "POST",
//         headers: { Authorization: `Token ${token}` },
//         body: formData,
//       });

//       const data = await res.json();
//       if (!res.ok || data.response_code !== "0") {
//         throw new Error("Save failed");
//       }

//       toast.success(editId ? "Updated!" : "Created!");
//       resetForm();
//       setShowForm(false);
//       fetchTables();
//     } catch (err) {
//       console.error(err);
//       toast.error("Save error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (t) => {
//     setEditId(t.reference_id);
//     setTableName(t.table_number);
//     setCapacity(t.capacity);
//     setLocation(t.location || "");
//     setShowForm(true);
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete table?")) return;
//     try {
//       const token = localStorage.getItem("adminToken");
//       await fetch(`${API_URL}/api/tables/${id}/`, {
//         method: "DELETE",
//         headers: { Authorization: `Token ${token}` },
//       });
//       toast.success("Deleted");
//       fetchTables();
//     } catch {
//       toast.error("Delete failed");
//     }
//   };

//   return (
//     <div className="min-h-screen">
//       <AdminHeader />
//       <ToastProvider />

//       <div className="p-6">
//         <button
//           onClick={() => setShowForm(true)}
//           className="bg-green-600 text-white px-4 py-2 rounded"
//         >
//           + Add Table
//         </button>

//         <table className="w-full mt-6 border">
//           <thead className="bg-gray-100">
//             <tr>
//               <th>Table</th>
//               <th>Capacity</th>
//               <th>QR</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {tables.map((t) => (
//               <tr key={t.reference_id} className="border">
//                 <td>Table {t.table_number}</td>
//                 <td>{t.capacity}</td>
//                 <td>
//                   <img
//                     src={t.qr_code}
//                     onClick={() => setOpenQr(t.qr_code)}
//                     className="w-16 cursor-pointer"
//                   />
//                 </td>
//                 <td className="flex gap-3">
//                   <button onClick={() => handleEdit(t)}>
//                     <PencilIcon className="w-5 text-blue-600" />
//                   </button>
//                   <button onClick={() => handleDelete(t.reference_id)}>
//                     <TrashIcon className="w-5 text-red-600" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* FORM MODAL */}
//       {showForm && (
//         <div
//           className="fixed inset-0 bg-black/40 flex items-center justify-center"
//           onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
//         >
//           <form
//             onSubmit={handleSubmit}
//             className="bg-white p-6 rounded w-full max-w-md"
//           >
//             <h2 className="font-bold mb-4">
//               {editId ? "Edit Table" : "Add Table"}
//             </h2>

//             <input
//               placeholder="Table Number"
//               value={tableName}
//               onChange={(e) => setTableName(e.target.value)}
//               className="border w-full mb-3 p-2"
//             />

//             <input
//               type="number"
//               placeholder="Capacity"
//               value={capacity}
//               onChange={(e) => setCapacity(e.target.value)}
//               className="border w-full mb-3 p-2"
//             />

//             <input
//               placeholder="Location"
//               value={location}
//               onChange={(e) => setLocation(e.target.value)}
//               className="border w-full mb-3 p-2"
//             />

//             <button
//               disabled={loading}
//               className="bg-blue-600 text-white w-full py-2 rounded"
//             >
//               {loading ? "Saving..." : "Save"}
//             </button>
//           </form>
//         </div>
//       )}

//       {/* QR PREVIEW */}
//       {openQr && (
//         <div
//           className="fixed inset-0 bg-black/60 flex justify-center items-center"
//           onClick={() => setOpenQr(null)}
//         >
//           <img src={openQr} className="bg-white p-4 rounded w-72" />
//         </div>
//       )}
//     </div>
//   );
// }
