'use client';

import { useEffect } from 'react';
import ChatPanel from '../../components/ChatPanel';
import { usePlanStore } from '../../store/planStore';
import MapView from '../../components/MapView';
import sampleTrip from '../../data/sampleTrip.json';

export default function PlanPage() {
  const { setItinerary } = usePlanStore();

  // Load sample itinerary on mount
  useEffect(() => {
    setItinerary(sampleTrip as any);
  }, [setItinerary]);

  // 从接口加载位置数据的函数
  const loadLocationsFromAPI = async () => {
    try {
      // 替换为你的实际 API 端点
      const response = await fetch('/api/locations');
      const data = await response.json();
      setItinerary(data);
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  };

  // 如果需要从接口加载数据，取消下面的注释
  // useEffect(() => {
  //   loadLocationsFromAPI();
  // }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* 顶部栏 */}
      <header className="bg-white border-b px-6 py-4 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600">AtlasOne</h1>
      </header>

      {/* 主内容区域 */}
      <main className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* 左侧聊天区域 */}
        <section className="md:w-1/2 p-4 border-r overflow-auto">
          <ChatPanel />
        </section>
        
        {/* 右侧地图区域 */}
        <section className="md:w-1/2 p-4">
          <div className="h-full">
            <MapView />
          </div>
        </section>
      </main>
    </div>
  );
}