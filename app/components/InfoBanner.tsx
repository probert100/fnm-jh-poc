'use client';

export default function InfoBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 px-8 rounded-lg shadow-lg mb-8">
      <div className="flex items-center gap-3 mb-2">
        <svg
          className="w-6 h-6 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-2xl font-bold">Proof of Concept</h2>
      </div>
      <p className="text-blue-50 text-lg leading-relaxed">
        This is a proof of concept testing of integration between browser and Jack Henry
        created by <span className="font-semibold">Intelligent Visibility</span> • December 2025
      </p>
    </div>
  );
}