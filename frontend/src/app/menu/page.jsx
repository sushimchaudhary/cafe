"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ShoppingCart, Soup } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Commet } from "react-loading-indicators";
import ToastProvider from "@/components/ToastProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CustomerMenu() {
  const [menuList, setMenuList] = useState([]);
  const [tableNumber, setTableNumber] = useState("-");
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);

  const searchParams = useSearchParams();
  const tableToken =
    searchParams.get("table_token") || searchParams.get("token");
  console.log("Customer page tableToken:", tableToken);

  /* ------------------ FETCH TABLE INFO ------------------ */
  const fetchTableInfo = async (token) => {
    try {
      console.log("Fetching table info for token:", token);
      const res = await axios.get(`${API_URL}/api/order-scan/`, {
        params: { token },
      });
      console.log("Table info response:", res.data);

      if (res.data.code === "0" && res.data.data?.summary_data) {
        const table = res.data.data.summary_data;
        setTable(table);
        setTableNumber(table?.table_number || "-");
        console.log("Table number set:", table?.table_number);
      } else {
        setTable(null);
        setTableNumber("-");
        console.warn("No table info found for token:", token);
      }
    } catch (err) {
      console.error("Error fetching table info:", err);
      setTable(null);
      setTableNumber("-");
    } finally {
      setTableLoading(false);
    }
  };

  /* ------------------ FETCH MENUS ------------------ */
  const fetchMenus = async (token) => {
    try {
      console.log("Fetching menus for token:", token);
      const res = await axios.get(`${API_URL}/api/order-scan/`, {
        params: { token },
      });
      console.log("Menu fetch response:", res.data);

      if (res.data.code !== "0") {
        toast.error("Menu load failed");
        return;
      }

      const menus = res.data.data?.details_data || [];
      setMenuList(
        menus.map((menu) => ({
          ...menu,
          quantity: 0,
          price: Number(menu.price), // parse string to number
        }))
      );
    } catch (err) {
      console.error("Menu fetch error:", err);
      toast.error("Menu load failed");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ IMAGE HELPER ------------------ */
  const getImageUrl = (menu) => {
    if (menu?.image) return menu.image;
    if (menu?.image_url) return menu.image_url;
    return "https://via.placeholder.com/150?text=No+Image";
  };

  /* ------------------ QUANTITY HANDLER ------------------ */
  const handleQtyChange = (index, change) => {
    setMenuList((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      )
    );
  };

  /* ------------------ TOTALS ------------------ */
  const totalItems = menuList.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = menuList.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );


  const handleSubmitOrder = async () => {
    if (!totalItems) {
      toast.error("Cart is empty!");
      return;
    }

    try {
      console.log("Submitting order...");

      

      const payload = {
        table_id: table?.table_id || "",
        table_number: table?.table_number || "",
        items: menuList
          .filter((m) => m.quantity > 0)
          .map((item) => ({
            menu_id: item.reference_id,
            name: item.name,
            unit_name: item.unit_name,   
            quantity: item.quantity,
            item_price: item.price,
            total_price: item.price * item.quantity,
          })),
        total_price: menuList
          .filter((m) => m.quantity > 0)
          .reduce((sum, i) => sum + i.price * i.quantity, 0),
        status: "pending",
        token: tableToken,
      };

      const res = await axios.post(`${API_URL}/api/orders/`, payload, {
        // params: { token: tableToken },
        headers: { "Content-Type": "application/json" },
      });

      console.log("Order response:", res.data);
      toast.success("Order placed successfully ✅");

      setMenuList((prev) => prev.map((m) => ({ ...m, quantity: 0 })));
    } catch (err) {
      console.error("Order submission error:", err);
      toast.error("Order failed");
    }
  };


  useEffect(() => {
    if (tableToken) {
      fetchTableInfo(tableToken);
      fetchMenus(tableToken);
    } else {
      setLoading(false);
      console.warn("No table token found in URL");
    }
  }, [tableToken]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <Commet color="#f59e0b" size="medium" textColor="#f59e0b" />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 relative overflow-hidden font-sans">
      <svg
        className="absolute inset-0 w-full h-full top-0 left-0 opacity-[0.25] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="momo-pattern"
            x="0"
            y="0"
            width="150"
            height="150"
            patternUnits="userSpaceOnUse"
          >
            {/* Momo dumpling with fold details */}
            <g transform="translate(35, 50)">
              <ellipse
                cx="0"
                cy="8"
                rx="18"
                ry="5"
                fill="#d97706"
                opacity="0.3"
              />
              <circle cx="0" cy="0" r="15" fill="#f59e0b" opacity="0.4" />
              <path
                d="M -12 0 Q 0 -8 12 0"
                stroke="#d97706"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M -10 -2 Q 0 -10 10 -2"
                stroke="#d97706"
                strokeWidth="1.5"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M -8 -4 Q 0 -12 8 -4"
                stroke="#d97706"
                strokeWidth="1"
                fill="none"
                opacity="0.4"
              />
              {/* Steam */}
              <path
                d="M -8 -18 Q -6 -25 -8 -32"
                stroke="#f59e0b"
                strokeWidth="2"
                fill="none"
                opacity="0.3"
                strokeLinecap="round"
              />
              <path
                d="M 0 -20 Q 2 -27 0 -34"
                stroke="#f59e0b"
                strokeWidth="2"
                fill="none"
                opacity="0.3"
                strokeLinecap="round"
              />
              <path
                d="M 8 -18 Q 10 -25 8 -32"
                stroke="#f59e0b"
                strokeWidth="2"
                fill="none"
                opacity="0.3"
                strokeLinecap="round"
              />
            </g>

            {/* Decorative plate with food */}
            <g transform="translate(100, 100)">
              <ellipse
                cx="0"
                cy="0"
                rx="25"
                ry="8"
                fill="none"
                stroke="#d97706"
                strokeWidth="2"
                opacity="0.4"
              />
              <ellipse
                cx="0"
                cy="-2"
                rx="28"
                ry="6"
                fill="#f59e0b"
                opacity="0.2"
              />
              <circle cx="-8" cy="-8" r="6" fill="#d97706" opacity="0.4" />
              <circle cx="0" cy="-10" r="6" fill="#d97706" opacity="0.4" />
              <circle cx="8" cy="-8" r="6" fill="#d97706" opacity="0.4" />
            </g>

            {/* Fork and spoon icons */}
            <g transform="translate(115, 35)" opacity="0.25">
              <rect x="0" y="0" width="1.5" height="25" fill="#d97706" />
              <circle cx="0.75" cy="-2" r="2" fill="#d97706" />
              <circle cx="0.75" cy="-6" r="2" fill="#d97706" />
              <circle cx="0.75" cy="-10" r="2" fill="#d97706" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#momo-pattern)" />
      </svg>

      <div className="container mx-auto sm:p-6 relative z-10">
        <ToastProvider />
        <div className="fixed top-0 left-0 w-full border-b-4 border-amber-600 px-4 py-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-b-2xl shadow-lg backdrop-blur-sm z-50">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-amber-700 tracking-tight">
                Menu
              </h1>
              <p className="text-sm text-amber-600 mt-1 font-medium">
                Table {tableNumber}
              </p>
            </div>
            <div className="relative">
              <div className="bg-amber-600 p-3 rounded-full shadow-lg">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md animate-pulse">
                  {totalItems}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5 mt-26 p-1 pb-32">
          {menuList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-center">
                <Soup className="w-20 h-20 text-amber-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-bold text-amber-700 mb-2">
                  No Menu Available
                </h3>
              </div>
            </div>
          ) : (
            menuList.map((menu, index) => (
              <div
                key={index}
                className="flex bg-white/70 backdrop-blur-sm border-l-4 border-amber-600 p-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="relative mr-3">
                  <div className="absolute bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-xl blur opacity-50"></div>
                  <img
                    src={getImageUrl(menu)}
                    alt={menu.name || "Menu item"}
                    className="relative w-24 h-24 rounded-xl object-cover border-[2px] border-amber-400  ring-2 ring-amber-200"
                    onError={(e) => {
                      e.target.src = "/images/placeholder.jpg";
                    }}
                  />
                </div>

                <div className="flex-1 flex justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-amber-700">
                      {menu.name || "Unnamed Item"}
                    </h2>
                    <p className="font-semibold text-amber-900 text-sm mt-1">
                      Rs {menu.price || "0.00"}
                    </p>
                    <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                      <p>Unit: {menu.unit_name}</p>
                      {/* {menu.item_category_name && (
                        <p>Category: {menu.item_category_name}</p>
                      )} */}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQtyChange(index, -1)}
                      className="w-8 h-8 border-2 rounded-full font-bold border-amber-600 text-amber-700 hover:bg-amber-100"
                    >
                      -
                    </button>
                    <span className="font-bold text-lg text-amber-900 min-w-[2rem] text-center">
                      {menu.quantity}
                    </span>
                    <button
                      onClick={() => handleQtyChange(index, 1)}
                      className="w-8 h-8 border-2 rounded-full font-bold border-amber-600 bg-amber-600 text-white hover:bg-amber-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-amber-100 to-orange-100 border-t-4 border-amber-600 rounded-t-3xl p-5 shadow-2xl backdrop-blur-sm z-20">
            <div className="flex justify-between font-bold text-amber-900 mb-3">
              <span className="text-lg">Total Items: {totalItems}</span>
              <span className="text-lg">Total: Rs {totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleSubmitOrder}
                className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 rounded-full font-bold text-white shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 active:scale-95 text-lg"
              >
                Place Orde
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
