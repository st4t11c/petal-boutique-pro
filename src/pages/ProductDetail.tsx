import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id!).single();
      return data;
    },
    enabled: !!id,
  });

  // Fetch additional images
  const { data: extraImages = [] } = useQuery({
    queryKey: ["product-images", id],
    queryFn: async () => {
      const { data } = await (supabase as any).from("product_images").select("*").eq("product_id", id!).order("sort_order");
      return data || [];
    },
    enabled: !!id,
  });

  // Fetch related products (same category)
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["related-products", product?.category, id],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*")
        .eq("category", product!.category).eq("is_active", true)
        .neq("id", id!).limit(4);
      return data || [];
    },
    enabled: !!product?.category,
  });

  if (isLoading) return <div className="container mx-auto px-4 py-8"><div className="h-96 bg-card animate-pulse rounded-2xl" /></div>;
  if (!product) return <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">{t("products")} - Not found</div>;

  // Build all images array
  const allImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...extraImages.map((img: any) => img.image_url),
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> {t("back")}
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
          <div className="aspect-square bg-card border border-border rounded-2xl overflow-hidden relative">
            {allImages.length > 0 ? (
              <>
                <img src={allImages[currentImage]} alt={product.name} className="w-full h-full object-cover" />
                {allImages.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImage((p) => (p - 1 + allImages.length) % allImages.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCurrentImage((p) => (p + 1) % allImages.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {allImages.map((_, i) => (
                        <button key={i} onClick={() => setCurrentImage(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? "bg-primary w-4" : "bg-foreground/30"}`} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ShoppingCart className="w-16 h-16" />
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {allImages.map((url, i) => (
                <button key={i} onClick={() => setCurrentImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${i === currentImage ? "border-primary" : "border-border"}`}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
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
          <button onClick={() => { addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url }); toast.success(`${product.name} ${t("addToCart").toLowerCase()}!`); }}
            disabled={product.stock <= 0}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
            <ShoppingCart className="w-5 h-5" /> {t("addToCart")}
          </button>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "Space Grotesk" }}>{t("relatedProducts")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((rp, i) => (
              <motion.div key={rp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} whileHover={{ y: -5 }}>
                <Link to={`/products/${rp.id}`}
                  className="block bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-all">
                  <div className="aspect-square bg-secondary/50 overflow-hidden">
                    {rp.image_url ? (
                      <img src={rp.image_url} alt={rp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ShoppingCart className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm truncate">{rp.name}</h3>
                    <p className="text-primary font-bold mt-1">${rp.price}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
