import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingCart, BarChart3, Landmark, CloudSun, MessageCircle, Leaf, TrendingUp, Users, Plus, Pencil, Trash2, Sprout, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface ActiveCrop {
  id: string;
  name: string;
  season: string | null;
  sowing_date: string | null;
  expected_harvest_date: string | null;
}

const modules = [
  { path: '/e-commerce', label: 'E-Commerce', desc: 'Buy seeds, fertilizers & tools', icon: ShoppingCart, color: 'bg-primary/10 text-primary' },
  { path: '/market-rates', label: 'APMC Rates', desc: 'Live crop prices from APMC', icon: BarChart3, color: 'bg-info/10 text-info' },
  { path: '/soil-prediction', label: 'Soil & Crop AI', desc: 'ML-powered crop prediction', icon: Leaf, color: 'bg-success/10 text-success' },
  { path: '/yojanas', label: 'Govt Schemes', desc: 'Yojana info & eligibility', icon: Landmark, color: 'bg-secondary/10 text-secondary' },
  { path: '/weather', label: 'Weather', desc: 'Forecasts for crop planning', icon: CloudSun, color: 'bg-warning/10 text-warning' },
  { path: '/community', label: 'Community', desc: 'Connect with fellow farmers', icon: MessageCircle, color: 'bg-success/10 text-success' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [crops, setCrops] = useState<ActiveCrop[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ActiveCrop | null>(null);
  const [form, setForm] = useState({ name: '', season: '', sowing_date: '', expected_harvest_date: '' });

  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Farmer';

  const fetchCrops = async () => {
    if (!user) return;
    const { data } = await (supabase as any).from('active_crops').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setCrops(data || []);
  };

  useEffect(() => { fetchCrops(); }, [user]);

  const resetForm = () => { setForm({ name: '', season: '', sowing_date: '', expected_harvest_date: '' }); setEditing(null); };

  const openEdit = (c: ActiveCrop) => {
    setEditing(c);
    setForm({ name: c.name, season: c.season || '', sowing_date: c.sowing_date || '', expected_harvest_date: c.expected_harvest_date || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user || !form.name.trim()) return;
    const payload = { name: form.name, season: form.season || null, sowing_date: form.sowing_date || null, expected_harvest_date: form.expected_harvest_date || null, user_id: user.id };
    if (editing) {
      const { error } = await (supabase as any).from('active_crops').update(payload).eq('id', editing.id);
      if (error) { toast.error('Update failed'); return; }
      toast.success('Crop updated');
    } else {
      const { error } = await (supabase as any).from('active_crops').insert(payload);
      if (error) { toast.error('Failed to add crop'); return; }
      toast.success('Crop added');
    }
    setDialogOpen(false); resetForm(); fetchCrops();
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from('active_crops').delete().eq('id', id);
    toast.success('Crop removed');
    fetchCrops();
  };

  const stats = [
    { label: 'Active Crops', value: crops.length, icon: Sprout },
    { label: 'Market Updates', value: '8', icon: TrendingUp },
    { label: 'Community Posts', value: '156', icon: Users },
  ];

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-foreground">Namaste, {name}! 🌾</h1>
        <p className="text-muted-foreground">Here's your agricultural dashboard for today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="shadow-soft">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Crops Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
            <Sprout className="h-5 w-5 text-success" /> Active Crops
          </h2>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Crop</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">{editing ? 'Edit Crop' : 'Add New Crop'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Crop Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Rice, Wheat" />
                </div>
                <div className="space-y-1.5">
                  <Label>Season</Label>
                  <Input value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} placeholder="e.g. Kharif, Rabi" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Sowing Date</Label>
                    <Input type="date" value={form.sowing_date} onChange={(e) => setForm({ ...form, sowing_date: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Expected Harvest</Label>
                    <Input type="date" value={form.expected_harvest_date} onChange={(e) => setForm({ ...form, expected_harvest_date: e.target.value })} />
                  </div>
                </div>
                <Button className="w-full" onClick={handleSave} disabled={!form.name.trim()}>
                  {editing ? 'Update Crop' : 'Add Crop'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {crops.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="text-center py-8 text-muted-foreground">
              <Sprout className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No active crops. Add your first crop!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {crops.map((crop) => (
              <Card key={crop.id} className="shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{crop.name}</p>
                      {crop.season && <p className="text-sm text-muted-foreground">{crop.season}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(crop)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(crop.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    {crop.sowing_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Sowed: {crop.sowing_date}</span>}
                    {crop.expected_harvest_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Harvest: {crop.expected_harvest_date}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Access - Farmer modules only */}
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.path} to={mod.path}>
                <Card className="shadow-soft hover:shadow-elevated transition-shadow duration-300 cursor-pointer group">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${mod.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{mod.label}</p>
                      <p className="text-sm text-muted-foreground">{mod.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
