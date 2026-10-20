import { Star, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";

type Service = {
  id: string;
  title: string;
  price: string;
  description: string;
  rating: number;
  badge?: string;
  slug?: string;
};

const HighTicketServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPremiumServices = async () => {
      setLoading(true);
      
      // 1. Fetch all active products (no strict filtering yet)
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true);

      if (!error && data) {
        // 2. Filter in JavaScript: Find products where attributes.is_featured is true
        const featuredData = data
          .filter((p: any) => p.attributes?.is_featured === true)
          .slice(0, 4); // Limit to 4 items
        
        // 3. Format for the UI
        const formatted = featuredData.map((p: any) => ({
          id: p.id || p.product_id,
          title: p.title || p.name || "Untitled",
          price: p.sale_price ? `NGN ${p.sale_price}` : `NGN ${p.price}`,
          description: p.short_description || p.description || "",
          rating: 4.8, 
          badge: "PREMIUM",
          slug: p.slug,
        }));
        
        setServices(formatted);
      }
      setLoading(false);
    };

    fetchPremiumServices();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-surface-warm">
      <div className="container">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Premium Services
            </h2>
            <p className="text-muted-foreground font-body">
              Expert-led services to fast-track your global ambitions.
            </p>
          </div>
          <Link
            to="/services"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground hover:text-secondary transition-colors font-body"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <p className="text-muted-foreground font-body">No premium services available right now.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-card rounded-lg border border-border p-6 hover:shadow-lg hover:border-secondary/30 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {service.badge && (
                    <span className="inline-block text-[10px] font-bold bg-secondary text-secondary-foreground px-2.5 py-1 rounded-sm mb-4">
                      {service.badge}
                    </span>
                  )}
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-secondary transition-colors line-clamp-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 font-body line-clamp-2">
                    {service.description}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(service.rating) ? "fill-secondary text-secondary" : "text-border"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">{service.rating}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="font-body text-xl font-bold text-foreground">{service.price}</p>
                    {service.slug && (
                      <Link 
                        to={`/product/${service.slug}`}
                        className="text-xs text-secondary font-semibold hover:underline"
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HighTicketServices;