"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { ShoppingCart, QrCode } from "lucide-react";
import ToastProvider from "@/components/ToastProvider";
import { useSearchParams, useRouter } from "next/navigation";
import { Commet } from "react-loading-indicators";
import { UtensilsCrossed } from "lucide-react";
import { Utensils } from "lucide-react";
import { Soup } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CustomerMenu() {
  const [menuList, setMenuList] = useState([]);
  const [units, setUnits] = useState([]);
  const [tableNumber, setTableNumber] = useState("-");
  const [tableInfo, setTableInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tableToken = searchParams.get("table_token");

    if (tableToken) {
      fetchTableName(tableToken);
    } else {
      setTableNumber("-");
    }

    fetchMenus(tableToken || "");
    fetchUnits(tableToken || "");
  }, [searchParams]);

  const fetchMenus = async (token) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      let menus = [];

      // If we have a table token, use the order-scan endpoint
      if (token) {
        try {
          console.log("📡 Fetching menus from order-scan endpoint with token:", token);
          const res = await axios.get(`${API_URL}/api/order-scan/?token=${token}`);
          menus = res.data.data || [];
          console.log("📋 Fetched menus from order-scan:", menus);
          console.log("📋 Total menus count:", menus.length);
          
          // Transform order-scan data structure to match our menu structure
          menus = menus.map((m) => ({
            ...m,
            reference_id: m.reference_id || `menu-${Date.now()}-${Math.random()}`,
            quantity: 0,
            // Map the order-scan structure
            unit: m.unit_name, // Already resolved name
            item_category: m.item_category_name, // Already resolved name
            image_url: m.image, // Map image to image_url
          }));
        } catch (scanErr) {
          console.warn("⚠️ order-scan failed, falling back to menus endpoint:", scanErr);
          // Fallback to regular menus endpoint
          const headers = adminToken
            ? { Authorization: `Token ${adminToken}` }
            : { "Table-Token": token };
          
          const res = await axios.get(`${API_URL}/api/menus/`, { headers });
          menus = res.data.data || [];
        }
      } else {
        // No token, use regular menus endpoint
        const headers = adminToken
          ? { Authorization: `Token ${adminToken}` }
          : {};

        const res = await axios.get(`${API_URL}/api/menus/`, { headers });
        menus = res.data.data || [];
      }

      if (menus.length > 0) {
        console.log("📋 Sample menu:", menus[0]);
        console.log("📋 Sample menu unit:", menus[0].unit || menus[0].unit_name);
        console.log("📋 Sample menu image:", menus[0].image || menus[0].image_url);
      }
      
      setMenuList(menus.map((m) => ({ ...m, quantity: 0 })));
      setLoading(false);
    } catch (err) {
      console.error("❌ fetchMenus error:", err);
      toast.error("Failed to load menus");
      setLoading(false);
    }
  };

  const fetchUnits = async (token) => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      const headers = adminToken
        ? { Authorization: `Token ${adminToken}` }
        : token
        ? { "Table-Token": token }
        : {};

      const res = await axios.get(`${API_URL}/api/units/`, { headers });
      setUnits(res.data.data || []);
    } catch (err) {
      console.error("❌ fetchUnits error:", err);
      toast.error("Failed to load units");
    }
  };

  // Helper function to extract ID from string representations like "Unit object (7)"
  const extractIdFromString = (value) => {
    if (typeof value === 'string' && value.includes('object')) {
      const match = value.match(/\((\d+)\)/);
      return match ? match[1] : null;
    }
    return null;
  };

  // Helper function to get unit name
  const getUnitName = (menuItem) => {
    // If menuItem has unit_name (from order-scan endpoint), use it directly
    if (menuItem?.unit_name) {
      return menuItem.unit_name;
    }
    
    const unit = menuItem?.unit || menuItem;
    if (!unit) return "N/A";
    
    // If it's an object with name property
    if (typeof unit === 'object' && unit !== null) {
      if (unit.name) return unit.name;
      // Check for nested properties
      if (unit.unit && unit.unit.name) {
        return unit.unit.name;
      }
      // Check if it has an id or reference_id we can use to lookup
      const lookupId = unit.reference_id || unit.id;
      if (lookupId) {
        const found = units.find(u => 
          u.reference_id === lookupId || 
          (u.id && String(u.id) === String(lookupId))
        );
        if (found) return found.name;
      }
    }
    
    // If it's a string, check if it's already a name (from order-scan) or needs lookup
    if (typeof unit === 'string' && unit) {
      // If it doesn't look like an ID (not a UUID and not "object (id)"), assume it's a name
      if (!unit.includes('object') && unit.length > 3 && !unit.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return unit; // Already a name
      }
      
      // Try to find in list by reference_id
      const found = units.find(u => u.reference_id === unit);
      if (found) return found.name;
      
      // Try extracting ID from string representation like "Unit object (7)"
      const extractedId = extractIdFromString(unit);
      if (extractedId) {
        // Try to find by id (primary key) or reference_id
        const foundById = units.find(u => {
          if (u.id && String(u.id) === extractedId) return true;
          if (u.reference_id === extractedId) return true;
          return false;
        });
        if (foundById) return foundById.name;
      }
    }
    
    return "N/A";
  };

  // Helper function to get image URL
  const getImageUrl = (menu) => {
    if (menu.image) return menu.image;
    if (menu.image_url) return menu.image_url;
    return "https://via.placeholder.com/150?text=No+Image";
  };
  

  const fetchTableName = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/tables/`, {
        headers: { "Table-Token": token },
      });
      const table = res.data.data?.find((t) => t.token === token || t.token === parseInt(token));
      if (table) {
        setTableInfo(table);
        setTableNumber(table.table_number || "-");
        console.log("📋 Table info fetched:", table);
      } else {
        setTableNumber("-");
        console.warn("⚠️ Table not found with token:", token);
      }
    } catch (err) {
      console.error("❌ fetchTableName error:", err);
      setTableNumber("-");
    }
  };

  const handleQuantityChange = (menuId, change) => {
    setMenuList((prev) =>
      prev.map((item) =>
        item.reference_id === menuId
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      )
    );
  };

  const totalItems = menuList.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = menuList.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleSubmitOrder = async () => {
    try {
      if (!API_URL) {
        console.error("❌ API_URL is not configured!");
        toast.error("API configuration error. Please contact support.");
        return;
      }

      const tableToken = searchParams.get("table_token");
      const adminToken = localStorage.getItem("adminToken");

      const cartItems = menuList.filter((i) => i.quantity > 0);
      if (!cartItems.length) {
        toast.error("No items in cart!");
        return;
      }

      if (!tableToken && !adminToken) {
        toast.error("Table token or admin token required!");
        return;
      }

      const formData = new FormData();
      
      // Use table_id and token_number if available, otherwise use table_token
      if (tableInfo) {
        if (tableInfo.reference_id) {
          formData.append("table_id", tableInfo.reference_id);
        }
        if (tableInfo.token_number !== undefined) {
          formData.append("token_number", tableInfo.token_number);
        } else if (tableInfo.token !== undefined) {
          formData.append("token_number", tableInfo.token);
        }
        console.log("📋 Using table info:", {
          table_id: tableInfo.reference_id,
          token_number: tableInfo.token_number || tableInfo.token,
        });
      } else if (tableToken) {
        formData.append("table_token", tableToken);
        console.log("📋 Using table_token:", tableToken);
      }

      cartItems.forEach((item, index) => {
        formData.append(`items[${index}][menu_id]`, item.reference_id);
        formData.append(`items[${index}][quantity]`, String(item.quantity));
        formData.append(`items[${index}][item_price]`, String(item.price));
        formData.append(
          `items[${index}][total_price]`,
          String(item.price * item.quantity)
        );
      });

      // Log the form data for debugging
      console.log("📤 Submitting order with:", {
        tableToken,
        tableInfo,
        hasAdminToken: !!adminToken,
        itemsCount: cartItems.length,
        API_URL,
      });
      
      // Log FormData contents
      for (let pair of formData.entries()) {
        console.log("📦 FormData:", pair[0], "=", pair[1]);
      }

      // Build headers
      const headers = {};
      if (tableToken) {
        headers["Table-Token"] = tableToken;
      }
      if (adminToken) {
        headers["Authorization"] = `Token ${adminToken}`;
      }

      // Use axios for better error handling and CORS support
      const res = await axios.post(`${API_URL}/api/orders/`, formData, {
        headers: headers,
      });

      console.log("📥 Order API response:", res.data);

      const data = res.data;
      if (data.response_code !== "0" && data.response_code !== undefined) {
        const errorMsg = data.message || data.error || "Order validation failed";
        toast.error(errorMsg);
        return;
      }

      toast.success("Order placed successfully ✅");
      setMenuList((prev) => prev.map((i) => ({ ...i, quantity: 0 })));
    } catch (error) {
      console.error("❌ Order submit error:", error);
      
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        console.error("❌ Server error response:", errorData);
        console.error("❌ Error status:", error.response.status);
        console.error("❌ Full error response:", JSON.stringify(errorData, null, 2));
        
        // Extract detailed error messages
        let errorMsg = "Order submission failed";
        if (errorData?.errors) {
          // Handle validation errors
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
            .join(" | ");
          errorMsg = errorMessages || errorData.message || errorData.error || errorMsg;
        } else if (errorData?.message) {
          errorMsg = errorData.message;
        } else if (errorData?.error) {
          errorMsg = errorData.error;
        } else if (typeof errorData === "string") {
          errorMsg = errorData;
        }
        
        toast.error(errorMsg);
      } else if (error.request) {
        // Request was made but no response received
        console.error("❌ No response received:", error.request);
        toast.error("Network error: Could not connect to server. Please check your connection.");
      } else {
        // Error setting up the request
        console.error("❌ Request setup error:", error.message);
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <Commet color="#f59e0b" size="medium" textColor="#f59e0b" />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 relative overflow-hidden">
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

        <div className="w-full border-b-4 border-amber-600 px-4 py-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-b-2xl shadow-lg backdrop-blur-sm">
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
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold shadow-md animate-pulse">
                  {totalItems}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5 mt-6 p-2 pb-32">
          {menuList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-center">
                <Soup className="w-20 h-20 text-amber-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-bold text-amber-700 mb-2">
                  No Menu Available
                </h3>
                {/* <p className="text-amber-600">
                  Please select a menu to get started
                </p> */}
              </div>
            </div>
          ) : (
            menuList.map((menu) => (
              <div
                key={menu.reference_id}
                className="flex bg-white/80 backdrop-blur-sm border-l-4 border-amber-600 p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="relative mr-4">
                  <div className="absolute -inset-1 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-xl blur opacity-50"></div>
                  <img
                    src={getImageUrl(menu)}
                    alt={menu.name || "Menu item"}
                    className="relative w-24 h-24 rounded-xl object-cover border-[3px] border-amber-400 shadow-lg ring-2 ring-amber-200"
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
                    <p className="font-semibold text-amber-900 text-lg mt-1">
                      Rs {menu.price || "0.00"}
                    </p>
                    <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                      <p>Unit: {getUnitName(menu)}</p>
                      {menu.item_category_name && (
                        <p>Category: {menu.item_category_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        handleQuantityChange(menu.reference_id, -1)
                      }
                      className="w-10 h-10 border-2 rounded-full font-bold border-amber-600 text-amber-700 hover:bg-amber-100 transition-colors duration-200 active:scale-95"
                    >
                      -
                    </button>
                    <span className="font-bold text-lg text-amber-900 min-w-[2rem] text-center">
                      {menu.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(menu.reference_id, 1)}
                      className="w-10 h-10 border-2 rounded-full font-bold border-amber-600 bg-amber-600 text-white hover:bg-amber-700 transition-colors duration-200 active:scale-95"
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
                className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 rounded-full font-bold text-white shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 active:scale-95 text-lg"
              >
                Place Order 🍽️
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
