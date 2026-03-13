import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users, Package, MessageCircle, Trash2, CheckCircle, XCircle, Clock, Plus, Search, Landmark, Pencil, BarChart3, ShoppingBag, Leaf, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Profile { id: string; user_id: string; full_name: string | null; role: string | null; location: string | null; phone: string | null; created_at: string | null; }
interface VendorRegistration { id: string; user_id: string; business_name: string; business_type: string | null; phone: string | null; address: string | null; status: string; admin_notes: string | null; created_at: string; }
interface Post { id: string; content: string; user_id: string; created_at: string | null; }
interface Yojana { id: string; title: string; description: string | null; benefits: string | null; eligibility: string | null; link: string | null; }
interface UserRole { user_id: string; role: string; }

const CHART_COLORS = ['hsl(153, 60%, 40%)', 'hsl(42, 80%, 55%)', 'hsl(200, 70%, 45%)', 'hsl(0, 72%, 51%)'];

export default function AdminDashboard() {
  const { user, hasRole, loading: authLoading, roleLoading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [vendorRegs, setVendorRegs] = useState<VendorRegistration[]>([]);
  const [yojanas, setYojanas] = useState<Yojana[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [yojanaDialog, setYojanaDialog] = useState(false);
  const [yojanaForm, setYojanaForm] = useState({ title: '', description: '', benefits: '', eligibility: '', link: '' });
  const [editingYojana, setEditingYojana] = useState<Yojana | null>(null);

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!hasRole('admin')) { toast.error('Access denied. Admin only.'); navigate('/admin-auth'); return; }
    if (user && hasRole('admin')) {
      Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('vendor_registrations').select('*').order('created_at', { ascending: false }),
        supabase.from('yojanas').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('*'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('soil_predictions').select('*').order('created_at', { ascending: false }),
      ]).then(([p, pr, po, vr, y, ur, o, sp]) => {
        setProfiles(p.data || []);
        setProducts(pr.data || []);
        setPosts(po.data || []);
        setVendorRegs(vr.data || []);
        setYojanas(y.data || []);
        setUserRoles(ur.data || []);
        setOrders(o.data || []);
        setPredictions(sp.data || []);
        setLoading(false);
      });
    }
  }, [user, authLoading]);

  const getUserRole = (userId: string) => userRoles.find(r => r.user_id === userId)?.role || 'farmer';

  const approveVendor = async (reg: VendorRegistration) => {
    await supabase.from('user_roles').insert({ user_id: reg.user_id, role: 'vendor' });
    await supabase.from('vendor_registrations').update({ status: 'approved' }).eq('id', reg.id);
    setVendorRegs(prev => prev.map(r => r.id === reg.id ? { ...r, status: 'approved' } : r));
    toast.success(`${reg.business_name} approved!`);
  };

  const rejectVendor = async (reg: VendorRegistration) => {
    await supabase.from('vendor_registrations').update({ status: 'rejected' }).eq('id', reg.id);
    setVendorRegs(prev => prev.map(r => r.id === reg.id ? { ...r, status: 'rejected' } : r));
    toast.success(`${reg.business_name} rejected.`);
  };

  const deletePost = async (id: string) => {
    await supabase.from('posts').delete().eq('id', id);
    setPosts(prev => prev.filter(p => p.id !== id));
    toast.success('Post removed');
  };

  const resetYojanaForm = () => { setYojanaForm({ title: '', description: '', benefits: '', eligibility: '', link: '' }); setEditingYojana(null); };
  const openEditYojana = (y: Yojana) => {
    setEditingYojana(y);
    setYojanaForm({ title: y.title, description: y.description || '', benefits: y.benefits || '', eligibility: y.eligibility || '', link: y.link || '' });
    setYojanaDialog(true);
  };
  const saveYojana = async () => {
    const payload = { title: yojanaForm.title, description: yojanaForm.description || null, benefits: yojanaForm.benefits || null, eligibility: yojanaForm.eligibility || null, link: yojanaForm.link || null };
    if (editingYojana) {
      await supabase.from('yojanas').update(payload).eq('id', editingYojana.id);
      setYojanas(prev => prev.map(y => y.id === editingYojana.id ? { ...y, ...payload } : y));
      toast.success('Yojana updated');
    } else {
      const { data } = await supabase.from('yojanas').insert(payload).select().single();
      if (data) setYojanas(prev => [data, ...prev]);
      toast.success('Yojana added');
    }
    setYojanaDialog(false); resetYojanaForm();
  };
  const deleteYojana = async (id: string) => {
    await supabase.from('yojanas').delete().eq('id', id);
    setYojanas(prev => prev.filter(y => y.id !== id));
    toast.success('Yojana deleted');
  };

  const pendingCount = vendorRegs.filter(r => r.status === 'pending').length;
  const filteredProfiles = profiles.filter(p => {
    const matchSearch = !userSearch || p.full_name?.toLowerCase().includes(userSearch.toLowerCase()) || p.phone?.includes(userSearch);
    const matchRole = roleFilter === 'all' || getUserRole(p.user_id) === roleFilter;
    return matchSearch && matchRole;
  });

  // Analytics data
  const roleCounts = userRoles.reduce((acc, r) => { acc[r.role] = (acc[r.role] || 0) + 1; return acc; }, {} as Record<string, number>);
  const roleChartData = Object.entries(roleCounts).map(([name, value]) => ({ name, value }));
  const orderStatusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  const orderChartData = Object.entries(orderStatusCounts).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const stats = [
    { label: 'Total Users', value: profiles.length, icon: Users, color: 'bg-primary/10 text-primary' },
    { label: 'Pending Vendors', value: pendingCount, icon: Clock, color: 'bg-warning/10 text-warning' },
    { label: 'Total Products', value: products.length, icon: Package, color: 'bg-info/10 text-info' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'bg-success/10 text-success' },
    { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-secondary/10 text-secondary' },
    { label: 'Predictions', value: predictions.length, icon: Leaf, color: 'bg-primary/10 text-primary' },
  ];

  if (authLoading || loading) return <div className="container py-16 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" /> Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Manage users, content, analytics & schemes</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s) => { const Icon = s.icon; return (
          <Card key={s.label} className="shadow-soft"><CardContent className="flex items-center gap-3 p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}><Icon className="h-5 w-5" /></div>
            <div><p className="text-xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </CardContent></Card>
        ); })}
      </div>

      <Tabs defaultValue="analytics">
        <TabsList className="flex-wrap">
          <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-1" /> Analytics</TabsTrigger>
          <TabsTrigger value="vendors">Vendors {pendingCount > 0 && <Badge variant="destructive" className="ml-1.5 h-5 px-1.5 text-[10px]">{pendingCount}</Badge>}</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="yojanas">Yojanas</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-soft">
              <CardHeader><CardTitle className="font-display text-lg">Users by Role</CardTitle></CardHeader>
              <CardContent>
                {roleChartData.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No user data</p>
                ) : (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={roleChartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                          {roleChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader><CardTitle className="font-display text-lg">Order Status</CardTitle></CardHeader>
              <CardContent>
                {orderChartData.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No orders yet</p>
                ) : (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={orderChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                        <Bar dataKey="value" fill="hsl(153, 50%, 30%)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-soft lg:col-span-2">
              <CardHeader><CardTitle className="font-display text-lg">Quick Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-2xl font-bold text-primary">{profiles.length}</p>
                    <p className="text-xs text-muted-foreground">Registered Users</p>
                  </div>
                  <div className="p-4 rounded-xl bg-success/5 border border-success/10 text-center">
                    <p className="text-2xl font-bold text-success">{orders.filter(o => o.status === 'delivered').length}</p>
                    <p className="text-xs text-muted-foreground">Delivered Orders</p>
                  </div>
                  <div className="p-4 rounded-xl bg-warning/5 border border-warning/10 text-center">
                    <p className="text-2xl font-bold text-warning">{predictions.length}</p>
                    <p className="text-xs text-muted-foreground">Soil Predictions</p>
                  </div>
                  <div className="p-4 rounded-xl bg-info/5 border border-info/10 text-center">
                    <p className="text-2xl font-bold text-info">{posts.length}</p>
                    <p className="text-xs text-muted-foreground">Community Posts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendors">
          <Card className="shadow-soft">
            <CardHeader><CardTitle className="font-display">Vendor Registration Requests</CardTitle></CardHeader>
            <CardContent>
              {vendorRegs.length === 0 ? <p className="text-center py-8 text-muted-foreground">No vendor registrations yet.</p> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Business</TableHead><TableHead>Type</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {vendorRegs.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-medium">{reg.business_name}</TableCell>
                        <TableCell>{reg.business_type || '—'}</TableCell>
                        <TableCell>{reg.phone || '—'}</TableCell>
                        <TableCell><Badge variant={reg.status === 'approved' ? 'default' : reg.status === 'rejected' ? 'destructive' : 'secondary'}>{reg.status}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(reg.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {reg.status === 'pending' && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="text-success h-7 px-2" onClick={() => approveVendor(reg)}><CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve</Button>
                              <Button size="sm" variant="outline" className="text-destructive h-7 px-2" onClick={() => rejectVendor(reg)}><XCircle className="h-3.5 w-3.5 mr-1" /> Reject</Button>
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
            <CardHeader>
              <CardTitle className="font-display">Registered Users</CardTitle>
              <div className="flex gap-3 mt-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name or phone..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-10" />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Role</TableHead><TableHead>Location</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredProfiles.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.full_name || 'N/A'}</TableCell>
                      <TableCell>{p.phone || '—'}</TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize">{getUserRole(p.user_id)}</Badge></TableCell>
                      <TableCell>{p.location || '—'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yojanas">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display flex items-center gap-2"><Landmark className="h-5 w-5" /> Government Schemes</CardTitle>
              <Dialog open={yojanaDialog} onOpenChange={(open) => { setYojanaDialog(open); if (!open) resetYojanaForm(); }}>
                <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Yojana</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle className="font-display">{editingYojana ? 'Edit Yojana' : 'Add New Yojana'}</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div className="space-y-1.5"><Label>Title</Label><Input value={yojanaForm.title} onChange={(e) => setYojanaForm({ ...yojanaForm, title: e.target.value })} placeholder="Scheme name" /></div>
                    <div className="space-y-1.5"><Label>Description</Label><Textarea value={yojanaForm.description} onChange={(e) => setYojanaForm({ ...yojanaForm, description: e.target.value })} rows={3} /></div>
                    <div className="space-y-1.5"><Label>Benefits</Label><Textarea value={yojanaForm.benefits} onChange={(e) => setYojanaForm({ ...yojanaForm, benefits: e.target.value })} rows={2} /></div>
                    <div className="space-y-1.5"><Label>Eligibility</Label><Textarea value={yojanaForm.eligibility} onChange={(e) => setYojanaForm({ ...yojanaForm, eligibility: e.target.value })} rows={2} /></div>
                    <div className="space-y-1.5"><Label>Link</Label><Input value={yojanaForm.link} onChange={(e) => setYojanaForm({ ...yojanaForm, link: e.target.value })} placeholder="https://..." /></div>
                    <Button className="w-full" onClick={saveYojana} disabled={!yojanaForm.title.trim()}>{editingYojana ? 'Update' : 'Add Yojana'}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-3">
              {yojanas.length === 0 ? <p className="text-center py-8 text-muted-foreground">No yojanas added yet.</p> : yojanas.map((y) => (
                <div key={y.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-semibold text-foreground">{y.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{y.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditYojana(y)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteYojana(y.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card className="shadow-soft">
            <CardHeader><CardTitle className="font-display">All Products</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead></TableRow></TableHeader>
                <TableBody>
                  {products.map((p: any) => (
                    <TableRow key={p.id}><TableCell className="font-medium">{p.name}</TableCell><TableCell><Badge variant="outline">{p.category}</Badge></TableCell><TableCell className="font-semibold text-primary">₹{p.price}</TableCell><TableCell>{p.stock}</TableCell></TableRow>
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
                  <div><p className="text-sm text-muted-foreground line-clamp-2">{p.content}</p><p className="text-xs text-muted-foreground mt-1">{p.created_at ? new Date(p.created_at).toLocaleString() : ''}</p></div>
                  <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => deletePost(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
