import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Search, ClipboardList, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import PageHero from '@/components/PageHero';
import ecommerceHero from '@/assets/ecommerce-hero.jpg';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  shipping_address: string | null;
  created_at: string;
  order_items: { id: string; quantity: number; price: number; products: { name: string } }[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-info/10 text-info',
  packed: 'bg-primary/10 text-primary',
  shipped: 'bg-primary/10 text-primary',
  out_for_delivery: 'bg-secondary/10 text-secondary',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function Marketplace() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('products').select('*').then(({ data }) => {
      setProducts(data || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('*, order_items(id, quantity, price, products(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setOrders((data as any) || []));
  }, [user]);

  const addToCart = async (product: Product) => {
    if (!user) { toast.error('Please sign in to add items to cart'); return; }
    setAdding(product.id);
    try {
      const { data: existing } = await supabase.from('cart_items').select('id, quantity').eq('user_id', user.id).eq('product_id', product.id).maybeSingle();
      if (existing) {
        await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
      } else {
        await supabase.from('cart_items').insert({ user_id: user.id, product_id: product.id, quantity: 1 });
      }
      toast.success(`${product.name} added to cart!`);
    } catch { toast.error('Failed to add to cart'); }
    finally { setAdding(null); }
  };

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-primary" /> E-Commerce
          </h1>
          <p className="text-muted-foreground">Seeds, fertilizers, equipment & more</p>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <Link to="/cart">
              <Button variant="outline" size="sm"><ShoppingCart className="h-4 w-4 mr-1" /> Cart</Button>
            </Link>
          )}
        </div>
      </div>

      <Tabs defaultValue="shop">
        <TabsList>
          <TabsTrigger value="shop">Shop</TabsTrigger>
          {user && <TabsTrigger value="orders">My Orders ({orders.length})</TabsTrigger>}
        </TabsList>

        <TabsContent value="shop">
          <div className="mb-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse"><div className="h-48 bg-muted rounded-t-lg" /><CardContent className="p-4 space-y-2"><div className="h-4 bg-muted rounded w-3/4" /><div className="h-3 bg-muted rounded w-1/2" /></CardContent></Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <Card key={product.id} className="overflow-hidden shadow-soft hover:shadow-elevated transition-shadow group">
                  <div className="h-48 overflow-hidden bg-muted">
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div><h3 className="font-semibold text-foreground">{product.name}</h3><p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p></div>
                    <div className="flex items-center justify-between">
                      <div><span className="text-xl font-bold text-primary">₹{product.price}</span><Badge variant="secondary" className="ml-2">{product.category}</Badge></div>
                      <Button size="sm" onClick={() => addToCart(product)} disabled={adding === product.id}><ShoppingCart className="h-4 w-4 mr-1" /> {adding === product.id ? '...' : 'Add'}</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No products found matching your search.</div>
          )}
        </TabsContent>

        {user && (
          <TabsContent value="orders">
            <div className="max-w-3xl space-y-4">
              {orders.length === 0 ? (
                <Card className="shadow-soft"><CardContent className="text-center py-12"><Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">No orders yet</p></CardContent></Card>
              ) : orders.map((order) => (
                <Card key={order.id} className="shadow-soft">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-semibold">Order #{order.id.slice(0, 8)}</span>
                      <Badge className={statusColors[order.status] || ''}>{order.status.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.products?.name} × {item.quantity}</span>
                        <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-border font-semibold">
                      <span>Total</span><span className="text-primary">₹{order.total_amount}</span>
                    </div>
                    {order.shipping_address && <p className="text-xs text-muted-foreground">📍 {order.shipping_address}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
