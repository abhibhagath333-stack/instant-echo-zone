import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, BarChart3, Search } from 'lucide-react';

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

  useEffect(() => {
    supabase.from('market_rates').select('*').order('date', { ascending: false }).then(({ data }) => {
      setRates(data || []);
      setLoading(false);
    });
  }, []);

  const markets = [...new Set(rates.map(r => r.market_name))];

  const filtered = rates.filter((rate) => {
    const matchesSearch = searchQuery === '' ||
      rate.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rate.market_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rate.location && rate.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMarket = marketFilter === 'all' || rate.market_name === marketFilter;
    return matchesSearch && matchesMarket;
  });

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
          <Input
            placeholder="Search by crop, market, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={marketFilter} onValueChange={setMarketFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by market" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Markets</SelectItem>
            {markets.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
    </div>
  );
}
