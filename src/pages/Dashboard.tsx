import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, BarChart3, Landmark, CloudSun, MessageCircle, Leaf, TrendingUp, Users, Package, Shield } from 'lucide-react';

const modules = [
  { path: '/marketplace', label: 'Marketplace', desc: 'Buy seeds, fertilizers & tools', icon: ShoppingCart, color: 'bg-primary/10 text-primary' },
  { path: '/market-rates', label: 'APMC Rates', desc: 'Live crop prices from APMC', icon: BarChart3, color: 'bg-info/10 text-info' },
  { path: '/soil-prediction', label: 'Soil & Crop AI', desc: 'ML-powered crop prediction', icon: Leaf, color: 'bg-success/10 text-success' },
  { path: '/yojanas', label: 'Govt Schemes', desc: 'Yojana info & eligibility', icon: Landmark, color: 'bg-secondary/10 text-secondary' },
  { path: '/weather', label: 'Weather', desc: 'Forecasts for crop planning', icon: CloudSun, color: 'bg-warning/10 text-warning' },
  { path: '/community', label: 'Community', desc: 'Connect with fellow farmers', icon: MessageCircle, color: 'bg-success/10 text-success' },
  { path: '/vendor', label: 'Vendor Panel', desc: 'Manage your product listings', icon: Package, color: 'bg-info/10 text-info' },
  { path: '/admin', label: 'Admin Panel', desc: 'System management & analytics', icon: Shield, color: 'bg-destructive/10 text-destructive' },
];

const stats = [
  { label: 'Active Crops', value: '12', icon: Leaf },
  { label: 'Market Updates', value: '8', icon: TrendingUp },
  { label: 'Community Posts', value: '156', icon: Users },
];

export default function Dashboard() {
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Farmer';

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

      <div>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
