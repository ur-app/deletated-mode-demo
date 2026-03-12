# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is the UR Delegated Mode Demo Sandbox, an interactive frontend application that demonstrates how to trigger UR core banking operations (Offramp, Onramp, FX) in Delegated Mode using a partner private key, without requiring a new wallet signature for every action.

## Common Commands
```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Architecture
### Tech Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Signing**: viem (browser-side Ethereum personal sign)
- **Testing**: Vitest

### Core Structure
```
src/
├── main.tsx              # Application entry point
├── App.tsx               # Root layout with 3-panel interface
├── constants/            # Default values, chain options, labels
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks (use-action for execution)
├── lib/
│   ├── api.ts            # Core banking API integration
│   ├── signing.ts        # Request signing logic using viem
│   ├── utils.ts          # General utility functions
│   └── format.ts         # Display formatting helpers
├── store/
│   ├── config-store.ts   # Configuration state management
│   ├── account-store.ts  # Account/balance state management
│   └── console-store.ts  # API console log state management
└── components/
    ├── layout/           # Header and layout components
    ├── config/           # Configuration form and action buttons
    ├── console/          # API request/response console
    └── status/           # Account status and balance display panels
```

### Key Features
1. **Core Operations**: Offramp (USDC → fiat), Onramp (fiat → USDC), FX (fiat-to-fiat conversion)
2. **API Signing**: All requests are signed in-browser using partner private key with Ethereum personal sign
3. **Interactive Console**: Full visibility into all API requests and responses
4. **Multi-chain Support**: Mantle Sepolia, Arbitrum Sepolia, Mantle Mainnet

### API Signing Mechanism
Requests include three custom headers:
- `X-Api-Signature`: Ethereum personal signature of (JSON body + deadline)
- `X-Api-Deadline`: Request expiry timestamp (now + 300s)
- `X-Api-PublicKey`: Partner public address derived from private key

## Deployment
- Deployed automatically to GitHub Pages via GitHub Actions when pushing to the `main` branch
- Production build outputs to the `dist/` directory

## Important Notes
- This is a pure frontend application with no backend
- All signing operations happen client-side in the browser
- Partner private keys are never transmitted to any server
- Supported chain IDs: `eip155:5003` (Mantle Sepolia), `eip155:421614` (Arbitrum Sepolia), `eip155:5000` (Mantle Mainnet)