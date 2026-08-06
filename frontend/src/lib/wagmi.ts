import { createConfig, http } from "wagmi";
import { baseSepolia } from "viem/chains";
import { injected, metaMask } from "wagmi/connectors";

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
});