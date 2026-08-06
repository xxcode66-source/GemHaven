"use client";

import { useState, useEffect } from "react";
import { Timer, AlertCircle, CheckCircle } from "lucide-react";

interface RoundTimerProps {
  endTime: number;
  isActive: boolean;
}

export function RoundTimer({ endTime, isActive }: RoundTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeRemaining(remaining);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const isWarning = timeRemaining <= 10 && timeRemaining > 0;
  const isCritical = timeRemaining <= 5 && timeRemaining > 0;
  const isEnded = timeRemaining === 0;

  return (
    <div className="glass-strong rounded-2xl p-4 sm:p-6 max-w-md mx-auto">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          ${isEnded ? 'bg-emerald-500/20' : isCritical ? 'bg-red-500/20' : isWarning ? 'bg-amber-500/20' : 'bg-primary-500/20'}
        `}>
          {isEnded ? (
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          ) : isCritical ? (
            <AlertCircle className="w-6 h-6 text-red-400 animate-pulse" />
          ) : (
            <Timer className={`
              w-6 h-6 
              ${isWarning ? 'text-amber-400 animate-pulse' : isCritical ? 'text-red-400 animate-pulse' : 'text-primary-400'}
            `} />
          )}
        </div>
        <div className="text-center">
          <p className="text-xs text-dark-400 uppercase tracking-wide">
            {isEnded ? 'Round Settling' : isActive ? 'Round Ends In' : 'Next Round Soon'}
          </p>
          <p className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums">
            {isEnded ? '00:00' : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
          </p>
        </div>
      </div>

      <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
        <div
          className={`
            h-full rounded-full transition-all duration-300 ease-linear
            ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-primary-500'}
          `}
          style={{ width: `${Math.max(0, (timeRemaining / 45) * 100)}%` }}
        />
      </div>

      {isEnded && (
        <p className="mt-3 text-center text-sm text-emerald-400 animate-pulse">
          Round settled! Winner revealed.
        </p>
      )}
    </div>
  );
}