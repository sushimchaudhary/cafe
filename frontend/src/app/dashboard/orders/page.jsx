"use client";
import React, { useEffect, useState } from "react";
import { X, Printer } from "lucide-react";
import Swal from "sweetalert2";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Convert ISO/UTC time to Nepal time
const toNepalDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return new Date(d.getTime() + 5.75 * 60 * 60 * 1000);
};

// Format Nepal time
const formatNepalTime = (iso) => {
  if (!iso) return "-";
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kathmandu",
  });
};

// Format Nepal date as YYYY-MM-DD (for today filter)
const getNepalDateString = (date) => {
  const nepal = toNepalDate(date);
  if (!nepal) return "";
  const yyyy = nepal.getFullYear();
  const mm = String(nepal.getMonth() + 1).padStart(2, "0");
  const dd = String(nepal.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Normalize backend status
const normalizeStatus = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "Pending";
    case "preparing":
      return "Preparing";
    case "ready":
      return "Ready";
    case "served":
      return "Served";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};

// Convert status for backend
const backendStatus = (status) => status.toLowerCase();

// Status indicator colors
const getStatusIndicator = (status) => {
  const colors = {
    Pending: "bg-yellow-300",
    Preparing: "bg-blue-300",
    Ready: "bg-indigo-300",
    Served: "bg-green-300",
    Cancelled: "bg-red-300",
  };

  return (
    <span
      className={`w-2 h-2 rounded-full inline-block mr-1 ${
        colors[status] || "bg-gray-200"
      }`}
    ></span>
  );
};

const statusOptions = ["Pending", "Preparing", "Ready", "Served", "Cancelled"];

const AdminOrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [token, setToken] = useState("");

  // Fetch orders from backend
  const fetchOrders = async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/api/orders-list/`, {
        headers: { Authorization: `Token ${authToken}` },
      });
      const result = await res.json();
      const ordersData = result?.data || [];

      const normalized = ordersData.map((o) => ({
        order_id: o.reference_id,
        table_id: o.table_id,
        tableName: o.table_number ? `Table ${o.table_number}` : "Table",
        items: Array.isArray(o.items)
          ? o.items.map((i) => ({
              name: i.menu_name,
              quantity: Number(i.quantity),
              unit_name: i.unit_name || "-",
              total_price: Number(i.total_price),
            }))
          : [],
        total_price: Number(o.total_amount),
        status: normalizeStatus(o.status),
        created_at: o.order_time,
      }));

      setOrders(normalized);
    } catch (err) {
      console.error("Fetch error:", err);
      setOrders([]);
    }
  };

  // Toast notification
  const showToast = (title, icon = "success") => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 2500,
    });
  };

  // Cancel order
  const cancelOrder = async (reference_id) => {
    Swal.fire({
      title: "Cancel order?",
      icon: "warning",
      showCancelButton: true,
    }).then(async (ok) => {
      if (!ok.isConfirmed) return;

      try {
        const res = await fetch(`${API_URL}/api/orders/cancel/${reference_id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Cancel failed");

        showToast("Order Cancelled");

        setOrders((prev) =>
          prev.map((o) =>
            o.order_id === reference_id ? { ...o, status: "Cancelled" } : o
          )
        );
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    });
  };

  // Update status from dropdown
  const handleStatusChange = async (order_id, newStatus) => {
    const order = orders.find((o) => o.order_id === order_id);
    if (!order || order.status === "Cancelled") return;

    try {
      const res = await fetch(`${API_URL}/api/orders/status/${order_id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: backendStatus(newStatus) }),
      });

      if (!res.ok) throw new Error("Status update failed");

      showToast("Status Updated");

      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === order_id ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // Print bill
  const printBill = (order) => {
    const w = window.open("", "", "width=400,height=600");
    w.document.write(`<h2>Restaurant Bill</h2>`);
    w.document.write(`<p>${order.tableName}</p>`);
    w.document.write(`<p>${formatNepalTime(order.created_at)}</p><hr/>`);
    order.items.forEach((i) => {
      w.document.write(`<p>${i.quantity}x ${i.name} - Rs.${i.total_price}</p>`);
    });
    w.document.write(`<hr/><b>Total: Rs.${order.total_price}</b>`);
    w.document.close();
    w.print();
  };

  useEffect(() => {
    const t = localStorage.getItem("adminToken");
    if (t) {
      setToken(t);
      fetchOrders(t);
      const i = setInterval(() => fetchOrders(t), 5000);
      return () => clearInterval(i);
    }
  }, []);

  // Filter today’s orders (Nepal time)
  const todayNepal = getNepalDateString(new Date());
  const todayOrders = orders.filter(
    (o) => getNepalDateString(o.created_at) === todayNepal
  );

  const todayTotal = todayOrders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + (o.total_price || 0), 0);

  return (
    <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-2">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-sm sm:text-xl font-bold text-gray-800 tracking-tight">
            Kitchen Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Orders for{" "}
            <span className="font-medium text-gray-700">{todayOrders.length}</span>
          </p>
        </div>

        <div className="bg-white px-5 py-2 rounded-full shadow-sm border border-gray-200 flex items-center gap-3 w-fit">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
            Total Revenue
          </span>
          <span className="text-xl font-bold text-emerald-600">
            Rs. {todayTotal.toFixed(2)}
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {todayOrders.map((order, idx) => (
          <div
            key={order.order_id}
            className={`flex flex-col justify-between border border-gray-200 rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              order.status === "Cancelled" ? "opacity-60 bg-gray-50 grayscale" : ""
            }`}
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-800 text-white text-xs font-semibold px-2 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {order.tableName}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-mono">
                    {formatNepalTime(order.created_at)}
                  </p>
                </div>

                {order.status !== "Cancelled" && (
                  <button
                    className="p-1.5 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    onClick={() => cancelOrder(order.order_id)}
                    title="Cancel Order"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 flex-grow">
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                <ul className="space-y-2">
                  {order.items.map((i, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-700 font-medium">
                        <span className="text-gray-400 text-xs mr-1">{i.quantity}x</span>
                        {i.name} <span className="text-xs text-gray-400">({i.unit_name})</span>
                      </span>
                      <span className="text-gray-600 font-mono text-xs whitespace-nowrap">
                        Rs.{i.total_price.toFixed(0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-gray-500 text-sm font-medium">Order Total</span>
                <span className="text-lg font-bold text-gray-900">
                  Rs.{order.total_price.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-3 pt-2">
              <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                  {getStatusIndicator(order.status)}
                  {order.status !== "Cancelled" ? (
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(order.order_id, e.target.value)
                      }
                      className="bg-transparent border-none text-xs font-semibold uppercase tracking-wide text-gray-600 focus:outline-none"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-wide text-red-500">
                      {order.status}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {order.status !== "Cancelled" && (
                    <>
                      <button
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        onClick={() => printBill(order)}
                        title="Print Bill"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 max-w-7xl mx-auto border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
        <span>End of list</span>
        <span className="mt-2 md:mt-0">Total Orders: {todayOrders.length}</span>
      </div>
    </div>
  );
};

export default AdminOrdersDashboard;
