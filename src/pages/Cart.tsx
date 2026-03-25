import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Cart = () => {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t("emptyCart")}</h2>
        <button onClick={() => navigate("/products")} className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl">
          {t("continueShopping")}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "Space Grotesk" }}>{t("cart")} ({itemCount})</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-4 bg-card border border-border rounded-xl p-4">
            <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden shrink-0">
              {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ShoppingBag className="w-6 h-6" /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{item.name}</h3>
              <p className="text-primary font-bold">${item.price}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded border border-border hover:bg-secondary"><Minus className="w-4 h-4" /></button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded border border-border hover:bg-secondary"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={() => removeItem(item.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 bg-card border border-border rounded-xl p-6">
        <div className="flex justify-between text-lg font-bold mb-4">
          <span>{t("total")}</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>
        <button onClick={() => navigate("/checkout")} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium text-lg hover:opacity-90 transition-opacity">
          {t("checkout")}
        </button>
      </div>
    </div>
  );
};

export default Cart;
