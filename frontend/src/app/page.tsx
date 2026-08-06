"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { injected, metaMask, walletConnect } from "wagmi/connectors";
import { parseEther, formatEther } from "viem";
import { Wallet, Grid, Zap, Gem, Timer, Trophy, ExternalLink, Chrome, Smartphone, Crown, AlertCircle, CheckCircle, Users } from "lucide-react";
import { MiningGrid } from "@/components/MiningGrid";
import { RoundTimer } from "@/components/RoundTimer";
import { WalletConnector } from "@/components/WalletConnector";
import { StatsBar } from "@/components/StatsBar";

const GRID_SIZE = 25;
const MIN_STAKE = "0.01";
const ROUND_DURATION = 45;

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const [roundInfo, setRoundInfo] = useState({
    round: 1,
    endTime: Date.now() + ROUND_DURATION * 1000,
    active: true,
    winningTile: null,
  });
  const [tileStakes, setTileStakes] = useState<number[]>(Array(GRID_SIZE).fill(0));
  const [myStakes, setMyStakes] = useState<number[]>(Array(GRID_SIZE).fill(0));
  const [isStaking, setIsStaking] = useState(false);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);

  useEffect(() => {
    const fetchRoundInfo = async () => {
      setRoundInfo({
        round: 1,
        endTime: Date.now() + ROUND_DURATION * 1000,
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
        next[selectedTile!] += parseFloat(MIN_STAKE);
        return next;
      });
      setTileStakes(prev => {
        const next = [...prev];
        next[selectedTile!] += parseFloat(MIN_STAKE);
        return next;
      });
      
      setSelectedTile(null);
      alert(`Staked ${MIN_STAKE} ETH on tile ${selectedTile}!`);
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
                  Stake {MIN_STAKE} ETH to claim this tile for the current round.
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
                    <Zap className="w-5 h-5" /> Stake {MIN_STAKE} ETH
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