import { Star, ArrowRight, Heart, Eye, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import QuickViewModal from "./QuickViewModal";
import { useShop } from "@/contexts/ShopContext";
import { supabase } from "@/lib/supabase/client";

type Product = {
  product_id: string;
  id: string | number;
  title: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  badgeColor?: string;
  rating: number;
  type: "digital" | "service";
  description: string;
  short_description?: string;
  saleRibbon?: string;
  slug?: string;
  category?: string;
};

const ProductCard = ({ product, onQuickView }: { product: Product; onQuickView: (p: Product) => void }) => {
  const { toggleFavourite, isFavourite, addToCart } = useShop();
  const wishlisted = isFavourite(product.id);

  const shopItem = {
    id: product.id,
    title: product.title,
    price: product.price,
    type: product.type,
  };

  return (
    <div className="group cursor-pointer">
      <div className="relative bg-muted rounded-lg overflow-hidden aspect-[3/4] mb-4">
        {/* Product visual */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10">
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-secondary/20 flex items-center justify-center">
              <span className="text-2xl">{product.type === "service" ? "🧑‍💼" : "📄"}</span>
            </div>
            <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">
              {product.type === "service" ? "Service" : "Digital Product"}
            </p>
            {product.category && (
              <p className="text-[10px] text-secondary font-body uppercase tracking-wider mt-1">
                {product.category}
              </p>
            )}
          </div>
        </div>

        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-sm ${product.badgeColor}`}>
            {product.badge}
          </span>
        )}

        {/* Side action icons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavourite(shopItem); }}
            className={`w-9 h-9 rounded-full border border-border bg-background flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all ${wishlisted ? "bg-destructive/10 text-destructive border-destructive/30" : "text-foreground"}`}
            aria-label="Add to wishlist"
          >
            <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            className="w-9 h-9 rounded-full border border-border bg-background text-foreground flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all"
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Add button */}
        <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 p-3">
          <button
            onClick={(e) => { e.stopPropagation(); addToCart(shopItem); }}
            className="w-full bg-background text-foreground text-xs font-semibold py-2.5 rounded-full shadow-lg hover:bg-secondary hover:text-secondary-foreground transition-all flex items-center justify-center gap-2 font-body"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Quick Add
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
            className={`h-3 w-3 ${
              i < Math.floor(product.rating) ? "fill-secondary text-secondary" : "text-border"
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">{product.rating}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-body font-semibold text-foreground">{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">{product.originalPrice}</span>
          )}
        </div>
        {product.slug && (
          <Link
            to={`/product/${product.slug}`}
            className="text-xs text-secondary hover:underline font-body"
          >
            Read More →
          </Link>
        )}
      </div>
    </div>
  );
};

const FeaturedProducts = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(8);

        if (error) throw error;

        const mappedProducts: Product[] = (data || []).map((p) => ({
          product_id: p.product_id,
          id: p.product_id,
          title: p.name,
          price: p.sale_price ? `NGN ${p.sale_price}` : `NGN ${p.price}`,
          originalPrice: p.sale_price ? `NGN ${p.price}` : undefined,
          badge: p.is_bestseller ? "BESTSELLER" : p.is_new ? "NEW" : undefined,
          badgeColor: p.is_bestseller 
            ? "bg-secondary text-secondary-foreground" 
            : p.is_new 
              ? "bg-primary text-primary-foreground" 
              : undefined,
          rating: 4.5,
          type: p.type === 'service' ? 'service' : 'digital',
          description: p.description || p.short_description || "",
          short_description: p.short_description || p.description?.slice(0, 100) || "",
          slug: p.slug,
          category: p.attributes?.category || undefined,
        }));

        setDbProducts(mappedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section id="products" className="py-16 md:py-24 bg-surface-warm">
        <div className="container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Today's Top Picks
              </h2>
              <p className="text-muted-foreground font-body">
                Start your journey with our most popular digital guides.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg aspect-[3/4] mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="products" className="py-16 md:py-24 bg-surface-warm">
        <div className="container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Today's Top Picks
              </h2>
              <p className="text-muted-foreground font-body">
                Start your journey with our most popular digital guides.
              </p>
            </div>
            <Link
              to="/services"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground hover:text-secondary transition-colors font-body"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {dbProducts.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>

          <div className="md:hidden mt-8 text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-secondary transition-colors font-body"
            >
              View All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <QuickViewModal
        open={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct ? {
          id: quickViewProduct.id,
          title: quickViewProduct.title,
          price: quickViewProduct.price,
          originalPrice: quickViewProduct.originalPrice,
          rating: quickViewProduct.rating,
          description: quickViewProduct.description,
          badge: quickViewProduct.badge,
        } : undefined}
      />
    </>
  );
};

export default FeaturedProducts;