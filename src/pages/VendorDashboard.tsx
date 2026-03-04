import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Plus, Pencil, Trash2, ShoppingBag, TrendingUp, Box, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  stock: number | null;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  shipping_address: string | null;
  created_at: string;
  user_id: string;
}

const categories = ['Seeds', 'Fertilizers', 'Pesticides', 'Tools', 'Equipment', 'Irrigation', 'Other'];
const orderStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-info/10 text-info',
  packed: 'bg-primary/10 text-primary',
  shipped: 'bg-primary/10 text-primary',
  out_for_delivery: 'bg-secondary/10 text-secondary',
  delivered: 'bg-success/10 text-success',
};

export default function VendorDashboard() {
  const { user, hasRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Seeds', stock: '', image_url: '' });

  useEffect(() => {
    if (!authLoading && !hasRole('vendor')) {
      toast.error('Access denied. Vendor account required.');
      navigate('/vendor-auth');
    }
  }, [authLoading]);

  const fetchProducts = async () => {
    if (!user) return;
    const { data } = await supabase.from('products').select('*').eq('vendor_id', user.id).order('created_at', { ascending: false });
    setProducts(data || []);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
  };

  useEffect(() => {
    if (user && hasRole('vendor')) {
      Promise.all([fetchProducts(), fetchOrders()]).then(() => setLoading(false));
    }
  }, [user, authLoading]);

  const resetForm = () => { setForm({ name: '', description: '', price: '', category: 'Seeds', stock: '', image_url: '' }); setEditing(null); };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || '', price: String(p.price), category: p.category || 'Seeds', stock: String(p.stock || 0), image_url: p.image_url || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    const payload = { name: form.name, description: form.description || null, price: parseFloat(form.price), category: form.category, stock: parseInt(form.stock) || 0, image_url: form.image_url || null, vendor_id: user.id };
    if (editing) {
      const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
      if (error) { toast.error('Update failed'); return; }
      toast.success('Product updated');
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) { toast.error('Failed to add product'); return; }
      toast.success('Product added');
    }
    setDialogOpen(false); resetForm(); fetchProducts();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    toast.success('Product deleted'); fetchProducts();
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) { toast.error('Failed to update order'); return; }
    toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
    if (newStatus === 'out_for_delivery') {
      toast.info('📦 Customer will be notified: Your order is out for delivery!');
    }
    fetchOrders();
  };

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValue = products.reduce((sum, p) => sum + p.price * (p.stock || 0), 0);

  if (authLoading || loading) return <div className="container py-16 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" /> Vendor Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Manage products, inventory & orders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Products', value: products.length, icon: ShoppingBag },
          { label: 'Total Stock', value: totalStock, icon: Box },
          { label: 'Inventory Value', value: `₹${totalValue.toLocaleString()}`, icon: TrendingUp },
          { label: 'Orders', value: orders.length, icon: ClipboardList },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="shadow-soft">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><Icon className="h-6 w-6 text-primary" /></div>
                <div><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="flex justify-end mb-4">
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Add Product</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-display">{editing ? 'Edit Product' : 'Add New Product'}</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="space-y-1.5"><Label>Product Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Organic Neem Oil" /></div>
                  <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Product details..." rows={3} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Price (₹)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                    <div className="space-y-1.5"><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                  </div>
                  <div className="space-y-1.5"><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></div>
                  <Button className="w-full" onClick={handleSave} disabled={!form.name || !form.price}>{editing ? 'Update' : 'Add Product'}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {products.length === 0 ? (
            <Card className="shadow-soft"><CardContent className="text-center py-12"><Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">No products yet</p></CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <Card key={p.id} className="shadow-soft">
                  {p.image_url && <div className="h-40 overflow-hidden rounded-t-lg bg-muted"><img src={p.image_url} alt={p.name} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} /></div>}
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start"><div><p className="font-semibold text-foreground">{p.name}</p><p className="text-sm text-muted-foreground">{p.category}</p></div><p className="text-lg font-bold text-primary">₹{p.price}</p></div>
                    <p className="text-xs text-muted-foreground">Stock: {p.stock || 0}</p>
                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" onClick={() => openEdit(p)}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3 w-3 mr-1" /> Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          <Card className="shadow-soft">
            <CardHeader><CardTitle className="font-display">Order Management</CardTitle></CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No orders yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">#{order.id.slice(0, 8)}</TableCell>
                        <TableCell className="font-semibold text-primary">₹{order.total_amount}</TableCell>
                        <TableCell className="max-w-[150px] truncate text-sm">{order.shipping_address || '—'}</TableCell>
                        <TableCell><Badge className={statusColors[order.status] || ''}>{order.status.replace('_', ' ')}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {order.status !== 'delivered' && (
                            <Select value={order.status} onValueChange={(v) => updateOrderStatus(order.id, v)}>
                              <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {orderStatuses.map((s) => <SelectItem key={s} value={s} className="text-xs">{s.replace('_', ' ')}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
