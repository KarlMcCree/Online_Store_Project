import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useShop } from "@/contexts/ShopContext";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Shield, 
  Clock, 
  Award,
  Check
} from "lucide-react";
import SEO from "@/components/SEO";

type Product = {
  product_id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  sale_price: number | null;
  featured_image: string | null;
  category_id: string | null;
  type: string;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  attributes: Record<string, any> | null;
  metadata: Record<string, any> | null;
  created_at: string;
};

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useShop();

  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .eq("is_active", true)
          .single();

        if (error) {
          if (error.code === "PGRST116") setError("Product not found");
          else setError(error.message);
          return;
        }
        setProduct(data);
      } catch (err) {
        setError("Failed to load product");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  // ---- Description Formatter ----
  const renderDescription = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let currentParagraph: string[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="space-y-3 my-4">
            {currentList.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-secondary text-lg leading-none mt-0.5">✦</span>
                <span className="text-base text-foreground/90">{item.trim()}</span>
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${elements.length}`} className="text-base text-foreground/80 leading-relaxed my-4">
            {currentParagraph.join(' ').trim()}
          </p>
        );
        currentParagraph = [];
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        flushList();
        flushParagraph();
        continue;
      }
      // Bullet detection: starts with *, -, •
      if (/^[\*\-\•]\s+/.test(line)) {
        flushParagraph();
        const bulletText = line.replace(/^[\*\-\•]\s+/, '');
        currentList.push(bulletText);
      } else {
        flushList();
        currentParagraph.push(line);
      }
    }
    flushList();
    flushParagraph();

    return <div className="prose prose-lg max-w-none">{elements}</div>;
  };

  if (loading) {
    return (
      <div className="container py-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            {error || "Product not found"}
          </h2>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-full font-semibold hover:bg-secondary/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const category = product.attributes?.category || "Product";
  const maxDownloads = product.attributes?.max_downloads || 0;

  return (
    <>
      <SEO
        title={`${product.name} – The Digital Desk`}
        description={product.short_description || product.description?.slice(0, 160) || `${product.name} - Premium service`}
        url={`/product/${product.slug}`}
      />

      <div className="bg-surface-warm min-h-screen py-8 md:py-16">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 font-body">
            <Link to="/" className="hover:text-secondary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/services" className="hover:text-secondary transition-colors">Services</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left column */}
            <div>
              <div className="sticky top-24">
                <div className="relative bg-background rounded-2xl overflow-hidden shadow-lg border border-border">
                  {product.featured_image ? (
                    <img
                      src={product.featured_image}
                      alt={product.name}
                      className="w-full h-auto aspect-[4/3] object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10">
                      <div className="text-center p-8">
                        <div className="w-24 h-24 mx-auto rounded-full bg-secondary/20 flex items-center justify-center text-4xl mb-4">
                          {product.type === 'service' ? '🧑‍💼' : '📄'}
                        </div>
                        <p className="text-sm text-muted-foreground">{product.type === 'service' ? 'Service' : 'Digital Product'}</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {product.is_new && (
                      <span className="text-[10px] font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-md">NEW</span>
                    )}
                    {product.is_bestseller && (
                      <span className="text-[10px] font-bold bg-secondary text-secondary-foreground px-3 py-1 rounded-full shadow-md">BESTSELLER</span>
                    )}
                    {hasDiscount && (
                      <span className="text-[10px] font-bold bg-destructive text-destructive-foreground px-3 py-1 rounded-full shadow-md">SALE</span>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[10px] font-bold bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full border border-border">
                      {category}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-background rounded-xl p-4 text-center border border-border">
                    <Shield className="h-5 w-5 text-secondary mx-auto mb-1" />
                    <p className="text-[10px] font-body text-muted-foreground">Secure Checkout</p>
                  </div>
                  <div className="bg-background rounded-xl p-4 text-center border border-border">
                    <Clock className="h-5 w-5 text-secondary mx-auto mb-1" />
                    <p className="text-[10px] font-body text-muted-foreground">Instant Access</p>
                  </div>
                  <div className="bg-background rounded-xl p-4 text-center border border-border">
                    <Award className="h-5 w-5 text-secondary mx-auto mb-1" />
                    <p className="text-[10px] font-body text-muted-foreground">Money-back Guarantee</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                  {product.name}
                </h1>
                {product.short_description && (
                  <p className="text-lg text-muted-foreground font-body">{product.short_description}</p>
                )}
              </div>

              <div className="bg-background rounded-2xl p-6 border border-border flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground font-body">Price</p>
                  <div className="flex items-center gap-3">
                    <span className="font-body text-3xl font-bold text-secondary">
                      ₦{displayPrice.toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <span className="text-lg text-muted-foreground line-through">
                        ₦{product.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {maxDownloads > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">{maxDownloads} downloads included</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    addToCart({
                      id: product.product_id,
                      title: product.name,
                      price: `₦${displayPrice.toLocaleString()}`,
                      type: product.type === 'service' ? 'service' : 'digital',
                      product_id: product.product_id,
                    });
                    toast({ title: "Added to cart", description: product.name });
                  }}
                  className="bg-secondary text-secondary-foreground font-semibold px-8 py-3 rounded-full hover:bg-secondary/90 transition-colors flex items-center gap-2 font-body"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>
              </div>

              {/* ---- IMPROVED DESCRIPTION ---- */}
              <div className="bg-background rounded-2xl p-6 md:p-8 border border-border">
                <h2 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-secondary rounded-full" />
                  About this {product.type === 'service' ? 'service' : 'product'}
                </h2>
                <div className="text-foreground/90 font-body leading-relaxed">
                  {renderDescription(product.description || '')}
                </div>
              </div>

              <div className="bg-background rounded-2xl p-6 border border-border grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</p>
                  <p className="text-foreground font-medium">{category}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Type</p>
                  <p className="text-foreground font-medium capitalize">{product.type}</p>
                </div>
              </div>

              <div className="bg-secondary/10 rounded-2xl p-6 border border-secondary/20 text-center">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  Ready to get started?
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Join thousands of satisfied customers who have transformed their journey with us.
                </p>
                <button
                  onClick={() => {
                    addToCart({
                      id: product.product_id,
                      title: product.name,
                      price: `₦${displayPrice.toLocaleString()}`,
                      type: product.type === 'service' ? 'service' : 'digital',
                      product_id: product.product_id,
                    });
                    toast({ title: "Added to cart", description: product.name });
                  }}
                  className="bg-secondary text-secondary-foreground font-semibold px-8 py-3 rounded-full hover:bg-secondary/90 transition-colors font-body"
                >
                  Add to Cart Now
                </button>
              </div>

              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary transition-colors font-body"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to all services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;