import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center py-16 px-4">
      <h1 className="text-4xl font-bold mb-4">AtlasOne Trip Planner</h1>
      <p className="text-lg text-center mb-8 max-w-xl">
        Plan your next adventure with the help of our AI-powered assistant. Describe your dream trip and watch Layla turn it into a structured itinerary.
      </p>
      <Link
        href="/plan"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        Start Planning
      </Link>
    </main>
  );
}
