"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { ShoppingCart } from "lucide-react";
import ToastProvider from "@/components/ToastProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CustomerMenuPage() {
  const [menuList, setMenuList] = useState([]);
  const [units, setUnits] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    setToken(savedToken);

    if (savedToken) {
      fetchMenus(savedToken);
      fetchUnits(savedToken);
    }
  }, []);

  const fetchMenus = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/menus/`, {
        headers: { Authorization: `Token ${token}` },
      });
      const menus = res.data.data || [];
      setMenuList(menus.map((m) => ({ ...m, quantity: 0 })));
    } catch {
      toast.error("Failed to fetch menus");
    }
  };

  const fetchUnits = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/units/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setUnits(res.data.data || []);
    } catch {
      toast.error("Failed to fetch units");
    }
  };

  const handleQuantityChange = (menuId, change) => {
    setMenuList((prev) =>
      prev.map((item) =>
        item.reference_id === menuId
          ? { ...item, quantity: Math.max(0, (item.quantity || 0) + change) }
          : item
      )
    );
  };

  const totalItems = menuList.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const totalPrice = menuList.reduce(
    (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
    0
  );

  const handlePlaceOrder = async () => {
    if (!token) {
      toast.error("Token not found, please login again.");
      return;
    }

    const itemsToOrder = menuList.filter((i) => i.quantity > 0);
    if (itemsToOrder.length === 0) {
      toast.error("No items selected!");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/orders/`,
        {
          items: itemsToOrder.map((i) => ({
            menu_id: i.reference_id,
            quantity: i.quantity,
          })),
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      if (res.data.response_code === "0") {
        toast.success("Order placed successfully!");
        setMenuList((prev) => prev.map((i) => ({ ...i, quantity: 0 })));
      } else {
        toast.error("Failed to place order!");
      }
    } catch {
      toast.error("Error placing order!");
    }
  };

  return (
    <div className="container mx-auto p-2 sm:p-6">
      <ToastProvider />

      <div className="w-full border-b rounded-b-xl border-amber-600 px-2 py-3 flex justify-between items-center ">
       
        <h1 className="text-3xl font-extrabold text-amber-600 tracking-wide">
          Menu
        </h1>

       
        <div className="relative flex items-center px-3 py-2">
          <ShoppingCart className="h-6 w-6 text-amber-700" />

          
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
              {totalItems}
            </span>
          )}
        </div>
      </div>

      
      <div className="flex flex-col space-y-4 mt-6">
        {menuList.map((menu) => (
          <div
            key={menu.reference_id}
            className="flex items-center border-l-4 border-amber-600 bg-amber-50  transition p-3 rounded-lg shadow-md"
          >
            
            <img
              src={menu.image_url }
              alt={menu.name}
              className="w-24 h-24 object-cover rounded-lg mr-4 "
            />

            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between w-full">
              <div>
                <h2 className="text-xl font-bold text-amber-700">
                  {menu.name}
                </h2>
                <p className="text-gray-700 mt-1 font-semibold">
                  Rs {menu.price}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Unit:{" "}
                  {units.find((u) => u.reference_id === menu.unit)?.name ||
                    "N/A"}
                </p>
              </div>

             
              <div className="flex items-center mt-2 sm:mt-0 space-x-3">
                <button
                  onClick={() => handleQuantityChange(menu.reference_id, -1)}
                  className="w-10 h-10 border-2 border-amber-500 text-black rounded-full font-bold hover:bg-amber-500 hover:text-white transition"
                >
                  -
                </button>
                <span className="text-lg font-semibold">
                  {menu.quantity || 0}
                </span>
                <button
                  onClick={() => handleQuantityChange(menu.reference_id, 1)}
                  className="w-10 h-10 border-2 border-amber-500 text-black rounded-full font-bold "
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      
      {totalItems > 0 && (
  <div className="fixed bottom-0 left-0 w-full bg-amber-50 border-t border-amber-400 rounded-t-3xl p-4 shadow-xl z-50">
    
    {/* Top Text Row */}
    <div className="flex justify-between items-center text-amber-800 font-semibold text-base sm:text-lg">
      <span>
        Total Items:{" "}
        <span className="text-amber-900 font-bold">{totalItems}</span>
      </span>

      <span>
        Total Price:{" "}
        <span className="text-amber-900 font-bold">
          Rs {totalPrice.toFixed(2)}
        </span>
      </span>
    </div>

    {/* Button Row */}
    <div className="flex justify-end mt-4">
      <button
        onClick={handlePlaceOrder}
        disabled={!token}
        className="bg-amber-500 hover:bg-amber-600 text-black py-2 px-6 rounded-lg font-bold shadow-lg transition-all duration-200 ease-in-out hover:scale-105 disabled:opacity-50"
      >
        Place Order
      </button>
    </div>
  </div>
)}

    </div>
  );
}
