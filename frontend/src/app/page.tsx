"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { injected, metaMask, walletConnect } from "wagmi/connectors";
import { parseEther, formatEther } from "viem";
import { Wallet, Grid, Zap, Gem, Timer, Trophy, ExternalLink, Chrome, Smartphone, Crown, AlertCircle, CheckCircle, Users } from "lucide-react";

const GRID_SIZE = 25;
const MIN_STAKE = "0.01";
const ROUND_DURATION = 45;

function WalletConnector() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800/50">
        <Wallet className="w-4 h-4 text-primary-500" />
        <span className="text-sm font-mono text-white">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="text-dark-400 hover:text-white text-xs px-2 py-1 rounded"
        >
          Disconnect
        </button>
      </div>
    );
  }

  const connectorIcons: Record<string, React.ReactNode> = {
    injected: <Chrome className="w-4 h-4" />,
    metaMask: <Chrome className="w-4 h-4" />,
    walletConnect: <Smartphone className="w-4 h-4" />,
  };

  const connectorNames: Record<string, string> = {
    injected: "Browser Wallet",
    metaMask: "MetaMask",
    walletConnect: "WalletConnect",
  };

  return (
    <div className="flex items-center gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800/50 hover:bg-dark-700/50 transition-colors text-sm font-medium text-dark-300 hover:text-white"
        >
          {connectorIcons[connector.id] || <Wallet className="w-4 h-4" />}
          <span className="hidden sm:inline">{connectorNames[connector.id] || connector.name}</span>
        </button>
      ))}
    </div>
  );
}

function MiningGrid({
  tileStakes,
  myStakes,
  selectedTile,
  onTileClick,
  isActive,
  winningTile,
}: {
  tileStakes: number[];
  myStakes: number[];
  selectedTile: number | null;
  onTileClick: (tileId: number) => void;
  isActive: boolean;
  winningTile: number | null;
}) {
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
            disabled={false}
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

function RoundTimer({ endTime, isActive }: { endTime: number; isActive: boolean }) {
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

function StatsBar({ round, totalPot, myTotalStake, timeRemaining }: { round: number; totalPot: number; myTotalStake: number; timeRemaining: number }) {
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
      )}
    </div>
  );
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const [roundInfo, setRoundInfo] = useState({
    round: 1,
    endTime: Date.now() + 45 * 1000,
    active: true,
    winningTile: null,
  });
  const [tileStakes, setTileStakes] = useState<number[]>(Array(25).fill(0));
  const [myStakes, setMyStakes] = useState<number[]>(Array(25).fill(0));
  const [isStaking, setIsStaking] = useState(false);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);

  useEffect(() => {
    const fetchRoundInfo = async () => {
      setRoundInfo({
        round: 1,
        endTime: Date.now() + 45 * 1000,
        active: true,
        winningTile: null,
      });
    };

    fetchRoundInfo();
    const interval = setInterval(fetchRoundInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTileClick = (tileId: number) => {
    if (!isConnected) return;
    if (isStaking) return;
    setSelectedTile(tileId);
  };

  const handleStake = async () => {
    if (selectedTile === null || !isConnected || isStaking) return;
    
    setIsStaking(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMyStakes(prev => {
        const next = [...prev];
        next[selectedTile!] += parseFloat("0.01");
        return next;
      });
      setTileStakes(prev => {
        const next = [...prev];
        next[selectedTile!] += parseFloat("0.01");
        return next;
      });
      
      setSelectedTile(null);
      alert(`Staked 0.01 ETH on tile ${selectedTile}!`);
    } catch (err) {
      console.error("Stake failed:", err);
      alert("Stake failed. Please try again.");
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass border-b border-dark-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Gem className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">GemHaven</h1>
                <p className="text-xs text-dark-400">Confidential Mining Grid</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <WalletConnector />
              {isConnected && address && (
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <span className="text-dark-400">{formatEther(balance?.value || 0n)} ETH</span>
                  <button
                    onClick={() => disconnect()}
                    className="text-dark-400 hover:text-white text-xs px-2 py-1 rounded"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <StatsBar 
          round={roundInfo.round}
          totalPot={tileStakes.reduce((a, b) => a + b, 0)}
          myTotalStake={myStakes.reduce((a, b) => a + b, 0)}
          timeRemaining={Math.max(0, roundInfo.endTime - Date.now())}
        />

        <div className="mt-6">
          <MiningGrid
            tileStakes={tileStakes}
            myStakes={myStakes}
            selectedTile={selectedTile}
            onTileClick={handleTileClick}
            isActive={roundInfo.active}
            winningTile={roundInfo.winningTile}
          />
        </div>

        {selectedTile !== null && isConnected && (
          <div className="mt-6 glass-strong rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Tile {selectedTile} Selected</h3>
                <p className="text-dark-400 text-sm mt-1">
                  Stake 0.01 ETH to claim this tile for the current round.
                  Current tile pot: {tileStakes[selectedTile].toFixed(4)} ETH
                </p>
              </div>
              <button
                onClick={handleStake}
                disabled={isStaking || myStakes[selectedTile] > 0}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-dark-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
              >
                {isStaking ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Staking...
                  </>
                ) : myStakes[selectedTile] > 0 ? (
                  <>
                    <Trophy className="w-5 h-5" /> Already Staked
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" /> Stake 0.01 ETH
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {selectedTile !== null && !isConnected && (
          <div className="mt-6 glass-strong rounded-2xl p-6 text-center animate-slide-up">
            <Wallet className="w-12 h-12 mx-auto text-dark-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet to Stake</h3>
            <p className="text-dark-400 mb-4">Connect your wallet to stake on tile {selectedTile}</p>
            <WalletConnector />
          </div>
        )}

        <RoundTimer 
          endTime={roundInfo.endTime}
          isActive={roundInfo.active}
        />

        <div className="mt-12 pt-8 border-t border-dark-700 flex flex-wrap justify-center gap-6 text-sm text-dark-400">
          <a href="https://github.com/xxcode66-source/GemHaven" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </a>
          <a href="https://docs.inco.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
            Powered by Inco Lightning
          </a>
          <a href="https://docs.megapot.io" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
            Megapot Integration
          </a>
        </div>
      </main>
    </div>
  );
}

export default Home;