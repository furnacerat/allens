// Allen's Contractor's - Main Application Entry Point

(function() {
    'use strict';

    console.log("=== Allen's Contractor's App Starting ===");

    // Initialize storage
    function initApp() {
        try {
            Storage.initializeStorage();
            console.log('[App] Storage initialized');

            // Load settings and apply defaults if needed
            const settings = Storage.getSettings();
            if (!settings || !settings.defaultLaborRate) {
                const defaultSettings = {
                    companyName: "Allen's Contractor's",
                    defaultLaborRate: 65,
                    defaultMarkupPercent: 20,
                    defaultTaxPercent: 0,
                    defaultContingencyPercent: 10,
                    targetMinMarkupPercent: 15,
                    targetMinMarginPercent: 25,
                    targetMinContingencyPercent: 5,
                    defaultTerms: 'Payment due upon completion. 50% deposit required to start work.',
                    defaultExclusions: 'Permit fees, utility connections, repairs not visibly damaged, hidden damage, landscaping, moving furniture, appliances unless listed.'
                };
                Storage.saveSettings(defaultSettings);
            }
            console.log('[App] Settings loaded');

            // Initialize components
            Toast.init();
            Modal.init();
            console.log('[App] Components initialized');

            // Setup navigation
            Views.init();
            console.log('[App] Navigation initialized');

            // Check for quick params from URL hash
            const hash = window.location.hash;
            if (hash) {
                const [view, id] = hash.slice(1).split('/');
                if (view === 'estimate' && id) {
                    Views.navigate('estimates');
                    setTimeout(() => EstimateBuilder.open(id), 100);
                    return;
                }
            }

            // Render initial dashboard
            Views.navigate('dashboard');
            console.log('[App] Initial view rendered');

            // Remove loading indicator
            document.body.classList.add('app-loaded');

            console.log("=== Allen's Contractor's App Ready ===");
        } catch (error) {
            console.error('[App] Initialization error:', error);
            Toast.error('App failed to load. Check console.');
        }
    }

    // Wait for DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

    // Setup hash routing for deep linking
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash) {
            const [view, id] = hash.slice(1).split('/');
            if (view === 'estimate' && id) {
                Views.navigate('estimates');
                setTimeout(() => EstimateBuilder.open(id), 100);
            }
        }
    });

    // Global error handler
    window.addEventListener('error', (e) => {
        console.error('[App] Global error:', e.error);
    });

    window.addEventListener('unhandledrejection', (e) => {
        console.error('[App] Unhandled rejection:', e.reason);
    });

})();

// Global navigation helper
window.navTo = function(view, params = {}) {
    Views.navigate(view, params);
};

// Add app-loaded class when ready
document.body = document.body || {};