"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ShoppingCart, Soup, Plus, Minus, Info } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Commet } from "react-loading-indicators";
import ToastProvider from "@/components/ToastProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CustomerMenu() {
  const [menuList, setMenuList] = useState([]);
  const [tableNumber, setTableNumber] = useState("-");
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastOrderTime, setLastOrderTime] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const searchParams = useSearchParams();
  const tableToken =
    searchParams.get("table_token") || searchParams.get("token");

  const fetchTableInfo = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/order-scan/`, {
        params: { token },
      });
      if (res.data.code === "0" && res.data.data?.summary_data) {
        const tableData = res.data.data.summary_data;
        setTable(tableData);
        setTableNumber(tableData?.table_number || "-");
      }
    } catch (err) {
      console.error("Table info error:", err);
    }
  };

  const fetchMenus = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/order-scan/`, {
        params: { token },
      });
      if (res.data.code === "0") {
        const menus = res.data.data?.details_data || [];
        setMenuList(
          menus.map((m) => ({ ...m, quantity: 0, price: Number(m.price) }))
        );
      }
    } catch (err) {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tableToken) {
      fetchTableInfo(tableToken);
      fetchMenus(tableToken);
    } else {
      setLoading(false);
    }
  }, [tableToken]);

  const handleQtyChange = (index, change) => {
    setMenuList((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      )
    );
  };

  const totalItems = menuList.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = menuList.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmitOrder = async () => {
    if (!totalItems) return toast.error("Your cart is empty!");
    try {
      const payload = {
        table_id: table?.table_id || "",
        table_number: table?.table_number || "",
        items: menuList
          .filter((m) => m.quantity > 0)
          .map((i) => ({
            menu_id: i.reference_id,
            name: i.name,
            unit_name: i.unit_name,
            quantity: i.quantity,
            item_price: i.price,
            total_price: i.price * i.quantity,
          })),
        total_price: totalPrice,
        status: "pending",
        token: tableToken,
      };
      const res = await axios.post(`${API_URL}/api/orders/`, payload);
      toast.success("Order placed successfully!");
      setLastOrderTime(res.data.created_at);
      setMenuList((prev) => prev.map((m) => ({ ...m, quantity: 0 })));
    } catch (err) {
      toast.error("Order failed. Try again.");
    }
  };

  if (loading)
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-white">
        <Commet color="#236B28" size="medium" />
        <p className="mt-4 text-[#236B28] font-medium animate-pulse">
          Loading Menu...
        </p>
      </div>
    );

  return (

    <>    
    <div className="min-h-screen bg-slate-50 font-sans pb-40">
      <ToastProvider />   

      {/* Header Section */}
      <header className="sticky top-0 z-50  bg-[#236B28] text-white p-3  shadow-xl">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <div>
            <h1 className="text-md font-black tracking-tight">EAT & REPEAT</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-white/20 px-2  rounded-full text-xs font-semibold backdrop-blur-md">
                Table {tableNumber}
              </span>
            </div>
          </div>
          <div className="relative p-2   backdrop-blur-md  border-white/30">
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-0 -right-1 bg-orange-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold animate-bounce">
                {totalItems}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Menu List */}
      <main className="max-w-2xl mx-auto px-2 mt-4 space-y-3">
        {menuList.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <Soup className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-500">
              No dishes available right now.
            </p>
          </div>
        ) : (
          menuList.map((menu, index) => (
            <div
              key={index}
              className="group relative flex bg-white rounded p-2 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 items-center"
            >
              
              <div className="relative w-16 h-16 overflow-hidden rounded-xl shadow-inner flex-shrink-0">
                <img
                  src={menu.image || "https://via.placeholder.com/150"}
                  alt={menu.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                  onClick={() => setPreviewImage(menu.image)}
                />
              </div>

              <div className="flex flex-1 justify-between items-center ml-3">
                <div className="flex flex-col">
                  <h3 className="text-[15px] font-bold text-slate-800 leading-tight">
                    {menu.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[#236B28] font-extrabold text-[16px]">
                      Rs {menu.price}
                    </p>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">
                      / {menu.unit_name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center bg-slate-50 rounded-full p-0.5 border border-slate-200">
                  <button
                    onClick={() => handleQtyChange(index, -1)}
                    className={`p-1 rounded-full transition-all ${
                      menu.quantity > 0
                        ? "bg-white text-[#236B28] shadow-sm"
                        : "text-slate-300"
                    }`}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-2 font-bold text-slate-700 text-sm min-w-[1.8rem] text-center">
                    {menu.quantity}
                  </span>
                  <button
                    onClick={() => handleQtyChange(index, 1)}
                    className="p-1 rounded-full bg-[#236B28] text-white shadow-sm active:scale-90 transition-transform"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {totalItems > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 animate-slideUp">
          <div className="bg-[#236B28] p-2 shadow-2xl border border-white/20 backdrop-blur-lg">
            <div className="flex justify-between items-center mb-3 text-white">
              <div>
                <p className="text-white/70 text-sm">Total Amount</p>
                <p className="text-md font-black">
                  Rs {totalPrice.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm">Items</p>
                <p className="text-md font-bold">{totalItems}</p>
              </div>
            </div>
            <button
              onClick={handleSubmitOrder}
              className="w-full bg-white text-[#236B28] py-2 mb-3 rounded font-black text-md shadow-lg hover:bg-orange-50 transition-colors active:scale-[0.98]"
            >
              PLACE ORDER NOW
            </button>
          </div>
        </div>
      )}

     
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-lg w-full">
            <img
              src={previewImage}
              className="w-full h-auto rounded-[2rem] shadow-2xl"
              alt="Preview"
            />
          </div>
        </div>
      )}
    </div>
    </>
  );
}
