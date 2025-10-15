'use client';

import { useEffect, useRef, useState } from 'react';
import { usePlanStore } from '../store/planStore';

// 定义 Google Maps API 类型
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const { itinerary, hoverId } = usePlanStore();
  const [isLoaded, setIsLoaded] = useState(false);

  // 加载 Google Maps API
  useEffect(() => {
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;

    window.initMap = () => {
      setIsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      if (window.initMap) {
        window.initMap = undefined as any;
      }
    };
  }, []);

  // 初始化地图
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    const defaultCenter = { lat: 48.8566, lng: 2.3522 }; // 默认巴黎

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 12,
      mapTypeId: 'roadmap', // 固定为路线图模式
      mapTypeControl: false, // 禁用地图类型切换控件（卫星/地图切换）
      streetViewControl: false,
      fullscreenControl: true,
    });
  }, [isLoaded]);

  // 更新标记点
  useEffect(() => {
    if (!mapInstanceRef.current || !itinerary) return;

    // 清除旧标记
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 收集所有位置
    const locations: Array<{
      lat: number;
      lng: number;
      title: string;
      id: string;
      day: number;
    }> = [];

    itinerary.days.forEach((day, dayIndex) => {
      day.items.forEach((item) => {
        if (item.location.lat && item.location.lng) {
          locations.push({
            lat: item.location.lat,
            lng: item.location.lng,
            title: item.title,
            id: item.id,
            day: dayIndex + 1,
          });
        }
      });
    });

    if (locations.length === 0) return;

    // 创建新标记
    const bounds = new window.google.maps.LatLngBounds();

    locations.forEach((loc, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: loc.lat, lng: loc.lng },
        map: mapInstanceRef.current,
        title: loc.title,
        label: {
          text: `${index + 1}`,
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
        },
        animation: hoverId === loc.id ? window.google.maps.Animation.BOUNCE : null,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold;">Day ${loc.day}</h3>
            <p style="margin: 0;">${loc.title}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(new window.google.maps.LatLng(loc.lat, loc.lng));
    });

    // 调整地图视图以显示所有标记
    if (locations.length > 1) {
      mapInstanceRef.current.fitBounds(bounds);
    } else {
      mapInstanceRef.current.setCenter({
        lat: locations[0].lat,
        lng: locations[0].lng,
      });
      mapInstanceRef.current.setZoom(14);
    }
  }, [itinerary, hoverId]);

  // 处理悬停效果
  useEffect(() => {
    if (!hoverId || markersRef.current.length === 0) {
      markersRef.current.forEach((marker) => marker.setAnimation(null));
      return;
    }

    // 找到对应的标记并添加动画
    const locations: string[] = [];
    itinerary?.days.forEach((day) => {
      day.items.forEach((item) => {
        if (item.location.lat && item.location.lng) {
          locations.push(item.id);
        }
      });
    });

    const markerIndex = locations.indexOf(hoverId);
    if (markerIndex >= 0 && markersRef.current[markerIndex]) {
      markersRef.current.forEach((marker, idx) => {
        if (idx === markerIndex) {
          marker.setAnimation(window.google.maps.Animation.BOUNCE);
        } else {
          marker.setAnimation(null);
        }
      });
    }
  }, [hoverId, itinerary]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-gray-600">Loading map...</p>
        </div>
      )}
    </div>
  );
}
