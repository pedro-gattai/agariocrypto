# Agar.io Crypto 🎮⚡

A blockchain-powered version of the classic Agar.io game built on Solana, where players bet cryptocurrency to compete for prizes.

## 🚀 Features

- **Real-time Multiplayer**: Classic agar.io gameplay with up to 20 players
- **Crypto Betting**: Bet SOL to enter games with prize pools
- **Solana Integration**: Smart contracts handle betting and prize distribution
- **Multiple Game Modes**: Battle Royale, Time Attack, and Team modes
- **Wallet Integration**: Support for Phantom, Solflare, and other Solana wallets
- **Leaderboards**: Track your stats and compete with other players

## 🏗 Architecture

```
├── client/          # React frontend with TypeScript
├── server/          # Node.js backend with Socket.io
├── contracts/       # Solana smart contracts (Anchor)
├── shared/          # Shared TypeScript types
└── database/        # PostgreSQL schemas and migrations
```

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Solana Wallet Adapter
- **Backend**: Node.js, Express, Socket.io, Prisma
- **Blockchain**: Solana, Anchor Framework, SPL Tokens
- **Database**: PostgreSQL
- **Real-time**: WebSockets for multiplayer gameplay

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Solana CLI and Anchor Framework

### Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url>
   cd agarIoCrypto
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

3. **Database setup**
   ```bash
   cd database
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Solana program deployment**
   ```bash
   cd contracts
   anchor build
   anchor deploy
   ```

## 🎮 Running the Application

### Development Mode
```bash
# Start all services
npm run dev

# Or start individually
npm run dev:client    # Frontend on http://localhost:5173
npm run dev:server    # Backend on http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

## 🎯 How to Play

1. **Connect Wallet**: Connect your Solana wallet (Phantom/Solflare)
2. **Join/Create Game**: Pay entry fee to join a game or create your own
3. **Play**: Use mouse to move, eat smaller players and pellets
4. **Win Prizes**: Top 3 players share the prize pool (50%/30%/20%)

## 💰 Prize Distribution

- **1st Place**: 50% of prize pool
- **2nd Place**: 30% of prize pool  
- **3rd Place**: 20% of prize pool
- **House Fee**: 20% of entry fees

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development servers
- `npm run build` - Build all packages
- `npm run test` - Run tests
- `npm run lint` - Lint codebase
- `npm run anchor:build` - Build Solana programs
- `npm run anchor:test` - Test Solana programs

### Database Commands
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database
- `npm run db:seed` - Seed sample data

## 🔐 Security

- Entry fees are held in escrow by smart contracts
- Automatic prize distribution prevents manual intervention
- Transaction signatures verified on-chain
- No custody of user funds - direct wallet-to-wallet transfers

## 📝 Smart Contract Functions

- `initialize_game_pool` - Create new game with entry fee
- `join_game` - Player joins and pays entry fee
- `start_game` - Begin gameplay when ready
- `end_game_and_distribute` - Distribute prizes to winners

## 🚧 Roadmap

- [ ] NFT Power-ups and Skins
- [ ] Tournament Mode with Larger Prizes
- [ ] Mobile App (React Native)
- [ ] Additional Tokens (USDC, custom SPL)
- [ ] Advanced Anti-cheat Systems
- [ ] Referral Program

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Only bet what you can afford to lose.