# GemHaven - Confidential Mining Grid

**Inco Summer Game Jam 2026 Submission** | Dual Track: Inco + Megapot

A ZINC/ORE-style confidential mining game built on Base using Inco Lightning for encrypted tile selection and Megapot for jackpot tickets.

## 🎮 Game Concept

**GemHaven** brings the thrill of confidential mining to Base:

- **5×5 Grid** — 25 tiles to stake on
- **45-Second Rounds** — Fast-paced mining action
- **Confidential Stakes** — Your tile choice is encrypted via Inco Lightning until reveal
- **Verifiable Random Winner** — `e.randBounded(25)` selects winner on-chain
- **Proportional Rewards** — Pot distributed to winner(s) on winning tile
- **10% Protocol Fee** — Used for GEM token buyback & burn
- **Megapot Tickets** — 1 ticket per tile staked per round for weekly jackpot

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ConfidentialMiningGrid.sol               │
│  Inherits: Inco Lightning (encrypted state, e.randBounded) │
├─────────────────────────────────────────────────────────────┤
│  State (encrypted via Inco):                                │
│  - euint256[25] tileStakes      // per-tile total stake    │
│  - euint256[25][N] userStakes   // per-user per-tile (private) │
│  - euint256 currentRound        // round counter           │
│  - euint256 winningTile         // set at settle           │
│  - euint256 roundEndTime        // timestamp               │
│  - euint256 totalPot            // total ETH in round      │
├─────────────────────────────────────────────────────────────┤
│  Functions:                                                 │
│  1. stakeTile(tileId)     // encrypted stake               │
│  2. settleRound()          // e.randBounded() → winner     │
│  3. claimRewards()         // proportional distribution    │
│  4. buybackAndBurn()       // fee → GEM buyback            │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                    MegapotMining.sol (50 lines)             │
│  - onStake(address user, uint256 tiles) → mintTicket * tiles │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Judging Criteria Coverage

| Criteria | How GemHaven Wins |
|----------|-------------------|
| **Hidden Mechanics (25%)** | Tile selection encrypted until settle — core mechanic |
| **Completeness (25%)** | Full cycle: stake → wait → settle → reveal → claim → buyback |
| **Creativity (25%)** | ZINC/ORE confidential port to Base + Inco + Megapot dual track |
| **Fun (25%)** | 45s rounds, animated reveal, token rewards, jackpot tickets |
| **Megapot Depth (30%)** | 1 ticket per tile per round, community pools, weekly draw |
| **Gameplay (25%)** | Strategy: spread vs concentrate, risk/reward visible |
| **UX (25%)** | One-click stake, real-time timer, mobile-responsive grid |
| **Retention (20%)** | Weekly Megapot, GEM price appreciation via buyback |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Base Sepolia ETH (get from [Base faucet](https://www.base.org/build))
- Inco Lightning deployed on Base Sepolia

### Contracts
```bash
# Install dependencies
npm install

# Compile
npm run compile

# Deploy to Base Sepolia (configure .env first)
cp .env.example .env
# Edit .env with your PRIVATE_KEY and MEGAPOT_ADDRESS
npm run deploy
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

## 📁 Project Structure

```
GemHaven/
├── contracts/
│   ├── ConfidentialMiningGrid.sol   # Main game logic
│   ├── GEM.sol                      # ERC-20 reward token
│   └── MegapotMining.sol            # Megapot integration
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Main game page
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── MiningGrid.tsx       # 5×5 grid UI
│   │   │   ├── RoundTimer.tsx       # 45s countdown
│   │   │   ├── StatsBar.tsx         # Live stats
│   │   │   └── WalletConnector.tsx  # Wagmi wallet connect
│   │   ├── lib/
│   │   │   └── wagmi.ts             # Wagmi config
│   │   └── providers.tsx            # React providers
│   └── package.json
├── scripts/
│   └── deploy.ts                    # Hardhat deployment
├── hardhat.config.ts
├── package.json
└── .env.example
```

## 🔧 Configuration

### Environment Variables (.env)
```bash
BASE_SEPOLIA_RPC=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
INCO_LIGHTNING_ADDRESS=0x4b9911b0191B0b6a6eA8F2Ed562e20Cff5AC8624
MEGAPOT_ADDRESS=0x...  # Get from Megapot docs
```

## 🎮 How to Play

1. **Connect Wallet** — MetaMask, Coinbase Wallet, or WalletConnect
2. **Select Tile** — Click any of the 25 tiles (your choice is encrypted)
3. **Stake 0.01 ETH** — Confirm transaction
4. **Wait 45s** — Round timer counts down
5. **Reveal** — `e.randBounded(25)` selects winning tile on-chain
6. **Claim** — Winner(s) claim proportional share + GEM tokens
7. **Megapot** — Every stake earns tickets for weekly jackpot

## 📊 Tokenomics

- **GEM Token** — 21M max supply, minted as rewards
- **Buyback & Burn** — 10% protocol fee buys GEM on open market
- **Deflationary** — Decreasing supply increases holder value
- **Megapot Tickets** — Free entry to weekly jackpot draws

## 🔗 Links

- **Inco Docs**: https://docs.inco.org
- **Megapot Docs**: https://docs.megapot.io
- **Base Sepolia Explorer**: https://sepolia.basescan.org
- **Summer Game Jam**: https://t.me/summergamejam

## 📝 License

MIT License - feel free to fork and build upon!

---

**Built for Inco Summer Game Jam 2026** 🏆
Dual track: Inco (Hidden Mechanics) + Megapot (Jackpot Integration)