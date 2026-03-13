import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', session.session.user.id).eq('role', 'vendor').single();
        if (!roleData) {
          toast.error('You are not authorized as a vendor. Contact admin for access.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
      }
      toast.success('Welcome back, Vendor!');
      navigate('/vendor');
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
          <CardTitle className="font-display text-2xl">Vendor Login</CardTitle>
          <CardDescription>Sign in to your vendor account. Vendor access is granted by admin only.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vendor@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : 'Sign In as Vendor'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Vendor accounts are created by the admin. Contact your administrator to get access.
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
