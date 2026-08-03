import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  is_active: boolean;
  type: string;
  attributes: Record<string, unknown> | null;
};

type FormState = {
  name: string;
  short_description: string;
  description: string;
  price: string;
  sale_price: string;
  image_url: string;
  category: string;
  type: string;
  max_downloads: string;
  file_url: string;
};

const emptyForm: FormState = {
  name: "",
  short_description: "",
  description: "",
  price: "",
  sale_price: "",
  image_url: "",
  category: "",
  type: "digital",
  max_downloads: "5",
  file_url: "",
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || `product-${Date.now()}`;

export default function AdminProducts() {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("product_id,name,slug,short_description,description,price,sale_price,featured_image,category_id,is_active,type,attributes")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as Product[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      short_description: p.short_description ?? "",
      description: p.description ?? "",
      price: String(p.price ?? ""),
      sale_price: String(p.sale_price ?? ""),
      image_url: p.featured_image ?? "",
      category: (p.attributes as { category?: string } | null)?.category ?? "",
      type: p.type || "digital",
      max_downloads: String((p.attributes as { max_downloads?: number } | null)?.max_downloads ?? 5),
      file_url: (p.attributes as { file_url?: string } | null)?.file_url ?? "",
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.price) { toast.error("Name and price are required"); return; }
    if (!user) { toast.error("You must be logged in to add products."); return; }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      short_description: form.short_description || form.description.slice(0, 200),
      description: form.description,
      price: Number(form.price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      featured_image: form.image_url || null,
      type: form.type || "digital",
      attributes: {
        category: form.category || null,
        max_downloads: Number(form.max_downloads) || 0,
        file_url: form.file_url || null,
      },
      is_active: true,
      user_id: user.id,
    };
    
    let error;
    if (editing) {
      ({ error } = await supabase.from("products").update(payload).eq("product_id", editing.product_id));
    } else {
      ({ error } = await supabase.from("products").insert({
        ...payload,
        slug: slugify(form.name),
        sku: `SKU-${Date.now()}`,
      }));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing ? "Product updated" : "Product created");
    setOpen(false);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("products").delete().eq("product_id", deleteId);
    if (error) toast.error(error.message);
    else { toast.success("Product deleted"); load(); }
    setDeleteId(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Products</CardTitle>
        <Button onClick={openCreate} size="sm"><Plus className="mr-1 h-4 w-4" /> Add product</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Max DL</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => (
              <TableRow key={p.product_id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>₦{Number(p.price).toLocaleString()}</TableCell>
                <TableCell className="capitalize">{p.type || "digital"}</TableCell>
                <TableCell>{(p.attributes as { category?: string } | null)?.category ?? "—"}</TableCell>
                <TableCell>{(p.attributes as { max_downloads?: number } | null)?.max_downloads ?? 5}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.product_id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {!loading && items.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No products yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle>
            <DialogDescription>Manage your products and services.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Product Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Short Description</Label>
              <Input value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
            </div>
            <div>
              <Label>Full Description</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price (₦) *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <Label>Sale Price</Label>
                <Input type="number" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Max Downloads</Label>
                <Input type="number" value={form.max_downloads} onChange={(e) => setForm({ ...form, max_downloads: e.target.value })} />
              </div>
              <div>
                <Label>File URL (digital products)</Label>
                <Input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}