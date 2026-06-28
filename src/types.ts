export interface HourlyForecast {
  time: string;
  temp: number;
  icon: string;
  rainProb: number;
  humidity: number;
  pressure?: number;
  uvIndex?: number;
}

export interface DailyForecast {
  day: string;
  date: string;
  tempMin: number;
  tempMax: number;
  condition: WeatherCondition;
  icon: string;
  rainProb: number;
  humidity: number;
  uvIndex: number;
}

export type WeatherCondition = 'sunny' | 'rainy' | 'cloudy' | 'stormy' | 'snowy' | 'windy';

export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  airQuality: string;
  airQualityDesc: string;
  airQualityCode: number; // AQI index
  pressure: number;
  condition: WeatherCondition;
  description: string;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  aiAdvice: string;
}

export interface UserProfile {
  email: string;
  phone?: string;
  name: string;
  avatarUrl: string;
  isLoggedIn: boolean;
  provider?: 'email' | 'phone' | 'google' | 'facebook';
}

export interface WeatherSettings {
  tempUnit: 'C' | 'F';
  windSpeedUnit: 'km/h' | 'm/s';
  pushEnabled: boolean;
  openWeatherApiKey?: string;
}

export interface WeatherNotification {
  id: string;
  title: string;
  content: string;
  time: string;
  type: 'danger' | 'warning' | 'info';
  read: boolean;
}

export type ThemeMode = 'deep' | 'pastel';

