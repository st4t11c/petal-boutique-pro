import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id!).single();
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="container mx-auto px-4 py-8"><div className="h-96 bg-card animate-pulse rounded-2xl" /></div>;
  if (!product) return <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          className="aspect-square bg-card border border-border rounded-2xl overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ShoppingCart className="w-16 h-16" />
            </div>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          {product.badge && <span className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-full">{product.badge}</span>}
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Space Grotesk" }}>{product.name}</h1>
          <p className="text-sm text-muted-foreground">{product.category}</p>
          <p className="text-3xl font-bold text-primary">${product.price}</p>
          <p className="text-muted-foreground">{product.description}</p>
          <p className={`text-sm ${product.stock <= 0 ? "text-destructive" : product.stock <= 5 ? "text-yellow-500" : "text-green-500"}`}>
            {product.stock <= 0 ? t("outOfStock") : product.stock <= 5 ? `${t("lowStock")} (${product.stock})` : `${t("inStock")} (${product.stock})`}
          </p>
          <button onClick={() => { addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url }); toast.success(`${product.name} added to cart!`); }}
            disabled={product.stock <= 0}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
            <ShoppingCart className="w-5 h-5" /> {t("addToCart")}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
