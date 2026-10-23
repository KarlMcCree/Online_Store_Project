import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, ExternalLink, ShoppingCart, ArrowLeft, ArrowRight } from "lucide-react";
import { useShop } from "@/contexts/ShopContext";
import { toast } from "sonner";

const SubProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useShop();
  
  const [product, setProduct] = useState<any>(null);
  const [subServices, setSubServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductAndSubs = async () => {
      setLoading(true);
      const { data: mainProduct } = await supabase.from("products").select("*").eq("product_id", productId).single();
      setProduct(mainProduct);

      const attributes = mainProduct?.attributes as any;
      
      if (mainProduct && attributes?.category) {
        const { data: allProducts } = await supabase.from("products").select("*").eq("is_active", true);
        
        if (allProducts) {
          // ✅ Clean the main product's category (e.g. "VPI-Canada" -> "vpicanada")
          const mainCatClean = attributes.category.replace(/[\s-]/g, "").toLowerCase();

          const subs = allProducts.filter((p: any) => {
            if (p.product_id === productId) return false;
            
            // ✅ Clean the sub-service's parent category
            const parentCatClean = (p.attributes?.parent_category || "").replace(/[\s-]/g, "").toLowerCase();
            
            // Match them
            return parentCatClean === mainCatClean;
          });
          setSubServices(subs);
        }
      }
      setLoading(false);
    };
    fetchProductAndSubs();
  }, [productId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-secondary" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Program not found</div>;

  const handleAddToCart = () => {
    addToCart({ id: product.product_id, title: product.name, price: `NGN ${product.sale_price || product.price}` });
    toast.success("Added to cart!");
  };

  const attributes = product.attributes as any;
  const richContent = attributes?.rich_content;
  const googleFormUrl = attributes?.google_form_url;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-12 max-w-5xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            {product.featured_image ? (
              <img src={product.featured_image} alt={product.name} className="w-full rounded-xl border border-border shadow-sm" />
            ) : (
              <div className="w-full aspect-square bg-muted rounded-xl flex items-center justify-center border border-border"><span className="text-muted-foreground">No Image</span></div>
            )}
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-secondary mb-6">NGN {(product.sale_price || product.price).toLocaleString()}</p>
            <p className="text-muted-foreground mb-8 text-sm leading-relaxed">{product.short_description || product.description}</p>
            <div className="flex flex-col gap-3 mb-8">
              {googleFormUrl && (
                <a href={googleFormUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-primary text-primary-foreground text-center py-3.5 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-md">
                  Make an Enquiry <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <button onClick={handleAddToCart} className="w-full bg-secondary text-secondary-foreground py-3.5 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition shadow-md">
                Add to Cart & Pay <ShoppingCart className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-10">
          <h2 className="font-display text-2xl font-bold mb-6">Full Details</h2>
          <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground">
            {richContent ? <div dangerouslySetInnerHTML={{ __html: richContent }} /> : <p className="whitespace-pre-line">{product.description}</p>}
          </div>
        </div>

        {subServices.length > 0 && (
          <div className="mt-16 bg-muted/30 p-8 rounded-2xl border border-border">
            <h2 className="font-display text-2xl font-bold mb-2">Available Sub-Services</h2>
            <p className="text-muted-foreground mb-6">Select a specific program below to read more and apply.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {subServices.map((sub) => (
                <Link key={sub.product_id} to={`/product-service/${sub.product_id}`} className="bg-background border border-border p-5 rounded-xl flex items-center justify-between hover:border-secondary hover:shadow-md transition group">
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-secondary transition">{sub.name}</h3>
                    <p className="text-sm text-muted-foreground">NGN {(sub.sale_price || sub.price).toLocaleString()}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SubProductDetails;