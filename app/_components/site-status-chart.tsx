'use client';

export function SiteStatusChart() {
  const data = [
    { month: "Mar", cdmx: 77, mty: 74, qro: 70 },
    { month: "Abr", cdmx: 82, mty: 78, qro: 72 },
    { month: "May", cdmx: 88, mty: 82, qro: 75 },
    { month: "Jun", cdmx: 95, mty: 86, qro: 78 },
  ];

  return (
    <div className="h-full relative">
      {/* Simple Line Chart using CSS */}
      <div className="absolute bottom-0 left-0 right-0 h-full">
        <div className="flex h-full items-end justify-between px-4">
          {data.map((data, index) => (
            <div key={data.month} className="flex flex-col items-center space-y-2">
              <div className="relative h-48 w-16 flex items-end justify-center space-x-1">
                {/* CDMX Line */}
                <div
                  className="w-1 bg-black rounded-t"
                  style={{ height: `${(data.cdmx / 100) * 192}px` }}
                ></div>
                {/* MTY Line */}
                <div
                  className="w-1 bg-gray-600 rounded-t"
                  style={{ height: `${(data.mty / 100) * 192}px` }}
                ></div>
                {/* QRO Line */}
                <div
                  className="w-1 bg-gray-400 rounded-t"
                  style={{ height: `${(data.qro / 100) * 192}px` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600">{data.month}</span>
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="mt-4 flex justify-center space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-black mr-2"></div>
            <span className="text-sm">CDMX-Norte-01</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-600 mr-2"></div>
            <span className="text-sm">MTY-Centro-03</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 mr-2"></div>
            <span className="text-sm">QRO-Terras-04</span>
          </div>
        </div>
      </div>
    </div>
  );
} 