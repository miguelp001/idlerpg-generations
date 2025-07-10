
import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  colorClass?: string;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, colorClass = 'bg-primary', label }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div>
      {label && <div className="text-sm font-semibold text-on-surface mb-1 flex justify-between"><span>{label}</span> <span>{value} / {max}</span></div>}
      <div className="w-full bg-surface-2 rounded-full h-4 overflow-hidden">
        <div
          className={`h-4 rounded-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
