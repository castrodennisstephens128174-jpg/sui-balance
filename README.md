# Sui Balance Checker

A bakti-styled Next.js dApp for the Sui testnet.

## What it does
- suix_getBalance for address and coin type
- total and coin count

## Testnet
- Network: Sui testnet
- RPC endpoint: https://fullnode.testnet.sui.io:443 (JSON-RPC)

## Wallet
- Sui wallets via @mysten/dapp-kit. Connect from the header to sign transactions on Sui testnet.

## Usage
```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
```
Enter a testnet address / hash / value in the tool and read live on-chain data. Connect a wallet for actions that sign or send.

## Faucet
- Testnet SUI: https://faucet.testnet.sui.io or `sui client faucet`

## Limitations
- Testnet only. Reads live data over the public RPC above.
- Wallet connect + signing requires a browser wallet extension and a funded testnet account; not exercised in headless CI.
- Stack: Next.js 15, TypeScript, Tailwind v4. Design system shared across all tools.
