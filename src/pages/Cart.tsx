import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    stock: number | null;
  };
}

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [address, setAddress] = useState('');

  const fetchCart = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('cart_items')
      .select('*, products(id, name, price, image_url, stock)')
      .eq('user_id', user.id);
    setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, [user]);

  const updateQty = async (id: string, qty: number) => {
    if (qty < 1) return;
    await supabase.from('cart_items').update({ quantity: qty }).eq('id', id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  };

  const removeItem = async (id: string) => {
    await supabase.from('cart_items').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success('Item removed');
  };

  const total = items.reduce((sum, i) => sum + i.products.price * i.quantity, 0);

  const placeOrder = async () => {
    if (!user || items.length === 0) return;
    setOrdering(true);
    try {
      // Create order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({ user_id: user.id, total_amount: total, shipping_address: address || null })
        .select()
        .single();
      if (orderErr) throw orderErr;

      // Create order items
      const orderItems = items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        quantity: i.quantity,
        price: i.products.price,
      }));
      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
      if (itemsErr) throw itemsErr;

      // Clear cart
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      setItems([]);
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setOrdering(false);
    }
  };

  if (!user) {
    return (
      <div className="container py-16 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">Please sign in to view your cart</p>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6 max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-primary" />
        Shopping Cart
      </h1>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : items.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="text-center py-12 space-y-3">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/30" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button variant="outline" onClick={() => navigate('/e-commerce')}>Browse Products</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="shadow-soft">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={item.products.image_url || '/placeholder.svg'}
                      alt={item.products.name}
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{item.products.name}</p>
                    <p className="text-primary font-bold">₹{item.products.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQty(item.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQty(item.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-bold text-foreground w-20 text-right">₹{item.products.price * item.quantity}</p>
                  <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-soft">
            <CardHeader><CardTitle className="font-display text-lg">Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Shipping Address</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your delivery address" />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-lg font-semibold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">₹{total.toLocaleString()}</span>
              </div>
              <Button className="w-full" size="lg" onClick={placeOrder} disabled={ordering}>
                {ordering ? 'Placing Order...' : <>Place Order <ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
