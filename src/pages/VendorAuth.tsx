import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        // Login: check vendor role
        const { error } = await signIn(email, password);
        if (error) throw error;
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user) {
          const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', session.session.user.id).eq('role', 'vendor').single();
          if (!roleData) {
            const { data: regData } = await supabase.from('vendor_registrations').select('status').eq('user_id', session.session.user.id).order('created_at', { ascending: false }).limit(1).single();
            if (regData?.status === 'pending') {
              toast.info('Your vendor registration is pending admin approval.');
            } else if (regData?.status === 'rejected') {
              toast.error('Your vendor registration was rejected. Contact admin.');
            } else {
              toast.error('You are not registered as a vendor.');
            }
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }
        }
        toast.success('Welcome back, Vendor!');
        navigate('/vendor');
      } else {
        // Register: create account + submit vendor registration
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        // Try to sign in immediately to submit registration
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          toast.success('Account created! Please verify your email, then log in to complete registration.');
          setLoading(false);
          return;
        }
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user) {
          await supabase.from('vendor_registrations').insert({
            user_id: session.session.user.id,
            business_name: businessName,
            business_type: businessType || null,
            phone: phone || null,
            address: address || null,
          });
          toast.success('Registration submitted! Wait for admin approval before logging in.');
          await supabase.auth.signOut();
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-elevated relative">
        <CardHeader className="text-center">
          <Button variant="ghost" size="sm" onClick={goBack} className="absolute left-4 top-4 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-info/10">
            <Package className="h-7 w-7 text-info" />
          </div>
          <CardTitle className="font-display text-2xl">{isLogin ? 'Vendor Login' : 'Vendor Registration'}</CardTitle>
          <CardDescription>{isLogin ? 'Sign in to your approved vendor account' : 'Submit your details for admin approval'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your shop/business name" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Input id="businessType" value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="e.g. Seeds, Tools" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Shop/Business address" rows={2} />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vendor@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In as Vendor' : 'Submit Registration'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have a vendor account? " : 'Already approved? '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
              {isLogin ? 'Register Now' : 'Sign In'}
            </button>
          </p>
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')} className="text-xs">Farmer Login</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin-auth')} className="text-xs">Admin Login</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
