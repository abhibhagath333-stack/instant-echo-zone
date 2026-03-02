import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Landmark, ExternalLink, CheckCircle } from 'lucide-react';

interface Yojana {
  id: string;
  title: string;
  description: string | null;
  eligibility: string | null;
  benefits: string | null;
  link: string | null;
}

export default function Yojanas() {
  const [yojanas, setYojanas] = useState<Yojana[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('yojanas').select('*').then(({ data }) => {
      setYojanas(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
          <Landmark className="h-8 w-8 text-secondary" />
          Government Yojanas & Schemes
        </h1>
        <p className="text-muted-foreground mt-1">Stay updated on schemes that benefit farmers</p>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-5 bg-muted rounded w-1/3 mb-3" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-5">
          {yojanas.map((y) => (
            <Card key={y.id} className="shadow-soft hover:shadow-elevated transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="font-display text-xl text-foreground">{y.title}</CardTitle>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{y.description}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-success" /> Eligibility
                    </p>
                    <p className="text-sm text-muted-foreground">{y.eligibility}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-success" /> Benefits
                    </p>
                    <p className="text-sm text-muted-foreground">{y.benefits}</p>
                  </div>
                </div>
                {y.link && (
                  <a href={y.link} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" /> Learn More
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
