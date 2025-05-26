'use client';

export function SiteTrendChart() {
  const data = [
    { type: "Backbone", value: 25 },
    { type: "Distribución", value: 15 },
    { type: "Acceso", value: 10 },
  ];

  return (
    <div className="h-full relative">
      {/* Simple Bar Chart using CSS */}
      <div className="flex h-full items-end justify-center space-x-8 px-4">
        {data.map((data) => (
          <div key={data.type} className="flex flex-col items-center space-y-2">
            <div
              className="w-16 bg-black rounded-t"
              style={{ height: `${(data.value / 30) * 200}px` }}
            ></div>
            <span className="text-xs text-gray-600">{data.type}</span>
            <span className="text-xs text-gray-500">{data.value}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
} 