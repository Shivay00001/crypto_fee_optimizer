# ⚡ Crypto Fee Optimizer

A high-performance, on-chain tool designed to find the cheapest and fastest routes for moving crypto across different blockchains. This tool is serverless, executes entirely in the browser, and respects user custody.

## 🚀 Vision

Built for the decentralized economy, this tool earns crypto natively through protocol-level fee sharing. It provides a free service to users while generating revenue for the integrator (developer) via integrated bridge and DEX aggregators.

## ✨ Features

- **Wallet Integration**: Native MetaMask support via Ethers.js v6.
- **Cross-Chain Routing**: Powered by **Li.Fi**, aggregating 20+ bridges and 25+ DEXs.
- **Native Earning**: Built-in logic to handle integrator fee sharing.
- **Premium UI**: Modern dark-mode interface with glassmorphism and responsiveness.
- **On-Chain Execution**: No middleman; transactions are signed and broadcast by the user.

## 💰 How Earnings are Generated

This tool uses the **Li.Fi API's Integrator mechanism**:

1. Every time a user requests a quote, the tool passes an `integrator` ID.
2. The `FEE_PERCENT` parameter (configured in `config.js`) instructs the smart contract to collect a small portion (e.g., 0.5%) of the transaction amount.
3. These fees are collected by the Li.Fi protocol and credited to your Integrator account.
4. You can claim these earnings directly from the [Li.Fi Dashboard](https://dashboard.li.fi/).

## 🛠️ Setup & Configuration

1. **Get an Integrator ID**: Visit [Li.Fi Dashboard](https://dashboard.li.fi/) and register your project.
2. **Update `config.js`**:

   ```javascript
   export const CONFIG = {
       INTEGRATOR_ID: 'your-unique-id', // Replace with your ID
       FEE_PERCENT: 0.005, // 0.5%
       // ...
   };
   ```

3. **Open `index.html`**: Use a local server (like Live Server in VS Code) for the best experience.

## 📂 Folder Structure

```text
crypto_fee_optimizer/
├── index.html      # Main UI structure
├── style.css       # Premium styling & dark mode
├── app.js          # Core application logic
├── config.js       # Configuration & Earning logic
└── README.md       # Project documentation
```

## 🌐 GitHub Pages Deployment

1. Create a new repository on GitHub.
2. Initialize and push the code:

   ```bash
   git init
   git add .
   git commit -m "Initialize Fee Optimizer"
   git remote add origin https://github.com/your-username/repo-name.git
   git push -u origin main
   ```

3. Go to **Settings > Pages**.
4. Select **Deploy from a branch** and choose `main`.
5. Your tool is now live at `https://your-username.github.io/repo-name/`.

## ⚖️ Legal Disclaimer

- **Financial Advice**: This tool does not provide financial advice. All trades are performed at the user's own risk.
- **No Custody**: We never hold your funds. All transactions happen directly between the user's wallet and the integrated smart contracts.
- **Transparency**: Every transaction yields a verifiable hash on the blockchain.
