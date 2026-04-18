// Storage Layer for Allen's Contractor's - Phase 5
// Provides abstraction for localStorage with easy swap to backend later

const STORAGE_KEYS = {
    JOBS: 'allen_jobs',
    ESTIMATES: 'allen_estimates',
    TEMPLATES: 'allen_templates',
    COST_LIBRARY: 'allen_cost_library',
    ASSEMBLIES: 'allen_assemblies',
    SETTINGS: 'allen_settings',
    CHANGE_ORDERS: 'allen_change_orders',
    PHOTO_NOTES: 'allen_photo_notes',
    SUBCONTRACTOR_BIDS: 'allen_subcontractor_bids',
    ACTUAL_COSTS: 'allen_actual_costs',
    INVOICES: 'allen_invoices',
    PAYMENTS: 'allen_payments',
    BRANDING: 'allen_branding',
    TEAM_MEMBERS: 'allen_team_members',
    INITIALIZED: 'allen_initialized',
    VERSION: 'allen_version'
};

const CURRENT_VERSION = '5.0.0';

const Storage = {
    initializeStorage() {
        console.log('[Storage] Initializing storage...');

        const existingVersion = localStorage.getItem(STORAGE_KEYS.VERSION);

        if (!existingVersion) {
            console.log('[Storage] First run, seeding default data...');
            this.seedDefaultDataInline();
            localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
            localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
            console.log('[Storage] Storage initialized successfully');
            return;
        }

        if (localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
            console.log('[Storage] Storage already initialized, validating data...');
            this.validateAll();
            return;
        }

        console.log('[Storage] First run, seeding default data...');
        this.seedDefaultDataInline();
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
        localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
        console.log('[Storage] Storage initialized successfully');
    },

    validateAll() {
        console.log('[Storage] Validating all stored data...');
        this.ensureKey(STORAGE_KEYS.JOBS, []);
        this.ensureKey(STORAGE_KEYS.ESTIMATES, []);
        this.ensureKey(STORAGE_KEYS.TEMPLATES, []);
        this.ensureKey(STORAGE_KEYS.COST_LIBRARY, []);
        this.ensureKey(STORAGE_KEYS.ASSEMBLIES, []);
        this.ensureKey(STORAGE_KEYS.SETTINGS, {});
        this.ensureKey(STORAGE_KEYS.CHANGE_ORDERS, []);
        this.ensureKey(STORAGE_KEYS.PHOTO_NOTES, []);
        this.ensureKey(STORAGE_KEYS.SUBCONTRACTOR_BIDS, []);
        this.ensureKey(STORAGE_KEYS.ACTUAL_COSTS, []);
        this.ensureKey(STORAGE_KEYS.INVOICES, []);
        this.ensureKey(STORAGE_KEYS.PAYMENTS, []);
        this.ensureKey(STORAGE_KEYS.BRANDING, {});
        console.log('[Storage] Data validation complete');
    },

    ensureKey(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            if (data === null) {
                localStorage.setItem(key, JSON.stringify(defaultValue));
            } else {
                JSON.parse(data);
            }
        } catch (e) {
            console.warn('[Storage] Resetting invalid key:', key);
            localStorage.setItem(key, JSON.stringify(defaultValue));
        }
    },

    seedDefaultDataInline() {
        console.log('[Storage] Seeding default data...');
        const now = new Date().toISOString();
        
        const defaultSettings = {
            companyName: "Allen's Contractor's",
            contactName: '',
            phone: '',
            email: '',
            address: '',
            defaultLaborRate: 65,
            defaultMarkupPercent: 20,
            defaultTaxPercent: 0,
            defaultContingencyPercent: 10,
            targetMinMarkupPercent: 15,
            targetMinMarginPercent: 25,
            targetMinContingencyPercent: 5,
            defaultTerms: 'Payment due upon completion. 50% deposit required to start work.',
            defaultExclusions: 'Permit fees not included unless specified.'
        };

        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
        localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.ESTIMATES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.COST_LIBRARY, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.ASSEMBLIES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.CHANGE_ORDERS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.PHOTO_NOTES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.SUBCONTRACTOR_BIDS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.ACTUAL_COSTS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify({}));
        localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify([]));
        
        console.log('[Storage] Default data seeded');
    },

    // Jobs
    getJobs() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.JOBS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveJobs(jobs) {
        try { localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs)); return true; }
        catch (e) { return false; }
    },

    // Estimates
    getEstimates() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.ESTIMATES);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveEstimates(estimates) {
        try { localStorage.setItem(STORAGE_KEYS.ESTIMATES, JSON.stringify(estimates)); return true; }
        catch (e) { return false; }
    },

    // Templates
    getTemplates() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveTemplates(templates) {
        try { localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates)); return true; }
        catch (e) { return false; }
    },

    // Cost Library
    getCostLibrary() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.COST_LIBRARY);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveCostLibrary(items) {
        try { localStorage.setItem(STORAGE_KEYS.COST_LIBRARY, JSON.stringify(items)); return true; }
        catch (e) { return false; }
    },

    // Assemblies
    getAssemblies() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.ASSEMBLIES);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveAssemblies(assemblies) {
        try { localStorage.setItem(STORAGE_KEYS.ASSEMBLIES, JSON.stringify(assemblies)); return true; }
        catch (e) { return false; }
    },

    // Settings
    getSettings() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            return data ? JSON.parse(data) : {};
        } catch (e) { return {}; }
    },

    saveSettings(settings) {
        try { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); return true; }
        catch (e) { return false; }
    },

    // Change Orders
    getChangeOrders() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.CHANGE_ORDERS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveChangeOrders(orders) {
        try { localStorage.setItem(STORAGE_KEYS.CHANGE_ORDERS, JSON.stringify(orders)); return true; }
        catch (e) { return false; }
    },

    // Photo Notes
    getPhotoNotes() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.PHOTO_NOTES);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    savePhotoNotes(notes) {
        try { localStorage.setItem(STORAGE_KEYS.PHOTO_NOTES, JSON.stringify(notes)); return true; }
        catch (e) { return false; }
    },

    // Subcontractor Bids
    getSubcontractorBids() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SUBCONTRACTOR_BIDS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveSubcontractorBids(bids) {
        try { localStorage.setItem(STORAGE_KEYS.SUBCONTRACTOR_BIDS, JSON.stringify(bids)); return true; }
        catch (e) { return false; }
    },

    // Actual Costs
    getActualCosts() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.ACTUAL_COSTS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveActualCosts(costs) {
        try { localStorage.setItem(STORAGE_KEYS.ACTUAL_COSTS, JSON.stringify(costs)); return true; }
        catch (e) { return false; }
    },

    // Invoices
    getInvoices() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveInvoices(invoices) {
        try { localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices)); return true; }
        catch (e) { return false; }
    },

    // Payments
    getPayments() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    savePayments(payments) {
        try { localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments)); return true; }
        catch (e) { return false; }
    },

    // Branding
    getBranding() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.BRANDING);
            return data ? JSON.parse(data) : {};
        } catch (e) { return {}; }
    },

    saveBranding(branding) {
        try { localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(branding)); return true; }
        catch (e) { return false; }
    },

    // Team Members
    getTeamMembers() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveTeamMembers(members) {
        try { localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members)); return true; }
        catch (e) { return false; }
    },

    // Backup
    getBackupData() {
        try {
            return {
                version: CURRENT_VERSION,
                exportedAt: new Date().toISOString(),
                jobs: this.getJobs(),
                estimates: this.getEstimates(),
                templates: this.getTemplates(),
                costLibrary: this.getCostLibrary(),
                assemblies: this.getAssemblies(),
                settings: this.getSettings(),
                changeOrders: this.getChangeOrders(),
                photoNotes: this.getPhotoNotes(),
                subcontractorBids: this.getSubcontractorBids(),
                actualCosts: this.getActualCosts(),
                invoices: this.getInvoices(),
                payments: this.getPayments(),
                branding: this.getBranding(),
                teamMembers: this.getTeamMembers()
            };
        } catch (e) {
            console.error('[Storage] Backup error:', e);
            return null;
        }
    },

    restoreBackupData(data, merge) {
        try {
            if (!data || !data.version) throw new Error('Invalid backup');
            
            if (!merge) {
                if (data.jobs) this.saveJobs(data.jobs);
                if (data.estimates) this.saveEstimates(data.estimates);
                if (data.templates) this.saveTemplates(data.templates);
                if (data.costLibrary) this.saveCostLibrary(data.costLibrary);
                if (data.assemblies) this.saveAssemblies(data.assemblies);
                if (data.settings) this.saveSettings(data.settings);
                if (data.changeOrders) this.saveChangeOrders(data.changeOrders);
                if (data.photoNotes) this.savePhotoNotes(data.photoNotes);
                if (data.subcontractorBids) this.saveSubcontractorBids(data.subcontractorBids);
                if (data.actualCosts) this.saveActualCosts(data.actualCosts);
                if (data.invoices) this.saveInvoices(data.invoices);
                if (data.payments) this.savePayments(data.payments);
                if (data.branding) this.saveBranding(data.branding);
                if (data.teamMembers) this.saveTeamMembers(data.teamMembers);
            }
            
            localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    getLastSaved() {
        return new Date().toLocaleString();
    }
};

window.Storage = Storage;