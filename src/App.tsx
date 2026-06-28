import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun,
  Moon,
  Search,
  Sparkles,
  CloudLightning,
  CloudRain,
  Snowflake,
  Wind,
  Cloud,
  MapPin,
  Compass,
  AlertCircle,
  ArrowRight,
  HelpCircle,
  Heart,
  Settings,
  Bell,
  Navigation,
  User,
  LogOut,
  ShieldAlert,
  Loader2,
  Trash2,
  Bookmark,
  ExternalLink,
  X,
  Calendar
} from 'lucide-react';
import { CITIES_DATA, PRESET_CITIES } from './data';
import { HourlyForecast, ThemeMode, WeatherCondition, UserProfile, WeatherNotification, WeatherSettings, WeatherData } from './types';
import GlassCard from './components/GlassCard';
import WeatherHero from './components/WeatherHero';
import StatsGrid from './components/StatsGrid';
import WeeklyForecast from './components/WeeklyForecast';
import AiAdvisor from './components/AiAdvisor';
import AiForecastSummary from './components/AiForecastSummary';
import AuthModal from './components/AuthModal';
import WeatherBgParticles from './components/WeatherBgParticles';
import AiPet from './components/AiPet';
import { supabase } from './lib/supabase';

const WeatherChart = lazy(() => import('./components/WeatherChart'));
const TechnicalWeatherChart = lazy(() => import('./components/TechnicalWeatherChart'));
const AiChatbot = lazy(() => import('./components/AiChatbot'));

// Helper for lightweight haptic feedback
const triggerHaptic = () => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10); // Very short tap
  }
};

import { CITY_COORDINATES } from './lib/weatherApi';

export default function App() {
  // Navigation tabs: 'weather' | 'favorites' | 'alerts' | 'settings'
  const [activeTab, setActiveTab] = useState<'weather' | 'favorites' | 'alerts' | 'settings'>('weather');
  const [selectedCity, setSelectedCity] = useState<string>('Hà Nội');
  const [themeMode, setThemeMode] = useState<ThemeMode>('deep');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [scrubbedHour, setScrubbedHour] = useState<HourlyForecast | null>(null);
  const [conditionOverride, setConditionOverride] = useState<WeatherCondition | null>(null);

  // Auth and modal states
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // App Settings (Temp unit and wind unit)
  const [appSettings, setAppSettings] = useState<WeatherSettings>(() => {
    const saved = localStorage.getItem('weather_settings');
    return saved ? JSON.parse(saved) : { tempUnit: 'C', windSpeedUnit: 'km/h', pushEnabled: true };
  });

  // Favorites states
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorite_cities');
    return saved ? JSON.parse(saved) : ['Hà Nội', 'TP. Hồ Chí Minh'];
  });

  // GPS States
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCityData, setGpsCityData] = useState<WeatherData | null>(null);

  // Alert and Notifications
  const [notifications, setNotifications] = useState<WeatherNotification[]>(() => {
    const saved = localStorage.getItem('weather_alerts');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'init-1',
        title: 'Cảnh báo Tia Cực Tím nguy hiểm',
        content: 'Chỉ số tia UV chạm ngưỡng 11+ tại TP. Hồ Chí Minh và các tỉnh phía Nam từ 11:00 đến 14:00 ngày hôm nay. Hạn chế tiếp xúc mắt và da trực tiếp ngoài trời.',
        time: 'Hôm nay lúc 10:15',
        type: 'danger',
        read: false
      },
      {
        id: 'init-2',
        title: 'Giông nhiệt và gió lốc cục bộ',
        content: 'Do mây ẩm phát triển mạnh sau nắng nóng hanh dài ngày, nguy cơ dông sét cao xuất hiện vào chiều muộn tại các vùng ven biển Đà Nẵng, Nha Trang.',
        time: 'Hôm nay lúc 08:30',
        type: 'warning',
        read: false
      },
      {
        id: 'init-3',
        title: 'Chất lượng không khí (AQI) suy giảm',
        content: 'Khu vực nội thành Hà Nội ghi nhận mật độ bụi mịn PM2.5 tăng nhẹ lúc sáng sớm. Khuyến nghị nhóm người nhạy cảm đeo khẩu trang chất lượng khi tập dưỡng sinh.',
        time: 'Hôm nay lúc 06:12',
        type: 'info',
        read: true
      }
    ];
  });

  // Interactive Live Toast Alert state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'danger' | 'info'; description?: string } | null>(null);
  const [isChatBoxFloatingOpen, setIsChatBoxFloatingOpen] = useState(false);
  const [isHeroFullscreen, setIsHeroFullscreen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingGpsData, setPendingGpsData] = useState<{lat: number, lon: number, data: WeatherData} | null>(null);

  // Guard persistence changes & sync to Supabase Cloud
  useEffect(() => {
    localStorage.setItem('weather_settings', JSON.stringify(appSettings));
    
    const syncSettings = async () => {
      if (userProfile?.email) {
        try {
          const { error } = await supabase.from('user_settings').upsert([
            { 
              email: userProfile.email, 
              temp_unit: appSettings.tempUnit, 
              wind_speed_unit: appSettings.windSpeedUnit,
              push_enabled: appSettings.pushEnabled,
              updated_at: new Date()
            }
          ], { onConflict: 'email' });
          if (error) console.log("Gợi ý cho Supabase: Bảng 'user_settings' chưa được tạo hoặc:", error.message);
        } catch (e) {
          console.warn(e);
        }
      }
    };
    syncSettings();
  }, [appSettings, userProfile]);

  useEffect(() => {
    localStorage.setItem('favorite_cities', JSON.stringify(favorites));

    const syncFavorites = async () => {
      if (userProfile?.email) {
        try {
          const { error } = await supabase.from('user_favorites').upsert([
            { 
              email: userProfile.email, 
              favorites: favorites, 
              updated_at: new Date() 
            }
          ], { onConflict: 'email' });
          if (error) console.log("Gợi ý cho Supabase: Bảng 'user_favorites' chưa được tạo hoặc:", error.message);
        } catch (e) {
          console.warn(e);
        }
      }
    };
    syncFavorites();
  }, [favorites, userProfile]);

  useEffect(() => {
    localStorage.setItem('weather_alerts', JSON.stringify(notifications));

    const syncNotifications = async () => {
      if (userProfile?.email) {
        try {
          const { error } = await supabase.from('weather_alerts').upsert([
            { 
              email: userProfile.email, 
              alerts: notifications, 
              updated_at: new Date() 
            }
          ], { onConflict: 'email' });
          if (error) console.log("Gợi ý cho Supabase: Bảng 'weather_alerts' chưa được tạo hoặc:", error.message);
        } catch (e) {
          console.warn(e);
        }
      }
    };
    syncNotifications();
  }, [notifications, userProfile]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('user_profile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('user_profile');
    }
  }, [userProfile]);

  // Load cloud data from Supabase when user logs in
  useEffect(() => {
    if (!userProfile?.email) return;

    const loadCloudData = async () => {
      try {
        // 1. Fetch favorites
        const { data: favData } = await supabase
          .from('user_favorites')
          .select('favorites')
          .eq('email', userProfile.email)
          .maybeSingle();
        if (favData && Array.isArray(favData.favorites)) {
          setFavorites(favData.favorites);
          showToast('Đã đồng bộ Danh sách Yêu thích từ Supabase Cloud! ☁️', 'success');
        }

        // 2. Fetch settings
        const { data: setVal } = await supabase
          .from('user_settings')
          .select('temp_unit, wind_speed_unit, push_enabled')
          .eq('email', userProfile.email)
          .maybeSingle();
        if (setVal) {
          setAppSettings(prev => ({
            ...prev,
            tempUnit: setVal.temp_unit || prev.tempUnit,
            windSpeedUnit: setVal.wind_speed_unit || prev.windSpeedUnit,
            pushEnabled: setVal.push_enabled !== undefined ? setVal.push_enabled : prev.pushEnabled
          }));
        }

        // 3. Fetch notifications
        const { data: noteVal } = await supabase
          .from('weather_alerts')
          .select('alerts')
          .eq('email', userProfile.email)
          .maybeSingle();
        if (noteVal && Array.isArray(noteVal.alerts)) {
          setNotifications(noteVal.alerts);
        }
      } catch (e) {
        console.warn("Supabase load cloud data warning:", e);
      }
    };

    loadCloudData();
  }, [userProfile?.email]);

  // Ngay khi ứng dụng khởi chạy (launch), tự động yêu cầu quyền truy cập GPS
  useEffect(() => {
    handleGPSLocation(true);
  }, []);

  // Request Notification Permission on mount and register service worker
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
    
    // Register Service Worker for offline/background push notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      }).catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }
  }, []);

  const sendBrowserNotification = (title: string, body: string) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((registration) => {
        const options: NotificationOptions = {
          body,
          icon: '/vite.svg',
          badge: '/vite.svg',
          requireInteraction: true,
          ...( { vibrate: [200, 100, 200, 100, 200, 100, 200] } as any )
        };
        registration.showNotification(title, options);
      }).catch(() => {
        // Fallback for when no service worker is active
        new Notification(title, { body });
      });
    }
  };

  // Create Toast Trigger helper
  const showToast = (message: string, type: 'success' | 'warning' | 'danger' | 'info', description?: string) => {
    setToast({ message, type, description });
    setTimeout(() => {
      setToast(null);
    }, 5500);
  };

  // Real API integration state
  const [baseWeatherData, setBaseWeatherData] = useState<WeatherData>(CITIES_DATA['Hà Nội']);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    if (selectedCity === 'Vị Trí Định Vị GPS' && gpsCityData) {
      setBaseWeatherData(gpsCityData);
      return;
    }

    const fetchWeather = async () => {
      setIsFetchingWeather(true);
      try {
        const { CITY_COORDINATES, fetchWeatherData } = await import('./lib/weatherApi');
        const coords = CITY_COORDINATES[selectedCity] || CITY_COORDINATES['Hà Nội'];
        const data = await fetchWeatherData(selectedCity, coords.lat, coords.lon, appSettings.openWeatherApiKey);
        if (isMounted) {
          setBaseWeatherData(data);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Failed to fetch real weather:', error);
        // Fallback to local data on error
        if (isMounted) {
          setBaseWeatherData(CITIES_DATA[selectedCity] || CITIES_DATA['Hà Nội']);
        }
      } finally {
        if (isMounted) {
          setIsFetchingWeather(false);
        }
      }
    };

    fetchWeather();

    return () => {
      isMounted = false;
    };
  }, [selectedCity, gpsCityData, appSettings.openWeatherApiKey]);

  // Combine base data with dynamic sim overrides
  const weatherData = useMemo(() => {
    if (!conditionOverride) {
      return baseWeatherData;
    }

    const overrideTemplates: { [key in WeatherCondition]: { desc: string; advice: string } } = {
      sunny: {
        desc: 'Trời nắng gắt chói chang, bức xạ nhiệt rất mạnh',
        advice: 'Nước lọc và kem chống nắng là vật bất ly thân lúc này. Hãy mang theo kính mát râm và mũ rơm rộng vành dạo bước.'
      },
      rainy: {
        desc: 'Mưa rào xối xả liên tục kèm dông dốc nước giảm nhiệt',
        advice: 'Bầu trời đầy mưa tầm tã dễ gây ngập úng. Chuẩn bị áo mưa hoặc ô dày chịu lực trước khi sải bước ra phố.'
      },
      cloudy: {
        desc: 'Nhiều đám mây tích nước dầy che phủ, mát lạnh',
        advice: 'Nhiệt độ hạ nhiệt lý tưởng, ít có nắng gắt khó chịu. Thích hợp đi dạo ngoài trời hoặc nhâm nhi ly trà xanh nóng.'
      },
      stormy: {
        desc: 'Sấm chớp giông sét đùng đoàng đe dọa trực tiếp diện rộng',
        advice: 'Nguy cơ sấm chớp giông lốc cao! Hãy rút phích điện máy tính, trú ngụ tòa nhà kiên cố, hạn chế chạy xe tốc độ cao.'
      },
      snowy: {
        desc: 'Bông tuyết trắng xốp kết hạt phủ trắng núi đồi hoang vu',
        advice: 'Trời buốt giá âm độ nguy hiểm! Cần mặc áo măng tô lót lông cừu, giữ ấm chân, tránh tuyết tan làm ướt giày sưởi.'
      },
      windy: {
        desc: 'Gió lốc thốc cuốn bụi mạnh từng cơn, cát bụi mù mịt',
        advice: 'Lực gió thổi mạnh dễ quật ngã vật cản mỏng. Nên đeo kính bảo vệ mắt, hạn chế di chuyển gần công trường cao tầng.'
      }
    };

    const tempDelta: { [key in WeatherCondition]: number } = {
      sunny: 5,
      rainy: -3,
      cloudy: -1,
      stormy: -4,
      snowy: -15,
      windy: -2
    };

    return {
      ...baseWeatherData,
      condition: conditionOverride,
      temp: baseWeatherData.temp + tempDelta[conditionOverride],
      description: overrideTemplates[conditionOverride].desc,
      aiAdvice: overrideTemplates[conditionOverride].advice
    };
  }, [baseWeatherData, conditionOverride]);

  // Refetch mechanic
  const refetchWeather = async () => {
    setIsRefreshing(true);
    try {
      if (selectedCity === 'Vị Trí Định Vị GPS' && gpsCityData) {
        setBaseWeatherData(gpsCityData);
      } else {
        const { CITY_COORDINATES, fetchWeatherData } = await import('./lib/weatherApi');
        const coords = CITY_COORDINATES[selectedCity] || CITY_COORDINATES['Hà Nội'];
        const data = await fetchWeatherData(selectedCity, coords.lat, coords.lon, appSettings.openWeatherApiKey);
        setBaseWeatherData(data);
      }
      setLastUpdated(new Date());
      showToast('Đã cập nhật dữ liệu thời tiết mới nhất', 'success');
    } catch (error) {
      console.error('Failed to refetch:', error);
      showToast('Không thể cập nhật dữ liệu, vui lòng thử lại sau', 'danger');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // 15 minutes interval
    const intervalId = setInterval(() => {
      refetchWeather();
    }, 15 * 60 * 1000);

    // Refresh on tab visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetchWeather();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedCity, gpsCityData, appSettings.openWeatherApiKey]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 't') {
        setActiveTab('weather');
      } else if (key === 'y') {
        setActiveTab('favorites');
      } else if (key === 'c') {
        setActiveTab('settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Report weather data to Supabase 24/7 (every 5 minutes)
  useEffect(() => {
    if (!weatherData) return;
    
    const reportData = async () => {
      try {
        const { error } = await supabase.from('weather_logs').insert([
          { 
            city: weatherData.city, 
            temp: weatherData.temp, 
            condition: weatherData.condition, 
            description: weatherData.description,
            humidity: weatherData.humidity
          }
        ]);
        if (error) {
          console.warn("Table may not exist or error:", error.message);
        }
        console.log("Đã gửi báo cáo thời tiết 24/7 lên Supabase:", weatherData.city);
      } catch (err) {
        console.error("Lỗi khi gửi báo cáo weather 24/7", err);
      }
    };

    // Report immediately once when weatherData changes
    reportData();
    
    // Repeat every 1 minute
    const interval = setInterval(reportData, 60000);
    return () => clearInterval(interval);
  }, [weatherData]);

  // Handle GPS location auto-detect
  const handleGPSLocation = (isAuto = false) => {
    setGpsLoading(true);
    if (!isAuto) {
      showToast('Ăng ten GPS đang kích hoạt...', 'success', 'Yêu cầu định vị vệ tinh màng mọc');
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          setTimeout(() => {
            // Priority: Real coordinate-derived weather screen (Long Bình, Đồng Nai as requested showcase)
            const reference = CITIES_DATA['Đồng Nai'] || CITIES_DATA['TP. Hồ Chí Minh'];
            const customGpsData: WeatherData = {
              ...reference,
              city: 'Long Bình, Đồng Nai',
              country: 'Định vị GPS thực tế',
              description: `Khí hậu tại tọa độ ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E (Long Bình, Đồng Nai)`,
              aiAdvice: 'Hệ thống đã nhận diện định vị GPS thành công. Thời tiết tại Long Bình, Đồng Nai đang được đồng bộ theo thời gian thực phù hợp với tọa độ thiết bị của bạn.'
            };

            setGpsLoading(false);
            // Instead of auto-switch, prompt the user
            setPendingGpsData({ lat, lon, data: customGpsData });
          }, 1500);
        },
        (error) => {
          // Fallback: If permission denied/failed, show Đồng Nai weather directly
          setTimeout(() => {
            setGpsLoading(false);
            if (!isAuto) {
              setGpsCityData(null);
              setSelectedCity('Đồng Nai');
              setActiveTab('weather');
              showToast('Quyền GPS bị từ chối / Không tìm thấy tín hiệu.', 'warning', 'Tự động hiển thị thời tiết Đồng Nai dự phòng.');
            }
          }, 1500);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGpsLoading(false);
      setSelectedCity('Đồng Nai');
      showToast('Trình duyệt không hỗ trợ định vị GPS. Đang sử dụng chế độ dự phòng Đồng Nai.', 'danger');
    }
  };

  const acceptGpsLocation = () => {
    if (pendingGpsData) {
      setGpsCityData(pendingGpsData.data);
      setSelectedCity('Vị Trí Định Vị GPS');
      setActiveTab('weather');
      showToast('Đã định vị GPS thành công!', 'success', `Vị trí: ${pendingGpsData.data.city} (${pendingGpsData.lat.toFixed(3)}°N, ${pendingGpsData.lon.toFixed(3)}°E)`);
      setPendingGpsData(null);
    }
  };

  const declineGpsLocation = () => {
    setPendingGpsData(null);
  };

  // Filter cities for search dropdown
  const filteredCities = useMemo(() => {
    if (!searchQuery) return PRESET_CITIES;
    return PRESET_CITIES.filter((city) =>
      city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
    setSearchQuery('');
    setIsSearchFocused(false);
    setConditionOverride(null); // Clear overrides
    setScrubbedHour(null);
    showToast(`Đã chuyển thành phố: ${city}`, 'success');
  };

  // Add / Remove from Favorites manager
  const toggleFavorite = (cityName: string) => {
    if (favorites.includes(cityName)) {
      setFavorites(favorites.filter(c => c !== cityName));
      showToast(`Đã xóa khỏi danh sách yêu thích`, 'warning', cityName);
    } else {
      setFavorites([...favorites, cityName]);
      showToast(`Đã thêm vào danh sách yêu thích thành công!`, 'success', cityName);
    }
  };

  // Simulate pushing a new emergency weather notification
  const triggerDemoAlert = () => {
    const alertTitles = [
      'Khẩn cấp: Bão Nhiệt Đới áp sát biển Đông',
      'Cảnh báo: Chỉ số chất lượng bụi mịn đạt đỉnh',
      'Cảnh báo: Sương mù băng tuyết đột biến',
      'Đại tiệc Nắng nóng cực đoan lên tới 39 độ'
    ];
    const alertContents = [
      'Áp thấp nhiệt đới mạnh dần thành bão số 2 có thể đổ bộ trực diện bờ biển miền Trung đêm nay. Gió mạnh giật cấp 12 nguy hiểm.',
      'Độ ẩm tương đối tăng cao tụ khí khói xói mòn tầm nhìn xuống 10% tại các trục đường đại lộ huyết mạch. Khuyến cáo mang kính đầy đủ.',
      'Nhiệt độ đồi núi rớt sâu xuống dưới âm độ gây đóng băng trơn trượt trên đèo dốc Ô Quy Hồ, Sa Pa. Phương tiện đi chuyển hết sức cẩn thận.',
      'Sự hội tụ khí nóng lục địa kéo nền nhiệt dâng cao tối đa vào giữa trưa lúc 12:30. Chú ý bổ sung chất khoáng dồi dào.'
    ];
    const types: ('danger' | 'warning' | 'info')[] = ['danger', 'warning', 'info', 'warning'];

    const randomIndex = Math.floor(Math.random() * alertTitles.length);
    const newAlert: WeatherNotification = {
      id: `alert-${Date.now()}`,
      title: alertTitles[randomIndex],
      content: alertContents[randomIndex],
      time: 'Vừa xong',
      type: types[randomIndex],
      read: false
    };

    setNotifications([newAlert, ...notifications]);

    // Push Toast Alert
    showToast(newAlert.title, newAlert.type, newAlert.content);
    
    // Web Push Notification if danger
    if (newAlert.type === 'danger') {
      sendBrowserNotification(newAlert.title, newAlert.content);
    }
  };

  const markAllAlertsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    showToast('Đã đọc toàn bộ cảnh báo', 'success');
  };

  const deleteAlert = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    showToast('Đã xóa thông báo cảnh báo', 'warning');
  };

  // Unread badge count helper
  const unreadAlertsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Select super friendly, weather-aware backgrounds for a cozy, alive aesthetic
  const getDynamicBackground = (cond: WeatherCondition, mode: ThemeMode) => {
    if (mode === 'deep') {
      switch (cond) {
        case 'sunny':
          return 'bg-gradient-to-br from-[#0c1c3c] via-[#152e60] to-[#254580] text-slate-100'; // Amber sunrise deep blue
        case 'rainy':
          return 'bg-gradient-to-br from-[#09152b] via-[#0d1e3d] to-[#152c52] text-slate-100'; // Refreshing dynamic blue rain deep
        case 'stormy':
          return 'bg-gradient-to-br from-[#050b1a] via-[#0b1329] to-[#1a1435] text-slate-100'; // Thunderstorm deep slate navy
        case 'cloudy':
          return 'bg-gradient-to-br from-[#0a1024] via-[#111e3b] to-[#1d2d52] text-slate-100'; // Indigo-tinted cloud-cover
        case 'snowy':
          return 'bg-gradient-to-br from-[#0b172d] via-[#1b2d4c] to-[#2b426b] text-slate-100'; // Glacial crystalline blue deep
        case 'windy':
          return 'bg-gradient-to-br from-[#0a1832] via-[#14264f] to-[#203a74] text-slate-100'; // Active currents deep backdrop
        default:
          return 'bg-gradient-to-br from-[#030712] via-[#091535] to-[#12102e] text-slate-100';
      }
    } else {
      switch (cond) {
        case 'sunny':
          return 'bg-gradient-to-br from-[#fffbeb] via-[#fed7aa] to-[#bfdbfe] text-slate-900'; // Warm morning light, pastel nectarine & beautiful spring blue sky!
        case 'rainy':
          return 'bg-gradient-to-br from-[#e0f2fe] via-[#f1f5f9] to-[#dbeafe] text-slate-800'; // Calm refreshing morning droplets gradient
        case 'stormy':
          return 'bg-gradient-to-br from-[#cbd5e1] via-[#e2e8f0] to-[#94a3b8] text-slate-800'; // Safe silver-toned stormy atmosphere
        case 'cloudy':
          return 'bg-gradient-to-br from-[#f1f5f9] via-[#e2e8f0] to-[#e4e4e7] text-slate-800'; // Pure bright puffy fluffy cloud cover
        case 'snowy':
          return 'bg-gradient-to-br from-[#ecfeff] via-[#e2e8f0] to-[#f8fafc] text-slate-800'; // Sugary ice crystals pure morning sky
        case 'windy':
          return 'bg-gradient-to-br from-[#f0fdf4] via-[#f3e8ff] to-[#e0f2fe] text-slate-800'; // Mint foliage to breezy sky blue
        default:
          return 'bg-gradient-to-br from-[#fbcfe8]/25 via-[#f3e8ff] to-[#ccfbf1]/25 text-slate-800';
      }
    }
  };

  // Weather condition selectors
  const testWeatherConditions: { cond: WeatherCondition; label: string; color: string }[] = [
    { cond: 'sunny', label: 'Nắng gắt', color: 'bg-amber-400 text-slate-900 border-amber-300' },
    { cond: 'cloudy', label: 'Nhiều Mây', color: 'bg-slate-400 text-white border-slate-300' },
    { cond: 'rainy', label: 'Mưa Rào', color: 'bg-blue-400 text-white border-blue-300' },
    { cond: 'stormy', label: 'Bão Dông', color: 'bg-indigo-600 text-white border-indigo-500' },
    { cond: 'snowy', label: 'Băng Tuyết', color: 'bg-teal-300 text-slate-900 border-teal-200' },
    { cond: 'windy', label: 'Gió Lốc', color: 'bg-emerald-500 text-white border-emerald-400' }
  ];

  return (
    <div
      className={`min-h-screen font-sans transition-all duration-700 ease-out flex flex-col items-center p-4 md:p-8 relative overflow-hidden ${
        getDynamicBackground(weatherData.condition, themeMode)
      }`}
    >
      {/* Dynamic weather-aware particle physics layer */}
      <WeatherBgParticles condition={weatherData.condition} humidity={weatherData.humidity} />

      {/* Decorative ambient blurred layout circles */}
      <div className="absolute inset-x-0 top-0 h-[500px] pointer-events-none overflow-hidden">
        {themeMode === 'deep' ? (
          <>
            <motion.div
              animate={{ x: [-100, 100, -100], y: [-50, 50, -50], rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
              className="absolute top-10 left-[15%] w-96 h-96 rounded-full bg-blue-900/40 blur-3xl filter opacity-60"
            />
            <motion.div
              animate={{ x: [100, -100, 100], y: [100, -100, 100], rotate: -360 }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
              className="absolute top-1/3 right-[10%] w-80 h-80 rounded-full bg-violet-900/35 blur-3xl filter opacity-50"
            />
            <div className="absolute top-[40%] left-[30%] w-60 h-60 rounded-full bg-emerald-950/25 blur-3xl opacity-40"></div>
          </>
        ) : (
          <>
            <motion.div
              animate={{ x: [-70, 70, -70], y: [-30, 30, -30] }}
              transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
              className="absolute top-8 left-[15%] w-96 h-96 rounded-full bg-purple-200/50 blur-3xl opacity-80"
            />
            <motion.div
              animate={{ x: [70, -70, 70], y: [40, -40, 40] }}
              transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
              className="absolute top-1/4 right-[8%] w-80 h-80 rounded-full bg-rose-200/40 blur-3xl opacity-75"
            />
            <div className="absolute top-[50%] left-[40%] w-72 h-72 rounded-full bg-teal-100/30 blur-3xl opacity-70"></div>
          </>
        )}
      </div>

      {/* Floating Global Live Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 z-50 max-w-sm w-full mx-4 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl flex items-start gap-3.5 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100'
                : toast.type === 'danger'
                ? 'bg-rose-950/90 border-rose-500/30 text-rose-100'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/30 text-amber-100'
                : 'bg-indigo-950/90 border-indigo-500/30 text-indigo-100'
            }`}
          >
            <div className="mt-0.5">
              <ShieldAlert className={toast.type === 'success' ? 'text-emerald-400' : toast.type === 'info' ? 'text-indigo-400' : 'text-amber-400'} size={18} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xs">{toast.message}</h4>
              {toast.description && <p className="text-[10px] opacity-85 mt-0.5 leading-relaxed">{toast.description}</p>}
            </div>
            <button onClick={() => setToast(null)} className="text-[10px] opacity-50 hover:opacity-100">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending GPS Confirmation Modal */}
      <AnimatePresence>
        {pendingGpsData && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 z-50 max-w-sm w-full mx-4 rounded-2xl border border-[#FFFF00]/30 p-5 shadow-2xl backdrop-blur-xl bg-slate-900/95"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-[#FFFF00]/20 rounded-full text-[#FFFF00]">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-white">Phát hiện vị trí mới</h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Chúng tôi nhận diện bạn đang ở khu vực <strong>{pendingGpsData.data.city}</strong>. Bạn có muốn xem thông tin thời tiết tại đây thay vì {selectedCity} không?
                </p>
                <div className="flex gap-2 mt-4">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { triggerHaptic(); acceptGpsLocation(); }}
                    className="flex-1 py-2 bg-[#FFFF00] text-slate-900 font-bold text-xs rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    Cập nhật ngay
                  </motion.button>
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { triggerHaptic(); declineGpsLocation(); }}
                    className="flex-1 py-2 bg-white/10 text-white font-semibold text-xs rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Bỏ qua
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="w-full max-w-6xl relative z-10 flex-1 flex flex-col gap-6">
        
        {/* UPPER ROW: Header brand + Theme control */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-2xl ${
              themeMode === 'deep' ? 'bg-[#FFFF00]/10 text-[#FFFF00] border border-[#FFFF00]/20' : 'bg-pink-600/10 text-pink-700 border border-pink-200'
            }`}>
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className={`text-xl font-bold tracking-tight ${themeMode === 'deep' ? 'text-white' : 'text-slate-900'}`}>
                AeroGlass <span className={themeMode === 'deep' ? 'text-[#FFFF00]' : 'text-pink-600'}>Meteo</span>
              </h2>
              <p className="text-[10px] opacity-65 tracking-wider uppercase font-semibold">
                DỰ BÁO THỜI TIẾT THÔNG MINH - KÍNH MỜ GLASSMORPHISM
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick GPS auto detect */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => { triggerHaptic(); handleGPSLocation(false); }}
              disabled={gpsLoading}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all ${
                gpsLoading
                  ? 'bg-slate-800 text-slate-500 border-transparent cursor-not-allowed'
                  : themeMode === 'deep'
                  ? 'bg-[#FFFF00]/10 border-[#FFFF00]/30 text-[#FFFF00] hover:bg-[#FFFF00]/20'
                  : 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100'
              }`}
            >
              {gpsLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-[#FFFF00]" fill={themeMode === 'deep' ? '#FFFF00' : 'currentColor'} />
              )}
              <span>GPS Định Vị</span>
            </motion.button>

            {/* HIGH-END INTERACTIVE THEME TOGGLER */}
            <div className={`flex items-center p-1 rounded-full border ${
              themeMode === 'deep' ? 'bg-slate-950/80 border-white/10' : 'bg-white/75 border-pink-200'
            }`}>
              <button
                onClick={() => setThemeMode('deep')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  themeMode === 'deep'
                    ? 'bg-[#121c3e] border border-cyan-500/20 text-cyan-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Bảng màu Cosmic Navy"
              >
                <Moon size={12} />
                <span className="hidden sm:inline">Vũ Trụ Navy</span>
              </button>
              
              <button
                onClick={() => setThemeMode('pastel')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  themeMode === 'pastel'
                    ? 'bg-rose-50 border border-pink-200 text-pink-600 shadow'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
                title="Yêu cầu từ người dùng: Tông màu Pastel dịu dàng"
              >
                <Sun size={12} />
                <span className="hidden sm:inline">Tông Pastel</span>
              </button>
            </div>
          </div>
        </header>

        {/* INTERACTIVE CENTRAL NAVIGATION TABS */}
        <div className="flex border-b border-white/5 pb-2 text-xs font-bold justify-between sm:justify-start gap-1 sm:gap-4 overflow-x-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { triggerHaptic(); setActiveTab('weather'); }}
            title="Phím tắt: T"
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'weather'
                ? 'bg-white/10 border-b-2 border-[#FFFF00] text-[#FFFF00]'
                : 'opacity-60 hover:opacity-100 hover:bg-white/5'
            }`}
          >
            🌡️ Thời Tiết
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { triggerHaptic(); setActiveTab('favorites'); }}
            title="Phím tắt: Y"
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'bg-white/10 border-b-2 border-[#FFFF00] text-[#FFFF00]'
                : 'opacity-60 hover:opacity-100 hover:bg-white/5'
            }`}
          >
            💖 Địa Điểm Yêu Thích 
            {favorites.length > 0 && (
              <span className="ml-1 bg-red-500 py-0.5 px-1.5 rounded-full text-[9px] text-white font-bold">
                {favorites.length}
              </span>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { triggerHaptic(); setActiveTab('alerts'); }}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'alerts'
                ? 'bg-white/10 border-b-2 border-[#FFFF00] text-[#FFFF00]'
                : 'opacity-60 hover:opacity-100 hover:bg-white/5'
            }`}
          >
            🔔 Hộp Cảnh Báo
            {unreadAlertsCount > 0 && (
              <span className="ml-1 bg-red-500 animate-pulse py-0.5 px-1.5 rounded-full text-[9px] text-white font-bold">
                {unreadAlertsCount}
              </span>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { triggerHaptic(); setActiveTab('settings'); }}
            title="Phím tắt: C"
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-white/10 border-b-2 border-[#FFFF00] text-[#FFFF00]'
                : 'opacity-60 hover:opacity-100 hover:bg-white/5'
            }`}
          >
            ⚙️ Cấu Hình & Tài Khoản
          </motion.button>
        </div>

        {/* WEATHER SEARCH SECTION - Visible under weather tab */}
        {activeTab === 'weather' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập và tìm kiếm thành phố (ví dụ: Nha Trang, Sa Pa, Đà Nẵng, Tokyo...)"
                  className={`w-full py-3.5 pl-11 pr-4 text-xs font-semibold rounded-2xl outline-none border transition-all ${
                    themeMode === 'deep'
                      ? 'bg-slate-900/30 backdrop-blur-xl border-white/10 focus:border-[#FFFF00]/40 text-white placeholder-slate-400 focus:bg-slate-900/50'
                      : 'bg-white/50 backdrop-blur-xl border-pink-200 focus:border-pink-400 text-slate-800 placeholder-slate-400 focus:bg-white/80'
                  }`}
                />
                <Search size={16} className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50" />
              </div>

              <AnimatePresence>
                {isSearchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border p-2 z-50 shadow-2xl backdrop-blur-2xl ${
                      themeMode === 'deep'
                        ? 'bg-[#0f172a]/95 border-white/10 text-white'
                        : 'bg-white/95 border-pink-100 text-slate-800'
                    }`}
                  >
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-40 px-3 py-1">
                      Đồng hạt khu vực hỗ trợ
                    </p>
                    <div className="space-y-0.5 max-h-56 overflow-y-auto">
                      {filteredCities.map((cityName) => (
                        <button
                          key={cityName}
                          onClick={() => handleSelectCity(cityName)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                            themeMode === 'deep'
                              ? 'hover:bg-white/5 text-slate-200 hover:text-white'
                              : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="opacity-50" />
                            {cityName}
                          </span>
                          <span className="text-[10px] opacity-40">
                            {CITY_COORDINATES[cityName]?.country}
                          </span>
                        </button>
                      ))}
                      {filteredCities.length === 0 && (
                        <div className="py-4 text-center text-xs opacity-50">
                          Không tìm thấy thành phố kết hợp nào
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Interactive climate simulation dropdown box */}
            <div className="md:col-span-4 flex items-center gap-1">
              <span className="text-[10px] opacity-60 uppercase tracking-widest hidden lg:inline mr-2 whitespace-nowrap font-bold">
                Mô phỏng:
              </span>
              <div className={`p-1.5 rounded-2xl flex-1 flex items-center justify-between gap-1 overflow-x-auto ${
                themeMode === 'deep' ? 'bg-white/5 border border-white/5' : 'bg-white/30 border border-pink-100/30'
              }`}>
                {testWeatherConditions.slice(0, 4).map((item) => {
                  const isActive = conditionOverride === item.cond;
                  return (
                    <button
                      key={item.cond}
                      onClick={() => setConditionOverride(conditionOverride === item.cond ? null : item.cond)}
                      className={`flex-1 py-1 px-1.5 rounded-lg text-[9px] font-bold text-center border transition-all whitespace-nowrap ${
                        isActive
                          ? `${item.color} scale-102 font-extrabold shadow-sm`
                          : themeMode === 'deep'
                          ? 'bg-slate-900/40 border-transparent text-slate-400 hover:text-white'
                          : 'bg-white/80 border-transparent text-slate-500 hover:text-slate-900'
                      }`}
                      title={`Simulate: ${item.label}`}
                    >
                      {item.label}
                    </button>
                  );
                })}
                {conditionOverride && (
                  <button
                    onClick={() => {
                      setConditionOverride(null);
                      showToast('Đã khôi phục khí hậu tự nhiên', 'success');
                    }}
                    className="px-1.5 py-1 text-[10px] bg-rose-500 text-white rounded-lg font-bold"
                    title="Khôi phục gốc"
                  >
                    X
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RENDER ACTIVE TAP SCREEN VIEW */}
        <AnimatePresence mode="wait">
          {activeTab === 'weather' && (
            <motion.div
              key="weather-view"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* PRIMARY LEFT CORE */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* LARGE HERO CARD */}
                <GlassCard 
                  theme={themeMode} 
                  className={`transition-all duration-500 origin-center ${
                    isHeroFullscreen
                      ? 'fixed inset-0 z-[100] m-0 !rounded-none p-8 md:p-20 flex flex-col justify-center'
                      : 'relative overflow-hidden w-full p-6 md:p-8'
                  }`}
                  onDoubleClick={() => setIsHeroFullscreen(!isHeroFullscreen)}
                >
                  {isHeroFullscreen && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsHeroFullscreen(false);
                      }} 
                      className="absolute top-8 right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-50 transition-all"
                      title="Thoát toàn màn hình"
                    >
                      <X size={24} />
                    </button>
                  )}
                  {/* Heart favorite button placed elegantly */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(weatherData.city);
                    }}
                    className="absolute top-4 left-4 z-20 p-2.5 rounded-full bg-slate-950/20 border border-white/10 text-white hover:bg-slate-950/40 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    title={favorites.includes(weatherData.city) ? 'Xóa khỏi yêu thích' : 'Yêu thích thành phố này'}
                  >
                    <Heart
                      size={18}
                      className={favorites.includes(weatherData.city) ? 'text-red-500 fill-red-500' : 'text-slate-300'}
                    />
                  </button>

                  <div
                    className={`absolute inset-0 bg-gradient-to-tr transition-all duration-700 pointer-events-none opacity-20 ${
                      weatherData.condition === 'sunny'
                        ? 'from-amber-400 via-yellow-500/0 to-amber-300'
                        : weatherData.condition === 'rainy'
                        ? 'from-blue-700 via-sky-600/0 to-slate-800'
                        : weatherData.condition === 'stormy'
                        ? 'from-indigo-900 via-purple-700/0 to-stone-950'
                        : weatherData.condition === 'snowy'
                        ? 'from-teal-300 via-sky-500/0 to-zinc-200'
                        : 'from-slate-600 via-transparent to-slate-800'
                    }`}
                  />

                  {/* Weather Hero section (With dynamic F / C conversion) */}
                  <WeatherHero
                    weather={weatherData}
                    theme={themeMode}
                    currentHourScrub={scrubbedHour ? scrubbedHour.time : null}
                    tempUnit={appSettings.tempUnit}
                    lastUpdated={lastUpdated}
                    isRefreshing={isRefreshing}
                    onRefetch={refetchWeather}
                  />
                </GlassCard>

                {/* BI-AXIAL CHART CLIMATE */}
                <GlassCard theme={themeMode} className="p-6">
                  <Suspense fallback={<div className="h-64 flex flex-col gap-2 items-center justify-center text-sm opacity-50"><span className="animate-spin text-2xl">⏳</span> Đang tải biểu đồ...</div>}>
                    <WeatherChart
                      hourlyData={weatherData.hourly}
                      theme={themeMode}
                      onHoverHour={(hourInfo) => setScrubbedHour(hourInfo)}
                      tempUnit={appSettings.tempUnit}
                    />
                    <TechnicalWeatherChart
                      hourlyData={weatherData.hourly}
                      theme={themeMode}
                      basePressure={weatherData.pressure}
                    />
                  </Suspense>
                </GlassCard>

              </div>

              {/* SECONDARY RIGHT CORE */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* 6 Grid Metrics cards */}
                <StatsGrid
                  weather={weatherData}
                  theme={themeMode}
                  windSpeedUnit={appSettings.windSpeedUnit}
                />

                {/* Tomorrow's Highlight / Overview */}
                {weatherData.daily[1] && (
                  <AiForecastSummary
                    dailyData={weatherData.daily[1]}
                    city={weatherData.city}
                    theme={themeMode}
                  />
                )}

                {/* 7 Days forecast summary */}
                <WeeklyForecast
                  days={weatherData.daily}
                  theme={themeMode}
                  tempUnit={appSettings.tempUnit}
                />

                {/* User Tip indicator */}
                <GlassCard theme={themeMode} className="p-4 flex items-start gap-3 relative">
                  <HelpCircle className="text-emerald-400 flex-shrink-0 mt-0.5" size={16} />
                  <div className="text-[11px] leading-relaxed opacity-85">
                    <p className="font-bold text-xs mb-1">Mẹo nhỏ vệ tinh:</p>
                    <ul className="list-disc pl-3.5 space-y-1 text-slate-400 font-medium">
                      <li>Nhấn vào biểu tượng trái tim góc trên thẻ để ghim thành phố trực tiếp lên tab yêu thích của bạn.</li>
                      <li>Quy đổi đơn vị đo gió, nhiệt kế dễ dàng trong tab Cấu hình ở góc điều hướng phụ.</li>
                    </ul>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* FAVORITES VIEW TAB */}
          {activeTab === 'favorites' && (
            <motion.div
              key="favorites-view"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold">Thành phố được quan tâm</h3>
                  <p className="text-xs opacity-60">Lưu trữ mượt trên bộ nhớ cache thiết bị cá nhân của bạn</p>
                </div>
                
                {favorites.length < PRESET_CITIES.length && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="opacity-70">Gợi ý ghim nhanh:</span>
                    {PRESET_CITIES.filter(c => !favorites.includes(c)).slice(0, 3).map(cityName => (
                      <button
                        key={cityName}
                        onClick={() => toggleFavorite(cityName)}
                        className="py-1 px-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-[10px] font-bold"
                      >
                        + Ghim {cityName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {favorites.length === 0 ? (
                <div className="text-center py-16">
                  <GlassCard theme={themeMode} className="max-w-md mx-auto p-10 flex flex-col items-center">
                    <div className="w-12 h-12 bg-white/5 text-slate-400 border border-white/10 rounded-2xl flex items-center justify-center mb-4">
                      <Bookmark size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-200">Danh Sách Trống</h4>
                    <p className="text-xs opacity-65 mt-2 leading-relaxed">
                      Bạn không lưu thành phố ưu tiên nào cả. Hãy ra trang tìm kiếm thời tiết chính và bấm nút thả tim để ghim mốc nhanh ở đây nha!
                    </p>
                    <button
                      onClick={() => setActiveTab('weather')}
                      className="mt-6 py-2 px-5 bg-gradient-to-r from-[#FFFF00] to-emerald-400 text-slate-900 rounded-xl text-xs font-bold shadow-lg"
                    >
                      Tìm kiếm điểm đến thôi
                    </button>
                  </GlassCard>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {favorites.map((cityName) => {
                    const country = CITY_COORDINATES[cityName]?.country || 'Đang cập nhật';

                    return (
                      <div key={cityName}>
                        <GlassCard
                          theme={themeMode}
                          className="p-5 relative group border hover:border-lime-500/20 hover:scale-102 transition-all flex flex-col justify-between"
                        >
                          {/* Top banner */}
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider bg-white/5 border border-white/5 px-2 py-0.5 rounded text-slate-400">
                                {country}
                              </span>
                              <h4
                                onClick={() => {
                                  setSelectedCity(cityName);
                                  setActiveTab('weather');
                                }}
                                className="text-base font-extrabold mt-1.5 cursor-pointer hover:text-[#FFFF00] flex items-center gap-1.5 transition-colors"
                              >
                                {cityName}
                                <ExternalLink size={12} className="opacity-40" />
                              </h4>
                            </div>

                            <button
                              onClick={() => toggleFavorite(cityName)}
                              className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-white rounded-xl transition-all"
                              title="Xóa nhanh khỏi ghim"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="mt-6 pt-3 border-t border-white/5">
                            <button
                              onClick={() => {
                                setSelectedCity(cityName);
                                setActiveTab('weather');
                              }}
                              className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                              Xem thời tiết <ArrowRight size={14} />
                            </button>
                          </div>
                        </GlassCard>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ALERTS TAB SCREEN */}
          {activeTab === 'alerts' && (
            <motion.div
              key="alerts-view"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              className="space-y-6 max-w-4xl mx-auto w-full"
            >
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold">Cảnh báo Thời tiết Thiên tai</h3>
                  <p className="text-xs opacity-60 font-medium">Hệ thống túc trực cập nhật khẩn cấp bão lũ và bụi ô nhiễm PM2.5</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={triggerDemoAlert}
                    className="py-2 px-4 border border-[#FFFF00]/30 bg-[#FFFF00]/10 text-[#FFFF00] hover:bg-[#FFFF00]/20 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    ⚡ Bắn Cảnh Báo Bản Demo [Test]
                  </button>

                  {notifications.length > 0 && (
                    <button
                      onClick={markAllAlertsAsRead}
                      className="py-2 px-3 border border-white/10 hover:bg-white/5 rounded-xl text-xs opacity-80"
                    >
                      Đánh dấu đã đọc tất cả
                    </button>
                  )}
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <GlassCard theme={themeMode} className="p-8 flex flex-col items-center">
                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
                      <Bell size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-200">Bầu Trời Tuyệt Đối An Toàn</h4>
                    <p className="text-xs opacity-60 mt-2">Hiện tại không ghi nhận cảnh báo thiên tai bất thường nào trong khu vực của bạn.</p>
                  </GlassCard>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((alert) => (
                    <div key={alert.id}>
                      <GlassCard
                        theme={themeMode}
                        className={`p-5 relative border transition-all ${
                          !alert.read
                            ? alert.type === 'danger'
                              ? 'border-red-500/30 bg-red-950/10'
                              : alert.type === 'warning'
                              ? 'border-amber-500/30 bg-amber-950/10'
                              : 'border-blue-500/30 bg-blue-950/10'
                            : 'border-white/5'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-start gap-3">
                            <span className={`p-1.5 rounded-lg mt-0.5 inline-block ${
                              alert.type === 'danger' 
                                ? 'bg-red-500/20 text-red-400' 
                                : alert.type === 'warning' 
                                ? 'bg-amber-500/20 text-amber-400' 
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              <AlertCircle size={14} />
                            </span>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`text-sm font-extrabold ${alert.read ? 'opacity-80' : 'text-slate-100 font-black'}`}>
                                  {alert.title}
                                </h4>
                                {!alert.read && (
                                  <span className="bg-emerald-400 h-1.5 w-1.5 rounded-full animate-ping"></span>
                                )}
                              </div>
                              <span className="text-[10px] opacity-45 mt-0.5 block">{alert.time}</span>
                              <p className="text-xs opacity-80 mt-2 leading-relaxed font-semibold">{alert.content}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!alert.read && (
                              <button
                                onClick={() => {
                                  setNotifications(notifications.map(n => n.id === alert.id ? { ...n, read: true } : n));
                                  showToast('Đã đánh dấu đã đọc', 'success');
                                }}
                                className="text-[10px] text-emerald-400 border border-emerald-400/20 bg-emerald-400/5 px-2 py-1 rounded-lg hover:bg-emerald-400/20 transition-all font-bold whitespace-nowrap"
                              >
                                Đánh dấu đọc OK
                              </button>
                            )}
                            <button
                              onClick={() => deleteAlert(alert.id)}
                              className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* SETTINGS AND PROFILE CONFIG PAGE */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings-view"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              className="max-w-2xl mx-auto w-full space-y-6"
            >
              {/* Account Card Profile */}
              <div>
                <h3 className="text-lg font-bold mb-3">Tài khoản liên kết</h3>
                <GlassCard theme={themeMode} className="p-6">
                  {userProfile ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={userProfile.avatarUrl}
                          alt="User avatar sample"
                          className="w-14 h-14 bg-gradient-to-r from-teal-400 to-[#FFFF00] p-0.5 rounded-full object-cover border border-white/20"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-extrabold text-slate-200">{userProfile.name}</h4>
                            <span className="text-[9px] uppercase tracking-wider bg-lime-400/20 text-lime-400 border border-lime-400/20 px-2 rounded-full font-bold">
                              MEMBER
                            </span>
                          </div>
                          <p className="text-xs opacity-60 mt-0.5 flex flex-col sm:block">
                            <span>Email: {userProfile.email}</span>
                            {userProfile.phone && <span className="sm:ml-3">| SĐT: {userProfile.phone}</span>}
                          </p>
                          <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
                            ✓ Xác thực đồng bộ qua {userProfile.provider === 'google' ? 'Google Social ID' : userProfile.provider === 'facebook' ? 'Facebook ID' : 'Email bảo mật'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setUserProfile(null);
                          showToast('Đã đăng xuất tài khoản thành công', 'warning');
                        }}
                        className="flex items-center gap-1.5 py-2 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-white rounded-xl text-xs transition-all font-bold cursor-pointer"
                      >
                        <LogOut size={13} />
                        Đăng Xuất
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6 flex flex-col items-center">
                      <div className="p-3 bg-white/5 rounded-full border border-white/10 text-slate-400 mb-3">
                        <User size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-200">Đồng Bộ Lưu Mây Không Giới Hạn</h4>
                      <p className="text-xs opacity-65 mt-1 max-w-sm mx-auto leading-relaxed">
                        Tạo tài khoản AeroGlass riêng tư để lưu trữ các địa danh ưa thích mãi mãi, nhận báo cáo giông bão vệ tinh ngay cả khi tắt tab ứng dụng.
                      </p>
                      <button
                        onClick={() => setIsAuthOpen(true)}
                        className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#FFFF00] to-emerald-400 text-slate-900 font-bold rounded-xl text-xs shadow-lg cursor-pointer"
                      >
                        Đăng ký / Đăng nhập
                      </button>
                    </div>
                  )}
                </GlassCard>
              </div>

              {/* Units metrics customization */}
              <div>
                <h3 className="text-lg font-bold mb-3">Cài Đặt Đơn Vị Đo Lường</h3>
                <GlassCard theme={themeMode} className="p-6 space-y-5">
                  
                  {/* TEMPERATURE CONFIG UNIT (Celcius / Fahrenheit) */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider opacity-90">Đơn vị đo nhiệt độ</h4>
                      <p className="text-[10px] opacity-60 mt-0.5">Áp dụng trực tiếp vào thanh nhiệt độ, biểu đồ giờ, và 7 ngày tới</p>
                    </div>

                    <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => {
                          setAppSettings({ ...appSettings, tempUnit: 'C' });
                          showToast('Đã chuyển sang độ Celsius (°C)', 'success');
                        }}
                        className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
                          appSettings.tempUnit === 'C'
                            ? 'bg-gradient-to-r from-[#FFFF00] to-emerald-400 text-slate-900 shadow-md font-black'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        °C
                      </button>
                      <button
                        onClick={() => {
                          setAppSettings({ ...appSettings, tempUnit: 'F' });
                          showToast('Đã chuyển sang độ Fahrenheit (°F)', 'success');
                        }}
                        className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
                          appSettings.tempUnit === 'F'
                            ? 'bg-gradient-to-r from-[#FFFF00] to-emerald-400 text-slate-900 shadow-md font-black'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        °F
                      </button>
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  {/* SPEED UNITS OPTION (km/h vs m/s) */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider opacity-90">Tốc độ gió hiển thị</h4>
                      <p className="text-[10px] opacity-60 mt-0.5">Quy đổi tự động chính xác hệ số 1 km/h = 0.28 m/s cho dân khí quyển</p>
                    </div>

                    <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/10">
                      <button
                        onClick={() => {
                          setAppSettings({ ...appSettings, windSpeedUnit: 'km/h' });
                          showToast('Đổi hiển thị tốc độ gió: km/h', 'success');
                        }}
                        className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition-all ${
                          appSettings.windSpeedUnit === 'km/h'
                            ? 'bg-[#FFFF00]/15 text-[#FFFF00] border border-[#FFFF00]/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        km/h
                      </button>
                      <button
                        onClick={() => {
                          setAppSettings({ ...appSettings, windSpeedUnit: 'm/s' });
                          showToast('Đổi hiển thị tốc độ gió: m/s', 'success');
                        }}
                        className={`px-3.5 py-1.5 text-xs rounded-lg font-bold transition-all ${
                          appSettings.windSpeedUnit === 'm/s'
                            ? 'bg-[#FFFF00]/15 text-[#FFFF00] border border-[#FFFF00]/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        m/s
                      </button>
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  {/* PUSH NOTIFICATIONS SWITCH STATE */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider opacity-90">Thông báo đẩy bão tố</h4>
                      <p className="text-[10px] opacity-60 mt-0.5">Cho phép đẩy thanh Toast tức thì khi có thiên tai giông tố cực đoan kề cận</p>
                    </div>

                    <button
                      onClick={() => {
                        const nextVal = !appSettings.pushEnabled;
                        setAppSettings({ ...appSettings, pushEnabled: nextVal });
                        showToast(
                          nextVal ? 'Đã bật thông báo đẩy khẩn cấp' : 'Đã tắt nhận thông báo đẩy',
                          nextVal ? 'success' : 'warning'
                        );
                      }}
                      className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-200 outline-none ${
                        appSettings.pushEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${
                          appSettings.pushEnabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </GlassCard>
              </div>

              {/* API Configuration */}
              <div>
                <h3 className="text-lg font-bold mb-3">Cấu Hình API Thời Tiết</h3>
                <GlassCard theme={themeMode} className="p-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-90">OpenWeatherMap API Key</label>
                    <p className="text-[10px] opacity-60">Sử dụng API key của riêng bạn để lấy dữ liệu thời tiết trực tiếp từ OpenWeatherMap thay vì Open-Meteo.</p>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="password"
                        placeholder="Nhập API key của bạn (ví dụ: a1b2c3d4...)"
                        value={appSettings.openWeatherApiKey || ''}
                        onChange={(e) => setAppSettings({ ...appSettings, openWeatherApiKey: e.target.value })}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#FFFF00]/50 transition-colors"
                      />
                    </div>
                  </div>

                </GlassCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* METEO CORE DECK FOOTER */}
        <footer className={`mt-8 pb-10 text-center text-[11px] opacity-60 flex flex-col items-center gap-1.5 ${
          themeMode === 'deep' ? 'text-slate-400' : 'text-slate-600'
        }`}>
          <div className="flex items-center gap-1">
            <Compass size={14} className="animate-spin text-emerald-400" style={{ animationDuration: '10s' }} />
            <span>Chế tác AeroGlass Meteo 2.0 | Layout mờ rực rỡ chuẩn thiết kế phân mức tối giản.</span>
          </div>
          <p>© 2026 Toàn bộ khí tượng hiển thị hỗ trợ 100% tiếng Việt thân thiện, tích hợp vệ tinh ảo điều biến.</p>
        </footer>

      </div>

      {/* RENDER AUTHEMPTY MODAL WITH ABSOLUTE TRANSITION OVERLAY */}
      <AnimatePresence>
        {isAuthOpen && (
          <AuthModal
            theme={themeMode}
            onLoginSuccess={(profile) => {
              setUserProfile(profile);
              showToast(`Chào mừng bạn quay lại, ${profile.name}!`, 'success', 'Đồng bộ đám mây thành phố yêu thích của bạn hoàn tất.');
            }}
            onClose={() => setIsAuthOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FLOATING CHATBOT AI PANEL TRIGGERED BY THE PET */}
      <AnimatePresence>
        {isChatBoxFloatingOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92, x: 15 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 30, scale: 0.92, x: 15 }}
            className="fixed bottom-28 right-6 z-50 w-[350px] sm:w-[380px] shadow-2xl pointer-events-auto"
          >
            <div className="relative">
              {/* Quick shrink button */}
              <button
                onClick={() => setIsChatBoxFloatingOpen(false)}
                className="absolute top-4 right-12 z-50 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer text-xs font-bold"
                title="Thu nhỏ"
              >
                Thu nhỏ ✕
              </button>
              <Suspense fallback={
                <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-[400px] flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-[#FFFF00]/30 border-t-[#FFFF00] animate-spin"></div>
                  <span className="text-sm font-semibold text-white/50 animate-pulse">Khởi động Trợ lý AI...</span>
                </div>
              }>
                <AiChatbot weatherContext={weatherData} theme={themeMode} />
              </Suspense>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE ANIMATED AI PET VISUAL AVATAR */}
      <AiPet
        weather={weatherData}
        theme={themeMode}
        isChatOpen={isChatBoxFloatingOpen}
        onOpenChat={() => setIsChatBoxFloatingOpen(!isChatBoxFloatingOpen)}
      />
    </div>
  );
}
