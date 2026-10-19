import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import SEO from "@/components/SEO";
import { Star, ShoppingCart, Heart, Eye, Filter, ChevronDown, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import QuickViewModal from "@/components/QuickViewModal";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

const categories = [
  "All",
  "Study Abroad",
  "Migration",
  "Digital Guides",
  "Consultation",
  "Travel Packages",
];

const sortOptions = ["Newest", "Price: Low to High", "Price: High to Low", "Top Rated"];

const slugToCategory: Record<string, string> = {
  "study-abroad": "Study Abroad",
  "migration": "Migration",
  "digital-guides": "Digital Guides",
  "consultation": "Consultation",
  "travel-packages": "Travel Packages",
};

const Services = () => {
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [showSort, setShowSort] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  // State for Supabase products
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true); // Only show active products

      if (error) {
        toast({ title: "Error loading products", description: error.message, variant: "destructive" });
        console.error(error);
      } else {
        // Map database columns to match what the UI expects
        const formatted = (data || []).map((p) => ({
          id: p.id,
          title: p.title || p.name,
          price: p.sale_price ? `NGN ${p.sale_price}` : `NGN ${p.price}`,
          originalPrice: p.sale_price ? `NGN ${p.price}` : null,
          rating: 4.8, // Default rating since it's not in DB yet
          type: p.type === "service" ? "service" : "digital",
          category: p.category || p.attributes?.category || "General",
          description: p.description || "",
          image_url: p.image_url || p.featured_image,
          badge: p.is_featured ? "FEATURED" : null,
          badgeColor: "bg-primary text-primary-foreground",
        }));
        setProducts(formatted);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (urlCategory && slugToCategory[urlCategory]) {
      setActiveCategory(slugToCategory[urlCategory]);
    } else {
      setActiveCategory("All");
    }
  }, [urlCategory]);

  const filtered = activeCategory === "All"
    ? products
    : products.filter((p) => 
        p.category?.toLowerCase().trim() === activeCategory.toLowerCase().trim()
      );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "Top Rated") return b.rating - a.rating;
    if (sortBy === "Price: Low to High") return parseFloat(a.price.replace(/[^0-9.]/g, "")) - parseFloat(b.price.replace(/[^0-9.]/g, ""));
    if (sortBy === "Price: High to Low") return parseFloat(b.price.replace(/[^0-9.]/g, "")) - parseFloat(a.price.replace(/[^0-9.]/g, ""));
    return 0; // Default sort (Newest)
  });

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${activeCategory === "All" ? "Products & Services" : activeCategory} – The Digital Desk`}
        description="Browse digital guides, consultations, and migration services to power your study-abroad journey."
        url="/services"
      />
      <AnnouncementBar />
      <Header />

      {/* Hero Banner */}
      <section className="bg-primary py-16 md:py-24">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            {activeCategory === "All" ? "Services & Products" : activeCategory}
          </h1>
          <p className="text-primary-foreground/70 font-body text-lg max-w-2xl mx-auto">
            {activeCategory === "All"
              ? "Explore our full range of digital guides, expert consultations, and premium services."
              : `Showing all ${activeCategory} products and services.`}
          </p>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="py-12 md:py-16">
        <div className="container">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium font-body transition-all ${
                  activeCategory === cat
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort & Count */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-sm text-muted-foreground font-body">
              Showing <span className="font-semibold text-foreground">{sorted.length}</span> results
            </p>
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 text-sm font-body text-foreground border border-border rounded-lg px-4 py-2 hover:border-secondary transition-colors"
              >
                <Filter className="h-4 w-4" />
                {sortBy}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[180px]">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setSortBy(opt); setShowSort(false); }}
                      className={`block w-full text-left px-4 py-2.5 text-sm font-body hover:bg-muted transition-colors ${
                        sortBy === opt ? "text-secondary font-semibold" : "text-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground font-body">No products found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {sorted.map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  <div className="relative bg-muted rounded-lg overflow-hidden aspect-[3/4] mb-4">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10">
                        <div className="text-center p-6">
                          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-secondary/20 flex items-center justify-center">
                            <span className="text-2xl">{product.type === "digital" ? "📄" : "🎯"}</span>
                          </div>
                          <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">
                            {product.type === "digital" ? "Digital Product" : "Service"}
                          </p>
                        </div>
                      </div>
                    )}

                    {product.badge && (
                      <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-sm z-10 ${product.badgeColor}`}>
                        {product.badge}
                      </span>
                    )}

                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300 z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                        className={`w-9 h-9 rounded-full border border-border bg-background flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all ${wishlist.includes(product.id) ? "bg-destructive/10 text-destructive border-destructive/30" : "text-foreground"}`}
                      >
                        <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? "fill-current" : ""}`} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                        className="w-9 h-9 rounded-full border border-border bg-background text-foreground flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-body text-sm font-medium text-foreground group-hover:text-secondary transition-colors mb-1.5 line-clamp-2">
                    {product.title}
                  </h3>

                  <div className="flex items-center gap-1 mb-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < Math.floor(product.rating) ? "fill-secondary text-secondary" : "text-border"}`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">{product.rating}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-body font-semibold text-foreground">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">{product.originalPrice}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      <QuickViewModal
        open={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct ? {
          title: quickViewProduct.title,
          price: quickViewProduct.price,
          originalPrice: quickViewProduct.originalPrice,
          rating: quickViewProduct.rating,
          description: quickViewProduct.description,
          badge: quickViewProduct.badge,
          image_url: quickViewProduct.image_url,
        } : undefined}
      />
    </div>
  );
};

export default Services;