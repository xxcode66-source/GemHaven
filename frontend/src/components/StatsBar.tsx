"use client";

import { Trophy, Zap, Gem, Users } from "lucide-react";

interface StatsBarProps {
  round: number;
  totalPot: number;
  myTotalStake: number;
  timeRemaining: number;
}

export function StatsBar({ round, totalPot, myTotalStake, timeRemaining }: StatsBarProps) {
  const stats = [
    {
      label: "Current Round",
      value: `#${round}`,
      icon: Trophy,
      color: "text-amber-400",
      bg: "bg-amber-500/20",
    },
    {
      label: "Total Pot",
      value: `${totalPot.toFixed(4)} ETH`,
      icon: Zap,
      color: "text-blue-400",
      bg: "bg-blue-500/20",
    },
    {
      label: "My Stake",
      value: `${myTotalStake.toFixed(4)} ETH`,
      icon: Gem,
      color: "text-emerald-400",
      bg: "bg-emerald-500/20",
    },
    {
      label: "Time Left",
      value: `${Math.max(0, Math.floor(timeRemaining / 1000))}s`,
      icon: Users,
      color: "text-primary-400",
      bg: "bg-primary-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {stats.map((stat, i) => (
        <div key={i} className="glass rounded-xl p-4 sm:p-5 hover:border-primary-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-dark-400 truncate">{stat.label}</p>
              <p className="text-lg sm:text-xl font-bold text-white truncate">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}