"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ShoppingCart, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import CartSidebar from "@/components/CartSidebar";
import { menuItems } from "@/data/MenuData";
import Menufilter from "@/components/Menu-filter";
import ToastProvider from "@/components/ToastProvider";
import toast from "react-hot-toast";

const TableMenuPage = () => {
  const { tableId } = useParams();
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const validTables = [1, 2, 3, 4, 5, 6];
  const clearCart = () => setCartItems([]);

  {
    /* invalid Tables check -------------- */
  }
  if (tableId && !validTables.includes(Number(tableId))) {
    return (
      <div className="p-10 text-center text-red-600 text-2xl">
        ❌ Invalid Table Number
      </div>
    );
  }

  const addToCart = (item) => {
    const exists = cartItems.find((c) => c.id === item.id);

    if (exists) {
      setCartItems(
        cartItems.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }

    toast.success(`${item.name} added to order`, {
      icon: <CheckCircle className="text-green-500" />,
    });
  };

  const updateQty = (id, qty) => {
    setCartItems(
      cartItems.map((c) => (c.id === id ? { ...c, quantity: qty } : c))
    );
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter((c) => c.id !== id));
    toast("Item removed!", { icon: "❌" });
  };

  const totalItems = cartItems.reduce((x, y) => x + y.quantity, 0);
  const totalPrice = cartItems.reduce((x, y) => x + y.price * y.quantity, 0);

  return (
    <div className="min-h-screen  from-[#f7f3ee] to-[#fafafa]">
      <ToastProvider />

      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 shadow-md border-b border-black/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-2">
            <div className=" p-0  ">
              <img
                src="/images/logo.png"
                alt="cafe logo"
                className="h-10 w-10"
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">Royal Dine Cafe</h1>
              <p className="text-xs text-gray-500">Table # {tableId}</p>
            </div>
          </div>

          {/* Cart Button */}
          <Button
            onClick={() => setIsCartOpen(true)}
            className="relative  bg-transparent text-amber-500  hover:bg-transparent hover:text-amber-600 rounded-xl px-2 py-2 cursor-pointer"
          > 
          
            <ShoppingCart className="h-10 w-10"/>
            

            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-md animate-bounce">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* HERO BANNER */}
      <div className="w-full h-48 bg-[url('/images/banner.avif')] bg-cover bg-center rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <h2 className="text-3xl font-bold drop-shadow-lg">
            Welcome to Royal Dine
          </h2>
          <p className="opacity-90 mt-1">Scan • Order • Enjoy</p>
          <p className="text-amber-500  font-bold mb-4">
            Order directly from your table.
          </p>
        </div>
      </div>

      {/* MENU LIST */}
      <main className="container mx-auto px-3 py-4  pb-32">
        <Menufilter menu={menuItems} onAdd={addToCart} />
      </main>

      {/* BOTTOM TOTAL BAR */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-amber-500 text-white p-5 rounded-t-3xl shadow-2xl">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">{totalItems} items</p>
              <p className="text-2xl font-bold">Rs. {totalPrice.toFixed(2)}</p>
            </div>

            <Button
              onClick={() => setIsCartOpen(true)}
              className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 shadow"
            >
              View Order
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* CART SIDEBAR */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQty}
        onRemove={removeItem}
        tableId={tableId}
        onClearCart={clearCart}
      />
    </div>
  );
};

export default TableMenuPage;
