import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Package } from 'lucide-react';

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
  shipped: 'bg-primary/10 text-primary',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('*, order_items(id, quantity, price, products(name))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as any) || []);
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="container py-8 space-y-6 max-w-3xl">
      <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
        <ClipboardList className="h-8 w-8 text-primary" />
        My Orders
      </h1>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : orders.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="text-center py-12 space-y-3">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/30" />
            <p className="text-muted-foreground">No orders yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-soft">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-display">
                    Order #{order.id.slice(0, 8)}
                  </CardTitle>
                  <Badge className={statusColors[order.status] || ''}>{order.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-foreground">{item.products?.name} × {item.quantity}</span>
                    <span className="text-muted-foreground">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-border font-semibold">
                  <span>Total</span>
                  <span className="text-primary">₹{order.total_amount}</span>
                </div>
                {order.shipping_address && (
                  <p className="text-xs text-muted-foreground mt-1">📍 {order.shipping_address}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
