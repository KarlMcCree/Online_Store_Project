import { X, Star, Heart, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useShop } from "@/contexts/ShopContext";

interface QuickViewModalProps {
  open: boolean;
  onClose: () => void;
  product?: {
    id?: string | number;
    title: string;
    price: string;
    originalPrice?: string;
    rating: number;
    description: string;
    badge?: string;
    image_url?: string | null; // Added image_url to the type
  };
}

const QuickViewModal = ({ open, onClose, product }: QuickViewModalProps) => {
  const [qty, setQty] = useState(1);
  const { addToCart, toggleFavourite, isFavourite } = useShop();

  if (!open || !product) return null;
  const productId = product.id ?? product.title;
  const wishlisted = isFavourite(productId);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addToCart({ id: productId, title: product.title, price: product.price });
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <div className="bg-background rounded-xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="relative p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-foreground hover:text-secondary transition-colors z-10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Image Section */}
              <div className="bg-muted rounded-lg aspect-square flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  // Render the actual image if it exists
                  <img 
                    src={product.image_url} 
                    alt={product.title} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  // Fallback to the icon if no image
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-secondary/20 flex items-center justify-center">
                      <span className="text-4xl">📄</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Digital Product</p>
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div>
                {product.badge && (
                  <span className="inline-block text-[10px] font-bold bg-secondary text-secondary-foreground px-2.5 py-1 rounded-sm mb-3">
                    {product.badge}
                  </span>
                )}
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">{product.title}</h3>

                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-secondary text-secondary" : "text-border"}`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2 font-body">{product.rating}</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-foreground font-body">{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">{product.originalPrice}</span>
                  )}
                </div>

                {/* Added whitespace-pre-wrap so paragraphs and line breaks show up correctly */}
                <p className="text-muted-foreground font-body text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                  {product.description}
                </p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center border border-border rounded-full">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-3 py-2 text-foreground hover:text-secondary transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-3 font-body font-medium text-foreground">{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="px-3 py-2 text-foreground hover:text-secondary transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => toggleFavourite({ id: productId, title: product.title, price: product.price })}
                    className={`transition-colors ${wishlisted ? "text-destructive" : "text-foreground hover:text-destructive"}`}
                    aria-label="Add to wishlist"
                  >
                    <Heart className={`h-5 w-5 ${wishlisted ? "fill-current" : ""}`} />
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  className="w-full bg-secondary text-secondary-foreground font-semibold py-3.5 rounded-full hover:bg-secondary/90 transition-colors font-body"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickViewModal;