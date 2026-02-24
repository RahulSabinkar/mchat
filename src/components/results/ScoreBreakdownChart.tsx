interface ScoreBreakdownChartProps {
  score: number;
}

export function ScoreBreakdownChart({ score }: ScoreBreakdownChartProps) {
  const thresholds = [
    { min: 0, max: 2, label: 'Low Risk', color: 'bg-green-500', textColor: 'text-green-700' },
    { min: 3, max: 7, label: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
    { min: 8, max: 20, label: 'High Risk', color: 'bg-red-500', textColor: 'text-red-700' },
  ];

  const scorePosition = (score / 20) * 100;

  return (
    <div className="space-y-3">
      <div className="relative h-8 rounded-lg overflow-hidden flex">
        {thresholds.map((threshold, index) => {
          const width = ((threshold.max - threshold.min + 1) / 20) * 100;
          return (
            <div
              key={index}
              className={`${threshold.color} relative`}
              style={{ width: `${width}%` }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {threshold.min}-{threshold.max}
              </span>
            </div>
          );
        })}
        <div
          className="absolute top-0 h-full w-1 bg-slate-900 shadow-lg"
          style={{ left: `${scorePosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded">
              {score}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>0 (lowest risk)</span>
        <span>20 (highest risk)</span>
      </div>
      <div className="flex items-center gap-4 pt-2">
        {thresholds.map((threshold, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${threshold.color}`} />
            <span className={`text-xs ${threshold.textColor}`}>{threshold.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
