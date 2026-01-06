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
  CartesianGrid,
} from "recharts";
import { Package, Tag, DollarSign, Clock } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [username, setUsername] = useState("");

  const [token, setToken] = useState("");
  const [nepalTime, setNepalTime] = useState(new Date());

  const toNepalDateString = (date) => {
    const d = new Date(date);
    const nepal = new Date(d.getTime() + 5.75 * 60 * 60 * 1000);
    return nepal.toDateString();
  };

  const getNepalTodayString = () => {
    const nowUTC = new Date(new Date().toUTCString().slice(0, -4));
    const nepal = new Date(nowUTC.getTime() + 5.75 * 60 * 60 * 1000);
    return nepal.toDateString();
  };

  const getNepalTime = () => {
    const nowUTC = new Date(new Date().toUTCString().slice(0, -4));
    return new Date(nowUTC.getTime() + 5.75 * 60 * 60 * 1000);
  };

  useEffect(() => {
    const interval = setInterval(() => setNepalTime(getNepalTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = nepalTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatTime = (date) => {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

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

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    const storedUsername = localStorage.getItem("username");
    if (storedToken) {
      setToken(storedToken);
      fetchOrders(storedToken);

      const interval = setInterval(() => fetchOrders(storedToken), 10000);
      return () => clearInterval(interval);
    }
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

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
  const pendingOrdersToday = todayOrders.filter(
    (o) => o.status === "pending"
  ).length;

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
    <div className="min-h-screen px/6-1 font-sans antialiased text-slate-900">
      <div
        className="max-w-7xl mx-auto mb-3 flex justify-between items-center p-3 rounded shadow-md

        bg-gradient-to-r from-amber-100 via-orange-100 to-amber-200 border border-amber-300"
      >
        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
            {getGreeting()},{username}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right mr-2">
            <span className="text-sm font-bold text-slate-700">
              {formatTime(nepalTime)}
            </span>
          </div>

          <div className="bg-emerald-50 px-3 py-1 rounded border border-emerald-100 flex items-center gap-1 text-[11px] font-bold text-emerald-600 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Update
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
        {" "}
        {[
          {
            title: "Today Orders",
            value: totalOrdersToday,
            icon: <Package className="w-6 h-6 text-amber-700" />,
          },
          {
            title: "Items Sold",
            value: totalItemsSold,
            icon: <Tag className="w-6 h-6 text-blue-700" />,
          },
          {
            title: "Today Revenue",
            value: `Rs. ${todayRevenue.toLocaleString()}`,
            icon: <DollarSign className="w-6 h-6 text-emerald-700" />,
          },
          {
            title: "Pending Order",
            value: pendingOrdersToday,
            icon: <Clock className="w-6 h-6 text-rose-700" />,
          },
        ].map((stat, i) => (
          <div
            key={stat.title}
            className="bg-white p-6 rounded-xl shadow-md border border-slate-100 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold uppercase tracking-wider text-gray-700">
                {stat.title}
              </p>
              {stat.icon}
            </div>
            <p className={`text-xl font-black ${stat.text}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-7xl mx-auto">
        <div className="bg-amber-50 p-2 rounded shadow-lg border border-amber-200 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-black tracking-tight">
                Revenue Stream
              </h2>
              <p className="text-amber-600 text-sm">Weekly growth trajectory</p>
            </div>
            <div className="bg-amber-100 p-1 rounded flex  border border-amber-200">
              <div className="px-2 bg-amber-200 shadow-sm rounded text-[10px] font-bold text-amber-800 uppercase italic flex items-center justify-center">
                Revenue
              </div>

              <div className="px-3 py-1 text-[10px] font-bold text-green-500 uppercase italic">
                Units
              </div>
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyData}
                margin={{ top: 0, right: 10, left: -20, bottom: 2 }}
              >
                <defs>
                  <linearGradient
                    id="lineGradAmber"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="6 6"
                  vertical={false}
                  stroke="#fef3c7"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#d97706", fontSize: 12 }}
                  dy={15}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#d97706", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#10b981", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 251, 235, 0.95)",
                    borderRadius: "15px",
                    border: "1px solid #fcd34d",
                    color: "#92400e",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="itemsSold"
                  stroke="#10b981"
                  strokeWidth={3}
                  strokeDasharray="6 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- BAR CHART CARD --- */}
        <div className="bg-amber-100 p-2 rounded shadow-lg border border-amber-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-300/20 blur-[60px] rounded-full"></div>

          <div className="relative z-10">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-black tracking-tight">
                Order Intensity
              </h2>
              <p className="text-amber-700 font-medium text-sm">
                Daily transaction volume
              </p>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 2 }}
                >
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#b45309", fontSize: 12, fontWeight: 600 }}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#10b981 ", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.1)" }}
                    contentStyle={{
                      backgroundColor: "rgba(255, 251, 235, 0.95)",
                      borderRadius: "15px",
                      border: "1px solid #fcd34d",
                      color: "#92400e",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="ordersCount"
                    fill="#d97706"
                    radius={[10, 10, 0, 0]}
                    barSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
