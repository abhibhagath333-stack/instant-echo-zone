import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sprout, ShoppingCart, BarChart3, Landmark, CloudSun, MessageCircle, Leaf, ArrowRight, CheckCircle } from 'lucide-react';
import heroImage from '@/assets/hero-farm.jpg';

const features = [
  { icon: BarChart3, title: 'APMC Live Rates', desc: 'Real-time crop prices from nearby APMC markets to maximize your profit.', color: 'bg-info/10 text-info' },
  { icon: ShoppingCart, title: 'E-Commerce', desc: 'Buy seeds, fertilizers & equipment directly online at fair prices.', color: 'bg-primary/10 text-primary' },
  { icon: CloudSun, title: 'Weather Forecast', desc: 'Accurate weather data to plan irrigation, sowing & harvesting.', color: 'bg-warning/10 text-warning' },
  { icon: Landmark, title: 'Govt Schemes', desc: 'Stay updated on PM-KISAN, Fasal Bima & other yojanas.', color: 'bg-secondary/10 text-secondary' },
  { icon: Leaf, title: 'Soil & Crop AI', desc: 'ML-powered soil classification and crop prediction for better yields.', color: 'bg-success/10 text-success' },
  { icon: MessageCircle, title: 'Community', desc: 'Connect with fellow farmers, share experiences & get expert advice.', color: 'bg-primary/10 text-primary' },
];

const benefits = [
  'Data-driven crop selection for maximum yield',
  'Direct market access — no middlemen',
  'Real-time weather alerts for crop protection',
  'Government scheme notifications delivered to you',
];

export default function Index() {
  return (
    <div className="min-h-screen">
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary-foreground" />
            <span className="font-display text-xl font-bold text-primary-foreground">Digital-Agri</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/auth"><Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">Farmer</Button></Link>
            <Link to="/vendor-auth"><Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">Vendor</Button></Link>
            <Link to="/admin-auth"><Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">Admin</Button></Link>
            <Link to="/auth"><Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Get Started</Button></Link>
          </div>
        </div>
      </header>

      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Indian farmland at golden hour" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>
        <div className="container relative z-10 py-24">
          <div className="max-w-2xl space-y-6 animate-fade-in">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
              Empowering Farmers with <span className="text-secondary">Digital Intelligence</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-xl">A smart, unified platform for soil analysis, crop prediction, live market rates, weather forecasts, e-commerce, and community support.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/auth"><Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">Start Free <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link to="/market-rates"><Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">View Live Rates</Button></Link>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-2 text-sm text-primary-foreground/70">
                  <CheckCircle className="h-4 w-4 text-secondary" />{b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Everything a Farmer Needs, In One Place</h2>
            <p className="text-muted-foreground">From soil to market — our platform covers every step of the agricultural journey.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title} className="shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 space-y-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}><Icon className="h-6 w-6" /></div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-hero">
        <div className="container text-center space-y-6">
          <h2 className="font-display text-3xl font-bold text-primary-foreground">Ready to Transform Your Farming?</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">Join thousands of farmers using Digital-Agri for smarter, more profitable agriculture.</p>
          <Link to="/auth"><Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">Join Digital-Agri Today <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
        </div>
      </section>

      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="font-display text-foreground text-lg mb-2">Digital-Agri — Digital Agriculture Support System</p>
          <p>JSS College of Arts Commerce and Science, Mysuru</p>
        </div>
      </footer>
    </div>
  );
}
