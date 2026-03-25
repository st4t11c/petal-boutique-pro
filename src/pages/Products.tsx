import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Search, ShoppingCart, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Products = () => {
  const { t } = useLanguage();
  const { addItem } = useCart();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data || [];
    },
  });

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleAddToCart = (product: typeof products[0]) => {
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
    toast.success(`${product.name} ${t("addToCart").toLowerCase()}!`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8" style={{ fontFamily: "Space Grotesk" }}>{t("products")}</motion.h1>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("search") + "..."}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-card border border-border rounded-xl text-sm appearance-none cursor-pointer focus:outline-none focus:border-primary">
            <option value="all">{t("allProducts")}</option>
            {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} whileHover={{ y: -5 }}
              className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-all">
              <Link to={`/products/${product.id}`}>
                <div className="aspect-square bg-secondary/50 overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ShoppingCart className="w-12 h-12" />
                    </div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                {product.badge && (
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{product.badge}</span>
                )}
                <Link to={`/products/${product.id}`}>
                  <h3 className="font-semibold mt-1 hover:text-primary transition-colors">{product.name}</h3>
                </Link>
                <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-primary">${product.price}</span>
                  <button onClick={() => handleAddToCart(product)} disabled={product.stock <= 0}
                    className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
                <p className={`text-xs mt-1 ${product.stock <= 0 ? "text-destructive" : product.stock <= 5 ? "text-yellow-500" : "text-green-500"}`}>
                  {product.stock <= 0 ? t("outOfStock") : product.stock <= 5 ? `${t("lowStock")} (${product.stock})` : t("inStock")}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
