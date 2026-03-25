import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "sonner";

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: user?.email || "", phone: "", fulfillment: "pickup", address: "", notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    try {
      const { data: order, error } = await supabase.from("orders").insert({
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone || null,
        fulfillment: form.fulfillment,
        delivery_address: form.address || null,
        notes: form.notes || null,
        total,
        status: "pending",
      }).select().single();

      if (error) throw error;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      await supabase.from("order_items").insert(orderItems);

      for (const item of items) {
        await supabase.rpc("decrease_stock", { p_product_id: item.id, p_quantity: item.quantity });
      }

      addNotification({ title: t("newOrder"), message: `Order #${order.id.slice(0, 8)} placed!`, type: "order" });
      clearCart();
      toast.success(t("orderSuccess"));
      navigate("/my-orders");
    } catch (err: any) {
      toast.error(err.message || "Error placing order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold mb-8" style={{ fontFamily: "Space Grotesk" }}>{t("checkout")}</motion.h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">{t("customerName")} *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm mb-1">{t("customerEmail")} *</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm mb-1">{t("phone")}</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full p-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm mb-1">{t("fulfillment")}</label>
          <select value={form.fulfillment} onChange={(e) => setForm({ ...form, fulfillment: e.target.value })}
            className="w-full p-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
            <option value="pickup">{t("pickup")}</option>
            <option value="delivery">{t("delivery")}</option>
          </select>
        </div>
        {form.fulfillment === "delivery" && (
          <div>
            <label className="block text-sm mb-1">{t("address")} *</label>
            <input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
          </div>
        )}
        <div>
          <label className="block text-sm mb-1">{t("notes")}</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full p-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary" rows={3} />
        </div>

        <div className="bg-card border border-border rounded-xl p-4 mt-6">
          <h3 className="font-semibold mb-2">{t("items")}</h3>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm py-1">
              <span>{item.name} × {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-border mt-2 pt-2 flex justify-between font-bold">
            <span>{t("total")}</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>

        <button type="submit" disabled={loading || items.length === 0}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium text-lg hover:opacity-90 transition-opacity disabled:opacity-50">
          {loading ? "..." : t("placeOrder")}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
