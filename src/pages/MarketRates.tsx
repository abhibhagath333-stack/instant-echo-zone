import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BarChart3, Search, History } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MarketRate {
  id: string;
  crop_name: string;
  market_name: string;
  location: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  date: string;
}

export default function MarketRates() {
  const [rates, setRates] = useState<MarketRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState('all');
  const [trendCrop, setTrendCrop] = useState('');

  useEffect(() => {
    supabase.from('market_rates').select('*').order('date', { ascending: false }).then(({ data }) => {
      setRates(data || []);
      setLoading(false);
      if (data && data.length > 0 && !trendCrop) setTrendCrop(data[0].crop_name);
    });
  }, []);

  const markets = [...new Set(rates.map(r => r.market_name))];
  const crops = [...new Set(rates.map(r => r.crop_name))];

  const filtered = rates.filter((rate) => {
    const matchesSearch = searchQuery === '' ||
      rate.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rate.market_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rate.location && rate.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMarket = marketFilter === 'all' || rate.market_name === marketFilter;
    return matchesSearch && matchesMarket;
  });

  // Historical price trend data
  const trendData = useMemo(() => {
    const cropRates = rates
      .filter(r => r.crop_name === trendCrop)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return cropRates.map(r => ({
      date: new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      min: r.min_price,
      max: r.max_price,
      modal: r.modal_price,
      market: r.market_name,
    }));
  }, [rates, trendCrop]);

  // Best market suggestion
  const bestMarket = useMemo(() => {
    if (!trendCrop) return null;
    const cropRates = rates.filter(r => r.crop_name === trendCrop);
    if (cropRates.length === 0) return null;
    return cropRates.reduce((best, r) => (r.modal_price > best.modal_price ? r : best), cropRates[0]);
  }, [rates, trendCrop]);

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          APMC Live Market Rates
        </h1>
        <p className="text-muted-foreground mt-1">Daily crop prices from nearby APMC markets</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by crop, market, or location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={marketFilter} onValueChange={setMarketFilter}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by market" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Markets</SelectItem>
            {markets.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="rates">
        <TabsList>
          <TabsTrigger value="rates">Live Rates</TabsTrigger>
          <TabsTrigger value="trends"><History className="h-4 w-4 mr-1" /> Price Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="space-y-6">
          {/* Top Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {filtered.slice(0, 3).map((rate) => (
              <Card key={rate.id} className="shadow-soft">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{rate.crop_name}</h3>
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <p className="text-2xl font-bold text-primary">₹{rate.modal_price}/q</p>
                  <p className="text-sm text-muted-foreground">{rate.market_name}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">Min: ₹{rate.min_price}</Badge>
                    <Badge variant="outline" className="text-xs">Max: ₹{rate.max_price}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="font-display flex items-center justify-between">
                All Market Rates
                <span className="text-sm font-normal text-muted-foreground">{filtered.length} results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading rates...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No matching rates found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Crop</TableHead>
                        <TableHead>Market</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Min (₹/q)</TableHead>
                        <TableHead className="text-right">Max (₹/q)</TableHead>
                        <TableHead className="text-right">Modal (₹/q)</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((rate) => (
                        <TableRow key={rate.id}>
                          <TableCell className="font-medium">{rate.crop_name}</TableCell>
                          <TableCell>{rate.market_name}</TableCell>
                          <TableCell>{rate.location}</TableCell>
                          <TableCell className="text-right text-destructive">₹{rate.min_price}</TableCell>
                          <TableCell className="text-right text-success">₹{rate.max_price}</TableCell>
                          <TableCell className="text-right font-bold text-primary">₹{rate.modal_price}</TableCell>
                          <TableCell>{rate.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Select value={trendCrop} onValueChange={setTrendCrop}>
              <SelectTrigger className="w-full sm:w-[250px]"><SelectValue placeholder="Select crop" /></SelectTrigger>
              <SelectContent>
                {crops.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {bestMarket && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 border border-success/20">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-success">Best Market: {bestMarket.market_name} — ₹{bestMarket.modal_price}/q</span>
              </div>
            )}
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-lg">Price History: {trendCrop}</CardTitle>
            </CardHeader>
            <CardContent>
              {trendData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No historical data available for this crop.</div>
              ) : (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="min" name="Min Price" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="modal" name="Modal Price" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="max" name="Max Price" stroke="hsl(153, 60%, 40%)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price comparison across markets */}
          {trendCrop && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="font-display text-lg">Market Comparison: {trendCrop}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rates
                    .filter(r => r.crop_name === trendCrop)
                    .sort((a, b) => b.modal_price - a.modal_price)
                    .slice(0, 6)
                    .map((r, i) => (
                      <div key={r.id} className={`p-4 rounded-xl border ${i === 0 ? 'border-success/40 bg-success/5' : 'border-border bg-muted/30'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-foreground">{r.market_name}</p>
                            <p className="text-xs text-muted-foreground">{r.location}</p>
                          </div>
                          {i === 0 && <Badge className="bg-success/10 text-success text-xs">Best</Badge>}
                        </div>
                        <p className="text-xl font-bold text-primary mt-2">₹{r.modal_price}/q</p>
                        <p className="text-xs text-muted-foreground">{r.date}</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
