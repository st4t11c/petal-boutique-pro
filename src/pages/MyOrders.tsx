import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const MyOrders = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", user?.email],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").eq("customer_email", user!.email!).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user?.email,
  });

  if (!user) return <Navigate to="/auth" />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: "Space Grotesk" }}>{t("myOrders")}</h1>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-card animate-pulse rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">{t("noOrdersYet")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">#{order.id.slice(0, 8)}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${order.status === "approved" ? "bg-green-500/20 text-green-500" : order.status === "denied" ? "bg-red-500/20 text-red-500" : order.status === "delivered" ? "bg-blue-500/20 text-blue-500" : "bg-yellow-500/20 text-yellow-500"}`}>
                  {t(order.status)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
                <span className="text-primary font-bold">${order.total}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("fulfillment")}: {t(order.fulfillment)}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
