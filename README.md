# UR Delegated Mode Demo Sandbox

An interactive sandbox that demonstrates how to trigger UR core banking operations (Offramp, Onramp, FX) in **Delegated Mode** using a partner private key, without requiring a new wallet signature for every action.

## Live Demo

<https://ur-app.github.io/deletated-mode-demo/>

## Features

- **Offramp** — Swap on‑chain USDC to fiat USD (quote + execute)
- **Onramp** — Swap fiat USD to on‑chain USDC (quote + execute)
- **FX** — Fiat‑to‑fiat conversion (e.g. USD → EUR)
- **Refresh state** — Fetch user profile and balances
- **Interactive console** — Inspect every API request/response in detail

## Tech Stack

| Category | Tech |
|---------|------|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| State | Zustand |
| Styling | Tailwind CSS |
| Signing | viem (browser-side Ethereum personal sign) |
| Testing | Vitest |

## Project Structure

```
src/
├── main.tsx                        # Entry point
├── App.tsx                         # Root layout (3 panels)
├── constants/index.ts              # Defaults, chain options, labels
├── types/index.ts                  # TypeScript types
├── hooks/use-action.ts             # Action execution hook
├── lib/
│   ├── api.ts                      # Core banking API calls
│   ├── signing.ts                  # Request signing (viem)
│   ├── utils.ts                    # Helpers
│   └── format.ts                   # Formatting helpers
├── store/
│   ├── config-store.ts             # Configuration state
│   ├── account-store.ts            # Account state
│   └── console-store.ts            # Console log state
└── components/
    ├── layout/Header.tsx           # Header
    ├── config/                     # Config form + actions
    ├── console/                    # API console
    └── status/                     # Account status panels
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### How to Use

1. Open `http://localhost:3000/deletated-mode-demo/` in your browser.
2. Paste the demo Partner Private Key from the quick start guide.
3. Enter the user URID and user address (or keep the defaults).
4. Select a target chain (Mantle Sepolia / Arbitrum Sepolia / Mantle Mainnet).
5. Trigger core banking actions and inspect the request/response steps in the console panel.

## API Signing

All requests are signed in the browser using the partner private key:

1. Concatenate the JSON body and a deadline into a message string.
2. Use `viem` `signMessage` to perform an Ethereum personal sign.
3. Send signature metadata via HTTP headers:
   - `X-Api-Signature` — signature value
   - `X-Api-Deadline` — expiry timestamp (now + 300s)
   - `X-Api-PublicKey` — partner public address

## Supported Chains

| Chain ID | Network |
|----------|---------|
| `eip155:5003` | Mantle Sepolia (testnet) |
| `eip155:421614` | Arbitrum Sepolia (testnet) |
| `eip155:5000` | Mantle Mainnet |

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

## Deployment

This repo is set up to deploy via GitHub Actions to GitHub Pages. Push to the `main` branch to trigger a build and deploy.

## Documentation

- [UR Delegated Mode API Reference](https://docs.ur.app/developer-resources/api-reference-delegated-contract-mode)
