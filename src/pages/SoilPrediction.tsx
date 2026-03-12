import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, FlaskConical, Loader2, Sprout, Droplets, Thermometer, CloudRain } from 'lucide-react';
import { toast } from 'sonner';
import PageHero from '@/components/PageHero';
import soilHero from '@/assets/soil-analysis-hero.jpg';

interface PredictionResult {
  soil_type: string;
  predicted_crops: string[];
  recommendation: string;
}

export default function SoilPrediction() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [form, setForm] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    rainfall: '',
    temperature: '',
    humidity: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to use soil prediction');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('soil-predict', {
        body: {
          nitrogen: parseFloat(form.nitrogen),
          phosphorus: parseFloat(form.phosphorus),
          potassium: parseFloat(form.potassium),
          ph: parseFloat(form.ph),
          rainfall: parseFloat(form.rainfall) || null,
          temperature: parseFloat(form.temperature) || null,
          humidity: parseFloat(form.humidity) || null,
        },
      });

      if (error) throw error;

      const prediction: PredictionResult = data;
      setResult(prediction);

      // Save to database
      await supabase.from('soil_predictions').insert({
        user_id: user.id,
        nitrogen: parseFloat(form.nitrogen),
        phosphorus: parseFloat(form.phosphorus),
        potassium: parseFloat(form.potassium),
        ph: parseFloat(form.ph),
        rainfall: parseFloat(form.rainfall) || null,
        temperature: parseFloat(form.temperature) || null,
        humidity: parseFloat(form.humidity) || null,
        predicted_crops: prediction.predicted_crops,
        soil_type: prediction.soil_type,
        recommendation: prediction.recommendation,
      });

      toast.success('Prediction complete!');
    } catch (err: any) {
      toast.error(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'nitrogen', label: 'Nitrogen (N)', icon: FlaskConical, placeholder: 'e.g. 90', unit: 'kg/ha' },
    { key: 'phosphorus', label: 'Phosphorus (P)', icon: FlaskConical, placeholder: 'e.g. 42', unit: 'kg/ha' },
    { key: 'potassium', label: 'Potassium (K)', icon: FlaskConical, placeholder: 'e.g. 43', unit: 'kg/ha' },
    { key: 'ph', label: 'Soil pH', icon: Droplets, placeholder: 'e.g. 6.5', unit: '' },
    { key: 'temperature', label: 'Temperature', icon: Thermometer, placeholder: 'e.g. 25', unit: '°C' },
    { key: 'humidity', label: 'Humidity', icon: Droplets, placeholder: 'e.g. 80', unit: '%' },
    { key: 'rainfall', label: 'Rainfall', icon: CloudRain, placeholder: 'e.g. 200', unit: 'mm' },
  ];

  return (
    <div className="container py-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
          <Leaf className="h-8 w-8 text-success" />
          Soil Classification & Crop Prediction
        </h1>
        <p className="text-muted-foreground mt-1">
          Enter your soil parameters to get AI-powered crop recommendations
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-xl">Soil Parameters</CardTitle>
            <CardDescription>Enter your soil test results below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePredict} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {fields.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.key} className="space-y-1.5">
                      <Label htmlFor={f.key} className="text-xs flex items-center gap-1">
                        <Icon className="h-3 w-3" /> {f.label}
                      </Label>
                      <div className="relative">
                        <Input
                          id={f.key}
                          type="number"
                          step="any"
                          placeholder={f.placeholder}
                          value={form[f.key as keyof typeof form]}
                          onChange={(e) => handleChange(f.key, e.target.value)}
                          required={['nitrogen', 'phosphorus', 'potassium', 'ph'].includes(f.key)}
                        />
                        {f.unit && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            {f.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button type="submit" className="w-full" disabled={loading || !user}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Sprout className="h-4 w-4 mr-2" /> Predict Suitable Crops
                  </>
                )}
              </Button>
              {!user && <p className="text-xs text-muted-foreground text-center">Sign in to use predictions</p>}
            </form>
          </CardContent>
        </Card>

        {result ? (
          <Card className="shadow-soft border-success/30 animate-fade-in">
            <CardHeader>
              <CardTitle className="font-display text-xl text-success flex items-center gap-2">
                <Sprout className="h-5 w-5" /> Prediction Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-sm font-semibold text-foreground mb-1">Soil Type</p>
                <p className="text-lg font-bold text-primary">{result.soil_type}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Recommended Crops</p>
                <div className="flex flex-wrap gap-2">
                  {result.predicted_crops.map((crop) => (
                    <span
                      key={crop}
                      className="px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium"
                    >
                      🌱 {crop}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted">
                <p className="text-sm font-semibold text-foreground mb-1">Expert Recommendation</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.recommendation}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-soft flex items-center justify-center min-h-[300px]">
            <CardContent className="text-center space-y-3 py-12">
              <Leaf className="h-16 w-16 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground">Enter soil parameters and click predict to see results</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
