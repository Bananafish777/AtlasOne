'use client';

import { ItineraryItem } from '../store/planStore';
import { usePlanStore } from '../store/planStore';

export default function ItineraryCard({ item }: { item: ItineraryItem }) {
  const { hoverId, setHoverId } = usePlanStore();

  return (
    <div
      onMouseEnter={() => setHoverId(item.id)}
      onMouseLeave={() => setHoverId(null)}
      className={`border rounded p-3 mb-2 shadow-sm ${
        hoverId === item.id ? 'bg-blue-50' : 'bg-white'
      }`}
    >
      <h4 className="font-medium text-lg">{item.title}</h4>
      <p className="text-sm text-gray-600">
        {item.timeWindow} · {item.location.city}
      </p>
      {item.bookingUrl && (
        <a
          href={item.bookingUrl}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline text-sm"
        >
          Book
        </a>
      )}
    </div>
  );
}