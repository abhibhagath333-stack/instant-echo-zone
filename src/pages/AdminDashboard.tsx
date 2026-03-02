import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Users, Package, MessageCircle, BarChart3, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: string | null;
  location: string | null;
  created_at: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string | null;
  stock: number | null;
  vendor_id: string;
}

interface Post {
  id: string;
  content: string;
  user_id: string;
  created_at: string | null;
  profiles?: { full_name: string | null } | null;
}

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('posts').select('*').order('created_at', { ascending: false }),
    ]).then(([p, pr, po]) => {
      setProfiles(p.data || []);
      setProducts(pr.data || []);
      setPosts(po.data || []);
      setLoading(false);
    });
  }, []);

  const deletePost = async (id: string) => {
    await supabase.from('posts').delete().eq('id', id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast.success('Post removed');
  };

  const stats = [
    { label: 'Total Users', value: profiles.length, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Total Products', value: products.length, icon: Package, color: 'bg-info/10 text-info' },
    { label: 'Community Posts', value: posts.length, icon: MessageCircle, color: 'bg-success/10 text-success' },
    { label: 'Market Entries', value: '—', icon: BarChart3, color: 'bg-warning/10 text-warning' },
  ];

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Monitor system, manage users & moderate content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="shadow-soft">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : (
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="shadow-soft">
              <CardHeader><CardTitle className="font-display">Registered Users</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.full_name || 'N/A'}</TableCell>
                        <TableCell><Badge variant="secondary">{p.role || 'farmer'}</Badge></TableCell>
                        <TableCell>{p.location || '—'}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="shadow-soft">
              <CardHeader><CardTitle className="font-display">All Products</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                        <TableCell className="font-semibold text-primary">₹{p.price}</TableCell>
                        <TableCell>{p.stock}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card className="shadow-soft">
              <CardHeader><CardTitle className="font-display">Community Posts (Moderation)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {posts.map((p) => (
                  <div key={p.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-semibold text-foreground">User</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{p.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {p.created_at ? new Date(p.created_at).toLocaleString() : ''}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => deletePost(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
