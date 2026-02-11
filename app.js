import { CONFIG } from './config.js';

// --- State ---
let state = {
    fromChain: 1, // Ethereum
    toChain: 137, // Polygon
    fromToken: null,
    toToken: null,
    amount: 0,
    routes: [],
    signer: null,
    userAddress: null
};

// Default Tokens (Fallbacks)
const DEFAULT_TOKENS = {
    1: { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18, logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png' },
    137: { symbol: 'USDC', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6, logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174/logo.png' },
    56: { symbol: 'BNB', address: '0x0000000000000000000000000000000000000000', decimals: 18, logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/binance/info/logo.png' },
    42161: { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18, logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png' },
    10: { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18, logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png' }
};

// --- DOM Elements ---
const elements = {
    connectBtn: document.getElementById('connect-wallet-btn'),
    amountInput: document.getElementById('amount'),
    fromChainSelect: document.getElementById('from-chain-select'),
    toChainSelect: document.getElementById('to-chain-select'),
    fromTokenBtn: document.getElementById('from-token-btn'),
    toTokenBtn: document.getElementById('to-token-btn'),
    switchBtn: document.getElementById('switch-chains-btn'),
    findRouteBtn: document.getElementById('find-route-btn'),
    resultsSection: document.getElementById('results-section'),
    receiveAmount: document.getElementById('receive-amount'),
    modal: document.getElementById('token-modal'),
    modalClose: document.querySelector('.close-modal'),
    tokenList: document.getElementById('token-list'),
    tokenSearch: document.getElementById('token-search'),
    configModal: document.getElementById('config-modal'),
    closeConfigBtn: document.getElementById('close-config-btn')
};

// --- Initialization ---
function init() {
    // Load initial config check
    if (localStorage.getItem('configSeen') !== 'true') {
        elements.configModal.classList.remove('hidden');
    }

    // Set initial tokens based on default selection
    updateTokenState('from', state.fromChain);
    updateTokenState('to', state.toChain);

    // Event Listeners
    elements.connectBtn.addEventListener('click', connectWallet);
    elements.findRouteBtn.addEventListener('click', findRoutes);
    elements.switchBtn.addEventListener('click', switchChains);

    elements.fromChainSelect.addEventListener('change', (e) => {
        state.fromChain = parseInt(e.target.value);
        updateTokenState('from', state.fromChain);
    });

    elements.toChainSelect.addEventListener('change', (e) => {
        state.toChain = parseInt(e.target.value);
        updateTokenState('to', state.toChain);
    });

    elements.closeConfigBtn.addEventListener('click', () => {
        elements.configModal.classList.add('hidden');
        localStorage.setItem('configSeen', 'true');
    });

    elements.fromTokenBtn.addEventListener('click', () => openTokenModal('from'));
    elements.toTokenBtn.addEventListener('click', () => openTokenModal('to'));
    elements.modalClose.addEventListener('click', () => elements.modal.classList.add('hidden'));

    // Close modal on outside click
    window.onclick = (event) => {
        if (event.target == elements.modal) {
            elements.modal.classList.add('hidden');
        }
    };
}

// --- Logic ---

function updateTokenState(side, chainId) {
    // In a real app, we'd fetch top tokens for the chain. 
    // Here we use defaults for simplicity.
    const token = DEFAULT_TOKENS[chainId];
    if (side === 'from') {
        state.fromToken = token;
        renderTokenButton('from', token);
    } else {
        state.toToken = token;
        renderTokenButton('to', token);
    }
}

function renderTokenButton(side, token) {
    const imgId = `${side}-token-icon`;
    const symbolId = `${side}-token-symbol`;
    document.getElementById(imgId).src = token.logoURI;
    document.getElementById(symbolId).innerText = token.symbol;
}

function switchChains() {
    const tempChain = state.fromChain;
    state.fromChain = state.toChain;
    state.toChain = tempChain;

    elements.fromChainSelect.value = state.fromChain;
    elements.toChainSelect.value = state.toChain;

    updateTokenState('from', state.fromChain);
    updateTokenState('to', state.toChain);
}

// --- Wallet ---
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            state.signer = signer;
            state.userAddress = address;

            elements.connectBtn.innerText = `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`;
            elements.connectBtn.classList.remove('btn-secondary');
            elements.connectBtn.classList.add('btn-primary');
        } catch (error) {
            console.error("User denied account access", error);
            alert("Could not connect to wallet.");
        }
    } else {
        alert("Please install MetaMask!");
    }
}

// --- API & Routing ---

async function findRoutes() {
    const amount = elements.amountInput.value;
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    elements.findRouteBtn.innerText = "Searching...";
    elements.findRouteBtn.disabled = true;
    elements.resultsSection.innerHTML = '<div class="spinner"></div>';
    elements.resultsSection.classList.remove('hidden');

    try {
        // Construct API Call to Li.Fi
        // Docs: https://apidocs.li.fi/reference/get_quote
        const params = new URLSearchParams({
            fromChain: state.fromChain,
            toChain: state.toChain,
            fromToken: state.fromToken.address,
            toToken: state.toToken.address,
            fromAmount: ethers.parseUnits(amount.toString(), state.fromToken.decimals).toString(),
            fromAddress: state.userAddress || "0x0000000000000000000000000000000000000000", // Required even if not connected for quote
            integrator: CONFIG.INTEGRATOR_ID,
            // fee: CONFIG.FEE_PERCENT // Add if using fee sharing and integrator is whitelisted
        });

        const response = await fetch(`${CONFIG.API_URL}/quote?${params}`);
        if (!response.ok) throw new Error("Failed to fetch routes");

        const data = await response.json();

        // Li.Fi /quote returns a single best route usually, or we can use /routes for multiple.
        // For simplicity we'll handle the single quote format which is often the "best".
        // To show multiple (Cheap vs Fast), we'd need to use /advanced/routes endpoints or filter.
        // Let's assume data is the route.

        renderRoutes([data]); // Wrap in array

    } catch (error) {
        console.error(error);
        elements.resultsSection.innerHTML = `<p style="text-align:center; color: #ff6b6b;">Error fetching routes: ${error.message}</p>`;
    } finally {
        elements.findRouteBtn.innerText = "Find Best Route";
        elements.findRouteBtn.disabled = false;
    }
}

function renderRoutes(routes) {
    elements.resultsSection.innerHTML = '';

    if (routes.length === 0) {
        elements.resultsSection.innerHTML = '<p style="text-align:center;">No routes found.</p>';
        return;
    }

    routes.forEach((route, index) => {
        // Safe check for valid route data
        if (!route.estimate) return;

        const card = document.createElement('div');
        card.className = 'route-card';

        // Tag logic (Mocking "Best" for the first result)
        if (index === 0) {
            const tag = document.createElement('div');
            tag.className = 'tag best';
            tag.innerText = 'BEST VALUE';
            card.appendChild(tag);
        }

        // Format Numbers
        const toAmountVal = ethers.formatUnits(route.estimate.toAmount, route.action.toToken.decimals);
        const gasCostUSD = route.estimate.gasCosts ? route.estimate.gasCosts.reduce((acc, curr) => acc + parseFloat(curr.amountUSD), 0).toFixed(2) : '0.00';
        const executionDuration = Math.ceil(route.estimate.executionDuration / 60);

        // Tool name (e.g., "Uniswap via Hop")
        const toolName = route.toolDetails ? route.toolDetails.key : 'Aggregator';

        card.innerHTML += `
            <div class="route-header">
                <div class="route-provider">
                    <!-- Icon placeholder -->
                    <span>${toolName.toUpperCase()}</span>
                </div>
                <div class="route-amount">
                    <span style="font-size: 1.25rem; font-weight: 700;">${parseFloat(toAmountVal).toFixed(4)}</span> ${route.action.toToken.symbol}
                </div>
            </div>
            <div class="route-stats">
                <div class="stat-item">
                    <span class="stat-label">Gas Cost</span>
                    <span class="stat-value">~$${gasCostUSD}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Est. Time</span>
                    <span class="stat-value">${executionDuration} min</span>
                </div>
                <div class="stat-item">
                    <button class="btn btn-primary btn-sm execute-btn">SWAP</button>
                </div>
            </div>
        `;

        // Execution Handler
        const btn = card.querySelector('.execute-btn');
        btn.addEventListener('click', () => executeRoute(route));

        elements.resultsSection.appendChild(card);

        // Update "You Receive" input
        if (index === 0) {
            elements.receiveAmount.value = parseFloat(toAmountVal).toFixed(4);
        }
    });
}

async function executeRoute(route) {
    if (!state.signer) {
        alert("Please connect your wallet first.");
        connectWallet();
        return;
    }

    // Switch Chain if needed
    if (state.fromChain !== route.action.fromChainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x' + route.action.fromChainId.toString(16) }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                alert("Please add this chain to your wallet first.");
            } else {
                console.error(switchError);
                return;
            }
        }
    }

    try {
        const tx = route.transactionRequest;
        // Send Transaction
        const txResponse = await state.signer.sendTransaction({
            to: tx.to,
            data: tx.data,
            value: tx.value,
            from: state.userAddress // key for some providers
        });

        alert(`Transaction Sent! Hash: ${txResponse.hash}`);
        console.log(txResponse);
    } catch (error) {
        console.error("Execution failed", error);
        alert("Transaction failed or rejected.");
    }
}

// --- Token Modal (Simplified) ---
// In a real app this would fetch token lists from an API (e.g. Li.Fi /tokens)

async function openTokenModal(side) {
    elements.modal.classList.remove('hidden');
    elements.tokenList.innerHTML = '<p style="padding:1rem; text-align:center;">Loading...</p>';

    // Fetch tokens for the selected chain
    const chainId = side === 'from' ? state.fromChain : state.toChain;

    try {
        const res = await fetch(`${CONFIG.API_URL}/tokens?chains=${chainId}`);
        const data = await res.json();
        const tokens = data.tokens[chainId] || [];

        elements.tokenList.innerHTML = '';

        // Limit to top 20 for performance in this demo
        tokens.slice(0, 20).forEach(token => {
            const div = document.createElement('div');
            div.className = 'token-item';
            div.innerHTML = `
                <img src="${token.logoURI}" onerror="this.src='https://via.placeholder.com/32'">
                <div>
                    <div style="font-weight:600">${token.symbol}</div>
                    <div style="font-size:0.75rem; opacity:0.7">${token.name}</div>
                </div>
            `;
            div.addEventListener('click', () => {
                if (side === 'from') {
                    state.fromToken = token;
                    renderTokenButton('from', token);
                } else {
                    state.toToken = token;
                    renderTokenButton('to', token);
                }
                elements.modal.classList.add('hidden');
            });
            elements.tokenList.appendChild(div);
        });

    } catch (e) {
        elements.tokenList.innerHTML = '<p>Error loading tokens.</p>';
    }
}

// Start
init();
