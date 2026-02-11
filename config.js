// Configuration for Fee Optimizer
// Users should get their own Integrator ID from https://dashboard.li.fi/ for fee sharing.

export const CONFIG = {
    // Default public integrator ID (or use your own unique one for fee sharing)
    // For testing, 'li.fi-sdk-test-id' often works, but for production/fees you need a real one.
    INTEGRATOR_ID: 'fee-optimizer-v1', 
    
    // Fee percentage (0.005 = 0.5%). check Li.Fi docs for allowed values/tiers.
    FEE_PERCENT: 0.005,
    
    // API Endpoints
    API_URL: 'https://li.fi/v1',
};
