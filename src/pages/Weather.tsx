import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudSun, Droplets, Wind, Thermometer, Sun, CloudRain, Cloud } from 'lucide-react';

const forecast = [
  { day: 'Today', temp: '32°C', condition: 'Sunny', humidity: '45%', wind: '12 km/h', icon: Sun },
  { day: 'Tomorrow', temp: '30°C', condition: 'Partly Cloudy', humidity: '55%', wind: '15 km/h', icon: CloudSun },
  { day: 'Wed', temp: '28°C', condition: 'Rain Expected', humidity: '75%', wind: '20 km/h', icon: CloudRain },
  { day: 'Thu', temp: '27°C', condition: 'Cloudy', humidity: '65%', wind: '10 km/h', icon: Cloud },
  { day: 'Fri', temp: '31°C', condition: 'Sunny', humidity: '40%', wind: '8 km/h', icon: Sun },
];

const tips = [
  { condition: 'Sunny', tip: 'Good day for harvesting and drying crops. Ensure adequate irrigation.' },
  { condition: 'Rain Expected', tip: 'Postpone spraying pesticides. Prepare drainage channels. Cover harvested crops.' },
  { condition: 'Cloudy', tip: 'Suitable for transplanting seedlings. Monitor soil moisture levels.' },
];

export default function Weather() {
  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
          <CloudSun className="h-8 w-8 text-warning" />
          Weather Forecast
        </h1>
        <p className="text-muted-foreground mt-1">Plan your farming activities with accurate weather data</p>
      </div>

      {/* Today's highlight */}
      <Card className="bg-gradient-hero text-primary-foreground shadow-elevated overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm opacity-80 mb-1">Mysore, Karnataka</p>
              <p className="text-6xl font-bold font-display">32°C</p>
              <p className="text-lg mt-1">Sunny & Clear</p>
            </div>
            <Sun className="h-24 w-24 opacity-80 animate-float" />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                <span>Humidity: 45%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-5 w-5" />
                <span>Wind: 12 km/h</span>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                <span>Feels like: 34°C</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5-day forecast */}
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">5-Day Forecast</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {forecast.map((day) => {
            const Icon = day.icon;
            return (
              <Card key={day.day} className="shadow-soft text-center">
                <CardContent className="p-4 space-y-2">
                  <p className="font-semibold text-foreground">{day.day}</p>
                  <Icon className="h-10 w-10 mx-auto text-warning" />
                  <p className="text-2xl font-bold text-foreground">{day.temp}</p>
                  <p className="text-xs text-muted-foreground">{day.condition}</p>
                  <div className="flex justify-center gap-2 text-xs text-muted-foreground">
                    <span>💧 {day.humidity}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Farming tips */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="font-display">🌱 Farming Tips Based on Weather</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tips.map((tip) => (
            <div key={tip.condition} className="flex gap-3 p-3 rounded-lg bg-muted/50">
              <div className="font-semibold text-foreground min-w-[120px]">{tip.condition}</div>
              <p className="text-sm text-muted-foreground">{tip.tip}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
