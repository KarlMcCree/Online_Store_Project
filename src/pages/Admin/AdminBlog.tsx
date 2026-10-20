import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AdminBlog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", category: "", author: "", image_url: "" });

  const fetchPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts(data || []);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("blog_posts").insert([form as any]);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Post created!" });
      setForm({ title: "", slug: "", excerpt: "", content: "", category: "", author: "", image_url: "" });
      fetchPosts();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await (supabase.from("blog_posts") as any).delete().eq("id", id);
    fetchPosts();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Blog</h2>
      
      {/* Form */}
      <form onSubmit={handleSave} className="bg-background border p-4 rounded-lg space-y-3">
        <Input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
        <Input placeholder="Slug (e.g., study-abroad-guide)" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required />
        <Input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
        <Input placeholder="Author" value={form.author} onChange={e => setForm({...form, author: e.target.value})} required />
        <Input placeholder="Image URL" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />
        <Textarea placeholder="Excerpt" value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} required />
        <Textarea placeholder="Content" value={form.content} onChange={e => setForm({...form, content: e.target.value})} required className="min-h-[150px]" />
        <Button type="submit">Add Post</Button>
      </form>

      {/* List */}
      <div className="space-y-2">
        {posts.map(post => (
          <div key={post.id} className="flex justify-between items-center border p-3 rounded">
            <span>{post.title}</span>
            <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>Delete</Button>
          </div>
        ))}
      </div>
    </div>
  );
}