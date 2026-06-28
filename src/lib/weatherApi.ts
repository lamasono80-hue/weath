import { WeatherData, WeatherCondition, HourlyForecast, DailyForecast } from '../types';

export const CITY_COORDINATES: Record<string, { lat: number, lon: number, country: string }> = {
  'Hà Nội': { lat: 21.0285, lon: 105.8542, country: 'Việt Nam' },
  'TP. Hồ Chí Minh': { lat: 10.8231, lon: 106.6297, country: 'Việt Nam' },
  'Đồng Nai': { lat: 10.9575, lon: 106.8427, country: 'Việt Nam' },
  'Đà Nẵng': { lat: 16.0544, lon: 108.2022, country: 'Việt Nam' },
  'Sa Pa': { lat: 22.3364, lon: 103.8438, country: 'Việt Nam' },
  'Nha Trang': { lat: 12.2388, lon: 109.1967, country: 'Việt Nam' },
  'Tokyo': { lat: 35.6895, lon: 139.6917, country: 'Nhật Bản' },
  'Paris': { lat: 48.8566, lon: 2.3522, country: 'Pháp' },
};

// Map Open-Meteo WMO weather codes to our simplified conditions
function mapWeatherCode(code: number): WeatherCondition {
  // Open-Meteo WMO codes
  if (code === 0 || code === 1) return 'sunny';
  if (code === 2 || code === 3) return 'cloudy';
  if (code >= 45 && code <= 48) return 'cloudy'; // Fog
  if (code >= 51 && code <= 67) return 'rainy'; // Drizzle / Rain
  if (code >= 71 && code <= 77) return 'snowy'; // Snow
  if (code >= 80 && code <= 82) return 'rainy'; // Rain showers
  if (code >= 85 && code <= 86) return 'snowy'; // Snow showers
  if (code >= 95 && code <= 99) return 'stormy'; // Thunderstorm
  return 'sunny';
}

function getWeatherDescription(condition: WeatherCondition): string {
  switch (condition) {
    case 'sunny': return 'Trời quang mây tạnh, có nắng chói chang';
    case 'cloudy': return 'Trời nhiều mây, râm mát dễ chịu';
    case 'rainy': return 'Có mưa rào và rải rác ở một vài nơi';
    case 'stormy': return 'Có dông sét, sấm chớp và mưa to';
    case 'snowy': return 'Trời có tuyết, rét đậm rét hại';
    case 'windy': return 'Nhiều gió lớn, không khí mát mẻ';
    default: return 'Thời tiết bình thường';
  }
}

export async function fetchWeatherData(city: string, lat: number, lon: number, apiKey?: string): Promise<WeatherData> {
  const activeKey = apiKey || import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (activeKey) {
    try {
      return await fetchOpenWeatherMapData(city, lat, lon, activeKey);
    } catch (error) {
      console.warn('OpenWeatherMap API failed, falling back to Open-Meteo', error);
      // Fallback to Open-Meteo
    }
  }
  
  return fetchOpenMeteoData(city, lat, lon);
}

async function fetchOpenWeatherMapData(city: string, lat: number, lon: number, apiKey: string): Promise<WeatherData> {
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=vi`;
  
  const [currentRes, forecastRes] = await Promise.all([
    fetch(currentUrl),
    fetch(forecastUrl)
  ]);
  
  if (!currentRes.ok || !forecastRes.ok) {
    throw new Error('Lỗi khi tải dữ liệu thời tiết từ OpenWeatherMap');
  }
  
  const currentData = await currentRes.json();
  const forecastData = await forecastRes.json();
  
  const mapOwmCode = (id: number): WeatherCondition => {
    if (id >= 200 && id < 300) return 'stormy';
    if (id >= 300 && id < 600) return 'rainy';
    if (id >= 600 && id < 700) return 'snowy';
    if (id >= 700 && id < 800) return 'cloudy'; // Fog, mist, etc.
    if (id === 800) return 'sunny';
    if (id > 800) return 'cloudy';
    return 'sunny';
  };
  
  const currentCondition = mapOwmCode(currentData.weather[0].id);
  const currentTemp = Math.round(currentData.main.temp);
  const humidity = currentData.main.humidity;
  const pressure = currentData.main.pressure;
  const windSpeed = Math.round(currentData.wind.speed * 3.6); // Convert m/s to km/h roughly for compatibility
  
  const hourly: HourlyForecast[] = [];
  for (let i = 0; i < 8; i++) { // Next 24 hours (8 * 3 hours)
    if (!forecastData.list[i]) break;
    const item = forecastData.list[i];
    hourly.push({
      time: new Date(item.dt * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(item.main.temp),
      icon: mapOwmCode(item.weather[0].id),
      rainProb: Math.round((item.pop || 0) * 100),
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      uvIndex: 0 // Not available in free tier 2.5
    });
  }
  
  // Aggregate daily from 3-hour chunks
  const daily: DailyForecast[] = [];
  const daysMap = new Map<string, any>();
  
  for (const item of forecastData.list) {
    const dateObj = new Date(item.dt * 1000);
    const dayStr = dateObj.toLocaleDateString('vi-VN', { weekday: 'short' });
    const dateStr = dateObj.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
    const key = dateStr;
    
    if (!daysMap.has(key)) {
      daysMap.set(key, {
        day: daysMap.size === 0 ? 'Hôm nay' : dayStr,
        date: dateStr,
        temps: [],
        codes: [],
        pops: []
      });
    }
    
    const dayData = daysMap.get(key);
    dayData.temps.push(item.main.temp);
    dayData.codes.push(item.weather[0].id);
    dayData.pops.push(item.pop || 0);
  }
  
  for (const dayData of Array.from(daysMap.values()).slice(0, 5)) {
    const tempMin = Math.round(Math.min(...dayData.temps));
    const tempMax = Math.round(Math.max(...dayData.temps));
    // Find most frequent weather code or use the first one
    const mainCode = dayData.codes[Math.floor(dayData.codes.length / 2)]; 
    const maxPop = Math.round(Math.max(...dayData.pops) * 100);
    
    daily.push({
      day: dayData.day,
      date: dayData.date,
      tempMin,
      tempMax,
      condition: mapOwmCode(mainCode),
      icon: mapOwmCode(mainCode),
      rainProb: maxPop,
      humidity: 70, 
      uvIndex: 0
    });
  }
  
  const countryInfo = CITY_COORDINATES[city]?.country || 'Đang cập nhật';

  return {
    city,
    country: countryInfo,
    temp: currentTemp,
    feelsLike: Math.round(currentData.main.feels_like),
    humidity,
    windSpeed,
    uvIndex: 0,
    airQuality: 'Tốt',
    airQualityDesc: 'Dữ liệu không khí không khả dụng trong API này.',
    airQualityCode: 30,
    pressure: Math.round(pressure),
    condition: currentCondition,
    description: currentData.weather[0].description.charAt(0).toUpperCase() + currentData.weather[0].description.slice(1),
    aiAdvice: 'Dữ liệu thời tiết theo thời gian thực từ OpenWeatherMap. Chúc bạn một ngày tốt lành!',
    hourly,
    daily
  };
}

async function fetchOpenMeteoData(city: string, lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,weathercode,surface_pressure,uv_index&daily=weathercode,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Lỗi khi tải dữ liệu thời tiết');
  }
  
  const data = await response.json();
  
  const currentCondition = mapWeatherCode(data.current_weather.weathercode);
  const currentTemp = Math.round(data.current_weather.temperature);
  const currentWindSpeed = Math.round(data.current_weather.windspeed);
  
  // Find current hour index to extract current humidity, UV, etc.
  const currentHour = new Date().getHours();
  const currentHourlyIndex = data.hourly.time.findIndex((t: string) => new Date(t).getHours() === currentHour) || 0;
  
  const humidity = data.hourly.relativehumidity_2m[currentHourlyIndex] || 60;
  const uvIndex = data.hourly.uv_index[currentHourlyIndex] || 0;
  const pressure = data.hourly.surface_pressure[currentHourlyIndex] || 1013;
  
  // Map hourly
  const hourly: HourlyForecast[] = [];
  for (let i = currentHourlyIndex; i < currentHourlyIndex + 24; i += 3) {
    if (i >= data.hourly.time.length) break;
    hourly.push({
      time: new Date(data.hourly.time[i]).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(data.hourly.temperature_2m[i]),
      icon: mapWeatherCode(data.hourly.weathercode[i]),
      rainProb: data.hourly.precipitation_probability[i],
      humidity: data.hourly.relativehumidity_2m[i],
      pressure: data.hourly.surface_pressure[i],
      uvIndex: data.hourly.uv_index[i]
    });
  }

  // Map daily
  const daily: DailyForecast[] = [];
  for (let i = 0; i < 7; i++) {
    if (i >= data.daily.time.length) break;
    const dateObj = new Date(data.daily.time[i]);
    const dayStr = i === 0 ? 'Hôm nay' : dateObj.toLocaleDateString('vi-VN', { weekday: 'short' });
    const dateStr = dateObj.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
    
    daily.push({
      day: dayStr,
      date: dateStr,
      tempMin: Math.round(data.daily.temperature_2m_min[i]),
      tempMax: Math.round(data.daily.temperature_2m_max[i]),
      condition: mapWeatherCode(data.daily.weathercode[i]),
      icon: mapWeatherCode(data.daily.weathercode[i]),
      rainProb: data.daily.precipitation_probability_max[i],
      humidity: 70, // Fallback since not in daily
      uvIndex: Math.round(data.daily.uv_index_max[i]) || 0
    });
  }

  const countryInfo = CITY_COORDINATES[city]?.country || 'Đang cập nhật';

  return {
    city,
    country: countryInfo,
    temp: currentTemp,
    feelsLike: currentTemp + 2, // Approximation
    humidity,
    windSpeed: currentWindSpeed,
    uvIndex: Math.round(uvIndex),
    airQuality: 'Tốt',
    airQualityDesc: 'Chất lượng không khí an toàn theo dữ liệu mô phỏng.',
    airQualityCode: 30,
    pressure: Math.round(pressure),
    condition: currentCondition,
    description: getWeatherDescription(currentCondition),
    aiAdvice: 'Dữ liệu thời tiết theo thời gian thực từ Open-Meteo. Hãy chú ý giữ gìn sức khoẻ tuỳ theo nhiệt độ và độ ẩm hiện tại nhé!',
    hourly,
    daily
  };
}
