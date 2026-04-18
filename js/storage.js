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
    CONTRACTS: 'allen_contracts',
    WARRANTIES: 'allen_warranties',
    PUNCH_LISTS: 'allen_punch_lists',
    MATERIAL_LISTS: 'allen_material_lists',
    COMMUNICATION_LOGS: 'allen_communication_logs',
    CALENDAR_EVENTS: 'allen_calendar_events',
    TASKS: 'allen_tasks',
    CREWS: 'allen_crews',
    MILESTONES: 'allen_milestones',
    DAILY_LOGS: 'allen_daily_logs',
    SCHEDULE_TEMPLATES: 'allen_schedule_templates',
    INITIALIZED: 'allen_initialized',
    VERSION: 'allen_version'
};

const CURRENT_VERSION = '7.0.0';

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
        this.ensureKey(STORAGE_KEYS.TEAM_MEMBERS, []);
        this.ensureKey(STORAGE_KEYS.CONTRACTS, []);
        this.ensureKey(STORAGE_KEYS.WARRANTIES, []);
        this.ensureKey(STORAGE_KEYS.PUNCH_LISTS, []);
        this.ensureKey(STORAGE_KEYS.MATERIAL_LISTS, []);
        this.ensureKey(STORAGE_KEYS.COMMUNICATION_LOGS, []);
        this.ensureKey(STORAGE_KEYS.CALENDAR_EVENTS, []);
        this.ensureKey(STORAGE_KEYS.TASKS, []);
        this.ensureKey(STORAGE_KEYS.CREWS, []);
        this.ensureKey(STORAGE_KEYS.MILESTONES, []);
        this.ensureKey(STORAGE_KEYS.DAILY_LOGS, []);
        this.ensureKey(STORAGE_KEYS.SCHEDULE_TEMPLATES, []);
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
            contactName: 'Allen Foster',
            phone: '555-0100',
            email: 'allen@allenscontractors.com',
            address: '123 Main Street, Springfield, IL 62701',
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

        // Demo Jobs
        const jobs = [
            { id: 'job_demo_1', name: '123 Oak Street Flip', customerName: 'Bob Anderson', phone: '555-0101', email: 'bob@email.com', address: '123 Oak Street, Springfield, IL 62701', projectType: 'flip', status: 'completed', squareFootage: 2200, notes: 'Full interior flip. 3 bed, 2 bath ranch.', createdAt: now, updatedAt: now },
            { id: 'job_demo_2', name: 'Kitchen Remodel - Johnson', customerName: 'Sarah Johnson', phone: '555-0102', email: 'sarah@email.com', address: '456 Maple Ave, Springfield, IL 62702', projectType: 'kitchen', status: 'in_progress', squareFootage: 200, notes: 'Complete kitchen remodel.', createdAt: now, updatedAt: now },
            { id: 'job_demo_3', name: 'Ridgeview Addition', customerName: 'Mike Williams', phone: '555-0103', email: 'mike@email.com', address: '789 Ridgeview Drive, Springfield, IL 62703', projectType: 'addition', status: 'proposal_sent', squareFootage: 400, notes: '16x24 bedroom addition with bath.', createdAt: now, updatedAt: now }
        ];

        // Demo Estimates
        const estimates = [
            { id: 'est_demo_1', jobId: 'job_demo_1', name: 'Full Rehab Estimate', status: 'approved', refNumber: 'AC-2601-0001', scopeSummary: 'Complete interior remodel including demolition, framing, drywall, paint, flooring, kitchen, bathrooms.', lineItems: [], rooms: [], createdAt: now, updatedAt: now },
            { id: 'est_demo_2', jobId: 'job_demo_2', name: 'Kitchen Estimate', status: 'draft', refNumber: 'AC-2601-0002', scopeSummary: 'Complete kitchen remodel with new cabinets, countertops.', lineItems: [], rooms: [], createdAt: now, updatedAt: now }
        ];

        // Demo Contracts (1 signed)
        const contracts = [
            { id: 'con_demo_1', contractNumber: 'CON-2026-0001', jobId: 'job_demo_1', estimateId: 'est_demo_1', title: '123 Oak Street Contract', status: 'signed', issueDate: '2026-01-15', effectiveDate: '2026-01-15', startDate: '2026-01-20', completionDate: '2026-02-15', amount: 45000, scopeSummary: 'Complete interior remodel.', exclusions: 'Permit fees not included.', termsConditions: '50% deposit required.', paymentTerms: 'Due upon completion.', cancellationText: '48 hour notice.', warrantyText: '1-year workmanship warranty.', customerSignature: { name: 'Bob Anderson' }, contractorSignature: { name: 'Allen Foster' }, signedDate: '2026-01-15', preparedBy: 'Allen Foster', createdBy: 'Allen Foster', createdDate: now, updatedDate: now }
        ];

        // Demo Warranties (1 active, 1 expired)
        const warranties = [
            { id: 'war_demo_1', jobId: 'job_demo_1', contractId: 'con_demo_1', title: 'Labor Warranty', type: 'workmanship', coverageDescription: 'All labor performed on project', startDate: '2026-01-20', endDate: '2027-01-20', status: 'active', exclusions: '', notes: '', createdDate: now, updatedDate: now },
            { id: 'war_demo_2', jobId: 'job_demo_1', title: 'Cabinet Warranty', type: 'manufacturer', coverageDescription: 'Cabinet manufacturer warranty', startDate: '2024-01-01', endDate: '2025-01-01', status: 'expired', exclusions: 'Water damage not covered', notes: 'Extended warranty available', createdDate: now, updatedDate: now }
        ];

        // Demo Punch List (mixed completion)
        const punchLists = [
            { id: 'punch_demo_1', jobId: 'job_demo_1', title: 'Final Punch List', status: 'in_progress', items: [
                { id: 'pi_1', title: 'Touch up paint in master bedroom', description: '', roomArea: 'Master BR', priority: 'medium', status: 'completed', notes: '' },
                { id: 'pi_2', title: 'Adjust cabinet doors', description: '', roomArea: 'Kitchen', priority: 'high', status: 'open', notes: '' },
                { id: 'pi_3', title: 'Replace bathroom faucet', description: 'Leaking at base', roomArea: 'Bath 2', priority: 'high', status: 'in_progress', notes: '' },
                { id: 'pi_4', title: 'Clean gutters', description: '', roomArea: 'Exterior', priority: 'low', status: 'completed', notes: '' }
            ], createdDate: now, updatedDate: now }
        ];

        // Demo Material List (ordered/unordered)
        const materialLists = [
            { id: 'mat_demo_1', jobId: 'job_demo_2', title: 'Kitchen Materials', status: 'active', items: [
                { id: 'mi_1', name: 'Cabinet Pulls', description: 'Oil rubbed bronze', quantity: 24, unit: 'ea', category: 'hardware', estimatedCost: 48, ordered: true, received: false },
                { id: 'mi_2', name: 'LED Lights', description: '6 inch recessed', quantity: 6, unit: 'ea', category: 'electrical', estimatedCost: 120, ordered: true, received: true },
                { id: 'mi_3', name: 'Faucet', description: 'Brushed nickel', quantity: 1, unit: 'ea', category: 'plumbing', estimatedCost: 280, ordered: false, received: false },
                { id: 'mi_4', name: 'Dishwasher', description: 'Bosch 800 series', quantity: 1, unit: 'ea', category: 'appliance', estimatedCost: 850, ordered: false, received: false }
            ], createdDate: now, updatedDate: now }
        ];

        // Demo Communication Log (with follow-up)
        const communicationLogs = [
            { id: 'comm_demo_1', jobId: 'job_demo_2', dateTime: now, type: 'call', contactPerson: 'Sarah Johnson', subject: 'Cabinet delivery delay', notes: 'Cabinets delayed 1 week. Need to reschedule install.', followUpNeeded: true, followUpDate: '2026-04-20', createdBy: 'Allen Foster', createdDate: now, updatedDate: now },
            { id: 'comm_demo_2', jobId: 'job_demo_1', dateTime: now, type: 'text', contactPerson: 'Bob Anderson', subject: 'Final walkthrough', notes: 'Client happy with work. Schedule final payment.', followUpNeeded: false, createdBy: 'Allen Foster', createdDate: now, updatedDate: now }
        ];

        // Demo Calendar Events (this week)
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(today); dayAfter.setDate(dayAfter.getDate() + 2);
        const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);
        
        const calendarEvents = [
            { id: 'cal_1', jobId: 'job_demo_2', title: 'Kitchen Install', type: 'install', startDate: today.toISOString().split('T')[0], startTime: '08:00', endTime: '17:00', allDay: false, location: '456 Maple Ave', assignedTo: '', crewId: '', status: 'scheduled', notes: '', createdDate: now, updatedDate: now },
            { id: 'cal_2', jobId: 'job_demo_3', title: 'Site Visit - Estimate', type: 'estimate_appointment', startDate: tomorrow.toISOString().split('T')[0], startTime: '10:00', endTime: '11:00', allDay: false, location: '789 Ridgeview Dr', assignedTo: '', crewId: '', status: 'confirmed', notes: 'Bring paint samples', createdDate: now, updatedDate: now },
            { id: 'cal_3', jobId: 'job_demo_1', title: 'Final Walkthrough', type: 'final_walkthrough', startDate: dayAfter.toISOString().split('T')[0], startTime: '14:00', endTime: '15:00', allDay: false, location: '123 Oak Street', assignedTo: 'Allen Foster', crewId: '', status: 'scheduled', notes: '', createdDate: now, updatedDate: now },
            { id: 'cal_4', jobId: 'job_demo_2', title: 'Material Delivery', type: 'material_delivery', startDate: nextWeek.toISOString().split('T')[0], startTime: '09:00', endTime: '10:00', allDay: false, location: '456 Maple Ave', assignedTo: '', crewId: '', status: 'scheduled', notes: 'Cabinets and countertops', createdDate: now, updatedDate: now }
        ];

        // Demo Tasks
        const tasks = [
            { id: 'task_1', jobId: 'job_demo_2', title: 'Install base cabinets', roomArea: 'Kitchen', category: 'install', assignedTo: 'Allen', priority: 'high', status: 'in_progress', dueDate: today.toISOString().split('T')[0], estimatedHours: 6, actualHours: 0, notes: '', createdDate: now, updatedDate: now },
            { id: 'task_2', jobId: 'job_demo_2', title: 'Install upper cabinets', roomArea: 'Kitchen', category: 'install', assignedTo: 'Allen', priority: 'high', status: 'open', dueDate: tomorrow.toISOString().split('T')[0], estimatedHours: 4, actualHours: 0, notes: '', createdDate: now, updatedDate: now },
            { id: 'task_3', jobId: 'job_demo_2', title: 'Plumbing hookup', roomArea: 'Kitchen', category: 'plumbing', assignedTo: '', priority: 'medium', status: 'open', dueDate: dayAfter.toISOString().split('T')[0], estimatedHours: 2, actualHours: 0, notes: '', createdDate: now, updatedDate: now },
            { id: 'task_4', jobId: 'job_demo_1', title: 'Final punch items', roomArea: 'Whole house', category: 'punch', assignedTo: 'Allen', priority: 'high', status: 'completed', dueDate: yesterday.toISOString().split('T')[0], estimatedHours: 4, actualHours: 3, notes: 'Complete', createdDate: now, updatedDate: now }
        ];

        // Demo Crews
        const crews = [
            { id: 'crew_1', name: 'Allen + Helper', role: 'General', memberIds: ['member_1'], notes: '', createdDate: now, updatedDate: now },
            { id: 'crew_2', name: 'Electrician - Mike', role: 'Electrical', memberIds: [], notes: 'Subcontractor', createdDate: now, updatedDate: now },
            { id: 'crew_3', name: 'Plumber - Tom', role: 'Plumbing', memberIds: [], notes: 'Subcontractor', createdDate: now, updatedDate: now }
        ];

        // Demo Milestones
        const milestones = [
            { id: 'mile_1', jobId: 'job_demo_2', title: 'Permit Approved', description: '', targetDate: '2026-04-01', actualDate: null, status: 'delayed', notes: 'Waiting on city', createdDate: now, updatedDate: now },
            { id: 'mile_2', jobId: 'job_demo_2', title: 'Demo Complete', description: '', targetDate: '2026-04-10', actualDate: '2026-04-05', status: 'completed', notes: '', createdDate: now, updatedDate: now },
            { id: 'mile_3', jobId: 'job_demo_2', title: 'Rough-in Inspection', description: '', targetDate: '2026-04-20', actualDate: null, status: 'upcoming', notes: '', createdDate: now, updatedDate: now },
            { id: 'mile_4', jobId: 'job_demo_2', title: 'Final Walkthrough', description: '', targetDate: '2026-05-01', actualDate: null, status: 'upcoming', notes: '', createdDate: now, updatedDate: now }
        ];

        // Demo Daily Logs
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
        const dailyLogs = [
            { id: 'log_1', jobId: 'job_demo_2', logDate: yesterday.toISOString().split('T')[0], weather: 'Sunny, 65F', crewOnSite: 'Allen', workCompleted: 'Removed old cabinets, disposed. Demo complete.', materialsDelivered: '', issues: 'Found water damage behind sink cabinet', inspections: '', customerComm: '', safetyNotes: '', nextSteps: 'Start base cabinet install tomorrow', createdBy: 'Allen Foster', createdDate: now, updatedDate: now },
            { id: 'log_2', jobId: 'job_demo_1', logDate: yesterday.toISOString().split('T')[0], weather: 'Cloudy, 58F', crewOnSite: 'Allen', workCompleted: 'Punch list items complete. Final cleaning.', materialsDelivered: '', issues: '', inspections: '', customerComm: 'Client satisfied', safetyNotes: '', nextSteps: 'Schedule final payment', createdBy: 'Allen Foster', createdDate: now, updatedDate: now }
        ];

        // Demo Schedule Templates
        const scheduleTemplates = [
            { id: 'template_1', name: 'Kitchen Remodel', jobType: 'kitchen', milestones: [
                { title: 'Permit if needed', daysOffset: -14 },
                { title: 'Demo', daysOffset: 0 },
                { title: 'Rough-in', daysOffset: 7 },
                { title: 'Drywall', daysOffset: 14 },
                { title: 'Cabinets', daysOffset: 21 },
                { title: 'Countertops', daysOffset: 28 },
                { title: 'Final Walkthrough', daysOffset: 35 }]
            }, tasks: [
                { title: 'Demo old cabinets', category: 'demolition', estimatedHours: 8 },
                { title: 'Install base cabinets', category: 'install', estimatedHours: 6 },
                { title: 'Install upper cabinets', category: 'install', estimatedHours: 4 },
                { title: 'Plumbing hookup', category: 'plumbing', estimatedHours: 2 }
            ], createdDate: now, updatedDate: now }
        ];

        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
        localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
        localStorage.setItem(STORAGE_KEYS.ESTIMATES, JSON.stringify(estimates));
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
        localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
        localStorage.setItem(STORAGE_KEYS.WARRANTIES, JSON.stringify(warranties));
        localStorage.setItem(STORAGE_KEYS.PUNCH_LISTS, JSON.stringify(punchLists));
        localStorage.setItem(STORAGE_KEYS.MATERIAL_LISTS, JSON.stringify(materialLists));
        localStorage.setItem(STORAGE_KEYS.COMMUNICATION_LOGS, JSON.stringify(communicationLogs));
        localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(calendarEvents));
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(crews));
        localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
        localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(dailyLogs));
        localStorage.setItem(STORAGE_KEYS.SCHEDULE_TEMPLATES, JSON.stringify(scheduleTemplates));
        
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

    // Contracts
    getContracts() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveContracts(contracts) {
        try { localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts)); return true; }
        catch (e) { return false; }
    },

    // Warranties
    getWarranties() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.WARRANTIES);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveWarranties(warranties) {
        try { localStorage.setItem(STORAGE_KEYS.WARRANTIES, JSON.stringify(warranties)); return true; }
        catch (e) { return false; }
    },

    // Punch Lists
    getPunchLists() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.PUNCH_LISTS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    savePunchLists(punchLists) {
        try { localStorage.setItem(STORAGE_KEYS.PUNCH_LISTS, JSON.stringify(punchLists)); return true; }
        catch (e) { return false; }
    },

    // Material Lists
    getMaterialLists() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.MATERIAL_LISTS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveMaterialLists(materialLists) {
        try { localStorage.setItem(STORAGE_KEYS.MATERIAL_LISTS, JSON.stringify(materialLists)); return true; }
        catch (e) { return false; }
    },

    // Communication Logs
    getCommunicationLogs() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.COMMUNICATION_LOGS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveCommunicationLogs(logs) {
        try { localStorage.setItem(STORAGE_KEYS.COMMUNICATION_LOGS, JSON.stringify(logs)); return true; }
        catch (e) { return false; }
    },

    // Calendar Events
    getCalendarEvents() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.CALENDAR_EVENTS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveCalendarEvents(events) {
        try { localStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(events)); return true; }
        catch (e) { return false; }
    },

    // Tasks
    getTasks() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.TASKS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveTasks(tasks) {
        try { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); return true; }
        catch (e) { return false; }
    },

    // Crews
    getCrews() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.CREWS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveCrews(crews) {
        try { localStorage.setItem(STORAGE_KEYS.CREWS, JSON.stringify(crews)); return true; }
        catch (e) { return false; }
    },

    // Milestones
    getMilestones() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.MILESTONES);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveMilestones(milestones) {
        try { localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones)); return true; }
        catch (e) { return false; }
    },

    // Daily Logs
    getDailyLogs() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveDailyLogs(logs) {
        try { localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs)); return true; }
        catch (e) { return false; }
    },

    // Schedule Templates
    getScheduleTemplates() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE_TEMPLATES);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveScheduleTemplates(templates) {
        try { localStorage.setItem(STORAGE_KEYS.SCHEDULE_TEMPLATES, JSON.stringify(templates)); return true; }
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
                teamMembers: this.getTeamMembers(),
                contracts: this.getContracts(),
                warranties: this.getWarranties(),
                punchLists: this.getPunchLists(),
                materialLists: this.getMaterialLists(),
                communicationLogs: this.getCommunicationLogs(),
                calendarEvents: this.getCalendarEvents(),
                tasks: this.getTasks(),
                crews: this.getCrews(),
                milestones: this.getMilestones(),
                dailyLogs: this.getDailyLogs(),
                scheduleTemplates: this.getScheduleTemplates()
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
                if (data.contracts) this.saveContracts(data.contracts);
                if (data.warranties) this.saveWarranties(data.warranties);
                if (data.punchLists) this.savePunchLists(data.punchLists);
                if (data.materialLists) this.saveMaterialLists(data.materialLists);
                if (data.communicationLogs) this.saveCommunicationLogs(data.communicationLogs);
                if (data.calendarEvents) this.saveCalendarEvents(data.calendarEvents);
                if (data.tasks) this.saveTasks(data.tasks);
                if (data.crews) this.saveCrews(data.crews);
                if (data.milestones) this.saveMilestones(data.milestones);
                if (data.dailyLogs) this.saveDailyLogs(data.dailyLogs);
                if (data.scheduleTemplates) this.saveScheduleTemplates(data.scheduleTemplates);
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