"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  CartesianGrid,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ================= DATE HELPERS (NEPAL) ================= */
const toNepalDateString = (date) => {
  const d = new Date(date);
  const nepal = new Date(d.getTime() + (5 * 60 + 45) * 60000);
  return nepal.toDateString();
};

const getNepalTodayString = () => {
  const now = new Date();
  const nepal = new Date(now.getTime() + (5 * 60 + 45) * 60000);
  return nepal.toDateString();
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [token, setToken] = useState("");

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/api/orders-list/`, {
        headers: { Authorization: `Token ${authToken}` },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");

      const result = await res.json();
      const ordersData = Array.isArray(result?.data) ? result.data : [];

      const normalizedOrders = ordersData.map((o) => {
        const items = Array.isArray(o.items)
          ? o.items.map((i) => ({
              name: i.menu_name,
              quantity: Number(i.quantity),
              total_price: Number(i.total_price),
            }))
          : [];

        return {
          order_id: o.reference_id,
          created_at: o.order_time,
          status: o.status || "Pending",
          items,
          total_price: Number(o.total_amount),
        };
      });

      setOrders(normalizedOrders);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setOrders([]);
    }
  };

  /* ================= ON MOUNT ================= */
  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    if (storedToken) {
      setToken(storedToken);
      fetchOrders(storedToken);

      const interval = setInterval(() => fetchOrders(storedToken), 10000);
      return () => clearInterval(interval);
    }
  }, []);

  /* ================= TODAY STATS ================= */
  const todayNepal = getNepalTodayString();
  const todayOrders = orders.filter(
    (o) => toNepalDateString(o.created_at) === todayNepal
  );
  const totalOrdersToday = todayOrders.length;
  const totalItemsSold = todayOrders.reduce(
    (sum, o) => sum + o.items.reduce((iSum, i) => iSum + i.quantity, 0),
    0
  );
  const todayRevenue = todayOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total_price, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  /* ================= WEEKLY CHART ================= */
  const getLast7DaysData = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = toNepalDateString(d);
      const dayOrders = orders.filter(
        (o) => toNepalDateString(o.created_at) === dateStr
      );

      return {
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: dayOrders.reduce(
          (sum, o) => sum + (o.status !== "cancelled" ? o.total_price : 0),
          0
        ),
        itemsSold: dayOrders.reduce(
          (sum, o) => sum + o.items.reduce((iSum, i) => iSum + i.quantity, 0),
          0
        ),
        ordersCount: dayOrders.length,
      };
    });
  };

  const weeklyData = getLast7DaysData();

  return (
    <div className="min-h-screen  p-1 font-sans antialiased text-slate-900">
      <div className="max-w-7xl mx-auto mb-10 flex justify-end items-center">
        <div className="bg-white px-4 py-2   rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2 text-sm font-semibold text-slate-600">
          <span className="w-2 h-2 rounded-full  bg-green-500 animate-pulse"></span>
          Live Updates
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
        {[
          {
            title: "Today Orders",
            value: totalOrdersToday,
            icon: "📦",
            color: "from-amber-50 to-amber-100",
            text: "text-amber-700",
          },
          {
            title: "Items Sold",
            value: totalItemsSold,
            icon: "🏷️",
            color: "from-blue-50 to-blue-100",
            text: "text-blue-700",
          },
          {
            title: "Today Revenue",
            value: `Rs. ${todayRevenue.toLocaleString()}`,
            icon: "💰",
            color: "from-emerald-50 to-emerald-100",
            text: "text-emerald-700",
          },
          {
            title: "Pending Orders",
            value: pendingOrders,
            icon: "⏳",
            color: "from-rose-50 to-rose-100",
            text: "text-rose-700",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl shadow-xl border border-slate-100 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
          >
            <div
              className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-bl-[5rem] -mr-6 -mt-6 opacity-50 group-hover:scale-110 transition-transform`}
            ></div>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
              {stat.title}
            </p>
            <p className={`text-3xl font-black ${stat.text}`}>{stat.value}</p>
          </div>
        ))}
      </div>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
  {/* --- LINE CHART CARD --- */}
  <div className="bg-amber-50 p-3 rounded-2xl shadow-lg border border-amber-200 relative overflow-hidden">
    <div className="flex justify-between items-start mb-6">
      <div>
        <h2 className="text-2xl font-extrabold text-amber-800 tracking-tight">
          Revenue Stream
        </h2>
        <p className="text-amber-600 font-medium text-sm">
          Weekly growth trajectory
        </p>
      </div>
      <div className="bg-amber-100 p-1.5 rounded-xl flex gap-1 border border-amber-200">
        <div className="px-3 py-1 bg-amber-200 shadow-sm rounded-lg text-[10px] font-bold text-amber-800 uppercase italic">
          Revenue
        </div>
        <div className="px-3 py-1 text-[10px] font-bold text-blue-500 uppercase italic">
          Units
        </div>
      </div>
    </div>

    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={weeklyData} margin={{ top: 0, right: 10, left: -20, bottom: 2 }}>
          <defs>
            <linearGradient id="lineGradAmber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#fef3c7" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#d97706", fontSize: 12 }} dy={15} />
          <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: "#d97706", fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#3b82f6", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 251, 235, 0.95)",
              borderRadius: "15px",
              border: "1px solid #fcd34d",
              color: "#92400e",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            }}
          />
          <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
          <Line yAxisId="right" type="monotone" dataKey="itemsSold" stroke="#3b82f6" strokeWidth={3} strokeDasharray="6 3" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* --- BAR CHART CARD --- */}
  <div className="bg-amber-100 p-6 rounded-2xl shadow-lg border border-amber-300 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-300/20 blur-[60px] rounded-full"></div>

    <div className="relative z-10">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-amber-900 tracking-tight">
          Order Intensity
        </h2>
        <p className="text-amber-700 font-medium text-sm">Daily transaction volume</p>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -20, bottom: 2 }}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#b45309", fontSize: 12, fontWeight: 600 }} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#b45309", fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.1)" }}
              contentStyle={{
                backgroundColor: "#78350f",
                borderRadius: "12px",
                border: "1px solid #c2410c",
                color: "#fff",
              }}
            />
            <Bar dataKey="ordersCount" fill="#d97706" radius={[10, 10, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
</div>

    </div>
  );
}

/* ================= STAT CARD ================= */
function Stat({ title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className={`text-3xl font-bold ${color}`}>{value}</h2>
    </div>
  );
}
