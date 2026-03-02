import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sprout, ShoppingCart, BarChart3, Landmark, CloudSun, MessageCircle, Leaf, Package, Shield, LogOut, Menu, X, User } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Sprout },
  { path: '/marketplace', label: 'Marketplace', icon: ShoppingCart },
  { path: '/market-rates', label: 'APMC Rates', icon: BarChart3 },
  { path: '/soil-prediction', label: 'Soil AI', icon: Leaf },
  { path: '/yojanas', label: 'Schemes', icon: Landmark },
  { path: '/weather', label: 'Weather', icon: CloudSun },
  { path: '/community', label: 'Community', icon: MessageCircle },
  { path: '/vendor', label: 'Vendor', icon: Package },
  { path: '/admin', label: 'Admin', icon: Shield },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">AgriDigital</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{user.email?.split('@')[0]}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button size="sm">Sign In</Button>
              </Link>
            )}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-card p-4 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="border-t border-border bg-card py-8 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="font-display text-foreground text-lg mb-2">AgriDigital — Digital Agriculture Support System</p>
          <p>Empowering farmers with technology for better productivity and profitability.</p>
        </div>
      </footer>
    </div>
  );
}
