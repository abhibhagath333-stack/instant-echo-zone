import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Users, Package, MessageCircle, BarChart3, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: string | null;
  location: string | null;
  created_at: string | null;
}

interface VendorRegistration {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface Post {
  id: string;
  content: string;
  user_id: string;
  created_at: string | null;
}

export default function AdminDashboard() {
  const { user, hasRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [vendorRegs, setVendorRegs] = useState<VendorRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !hasRole('admin')) {
      toast.error('Access denied. Admin only.');
      navigate('/admin-auth');
      return;
    }
    if (user && hasRole('admin')) {
      Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('vendor_registrations').select('*').order('created_at', { ascending: false }),
      ]).then(([p, pr, po, vr]) => {
        setProfiles(p.data || []);
        setProducts(pr.data || []);
        setPosts(po.data || []);
        setVendorRegs(vr.data || []);
        setLoading(false);
      });
    }
  }, [user, authLoading]);

  const approveVendor = async (reg: VendorRegistration) => {
    // Add vendor role
    const { error: roleError } = await supabase.from('user_roles').insert({ user_id: reg.user_id, role: 'vendor' });
    if (roleError && !roleError.message.includes('duplicate')) {
      toast.error('Failed to assign vendor role');
      return;
    }
    // Update registration status
    const { error } = await supabase.from('vendor_registrations').update({ status: 'approved' }).eq('id', reg.id);
    if (error) { toast.error('Failed to update status'); return; }
    setVendorRegs(prev => prev.map(r => r.id === reg.id ? { ...r, status: 'approved' } : r));
    toast.success(`${reg.business_name} approved as vendor!`);
  };

  const rejectVendor = async (reg: VendorRegistration) => {
    const { error } = await supabase.from('vendor_registrations').update({ status: 'rejected' }).eq('id', reg.id);
    if (error) { toast.error('Failed to update status'); return; }
    setVendorRegs(prev => prev.map(r => r.id === reg.id ? { ...r, status: 'rejected' } : r));
    toast.success(`${reg.business_name} registration rejected.`);
  };

  const deletePost = async (id: string) => {
    await supabase.from('posts').delete().eq('id', id);
    setPosts(prev => prev.filter(p => p.id !== id));
    toast.success('Post removed');
  };

  const pendingCount = vendorRegs.filter(r => r.status === 'pending').length;

  const stats = [
    { label: 'Total Users', value: profiles.length, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Pending Vendors', value: pendingCount, icon: Clock, color: 'bg-warning/10 text-warning' },
    { label: 'Total Products', value: products.length, icon: Package, color: 'bg-info/10 text-info' },
    { label: 'Community Posts', value: posts.length, icon: MessageCircle, color: 'bg-success/10 text-success' },
  ];

  if (authLoading || loading) {
    return <div className="container py-16 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Manage users, approve vendors & moderate content</p>
      </div>

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

      <Tabs defaultValue="vendors">
        <TabsList>
          <TabsTrigger value="vendors">
            Vendor Approvals {pendingCount > 0 && <Badge variant="destructive" className="ml-1.5 h-5 px-1.5 text-[10px]">{pendingCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors">
          <Card className="shadow-soft">
            <CardHeader><CardTitle className="font-display">Vendor Registration Requests</CardTitle></CardHeader>
            <CardContent>
              {vendorRegs.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No vendor registrations yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorRegs.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-medium">{reg.business_name}</TableCell>
                        <TableCell>{reg.business_type || '—'}</TableCell>
                        <TableCell>{reg.phone || '—'}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{reg.address || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={reg.status === 'approved' ? 'default' : reg.status === 'rejected' ? 'destructive' : 'secondary'}>
                            {reg.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(reg.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {reg.status === 'pending' && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="text-success h-7 px-2" onClick={() => approveVendor(reg)}>
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive h-7 px-2" onClick={() => rejectVendor(reg)}>
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </div>
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
                  {products.map((p: any) => (
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
    </div>
  );
}
