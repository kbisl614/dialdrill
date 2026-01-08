'use client';

interface SkillRadarChartProps {
  categoryScores: Record<string, number>;
  maxScore?: number;
}

export default function SkillRadarChart({ categoryScores, maxScore = 10 }: SkillRadarChartProps) {
  const categories = Object.keys(categoryScores);
  const values = Object.values(categoryScores);

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[#94a3b8]">
        <p>No data available yet. Complete a call to see your skills!</p>
      </div>
    );
  }

  // Calculate polygon points for the outer boundary (max score)
  const centerX = 150;
  const centerY = 150;
  const radius = 100;
  const angleStep = (2 * Math.PI) / categories.length;

  // Generate points for the data polygon
  const dataPoints = values.map((value, index) => {
    const angle = angleStep * index - Math.PI / 2; // Start at top
    const ratio = value / maxScore;
    const x = centerX + radius * ratio * Math.cos(angle);
    const y = centerY + radius * ratio * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative">
      <svg width="300" height="300" viewBox="0 0 300 300" className="mx-auto">
        {/* Background circles */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={categories.map((_, index) => {
              const angle = angleStep * index - Math.PI / 2;
              const x = centerX + radius * scale * Math.cos(angle);
              const y = centerY + radius * scale * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {categories.map((_, index) => {
          const angle = angleStep * index - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          return (
            <line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={dataPoints}
          fill="rgba(0, 217, 255, 0.2)"
          stroke="#00d9ff"
          strokeWidth="2"
        />

        {/* Data points */}
        {values.map((value, index) => {
          const angle = angleStep * index - Math.PI / 2;
          const ratio = value / maxScore;
          const x = centerX + radius * ratio * Math.cos(angle);
          const y = centerY + radius * ratio * Math.sin(angle);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="#00d9ff"
              className="drop-shadow-[0_0_8px_rgba(0,217,255,0.8)]"
            />
          );
        })}

        {/* Category labels */}
        {categories.map((category, index) => {
          const angle = angleStep * index - Math.PI / 2;
          const x = centerX + (radius + 30) * Math.cos(angle);
          const y = centerY + (radius + 30) * Math.sin(angle);
          return (
            <text
              key={category}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-semibold fill-white"
            >
              {category}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {categories.map((category, index) => (
          <div key={category} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#00d9ff]"></div>
            <span className="text-xs text-[#94a3b8]">
              {category}: <span className="text-white font-semibold">{values[index].toFixed(1)}/{maxScore}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
