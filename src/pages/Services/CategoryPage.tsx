import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCategoryName, setDisplayCategoryName] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      const { data } = await supabase.from("products").select("*").eq("is_active", true);

      if (data) {
        const cleanUrl = categoryId?.replace(/[\s-]/g, "").toLowerCase();

        
        const matched = data.filter((p: any) => {
          const pCategory = (p.attributes?.category || "").replace(/[\s-]/g, "").toLowerCase();
          const matchesCategory = pCategory === cleanUrl;
          const hasParent = !!p.attributes?.parent_category;
          return matchesCategory && hasParent;
        });

        setProducts(matched);

        // 2. Find the main product to get the exact display name
        const mainProduct = data.find((p: any) => {
          const pCategory = (p.attributes?.category || "").replace(/[\s-]/g, "").toLowerCase();
          return pCategory === cleanUrl && !p.attributes?.parent_category;
        });

        // 3. Set the display name (or fallback to the URL slug if not found)
        if (mainProduct && mainProduct.attributes?.category) {
          setDisplayCategoryName(mainProduct.attributes.category);
        } else {
          setDisplayCategoryName(categoryId?.replace(/-/g, " ") || "");
        }
      }
      setLoading(false);
    };
    fetchProducts();
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="bg-primary py-16 text-center">
        <div className="container">
          <h1 className="font-display text-4xl font-bold text-primary-foreground mb-4">
            {displayCategoryName} Programs
          </h1>
          <p className="text-primary-foreground/70">Select a program below to read more and apply.</p>
        </div>
      </section>

      <div className="container py-12">
        <Link to="/services" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to all Services
        </Link>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-secondary" /></div>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No programs found in this category.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.product_id} className="border p-6 rounded-xl bg-card flex flex-col justify-between hover:shadow-lg transition">
                <div>
                  {p.featured_image && <img src={p.featured_image} alt={p.name} className="w-full h-40 object-cover rounded-lg mb-4" />}
                  <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{p.short_description || p.description}</p>
                </div>
                <Link to={`/product-service/${p.product_id}`} className="w-full bg-secondary text-secondary-foreground text-center py-3 rounded-full font-semibold hover:bg-secondary/90 transition flex items-center justify-center gap-2">
                  Read More & Apply <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;