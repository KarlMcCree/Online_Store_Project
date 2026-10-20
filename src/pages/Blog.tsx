import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import SEO from "@/components/SEO";
import { Calendar, Clock, ArrowRight, User, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url?: string;
  category: string;
  author: string;
  is_featured: boolean;
  created_at: string;
};

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Study Abroad", "Migration", "Guides", "Visa Tips", "Travel", "Second Passport"];

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setPosts((data as any) || []);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const featuredPost = posts.find((p) => p.is_featured) || posts[0];
  const filteredPosts = activeCategory === "All" ? posts : posts.filter((p) => p.category === activeCategory);
  const regularPosts = filteredPosts.filter((p) => p.id !== featuredPost?.id);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Blog – Study Abroad Tips & Updates" description="Expert insights on study abroad." url="/blog" />
      <AnnouncementBar />
      <Header />

      <section className="bg-primary py-16 md:py-24">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Blog & Resources</h1>
          <p className="text-primary-foreground/70 font-body text-lg max-w-2xl mx-auto">
            Expert insights, guides, and tips to help you navigate your global journey with confidence.
          </p>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="container py-4">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium font-body transition-all ${
                  activeCategory === cat ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-secondary" /></div>
          ) : posts.length === 0 ? (
            <p className="text-center text-muted-foreground">No blog posts yet. Check back soon!</p>
          ) : (
            <>
              {/* Featured Post */}
              {featuredPost && (
                <div className="mb-16">
                  <Link to={`/blog/${featuredPost.slug}`} className="grid md:grid-cols-2 gap-8 bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="bg-muted aspect-video md:aspect-auto flex items-center justify-center overflow-hidden">
                      {featuredPost.image_url ? (
                        <img src={featuredPost.image_url} alt={featuredPost.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">✍️</span>
                      )}
                    </div>
                    <div className="p-8 md:p-10 flex flex-col justify-center">
                      <span className="text-xs font-bold text-secondary uppercase tracking-wider font-body mb-3">{featuredPost.category}</span>
                      <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4 hover:text-secondary transition-colors">{featuredPost.title}</h2>
                      <p className="text-muted-foreground font-body mb-6 leading-relaxed">{featuredPost.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground font-body mb-6">
                        <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {featuredPost.author}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(featuredPost.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-secondary/80">
                        Read Article <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </div>
              )}

              {/* Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg hover:border-secondary/30 transition-all duration-300 group">
                    <div className="bg-muted aspect-video flex items-center justify-center overflow-hidden">
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <span className="text-xl">📝</span>
                      )}
                    </div>
                    <div className="p-6">
                      <span className="text-xs font-bold text-secondary uppercase tracking-wider font-body">{post.category}</span>
                      <h3 className="font-display text-lg font-semibold text-foreground mt-2 mb-3 group-hover:text-secondary transition-colors line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground font-body mb-4 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Blog;