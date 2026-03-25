import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Star, Truck, CreditCard, Package, Coffee, Apple, Croissant } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const floatingIcons = [
  { Icon: ShoppingBag, delay: 0, x: "10%", y: "20%" },
  { Icon: Star, delay: 1, x: "80%", y: "15%" },
  { Icon: Truck, delay: 2, x: "70%", y: "70%" },
  { Icon: CreditCard, delay: 3, x: "15%", y: "75%" },
  { Icon: Package, delay: 0.5, x: "50%", y: "10%" },
  { Icon: Coffee, delay: 1.5, x: "85%", y: "45%" },
  { Icon: Apple, delay: 2.5, x: "25%", y: "50%" },
  { Icon: Croissant, delay: 3.5, x: "60%", y: "85%" },
];

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-30"
            style={{
              background: "radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsl(var(--accent) / 0.2) 0%, transparent 50%)",
              backgroundSize: "200% 200%",
            }}
          />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        {/* Floating icons */}
        {floatingIcons.map(({ Icon, delay, x, y }, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/20"
            style={{ left: x, top: y }}
            animate={{ y: [0, -30, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay, ease: "easeInOut" }}
          >
            <Icon className="w-8 h-8 md:w-12 md:h-12" />
          </motion.div>
        ))}

        {/* Hero content */}
        <div className="relative z-10 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-4" style={{ fontFamily: "Space Grotesk" }}>
              <span className="text-primary">THE</span><br />
              <span className="text-foreground">SHOP</span>
            </h1>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto mb-8">
            {t("heroSubtitle")}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate("/products")}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-lg hover:opacity-90 transition-all hover:scale-105">
              {t("shopNow")}
            </button>
            <button onClick={() => navigate("/products")}
              className="px-8 py-3 border border-border text-foreground rounded-xl font-medium text-lg hover:bg-secondary transition-all hover:scale-105">
              {t("browseProducts")}
            </button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center pt-2">
            <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-primary rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Package className="w-8 h-8" />, title: "Premium Quality", desc: "Hand-picked products for the discerning customer" },
              { icon: <Truck className="w-8 h-8" />, title: "Fast Delivery", desc: "Quick and reliable delivery to your doorstep" },
              { icon: <CreditCard className="w-8 h-8" />, title: "Secure Payment", desc: "Multiple secure payment options available" },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.2 }}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
                <div className="text-primary mb-4 flex justify-center">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
