"use client";

import { Wallet, Chrome, Smartphone } from "lucide-react";
import { useConnect, useAccount } from "wagmi";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

export function WalletConnector() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800/50">
        <Wallet className="w-4 h-4 text-primary-500" />
        <span className="text-sm font-mono text-white">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
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