"use client";

import { Gem, Zap, Crown, AlertCircle, CheckCircle } from "lucide-react";

interface MiningGridProps {
  tileStakes: number[];
  myStakes: number[];
  selectedTile: number | null;
  onTileClick: (tileId: number) => void;
  isActive: boolean;
  winningTile: number | null;
}

export function MiningGrid({
  tileStakes,
  myStakes,
  selectedTile,
  onTileClick,
  isActive,
  winningTile,
}: MiningGridProps) {
  const getTileColor = (index: number) => {
    if (winningTile !== null && index === winningTile) {
      return "bg-gradient-to-br from-amber-500/30 to-amber-600/30 border-amber-500/50 ring-2 ring-amber-500/30";
    }
    if (index === selectedTile) {
      return "bg-gradient-to-br from-primary-500/30 to-primary-600/30 border-primary-500/50 ring-2 ring-primary-500/30";
    }
    if (myStakes[index] > 0) {
      return "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30";
    }
    if (tileStakes[index] > 0) {
      return "bg-gradient-to-br from-blue-500/15 to-blue-600/15 border-blue-500/20";
    }
    return "bg-dark-800/50 border-dark-600 hover:border-primary-500/30 hover:bg-dark-700/50";
  };

  const getTileIcon = (index: number) => {
    if (winningTile !== null && index === winningTile) {
      return <Crown className="w-8 h-8 text-amber-400" />;
    }
    if (myStakes[index] > 0) {
      return <Gem className="w-8 h-8 text-emerald-400" />;
    }
    if (tileStakes[index] > 0) {
      return <Zap className="w-8 h-8 text-blue-400" />;
    }
    return <div className="w-8 h-8 text-dark-500 opacity-30">◻</div>;
  };

  return (
    <div className="glass-strong rounded-2xl p-4 sm:p-6">
      <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-md mx-auto">
        {Array.from({ length: 25 }, (_, i) => (
          <button
            key={i}
            onClick={() => onTileClick(i)}
            disabled={!isActive}
            className={`
              relative aspect-square rounded-xl border-2 transition-all duration-200
              flex flex-col items-center justify-center p-2 sm:p-3
              active:scale-[0.98]
              ${getTileColor(i)}
            `}
          >
            <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
              {winningTile !== null && i === winningTile && (
                <Crown className="w-4 h-4 text-amber-400" />
              )}
              {myStakes[i] > 0 && (
                <Gem className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>
            
            <div className="flex flex-col items-center justify-center flex-1">
              {getTileIcon(i)}
              
              <div className="mt-2 text-center w-full">
                <p className="text-xs font-mono text-dark-400">Tile {i}</p>
                <p className="text-sm font-semibold text-white">
                  {tileStakes[i].toFixed(4)} ETH
                </p>
                {myStakes[i] > 0 && (
                  <p className="text-xs text-emerald-400 font-medium">
                    Your: {myStakes[i].toFixed(4)} ETH
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-dark-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-amber-500/30 to-amber-600/30 border border-amber-500/50" />
          <span>Winner</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-primary-500/30 to-primary-600/30 border border-primary-500/50" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30" />
          <span>Your Stake</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-blue-500/15 to-blue-600/15 border border-blue-500/20" />
          <span>Staked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-dark-800/50 border border-dark-600" />
          <span>Empty</span>
        </div>
      </div>
    </div>
  );
}