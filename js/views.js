// Views for Allen's Contractor's - Phase 2

let currentView = 'dashboard';
let currentJobId = null;
let currentEstimateId = null;
let saveStatus = 'saved';
let unsavedChanges = false;

const Views = {
    init() {
        this.setupNavigation();
    },

    setupNavigation() {
        document.querySelectorAll('[data-view]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.dataset.view;
                this.navigate(view);
            });
        });

        document.getElementById('menu-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        document.getElementById('quick-add').addEventListener('click', () => {
            this.handleQuickAdd();
        });
    },

    handleQuickAdd() {
        switch (currentView) {
            case 'jobs':
                JobForm.open();
                break;
            case 'estimates':
                currentJobId = null;
                EstimateForm.openNew();
                break;
            case 'library':
                LibraryForm.open();
                break;
            case 'templates':
                TemplateForm.open();
                break;
            case 'assemblies':
                AssemblyForm.open();
                break;
            default:
                this.navigate('jobs');
                setTimeout(() => JobForm.open(), 100);
        }
    },

    navigate(view, params = {}) {
        if (unsavedChanges && currentEstimateId) {
            const confirmLeave = confirm('You have unsaved changes. Leave anyway?', () => {
                this.doNavigate(view, params);
            });
            if (!confirmLeave) return;
        }
        this.doNavigate(view, params);
    },

    doNavigate(view, params = {}) {
        currentView = view;
        if (params.jobId) currentJobId = params.jobId;
        if (params.estimateId) currentEstimateId = params.estimateId;
        unsavedChanges = false;
        saveStatus = 'saved';

        document.querySelectorAll('[data-view]').forEach(link => {
            link.classList.toggle('active', link.dataset.view === view);
        });

        const titles = {
            dashboard: 'Dashboard',
            jobs: 'Jobs',
            estimates: 'Estimates',
            library: 'Cost Library',
            templates: 'Templates',
            assemblies: 'Assemblies',
            changeorders: 'Change Orders',
            photnotes: 'Photo Notes',
            subbids: 'Subcontractor Bids',
            jobcosts: 'Job Costs',
            invoices: 'Invoices',
            settings: 'Settings'
        };

        document.getElementById('page-title').textContent = titles[view] || view;
        document.getElementById('sidebar').classList.remove('open');

        this.render(view, params);
    },

    render(view, params = {}) {
        const content = document.getElementById('content');

        const renderers = {
            dashboard: () => this.renderDashboard(content),
            jobs: () => this.renderJobs(content),
            estimates: () => this.renderEstimates(content, currentJobId),
            library: () => this.renderLibrary(content),
            templates: () => this.renderTemplates(content),
            assemblies: () => this.renderAssemblies(content),
            changeorders: () => this.renderChangeOrders(content),
            photnotes: () => PhotoNotesView.render(content),
            subbids: () => SubBidsView.render(content),
            jobcosts: () => JobCostsView.render(content),
            invoices: () => InvoicesView.render(content),
            settings: () => this.renderSettings(content)
        };

        const renderer = renderers[view];
        if (renderer) {
            renderer();
        }
    },

    // Dashboard
    renderDashboard(container) {
        const jobs = Storage.getJobs();
        const estimates = Storage.getEstimates();
        const settings = Storage.getSettings();

        const totalJobs = jobs.length;
        const totalEstimates = estimates.length;
        const drafts = estimates.filter(e => e.status === 'draft').length;
        const approved = estimates.filter(e => e.status === 'approved').length;

        let totalValue = 0;
        estimates.forEach(est => {
            const calc = calculateEstimate(est, settings);
            totalValue += calc.grandTotal;
        });

        const recentEstimates = estimates
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5);

        container.innerHTML = `
            <div class="flex items-center gap-sm mb-md">
                <div class="status-indicator">
                    <span class="status-dot"></span>
                    <span>Saved locally</span>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Total Jobs</div>
                    <div class="stat-value">${totalJobs}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Estimates</div>
                    <div class="stat-value">${totalEstimates}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Drafts</div>
                    <div class="stat-value">${drafts}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Approved</div>
                    <div class="stat-value">${approved}</div>
                </div>
                <div class="stat-card accent">
                    <div class="stat-label">Total Estimated Value</div>
                    <div class="stat-value currency">${formatCurrency(totalValue)}</div>
                </div>
            </div>

            <div class="quick-actions">
                <button class="btn btn-lg btn-primary" onclick="Views.navigate('jobs'); setTimeout(() => JobForm.open(), 100)">
                    <span>➕</span> New Job
                </button>
                <button class="btn btn-lg btn-accent" onclick="Views.navigate('estimates'); setTimeout(() => EstimateForm.openNew(), 100)">
                    <span>📐</span> New Estimate
                </button>
                <button class="btn btn-lg btn-secondary" onclick="Views.navigate('assemblies')">
                    <span>📦</span> Assemblies
                </button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Recent Estimates</h3>
                </div>
                <div class="card-body no-padding">
                    ${recentEstimates.length > 0 ? `
                        <div class="table-wrapper">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Job</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                        <th>Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recentEstimates.map(est => {
                                        const job = jobs.find(j => j.id === est.jobId) || {};
                                        const calc = calculateEstimate(est, settings);
                                        return `
                                            <tr class="clickable" onclick="Views.navigate('estimates', {jobId: '${est.jobId}', estimateId: '${est.id}'})">
                                                <td><strong>${est.name}</strong></td>
                                                <td>${job.name || '-'}</td>
                                                <td>${createStatusBadge(est.status, getEstimateStatusLabel(est.status))}</td>
                                                <td class="table-number text-accent">${formatCurrency(calc.grandTotal)}</td>
                                                <td>${formatDate(est.updatedAt)}</td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : createEmptyState('📐', 'No Estimates Yet', 'Create your first estimate to get started.')}
                </div>
            </div>
        `;
    },

    // Jobs
    renderJobs(container) {
        const jobs = Storage.getJobs();

        container.innerHTML = `
            <div class="search-bar">
                <input type="text" class="form-input" placeholder="Search jobs..." id="job-search" oninput="JobList.filter(this.value)">
            </div>
            <div class="quick-actions mb-md">
                <button class="btn btn-primary btn-lg" onclick="JobForm.open()">
                    <span>➕</span> New Job
                </button>
            </div>
            <div class="card">
                <div class="card-body no-padding" id="job-list">
                    ${JobList.render(jobs)}
                </div>
            </div>
        `;
    },

    // Estimates
    renderEstimates(container, jobId = null) {
        const jobs = Storage.getJobs();
        const estimates = jobId
            ? Storage.getEstimates().filter(e => e.jobId === jobId)
            : Storage.getEstimates();

        container.innerHTML = `
            <div class="quick-actions mb-md">
                <button class="btn btn-primary btn-lg" onclick="EstimateForm.openNew()">
                    <span>➕</span> New Estimate
                </button>
                ${jobId ? `<button class="btn btn-secondary" onclick="Views.navigate('jobs')">Back to Jobs</button>` : ''}
            </div>
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${jobId ? 'Job Estimates' : 'All Estimates'}</h3>
                </div>
                <div class="card-body no-padding">
                    ${estimates.length > 0 ? `
                        <div class="table-wrapper">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        ${!jobId ? '<th>Job</th>' : ''}
                                        <th>Status</th>
                                        <th>Total</th>
                                        <th>Ref#</th>
                                        <th>Updated</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${estimates.map(est => {
                                        const job = !jobId ? jobs.find(j => j.id === est.jobId) : null;
                                        const settings = Storage.getSettings();
                                        const calc = calculateEstimate(est, settings);
                                        return `
                                            <tr>
                                                <td>
                                                    <button class="btn btn-ghost text-left" style="width:100%;" onclick="EstimateBuilder.open('${est.id}')">
                                                        <strong>${est.name}</strong>
                                                    </button>
                                                </td>
                                                ${!jobId ? `<td>${job?.name || '-'}</td>` : ''}
                                                <td>${createStatusBadge(est.status, getEstimateStatusLabel(est.status))}</td>
                                                <td class="table-number text-accent">${formatCurrency(calc.grandTotal)}</td>
                                                <td class="font-mono text-muted">${est.refNumber || '-'}</td>
                                                <td>${formatDate(est.updatedAt)}</td>
                                                <td>
                                                    <div class="flex gap-sm">
                                                        <button class="btn btn-sm btn-ghost" onclick="EstimateBuilder.open('${est.id}')" title="Edit">✏️</button>
                                                        <button class="btn btn-sm btn-ghost" onclick="EstimateForm.duplicate('${est.id}')" title="Duplicate">📋</button>
                                                        <button class="btn btn-sm btn-ghost" onclick="ProposalView.open('${est.id}')" title="Proposal">👁</button>
                                                        <button class="btn btn-sm btn-ghost" onclick="confirm('Delete this estimate?', () => EstimateForm.delete('${est.id}'))" title="Delete">🗑</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : createEmptyState('📐', 'No Estimates', 'Create your first estimate to get started.', `
                        <button class="btn btn-primary" onclick="EstimateForm.openNew()">Create Estimate</button>
                    `)}
                </div>
            </div>
        `;
    },

    // Cost Library
    renderLibrary(container) {
        const items = Storage.getCostLibrary();

        container.innerHTML = `
            <div class="search-bar">
                <input type="text" class="form-input" placeholder="Search library..." id="library-search" oninput="LibraryList.filter(this.value)">
            </div>
            <div class="quick-actions mb-md">
                <button class="btn btn-primary btn-lg" onclick="LibraryForm.open()">
                    <span>➕</span> Add Item
                </button>
            </div>
            <div class="card">
                <div class="card-body no-padding" id="library-list">
                    ${LibraryList.render(items)}
                </div>
            </div>
        `;
    },

    // Templates
    renderTemplates(container) {
        const templates = Storage.getTemplates();

        container.innerHTML = `
            <div class="search-bar">
                <input type="text" class="form-input" placeholder="Search templates..." id="template-search" oninput="TemplateList.filter(this.value)">
            </div>
            <div class="quick-actions mb-md">
                <button class="btn btn-primary btn-lg" onclick="TemplateForm.open()">
                    <span>➕</span> New Template
                </button>
            </div>
            <div class="card">
                <div class="card-body no-padding" id="template-list">
                    ${TemplateList.render(templates)}
                </div>
            </div>
        `;
    },

    // Assemblies (Phase 2)
    renderAssemblies(container) {
        const assemblies = Storage.getAssemblies();

        container.innerHTML = `
            <div class="search-bar">
                <input type="text" class="form-input" placeholder="Search assemblies..." id="assembly-search" oninput="AssemblyList.filter(this.value)">
            </div>
            <div class="quick-actions mb-md">
                <button class="btn btn-primary btn-lg" onclick="AssemblyForm.open()">
                    <span>➕</span> New Assembly
                </button>
            </div>
            <div class="card">
                <div class="card-body no-padding" id="assembly-list">
                    ${AssemblyList.render(assemblies)}
                </div>
            </div>
        `;
    },

    // Change Orders
    renderChangeOrders(container) {
        const orders = Storage.getChangeOrders();
        const estimates = Storage.getEstimates();
        const jobs = Storage.getJobs();

        container.innerHTML = `
            <div class="quick-actions mb-md">
                <button class="btn btn-primary btn-lg" onclick="ChangeOrderForm.open()">
                    <span>➕</span> New Change Order
                </button>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Change Orders</h3>
                </div>
                <div class="card-body no-padding">
                    ${orders.length > 0 ? `
                        <div class="table-wrapper">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Job</th>
                                        <th>Status</th>
                                        <th>Cost Impact</th>
                                        <th>Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${orders.map(order => {
                                        const job = jobs.find(j => j.id === order.jobId) || {};
                                        const calc = calculateEstimate({ lineItems: order.lineItems }, Storage.getSettings());
                                        return `
                                            <tr>
                                                <td><strong>${order.name}</strong></td>
                                                <td>${job.name || '-'}</td>
                                                <td>${createStatusBadge(order.status, order.status.charAt(0).toUpperCase() + order.status.slice(1))}</td>
                                                <td class="table-number text-accent">${formatCurrency(calc.grandTotal)}</td>
                                                <td>${formatDate(order.createdAt)}</td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : createEmptyState('🔄', 'No Change Orders', 'Change orders track client-requested scope changes.')}
                </div>
            </div>
        `;
    },

    // Settings
    renderSettings(container) {
        const settings = Storage.getSettings();
        const teamMembers = Storage.getTeamMembers();

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Company Settings</h3>
                    <button class="btn btn-primary" onclick="SettingsForm.save()">Save Settings</button>
                </div>
                <div class="card-body">
                    <form id="settings-form">
                        ${Forms.createInput('companyName', 'Company Name', 'text', settings.companyName || '', true)}
                        ${Forms.createInput('contactName', 'Contact Name', 'text', settings.contactName || '')}
                        <div class="form-row">
                            ${Forms.createInput('phone', 'Phone', 'tel', settings.phone || '')}
                            ${Forms.createInput('email', 'Email', 'email', settings.email || '')}
                        </div>
                        ${Forms.createTextarea('address', 'Address', settings.address || '')}
                        <div class="form-row form-row-2">
                            ${Forms.createCurrencyInput('defaultLaborRate', 'Default Labor Rate ($/hr)', settings.defaultLaborRate || 65)}
                            ${Forms.createCurrencyInput('defaultMarkupPercent', 'Default Markup %', settings.defaultMarkupPercent || 20)}
                        </div>
                        <div class="form-row form-row-3">
                            ${Forms.createCurrencyInput('defaultTaxPercent', 'Default Tax %', settings.defaultTaxPercent || 0)}
                            ${Forms.createCurrencyInput('defaultContingencyPercent', 'Default Contingency %', settings.defaultContingencyPercent || 10)}
                        </div>
                        <hr style="border:none;border-top:1px solid var(--border);margin:var(--space-lg) 0;">
                        <h4 style="margin-bottom:var(--space-md);">Margin Warning Thresholds</h4>
                        <div class="form-row form-row-3">
                            ${Forms.createCurrencyInput('targetMinMarkupPercent', 'Min Markup %', settings.targetMinMarkupPercent || 15)}
                            ${Forms.createCurrencyInput('targetMinMarginPercent', 'Min Gross Margin %', settings.targetMinMarginPercent || 25)}
                            ${Forms.createCurrencyInput('targetMinContingencyPercent', 'Min Contingency %', settings.targetMinContingencyPercent || 5)}
                        </div>
                        ${Forms.createTextarea('defaultTerms', 'Default Terms', settings.defaultTerms || '')}
                        ${Forms.createTextarea('defaultExclusions', 'Default Exclusions', settings.defaultExclusions || '')}
                    </form>
                </div>
            </div>

            <div class="card mt-lg">
                <div class="card-header">
                    <h3 class="card-title">Team Members</h3>
                    <button class="btn btn-secondary" onclick="TeamMemberForm.open()">Add</button>
                </div>
                <div class="card-body">
                    ${teamMembers.length > 0 ? teamMembers.map(m => `
                        <div class="list-item">
                            <div class="list-item-content">
                                <div class="list-item-title">${m.name}</div>
                                <div class="list-item-subtitle">${m.role || 'No role'}</div>
                            </div>
                            <button class="btn btn-sm btn-ghost" onclick="TeamMemberForm.open('${m.id}')">Edit</button>
                        </div>
                    `).join('') : '<p class="text-muted">No team members yet. Add team members to track who prepared estimates.</p>'}
                </div>
            </div>

            <div class="card mt-lg">
                <div class="card-header">
                    <h3 class="card-title">Backup & Restore</h3>
                </div>
                <div class="card-body">
                    <div class="quick-actions flex-col gap-sm">
                        <button class="btn btn-primary" onclick="BackupForm.download()">
                            <span>📥</span> Download Backup
                        </button>
                        <button class="btn btn-secondary" onclick="document.getElementById('restore-input').click()">
                            <span>📤</span> Restore from Backup
                        </button>
                        <input type="file" id="restore-input" accept=".json" style="display:none" onchange="BackupForm.restore(this)">
                    </div>
                    <p class="text-muted mt-md">Back up your data regularly to protect against data loss.</p>
                </div>
            </div>

            <div class="card mt-lg">
                <div class="card-header">
                    <h3 class="card-title">Data Management</h3>
                </div>
                <div class="card-body">
                    <div class="last-saved mb-md">Last saved: ${Storage.getLastSaved()}</div>
                    <button class="btn btn-danger" onclick="confirm('Clear ALL data? This cannot be undone.', () => {
                        Storage.clearAll();
                        localStorage.removeItem('allen_initialized');
                        localStorage.removeItem('allen_version');
                        localStorage.removeItem('allen_team_members');
                        location.reload();
                    })">Clear All Data</button>
                </div>
            </div>
        `;
    }
};

// Job List
const JobList = {
    render(jobs, searchTerm = '') {
        const filtered = searchTerm
            ? jobs.filter(j =>
                j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                j.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                j.address.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : jobs;

        if (filtered.length === 0) {
            return createEmptyState('📋', 'No Jobs', 'Create your first job to get started.');
        }

        return filtered.map(job => `
            <button class="list-item" onclick="JobForm.open('${job.id}')">
                <div class="list-item-content">
                    <div class="list-item-title">${job.name}</div>
                    <div class="list-item-subtitle">${job.customerName} • ${job.address || 'No address'}</div>
                </div>
                <div class="list-item-meta">
                    ${createStatusBadge(job.status, getJobStatusLabel(job.status))}
                    <div>${getProjectTypeLabel(job.projectType)}</div>
                </div>
            </button>
        `).join('');
    },

    filter(term) {
        const jobs = Storage.getJobs();
        const list = document.getElementById('job-list');
        if (list) list.innerHTML = this.render(jobs, term);
    }
};

// Job Form
const JobForm = {
    open(jobId = null) {
        const job = jobId ? Storage.getJobs().find(j => j.id === jobId) : null;

        Modal.open(job ? 'Edit Job' : 'New Job', `
            <form id="job-form">
                ${Forms.createInput('name', 'Job Name', 'text', job?.name || '', true, 'e.g., 123 Oak Street Flip')}
                ${Forms.createInput('customerName', 'Customer Name', 'text', job?.customerName || '', true)}
                <div class="form-row">
                    ${Forms.createInput('phone', 'Phone', 'tel', job?.phone || '', false, '555-0100')}
                    ${Forms.createInput('email', 'Email', 'email', job?.email || '', false, 'email@example.com')}
                </div>
                ${Forms.createTextarea('address', 'Address', job?.address || '', false, 'Street, City, ZIP')}
                <div class="form-row">
                    ${Forms.createSelect('projectType', 'Project Type', PROJECT_TYPES, job?.projectType || 'remodel', true)}
                    ${Forms.createSelect('status', 'Status', JOB_STATUSES, job?.status || 'lead', true)}
                </div>
                ${Forms.createCurrencyInput('squareFootage', 'Square Footage', job?.squareFootage || 0)}
                ${Forms.createTextarea('notes', 'Notes', job?.notes || '', false, 'Additional notes...')}
            </form>
        `, `
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
            ${job ? `<button class="btn btn-danger" onclick="confirm('Delete this job? All estimates will be orphaned.', () => { JobForm.delete('${job.id}'); })">Delete</button>` : ''}
            <button class="btn btn-primary" onclick="JobForm.save('${jobId || ''}')">${job ? 'Update' : 'Create'} Job</button>
        `);
    },

    save(existingId) {
        const values = Forms.getValues('job-form');
        if (!values.name || !values.customerName) {
            Toast.error('Please fill in required fields');
            return;
        }

        const jobs = Storage.getJobs();

        if (existingId) {
            const index = jobs.findIndex(j => j.id === existingId);
            if (index !== -1) {
                jobs[index] = { ...jobs[index], ...values, updatedAt: now() };
            }
        } else {
            jobs.push(createJob(values));
        }

        Storage.saveJobs(jobs);
        Modal.close();
        Toast.success('Job saved');
        Views.navigate('jobs');
    },

    delete(jobId) {
        const jobs = Storage.getJobs().filter(j => j.id !== jobId);
        Storage.saveJobs(jobs);
        Modal.close();
        Toast.success('Job deleted');
        Views.navigate('jobs');
    }
};

// Estimate Form
const EstimateForm = {
    openNew() {
        const jobs = Storage.getJobs();
        const settings = Storage.getSettings() || {};

        Modal.open('New Estimate', `
            <form id="estimate-form">
                ${Forms.createSelect('jobId', 'Job', jobs.map(j => ({ value: j.id, label: j.name })), currentJobId || '', true)}
                ${Forms.createInput('name', 'Estimate Name', 'text', '', true, 'e.g., Full Rehab Estimate')}
                ${Forms.createSelect('status', 'Status', ESTIMATE_STATUSES, 'draft', true)}
                ${Forms.createTextarea('scopeSummary', 'Scope Summary', '', false, 'Brief summary of work included...')}
            </form>
        `, `
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
            <button class="btn btn-primary" onclick="EstimateForm.create()">Create Estimate</button>
        `);
    },

    create() {
        const values = Forms.getValues('estimate-form');
        if (!values.jobId || !values.name) {
            Toast.error('Please fill in required fields');
            return;
        }

        const settings = Storage.getSettings() || {};
        const refNumber = generateRefNumber();

        const newEstimate = createEstimate({
            ...values,
            refNumber,
            lineItems: [],
            rooms: []
        });

        const estimates = Storage.getEstimates();
        estimates.push(newEstimate);
        Storage.saveEstimates(estimates);

        Modal.close();
        Toast.success('Estimate created');
        Views.navigate('estimates', { jobId: values.jobId });
    },

    duplicate(estimateId) {
        const estimates = Storage.getEstimates();
        const original = estimates.find(e => e.id === estimateId);
        if (!original) return;

        const cloned = deepCloneEstimate(original);
        estimates.push(cloned);
        Storage.saveEstimates(estimates);

        Toast.success('Estimate duplicated');
        Views.navigate('estimates', { jobId: original.jobId });
    },

    delete(estimateId) {
        const estimates = Storage.getEstimates().filter(e => e.id !== estimateId);
        Storage.saveEstimates(estimates);
        Toast.success('Estimate deleted');
        Views.navigate('estimates');
    }
};

// Estimate Builder
const EstimateBuilder = {
    open(estimateId) {
        currentEstimateId = estimateId;
        Views.navigate('estimates', { estimateId });

        const estimate = Storage.getEstimates().find(e => e.id === estimateId);
        const job = Storage.getJobs().find(j => j.id === estimate?.jobId);
        const settings = Storage.getSettings() || {};

        if (!estimate) return;

        const calc = calculateEstimate(estimate, settings);
        const warnings = calculateEstimateWarnings(estimate, settings);

        document.getElementById('content').innerHTML = `
            <div class="estimate-header-bar">
                <div>
                    <button class="btn btn-ghost mb-sm" onclick="Views.navigate('estimates', {jobId: '${estimate.jobId}'})">← Back</button>
                    <h2 class="mt-sm">${estimate.name}</h2>
                    <div class="flex gap-sm items-center">
                        ${job ? `<span class="text-muted">${job.name}</span>` : ''}
                        ${estimate.refNumber ? `<span class="estimate-ref">${estimate.refNumber}</span>` : ''}
                        ${createStatusBadge(estimate.status, getEstimateStatusLabel(estimate.status))}
                    </div>
                </div>
                <div class="flex gap-sm">
                    <div class="save-status ${saveStatus}">
                        <span>${saveStatus === 'saved' ? '✓' : saveStatus === 'saving' ? '...' : '●'}</span>
                        <span>${saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}</span>
                    </div>
                    <button class="btn btn-secondary" onclick="EstimateForm.duplicate('${estimateId}')">📋 Copy</button>
                    <button class="btn btn-secondary" onclick="ProposalView.open('${estimateId}')">Print Proposal</button>
                    <button class="btn btn-primary" onclick="EstimateBuilder.addItem()">+ Add Item</button>
                </div>
            </div>

            ${warnings.length > 0 ? `
                <div class="warnings-panel ${warnings.some(w => w.type === 'danger') ? '' : 'warning'}">
                    ${warnings.map((w, i) => `
                        <div class="warning-item ${w.type}">
                            <span class="warning-icon">${w.type === 'danger' ? '✕' : '⚠'}</span>
                            <span>${w.message}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div class="card mb-md">
                <div class="card-header">
                    <h3 class="card-title">Summary</h3>
                </div>
                <div class="card-body">
                    <div class="review-section">
                        <div class="review-title">Total Sale Price</div>
                        <div class="review-value large">${formatCurrency(calc.grandTotal)}</div>
                    </div>
                    <div class="form-row form-row-4">
                        <div class="review-section">
                            <div class="review-title">Materials</div>
                            <div class="review-value">${formatCurrency(calc.totalMaterials)}</div>
                        </div>
                        <div class="review-section">
                            <div class="review-title">Labor</div>
                            <div class="review-value">${formatCurrency(calc.totalLabor)}</div>
                        </div>
                        <div class="review-section">
                            <div class="review-title">Subs/Equip</div>
                            <div class="review-value">${formatCurrency(calc.totalSubcontractor + calc.totalEquipment)}</div>
                        </div>
                        <div class="review-section">
                            <div class="review-title">Tax/Conting.</div>
                            <div class="review-value">${formatCurrency(calc.totalTax + calc.totalContingency)}</div>
                        </div>
                    </div>
                    <div class="form-row form-row-2 mt-md">
                        <div class="review-section">
                            <div class="review-title">Gross Profit</div>
                            <div class="review-value">${formatCurrency(calc.grossProfit)}</div>
                        </div>
                        <div class="review-section">
                            <div class="review-title">Gross Margin</div>
                            <div class="review-value ${calc.grossMargin < 25 ? 'text-danger' : ''}">${calc.grossMargin.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex gap-sm mb-md">
                <button class="btn btn-secondary" onclick="EstimateBuilder.openLibraryPicker()">+ From Library</button>
                <button class="btn btn-secondary" onclick="AssemblyPicker.open('${estimateId}')">+ From Assembly</button>
            </div>

            <div class="card">
                <div class="line-items-header">
                    <span class="line-items-title">Line Items (${estimate.lineItems.length})</span>
                </div>
                <div class="card-body no-padding" id="line-items-list">
                    ${EstimateBuilder.renderLineItems(estimate)}
                </div>
            </div>

            <div class="sticky-totals" id="sticky-totals">
                <div>
                    <div class="sticky-totals-label">Total</div>
                </div>
                <div class="sticky-totals-value">${formatCurrency(calc.grandTotal)}</div>
            </div>
        `;
    },

    renderLineItems(estimate) {
        if (estimate.lineItems.length === 0) {
            return createEmptyState('📐', 'No Line Items', 'Add line items to build your estimate.', `
                <button class="btn btn-primary" onclick="EstimateBuilder.addItem()">Add First Item</button>
            `);
        }

        const groupedItems = {};
        estimate.lineItems.forEach(item => {
            const cat = item.category || 'miscellaneous';
            if (!groupedItems[cat]) groupedItems[cat] = [];
            groupedItems[cat].push(item);
        });

        let html = '';
        Object.keys(groupedItems).sort().forEach(category => {
            const items = groupedItems[category];
            const catTotal = items.reduce((sum, item) => sum + calculateLineItem(item).total, 0);

            html += `
                <div class="category-header" onclick="this.classList.toggle('collapsed'); this.nextElementSibling.classList.toggle('hidden');">
                    <div class="category-title">
                        <span class="category-toggle-icon">▼</span>
                        ${getCategoryLabel(category)} (${items.length})
                    </div>
                    <div class="font-mono">${formatCurrency(catTotal)}</div>
                </div>
                <div class="category-items">
            `;

            items.forEach((item, idx) => {
                const calc = calculateLineItem(item);
                html += EstimateBuilder.renderLineItemCard(item, calc);
            });

            html += '</div>';
        });

        return html;
    },

    renderLineItemCard(item, calc) {
        return `
            <div class="line-item-card" onclick="EstimateBuilder.editItem('${item.id}')">
                <div class="line-item-card-header">
                    <div class="line-item-card-title">${item.name}</div>
                    <div class="line-item-card-cost">${formatCurrency(calc.total)}</div>
                </div>
                ${item.description ? `<div class="text-muted mb-sm" style="font-size:12px;">${item.description}</div>` : ''}
                <div class="line-item-card-details">
                    <span>${item.quantity} ${getUnitLabel(item.unit)}</span>
                    <span>${formatCurrency(item.materialCost)} mat</span>
                    <span>${item.laborHours}h @ ${formatCurrency(item.laborRate)}/h</span>
                    ${item.contingencyPercent > 0 ? `<span>${item.contingencyPercent}% cont.</span>` : ''}
                </div>
                ${item.room ? `<div class="line-item-room mt-sm">${item.room}</div>` : ''}
            </div>
        `;
    },

    addItem() {
        if (!currentEstimateId) return;

        const estimate = Storage.getEstimates().find(e => e.id === currentEstimateId);
        const settings = Storage.getSettings() || {};

        const newItem = createLineItem({
            laborRate: settings.defaultLaborRate || 65,
            markupPercent: settings.defaultMarkupPercent || 20,
            taxPercent: settings.defaultTaxPercent || 0,
            contingencyPercent: settings.defaultContingencyPercent || 10,
            sortOrder: estimate.lineItems.length + 1
        });

        EstimateBuilder.showItemForm(newItem, null);
    },

    editItem(itemId) {
        const estimates = Storage.getEstimates();
        const estimate = estimates.find(e => e.id === currentEstimateId);
        const item = estimate.lineItems.find(li => li.id === itemId);
        if (!item) return;

        EstimateBuilder.showItemForm(item, itemId);
    },

    showItemForm(item, editId) {
        const settings = Storage.getSettings() || {};

        Modal.open(editId ? 'Edit Line Item' : 'Add Line Item', `
            <form id="line-item-form">
                ${Forms.createInput('name', 'Item Name', 'text', item.name, true)}
                ${Forms.createTextarea('description', 'Description', item.description)}
                <div class="form-row">
                    ${Forms.createSelect('category', 'Category', LINE_ITEM_CATEGORIES, item.category || 'miscellaneous', true)}
                    ${Forms.createSelect('room', 'Room/Area', ROOM_AREAS, item.room || '')}
                </div>
                <div class="form-row form-row-3">
                    ${Forms.createCurrencyInput('quantity', 'Quantity', item.quantity)}
                    ${Forms.createSelect('unit', 'Unit', UNITS, item.unit || 'ea')}
                    ${Forms.createCurrencyInput('materialCost', 'Material $', item.materialCost)}
                </div>
                <div class="form-row form-row-3">
                    ${Forms.createCurrencyInput('laborHours', 'Labor Hrs', item.laborHours)}
                    ${Forms.createCurrencyInput('laborRate', 'Labor Rate', item.laborRate)}
                    ${Forms.createCurrencyInput('subcontractorCost', 'Subcontract $', item.subcontractorCost)}
                </div>
                <div class="form-row form-row-4">
                    ${Forms.createCurrencyInput('wasteFactorPercent', 'Waste %', item.wasteFactorPercent)}
                    ${Forms.createCurrencyInput('markupPercent', 'Markup %', item.markupPercent, false, '', settings.defaultMarkupPercent + '% markup')}
                    ${Forms.createCurrencyInput('taxPercent', 'Tax %', item.taxPercent)}
                    ${Forms.createCurrencyInput('contingencyPercent', 'Contingency %', item.contingencyPercent)}
                </div>
                <div class="form-row">
                    ${Forms.createInput('notes', 'Notes', 'text', item.notes || '')}
                </div>
            </form>
        `, `
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
            ${editId ? `<button class="btn btn-danger" onclick="confirm('Delete this line item?', () => EstimateBuilder.deleteItem('${editId}'))">Delete</button>` : ''}
            <button class="btn btn-primary" onclick="EstimateBuilder.saveItem('${editId || ''}')">${editId ? 'Save' : 'Add'} Item</button>
        `);
    },

    saveItem(itemId = null) {
        const values = Forms.getValues('line-item-form');
        if (!values.name) {
            Toast.error('Item name is required');
            return;
        }

        const estimates = Storage.getEstimates();
        const estimate = estimates.find(e => e.id === currentEstimateId);
        if (!estimate) return;

        if (itemId) {
            const idx = estimate.lineItems.findIndex(li => li.id === itemId);
            if (idx !== -1) {
                estimate.lineItems[idx] = { ...estimate.lineItems[idx], ...values };
            }
        } else {
            estimate.lineItems.push(createLineItem({ ...values, id: generateId() }));
        }

        estimate.updatedAt = now();
        estimate.lastSavedAt = now();
        Storage.saveEstimates(estimates);

        saveStatus = 'saved';
        unsavedChanges = false;
        Modal.close();
        Toast.success('Item saved');
        this.open(currentEstimateId);
    },

    deleteItem(itemId) {
        const estimates = Storage.getEstimates();
        const estimate = estimates.find(e => e.id === currentEstimateId);
        if (!estimate) return;

        estimate.lineItems = estimate.lineItems.filter(li => li.id !== itemId);
        estimate.updatedAt = now();
        estimate.lastSavedAt = now();
        Storage.saveEstimates(estimates);

        Modal.close();
        Toast.success('Item deleted');
        this.open(currentEstimateId);
    },

    openLibraryPicker() {
        const library = Storage.getCostLibrary();

        if (library.length === 0) {
            Toast.warning('No library items. Add items to Cost Library first.');
            Views.navigate('library');
            return;
        }

        const itemsByCategory = {};
        library.forEach(item => {
            const cat = item.category;
            if (!itemsByCategory[cat]) itemsByCategory[cat] = [];
            itemsByCategory[cat].push(item);
        });

        let html = '';
        Object.keys(itemsByCategory).sort().forEach(cat => {
            html += `
                <div class="category-header">
                    <div class="category-title">${getCategoryLabel(cat)}</div>
                </div>
            `;
            itemsByCategory[cat].forEach(item => {
                html += `
                    <button class="list-item" onclick="EstimateBuilder.addFromLibrary('${item.id}')">
                        <div class="list-item-content">
                            <div class="list-item-title">${item.name}</div>
                            <div class="list-item-subtitle">${item.defaultUnit} • ${formatCurrency(item.defaultMaterialCost)}</div>
                        </div>
                    </button>
                `;
            });
        });

        Modal.open('Add from Library', `
            <div style="max-height: 60vh; overflow-y: auto;">${html}</div>
        `, `
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        `);
    },

    addFromLibrary(itemId) {
        const libraryItem = Storage.getCostLibrary().find(i => i.id === itemId);
        if (!libraryItem) return;

        const estimates = Storage.getEstimates();
        const estimate = estimates.find(e => e.id === currentEstimateId);
        if (!estimate) return;

        const newItem = createLineItem({
            name: libraryItem.name,
            category: libraryItem.category,
            unit: libraryItem.defaultUnit,
            materialCost: libraryItem.defaultMaterialCost,
            laborHours: libraryItem.defaultLaborHours,
            laborRate: libraryItem.defaultLaborRate,
            subcontractorCost: libraryItem.defaultSubcontractorCost,
            markupPercent: libraryItem.defaultMarkup,
            sortOrder: estimate.lineItems.length + 1
        });

        estimate.lineItems.push(newItem);
        estimate.updatedAt = now();
        estimate.lastSavedAt = now();
        Storage.saveEstimates(estimates);

        Modal.close();
        Toast.success('Item added from library');
        this.open(currentEstimateId);
    }
};

// Assembly Picker
const AssemblyPicker = {
    open(estimateId) {
        const assemblies = Storage.getAssemblies();

        if (assemblies.length === 0) {
            Toast.warning('No assemblies. Create assemblies first.');
            Views.navigate('assemblies');
            return;
        }

        let html = assemblies.map(asm => `
            <button class="list-item" onclick="AssemblyPicker.insert('${asm.id}', '${estimateId}')">
                <div class="list-item-content">
                    <div class="list-item-title">${asm.name}</div>
                    <div class="list-item-subtitle">${asm.description || ''}</div>
                </div>
                <div class="list-item-meta">
                    <div>${asm.lineItems.length} items</div>
                </div>
            </button>
        `).join('');

        Modal.open('Insert Assembly', `
            <div style="max-height: 60vh; overflow-y: auto;">${html}</div>
        `, `
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        `);
    },

    insert(assemblyId, estimateId) {
        const assembly = Storage.getAssemblies().find(a => a.id === assemblyId);
        if (!assembly) return;

        const estimates = Storage.getEstimates();
        const estimate = estimates.find(e => e.id === estimateId);
        if (!estimate) return;

        assembly.lineItems.forEach((item, idx) => {
            const newItem = createLineItem({
                ...item,
                id: generateId(),
                sortOrder: estimate.lineItems.length + idx + 1
            });
            estimate.lineItems.push(newItem);
        });

        estimate.updatedAt = now();
        estimate.lastSavedAt = now();
        Storage.saveEstimates(estimates);

        Modal.close();
        Toast.success(`Added ${assembly.lineItems.length} items from assembly`);
        EstimateBuilder.open(estimateId);
    }
};

// Proposal View
const ProposalView = {
    open(estimateId) {
        const estimate = Storage.getEstimates().find(e => e.id === estimateId);
        const job = Storage.getJobs().find(j => j.id === estimate?.jobId);
        const settings = Storage.getSettings() || {};

        if (!estimate) return;

        const calc = calculateEstimate(estimate, settings);

        const groupedItems = {};
        estimate.lineItems.forEach(item => {
            const cat = item.category || 'miscellaneous';
            if (!groupedItems[cat]) groupedItems[cat] = [];
            groupedItems[cat].push(item);
        });

        let itemsHtml = '';
        Object.keys(groupedItems).sort().forEach(cat => {
            const items = groupedItems[cat];
            itemsHtml += `
                <div class="mb-md print-no-break">
                    <div style="font-weight: 600; margin-bottom: var(--space-sm); border-bottom:1px solid #ccc; padding-bottom:4px;">${getCategoryLabel(cat)}</div>
                    <table style="width:100%; font-size: 11pt;">
                        <tbody>
                            ${items.map(item => `
                                <tr>
                                    <td style="padding: 4px 0;">${item.name} ${item.description ? `<div style="font-size:9pt; color:#666;">${item.description}</div>` : ''}</td>
                                    <td style="text-align:right; padding: 4px 8px;">${item.quantity} ${getUnitLabel(item.unit)}</td>
                                    <td style="text-align:right; padding: 4px 0; width:80px;">${formatCurrency(calculateLineItem(item).total)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        });

        const validThrough = estimate.validThrough || '';
        const refNumber = estimate.refNumber || generateRefNumber();

        document.getElementById('content').innerHTML = `
            <div class="flex justify-between items-center mb-md">
                <button class="btn btn-ghost" onclick="EstimateBuilder.open('${estimateId}')">← Back to Estimate</button>
                <button class="btn btn-primary" onclick="window.print()">🖨 Print Proposal</button>
            </div>

            <div class="proposal">
                <div class="proposal-header">
                    <div class="proposal-company">${settings.companyName || "Allen's Contractor's"}</div>
                    <div class="proposal-title">Estimate Proposal</div>
                    ${refNumber ? `<div style="font-size:12px; color:#666;">Ref: ${refNumber}</div>` : ''}
                </div>

                <div class="proposal-customer">
                    <div>
                        <div class="proposal-field-label">Customer</div>
                        <div class="proposal-field-value">${job?.customerName || 'N/A'}</div>
                        ${job?.phone ? `<div class="text-muted" style="font-size:11px;">${job.phone}</div>` : ''}
                        ${job?.email ? `<div class="text-muted" style="font-size:11px;">${job.email}</div>` : ''}
                    </div>
                    <div>
                        <div class="proposal-field-label">Property Address</div>
                        <div class="proposal-field-value">${job?.address || 'N/A'}</div>
                        ${job?.squareFootage ? `<div style="font-size:11px; color:#666;">${job.squareFootage} sq ft</div>` : ''}
                    </div>
                </div>

                <div style="margin-bottom: 20pt;">
                    <div class="proposal-field-label">Estimate</div>
                    <div style="font-weight:600; font-size:14pt;">${estimate.name}</div>
                    <div style="font-size:11px; color:#666;">Date: ${formatDate(estimate.updatedAt)}</div>
                </div>

                ${estimate.scopeSummary ? `
                    <div class="proposal-scope">
                        <div class="proposal-scope-title">Scope of Work</div>
                        <p>${estimate.scopeSummary}</p>
                    </div>
                ` : ''}

                <div class="proposal-items-title">Line Items</div>
                ${itemsHtml}

                <div class="proposal-total">
                    <div class="proposal-total-label">Total Estimate</div>
                    <div class="proposal-total-value">${formatCurrency(calc.grandTotal)}</div>
                </div>

                ${calc.totalContingency > 0 ? `
                    <div style="font-size:11px; color:#666; margin-top: 8px;">
                        Includes contingency: ${formatCurrency(calc.totalContingency)}
                    </div>
                ` : ''}

                <div class="proposal-terms">
                    <div style="font-weight: 600; margin-bottom: var(--space-sm);">Terms & Conditions</div>
                    <p style="font-size: 11px; white-space: pre-wrap;">${settings.defaultTerms || 'Payment due upon completion.'}</p>
                </div>

                <div style="margin-top: var(--space-lg);">
                    <div style="font-weight: 600; margin-bottom: var(--space-sm);">Exclusions</div>
                    <p style="font-size: 11px; white-space: pre-wrap;">${settings.defaultExclusions || 'Permit fees not included.'}</p>
                </div>

                ${validThrough ? `
                    <div style="margin-top: var(--space-md); font-size: 11px; color:#666;">
                        Valid through: ${formatDate(validThrough)}
                    </div>
                ` : ''}

                <div class="proposal-signature">
                    <div class="flex justify-between">
                        <div style="width: 45%;">
                            <div class="signature-line"></div>
                            <div style="font-size: 11px; margin-top: 4px;">Accepted by (Customer)</div>
                        </div>
                        <div style="width: 45%;">
                            <div class="signature-line"></div>
                            <div style="font-size: 11px; margin-top: 4px;">Date</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// Cost Library List
const LibraryList = {
    render(items, searchTerm = '') {
        const filtered = searchTerm
            ? items.filter(i =>
                i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                i.category.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : items;

        if (filtered.length === 0) {
            return createEmptyState('📚', 'No Library Items', 'Add common pricing items for quick estimate entry.');
        }

        return filtered.map(item => `
            <button class="list-item" onclick="LibraryForm.open('${item.id}')">
                <div class="list-item-content">
                    <div class="list-item-title">${item.name}</div>
                    <div class="list-item-subtitle">${getCategoryLabel(item.category)} • Default: ${item.defaultUnit}</div>
                </div>
                <div class="list-item-meta">
                    <div>${formatCurrency(item.defaultMaterialCost)} / ${item.defaultUnit}</div>
                    <div class="text-muted">${item.defaultLaborHours} hrs @ ${formatCurrency(item.defaultLaborRate)}/hr</div>
                </div>
            </button>
        `).join('');
    },

    filter(term) {
        const items = Storage.getCostLibrary();
        const list = document.getElementById('library-list');
        if (list) list.innerHTML = this.render(items, term);
    }
};

const LibraryForm = {
    open(itemId = null) {
        const item = itemId ? Storage.getCostLibrary().find(i => i.id === itemId) : null;

        Modal.open(item ? 'Edit Library Item' : 'Add Library Item', `
            <form id="library-form">
                ${Forms.createInput('name', 'Item Name', 'text', item?.name || '', true)}
                ${Forms.createSelect('category', 'Category', LINE_ITEM_CATEGORIES, item?.category || 'miscellaneous', true)}
                ${Forms.createSelect('unit', 'Default Unit', UNITS, item?.defaultUnit || 'ea')}
                <div class="form-row">
                    ${Forms.createCurrencyInput('defaultMaterialCost', 'Material Cost', item?.defaultMaterialCost || 0)}
                    ${Forms.createCurrencyInput('defaultLaborHours', 'Labor Hours', item?.defaultLaborHours || 0)}
                    ${Forms.createCurrencyInput('defaultLaborRate', 'Labor Rate', item?.defaultLaborRate || 65)}
                </div>
                <div class="form-row">
                    ${Forms.createCurrencyInput('defaultSubcontractorCost', 'Subcontractor Cost', item?.defaultSubcontractorCost || 0)}
                    ${Forms.createCurrencyInput('defaultMarkup', 'Markup %', item?.defaultMarkup || 20)}
                </div>
                ${Forms.createTextarea('notes', 'Notes', item?.notes || '')}
            </form>
        `, `
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
            ${item ? `<button class="btn btn-danger" onclick="confirm('Delete this library item?', () => { LibraryForm.delete('${item.id}'); })">Delete</button>` : ''}
            <button class="btn btn-primary" onclick="LibraryForm.save('${itemId || ''}')">${item ? 'Update' : 'Add'} Item</button>
        `);
    },

    save(existingId) {
        const values = Forms.getValues('library-form');
        if (!values.name) {
            Toast.error('Item name is required');
            return;
        }

        const items = Storage.getCostLibrary();

        if (existingId) {
            const index = items.findIndex(i => i.id === existingId);
            if (index !== -1) {
                items[index] = { ...items[index], ...values };
            }
        } else {
            items.push(createCostLibraryItem(values));
        }

        Storage.saveCostLibrary(items);
        Modal.close();
        Toast.success('Library item saved');
        Views.navigate('library');
    },

    delete(itemId) {
        const items = Storage.getCostLibrary().filter(i => i.id !== itemId);
        Storage.saveCostLibrary(items);
        Modal.close();
        Toast.success('Library item deleted');
        Views.navigate('library');
    }
};

// Template List
const TemplateList = {
    render(templates, searchTerm = '') {
        const filtered = searchTerm
            ? templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
            : templates;

        if (filtered.length === 0) {
            return createEmptyState('📄', 'No Templates', 'Create templates for common job types.');
        }

        return filtered.map(tpl => `
            <button class="list-item" onclick="TemplateForm.open('${tpl.id}')">
                <div class="list-item-content">
                    <div class="list-item-title">${tpl.name}</div>
                    <div class="list-item-subtitle">${tpl.description || 'No description'}</div>
                </div>
                <div class="list-item-meta">
                    <div>${tpl.lineItems.length} items</div>
                </div>
            </button>
        `).join('');
    },

    filter(term) {
        const templates = Storage.getTemplates();
        const list = document.getElementById('template-list');
        if (list) list.innerHTML = this.render(templates, term);
    }
};

const TemplateForm = {
    open(templateId = null) {
        const template = templateId ? Storage.getTemplates().find(t => t.id === templateId) : null;

        Modal.open(template ? 'Edit Template' : 'New Template', `
            <form id="template-form">
                ${Forms.createInput('name', 'Template Name', 'text', template?.name || '', true)}
                ${Forms.createTextarea('description', 'Description', template?.description || '')}
            </form>
        `, `
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
            ${template ? `<button class="btn btn-danger" onclick="confirm('Delete this template?', () => { TemplateForm.delete('${template.id}'); })">Delete</button>` : ''}
            <button class="btn btn-primary" onclick="TemplateForm.save('${templateId || ''}')">${template ? 'Update' : 'Create'} Template</button>
        `);
    },

    save(existingId) {
        const values = Forms.getValues('template-form');
        if (!values.name) {
            Toast.error('Template name is required');
            return;
        }

        const templates = Storage.getTemplates();

        if (existingId) {
            const index = templates.findIndex(t => t.id === existingId);
            if (index !== -1) {
                templates[index] = { ...templates[index], ...values };
            }
        } else {
            templates.push(createTemplate(values));
        }

        Storage.saveTemplates(templates);
        Modal.close();
        Toast.success('Template saved');
        Views.navigate('templates');
    },

    delete(templateId) {
        const templates = Storage.getTemplates().filter(t => t.id !== templateId);
        Storage.saveTemplates(templates);
        Modal.close();
        Toast.success('Template deleted');
        Views.navigate('templates');
    }
};

// Assembly List (Phase 2)
const AssemblyList = {
    render(assemblies, searchTerm = '') {
        const filtered = searchTerm
            ? assemblies.filter(a =>
                a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.category.toLowerCase().includes(searchTerm.toLowerCase())
            )
            : assemblies;

        if (filtered.length === 0) {
            return createEmptyState('📦', 'No Assemblies', 'Create assemblies for common work packages.');
        }

        return filtered.map(asm => `
            <button class="list-item" onclick="AssemblyForm.open('${asm.id}')">
                <div class="list-item-content">
                    <div class="list-item-title">${asm.name}</div>
                    <div class="list-item-subtitle">${asm.description || ''}</div>
                </div>
                <div class="list-item-meta">
                    <div>${asm.lineItems.length} items</div>
                    <div>${getCategoryLabel(asm.category)}</div>
                </div>
            </button>
        `).join('');
    },

    filter(term) {
        const assemblies = Storage.getAssemblies();
        const list = document.getElementById('assembly-list');
        if (list) list.innerHTML = this.render(assemblies, term);
    }
};

const AssemblyForm = {
    open(assemblyId = null) {
        const assembly = assemblyId ? Storage.getAssemblies().find(a => a.id === assemblyId) : null;

        const action = assemblyId ? 'Edit' : 'New';

        Modal.open(`${action} Assembly`, `
            <form id="assembly-form">
                ${Forms.createInput('name', 'Assembly Name', 'text', assembly?.name || '', true)}
                ${Forms.createSelect('category', 'Category', LINE_ITEM_CATEGORIES, assembly?.category || 'miscellaneous', true)}
                ${Forms.createTextarea('description', 'Description', assembly?.description || '')}
                <div class="form-group">
                    <div class="form-label">Line Items</div>
                    <div class="form-help">Save the assembly first, then add line items to it.</div>
                </div>
            </form>
        `, `
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
            ${assembly ? `<button class="btn btn-danger" onclick="confirm('Delete this assembly?', () => { AssemblyForm.delete('${assembly.id}'); })">Delete</button>` : ''}
            <button class="btn btn-primary" onclick="AssemblyForm.save('${assemblyId || ''}')">${assembly ? 'Update' : 'Create'} Assembly</button>
        `);
    },

    save(existingId) {
        const values = Forms.getValues('assembly-form');
        if (!values.name) {
            Toast.error('Assembly name is required');
            return;
        }

        const assemblies = Storage.getAssemblies();

        if (existingId) {
            const index = assemblies.findIndex(a => a.id === existingId);
            if (index !== -1) {
                assemblies[index] = { ...assemblies[index], ...values, updatedAt: now() };
            }
        } else {
            assemblies.push(createAssembly({ ...values, lineItems: [] }));
        }

        Storage.saveAssemblies(assemblies);
        Modal.close();
        Toast.success('Assembly saved');
        Views.navigate('assemblies');
    },

    delete(assemblyId) {
        const assemblies = Storage.getAssemblies().filter(a => a.id !== assemblyId);
        Storage.saveAssemblies(assemblies);
        Modal.close();
        Toast.success('Assembly deleted');
        Views.navigate('assemblies');
    }
};

// Change Order Form
const ChangeOrderForm = {
    open() {
        const estimates = Storage.getEstimates();

        Modal.open('New Change Order', `
            <form id="changeorder-form">
                ${Forms.createSelect('estimateId', 'Estimate', estimates.map(e => ({ value: e.id, label: e.name })), '', true)}
                ${Forms.createInput('name', 'Change Order Name', 'text', '', true)}
                ${Forms.createTextarea('reason', 'Reason for Change', '', true)}
            </form>
        `, `
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
            <button class="btn btn-primary" onclick="ChangeOrderForm.create()">Create Change Order</button>
        `);
    },

    create() {
        const values = Forms.getValues('changeorder-form');
        const estimate = Storage.getEstimates().find(e => e.id === values.estimateId);

        const orders = Storage.getChangeOrders();
        orders.push(createChangeOrder({
            estimateId: values.estimateId,
            jobId: estimate?.jobId,
            name: values.name,
            reason: values.reason
        }));

        Storage.saveChangeOrders(orders);
        Modal.close();
        Toast.success('Change order created');
        Views.navigate('changeorders');
    },

    delete(orderId) {
        const orders = Storage.getChangeOrders().filter(o => o.id !== orderId);
        Storage.saveChangeOrders(orders);
        Toast.success('Change order deleted');
        Views.navigate('changeorders');
    }
};

// Settings Form
const SettingsForm = {
    save() {
        const values = Forms.getValues('settings-form');
        Storage.saveSettings(values);
        Toast.success('Settings saved');
    }
};

// PHASE 3 VIEW FUNCTIONS

// Photo Notes Views
const PhotoNotesView = {
    render(container, jobId = null) {
        const notes = jobId ? Storage.getPhotoNotes().filter(n => n.jobId === jobId) : Storage.getPhotoNotes();
        const searchTerm = '';

        container.innerHTML = `
            <div class="search-bar">
                <input type="text" class="form-input" placeholder="Search photo notes..." id="photonote-search" oninput="PhotoNotesView.filter(this.value)">
            </div>
            <div class="quick-actions mb-md">
                <button class="btn btn-primary btn-lg" onclick="PhotoNoteForm.open()">
                    <span>📷</span> Add Photo Note
                </button>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${jobId ? 'Job Photo Notes' : 'All Photo Notes'} (${notes.length})</h3>
                </div>
                <div class="card-body no-padding" id="photonote-list">
                    ${notes.length > 0 ? this.renderList(notes) : createEmptyState('📷', 'No Photo Notes', 'Add photos to document site conditions, issues, and progress.')}
                </div>
            </div>
        `;
    },

    renderList(notes) {
        return notes.map(note => `
            <div class="line-item-card" onclick="PhotoNoteForm.open('${note.id}')">
                <div class="line-item-card-header">
                    <div class="line-item-card-title">${note.title}</div>
                    ${note.imageData ? `<span class="status-badge">📷</span>` : ''}
                </div>
                <div class="line-item-card-details">
                    <span>${note.room || 'No room'}</span>
                    <span>${formatDate(note.createdAt)}</span>
                </div>
                ${note.tags && note.tags.length > 0 ? `
                    <div class="mt-sm">
                        ${note.tags.map(tag => `<span class="warning-badge">${tag}</span>`).join(' ')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    },

    filter(term) {
        const notes = Storage.getPhotoNotes();
        const list = document.getElementById('photonote-list');
        if (list) {
            const filtered = term ? notes.filter(n => n.title.toLowerCase().includes(term.toLowerCase()) || (n.description && n.description.toLowerCase().includes(term.toLowerCase()))) : notes;
            list.innerHTML = this.renderList(filtered);
        }
    }
};

const PhotoNoteForm = {
    open(noteId = null) {
        const note = noteId ? Storage.getPhotoNotes().find(n => n.id === noteId) : null;
        const jobs = Storage.getJobs();
        const settings = Storage.getSettings() || {};

        Modal.open(note ? 'Edit Photo Note' : 'New Photo Note', `
            <form id="photonote-form">
                ${Forms.createSelect('jobId', 'Job', jobs.map(j => ({ value: j.id, label: j.name })), note?.jobId || currentJobId || '', true)}
                ${Forms.createInput('title', 'Title', 'text', note?.title || '', true)}
                <div class="form-group">
                    <label class="form-label">Photo</label>
                    ${note?.imageData ? `
                        <img src="${note.imageData}" style="max-width:100%; max-height:200px; border-radius:8px; margin-bottom:8px;">
                    ` : ''}
                    <input type="file" class="form-input" id="photo-input" accept="image/*" onchange="PhotoNoteForm.handlePhotoUpload(this)">
                    <input type="hidden" name="imageData" id="imageData" value="${note?.imageData || ''}">
                    <div class="form-help">Tap to take photo or select from device</div>
                </div>
                ${Forms.createTextarea('description', 'Description', note?.description || '')}
                <div class="form-row">
                    ${Forms.createSelect('room', 'Room/Area', ROOM_AREAS, note?.room || '')}
                </div>
                ${Forms.createInput('tags', 'Tags (comma-separated)', 'text', note?.tags ? note.tags.join(', ') : '', false, 'demo, damage, electrical')}
                ${Forms.createTextarea('notes', 'Notes', note?.notes || '')}
            </form>
        `, `
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
            ${note ? `<button class="btn btn-danger" onclick="confirm('Delete this photo note?', () => { PhotoNoteForm.delete('${note.id}'); })">Delete</button>` : ''}
            <button class="btn btn-primary" onclick="PhotoNoteForm.save('${noteId || ''}')">${note ? 'Update' : 'Save'} Photo Note</button>
        `);
    },

    handlePhotoUpload(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                let dataUrl = e.target.result;
                if (dataUrl.length > 500000) {
                    Toast.warning('Image too large, will be compressed');
                }
                document.getElementById('imageData').value = dataUrl;
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    save(existingId) {
        const values = Forms.getValues('photonote-form');
        if (!values.title || !values.jobId) {
            Toast.error('Title and job are required');
            return;
        }

        const tags = values.tags ? values.tags.split(',').map(t => t.trim()).filter(t => t) : [];

        const notes = Storage.getPhotoNotes();

        if (existingId) {
            const idx = notes.findIndex(n => n.id === existingId);
            if (idx !== -1) {
                notes[idx] = { ...notes[idx], ...values, tags, updatedAt: now() };
            }
        } else {
            notes.push(createPhotoNote({ ...values, tags }));
        }

        Storage.savePhotoNotes(notes);
        Modal.close();
        Toast.success('Photo note saved');
        Views.navigate('photnotes');
    },

    delete(noteId) {
        const notes = Storage.getPhotoNotes().filter(n => n.id !== noteId);
        Storage.savePhotoNotes(notes);
        Modal.close();
        Toast.success('Photo note deleted');
        Views.navigate('photnotes');
    }
};

// Subcontractor Bids Views
const SubBidsView = {
    render(container, jobId = null) {
        const bids = jobId ? Storage.getSubcontractorBids().filter(b => b.jobId === jobId) : Storage.getSubcontractorBids();

        container.innerHTML = `
            <div class="quick-actions mb-md">
                <button class="btn btn-primary btn-lg" onclick="SubBidForm.open()">
                    <span>🏗</span> Add Bid
                </button>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Subcontractor Bids (${bids.length})</h3>
                </div>
                <div class="card-body no-padding">
                    ${bids.length > 0 ? this.renderList(bids) : createEmptyState('🏗', 'No Bids', 'Add subcontractor bids to compare pricing.')}
                </div>
            </div>
        `;
    },

    renderList(bids) {
        const byTrade = {};
        bids.forEach(bid => {
            if (!byTrade[bid.trade]) byTrade[bid.trade] = [];
            byTrade[bid.trade].push(bid);
        });

        let html = '';
        Object.keys(byTrade).sort().forEach(trade => {
            const tradeBids = byTrade[trade].sort((a, b) => a.bidAmount - b.bidAmount);
            const selected = tradeBids.find(b => b.status === 'selected');

            html += `
                <div class="category-header" onclick="this.classList.toggle('collapsed'); this.nextElementSibling.classList.toggle('hidden');">
                    <div class="category-title">
                        <span class="category-toggle-icon">▼</span>
                        ${getCategoryLabel(trade)} (${tradeBids.length} bids)
                    </div>
                    ${selected ? `<span class="text-success">Selected: ${formatCurrency(selected.bidAmount)}</span>` : ''}
                </div>
                <div class="category-items">
            `;

            tradeBids.forEach(bid => {
                html += `
                    <div class="list-item" onclick="SubBidForm.open('${bid.id}')">
                        <div class="list-item-content">
                            <div class="list-item-title">${bid.companyName}</div>
                            <div class="list-item-subtitle">${bid.contactName || ''} • ${bid.leadTime || ''}</div>
                        </div>
                        <div class="list-item-meta">
                            ${createStatusBadge(bid.status, bid.status)}
                            <div class="list-item-value">${formatCurrency(bid.bidAmount)}</div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
        });

        return html;
    }
};

const SubBidForm = {
    open(bidId = null) {
        const bid = bidId ? Storage.getSubcontractorBids().find(b => b.id === bidId) : null;
        const jobs = Storage.getJobs();

        Modal.open(bid ? 'Edit Bid' : 'New Bid', `
            <form id="subbid-form">
                ${Forms.createSelect('jobId', 'Job', jobs.map(j => ({ value: j.id, label: j.name })), bid?.jobId || currentJobId || '', true)}
                ${Forms.createSelect('trade', 'Trade', TRADES, bid?.trade || 'electrical', true)}
                ${Forms.createInput('companyName', 'Company Name', 'text', bid?.companyName || '', true)}
                <div class="form-row">
                    ${Forms.createInput('contactName', 'Contact', 'text', bid?.contactName || '')}
                    ${Forms.createInput('phone', 'Phone', 'tel', bid?.phone || '')}
                </div>
                ${Forms.createInput('email', 'Email', 'email', bid?.email || '')}
                ${Forms.createCurrencyInput('bidAmount', 'Bid Amount', bid?.bidAmount || 0)}
                <div class="form-row">
                    ${Forms.createSelect('status', 'Status', BID_STATUSES, bid?.status || 'requested', true)}
                </div>
                ${Forms.createTextarea('exclusions', 'Exclusions', bid?.exclusions || '')}
                ${Forms.createInput('leadTime', 'Lead Time', 'text', bid?.leadTime || '', false, 'e.g., 2 weeks')}
                ${Forms.createTextarea('warranty', 'Warranty', bid?.warranty || '')}
                ${Forms.createTextarea('notes', 'Notes', bid?.notes || '')}
            </form>
        `, `
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
            ${bid ? `<button class="btn btn-danger" onclick="confirm('Delete this bid?', () => { SubBidForm.delete('${bid.id}'); })">Delete</button>` : ''}
            <button class="btn btn-primary" onclick="SubBidForm.save('${bidId || ''}')">${bid ? 'Update' : 'Save'} Bid</button>
        `);
    },

    save(existingId) {
        const values = Forms.getValues('subbid-form');
        if (!values.companyName) {
            Toast.error('Company name is required');
            return;
        }

        const bids = Storage.getSubcontractorBids();

        if (existingId) {
            const idx = bids.findIndex(b => b.id === existingId);
            if (idx !== -1) {
                bids[idx] = { ...bids[idx], ...values, updatedAt: now() };
            }
        } else {
            bids.push(createSubcontractorBid({ ...values }));
        }

        Storage.saveSubcontractorBids(bids);
        Modal.close();
        Toast.success('Bid saved');
        Views.navigate('subbids');
    },

    delete(bidId) {
        const bids = Storage.getSubcontractorBids().filter(b => b.id !== bidId);
        Storage.saveSubcontractorBids(bids);
        Modal.close();
        Toast.success('Bid deleted');
        Views.navigate('subbids');
    }
};

// Job Costs Views
const JobCostsView = {
    render(container, jobId = null) {
        const costs = jobId ? Storage.getActualCosts().filter(c => c.jobId === jobId) : Storage.getActualCosts();
        const jobs = Storage.getJobs();

        container.innerHTML = `
            <div class="quick-actions mb-md">
                <button class="btn btn-primary btn-lg" onclick="ActualCostForm.open()">
                    <span>💰</span> Add Cost
                </button>
            </div>
            <div class="stats-grid mb-md">
                <div class="stat-card">
                    <div class="stat-label">Material</div>
                    <div class="stat-value">${formatCurrency(costs.filter(c => c.category === 'material').reduce((sum, c) => sum + c.amount, 0))}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Labor</div>
                    <div class="stat-value">${formatCurrency(costs.filter(c => c.category === 'labor').reduce((sum, c) => sum + c.amount, 0))}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Subcontractor</div>
                    <div class="stat-value">${formatCurrency(costs.filter(c => c.category === 'subcontractor').reduce((sum, c) => sum + c.amount, 0))}</div>
                </div>
                <div class="stat-card accent">
                    <div class="stat-label">Total Actual</div>
                    <div class="stat-value currency">${formatCurrency(costs.reduce((sum, c) => sum + c.amount, 0))}</div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Actual Costs (${costs.length})</h3>
                </div>
                <div class="card-body no-padding">
                    ${costs.length > 0 ? this.renderList(costs) : createEmptyState('💰', 'No Costs', 'Track actual job costs to compare against estimates.')}
                </div>
            </div>
        `;
    },

    renderList(costs) {
        const byCategory = {};
        costs.forEach(cost => {
            if (!byCategory[cost.category]) byCategory[cost.category] = [];
            byCategory[cost.category].push(cost);
        });

        let html = '';
        Object.keys(byCategory).sort().forEach(cat => {
            const catCosts = byCategory[cat];
            html += `
                <div class="category-header" onclick="this.classList.toggle('collapsed'); this.nextElementSibling.classList.toggle('hidden');">
                    <div class="category-title">
                        <span class="category-toggle-icon">▼</span>
                        ${catCosts.length} ${cat} cost(s)
                    </div>
                    <div class="font-mono">${formatCurrency(catCosts.reduce((sum, c) => sum + c.amount, 0))}</div>
                </div>
                <div class="category-items">
            `;

            catCosts.forEach(cost => {
                html += `
                    <div class="list-item" onclick="ActualCostForm.open('${cost.id}')">
                        <div class="list-item-content">
                            <div class="list-item-title">${cost.description || cost.vendor || 'Cost'}</div>
                            <div class="list-item-subtitle">${cost.vendor || ''}</div>
                        </div>
                        <div class="list-item-meta">
                            <div>${formatDate(cost.date)}</div>
                            <div class="list-item-value">${formatCurrency(cost.amount)}</div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
        });

        return html;
    }
};

const ActualCostForm = {
    open(costId = null) {
        const cost = costId ? Storage.getActualCosts().find(c => c.id === costId) : null;
        const jobs = Storage.getJobs();

        Modal.open(cost ? 'Edit Cost' : 'New Cost', `
            <form id="actualcost-form">
                ${Forms.createSelect('jobId', 'Job', jobs.map(j => ({ value: j.id, label: j.name })), cost?.jobId || currentJobId || '', true)}
                ${Forms.createSelect('category', 'Category', COST_CATEGORIES, cost?.category || 'material', true)}
                ${Forms.createInput('vendor', 'Vendor/Payee', 'text', cost?.vendor || '')}
                ${Forms.createInput('description', 'Description', 'text', cost?.description || '', true)}
                ${Forms.createCurrencyInput('amount', 'Amount', cost?.amount || 0)}
                ${Forms.createInput('date', 'Date', 'date', cost?.date || new Date().toISOString().split('T')[0])}
                <div class="form-row">
                    ${Forms.createSelect('room', 'Room/Area', ROOM_AREAS, cost?.room || '')}
                </div>
                ${Forms.createTextarea('notes', 'Notes', cost?.notes || '')}
            </form>
        `, `
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
            ${cost ? `<button class="btn btn-danger" onclick="confirm('Delete this cost?', () => { ActualCostForm.delete('${cost.id}'); })">Delete</button>` : ''}
            <button class="btn btn-primary" onclick="ActualCostForm.save('${costId || ''}')">${cost ? 'Update' : 'Save'} Cost</button>
        `);
    },

    save(existingId) {
        const values = Forms.getValues('actualcost-form');
        if (!values.description) {
            Toast.error('Description is required');
            return;
        }

        const costs = Storage.getActualCosts();

        if (existingId) {
            const idx = costs.findIndex(c => c.id === existingId);
            if (idx !== -1) {
                costs[idx] = { ...costs[idx], ...values, updatedAt: now() };
            }
        } else {
            costs.push(createActualCost({ ...values }));
        }

        Storage.saveActualCosts(costs);
        Modal.close();
        Toast.success('Cost saved');
        Views.navigate('jobcosts');
    },

    delete(costId) {
        const costs = Storage.getActualCosts().filter(c => c.id !== costId);
        Storage.saveActualCosts(costs);
        Modal.close();
        Toast.success('Cost deleted');
        Views.navigate('jobcosts');
    }
};

// Make views globally available
window.Views = Views;
window.JobList = JobList;
window.JobForm = JobForm;
window.EstimateForm = EstimateForm;
window.EstimateBuilder = EstimateBuilder;
window.AssemblyPicker = AssemblyPicker;
window.ProposalView = ProposalView;
window.LibraryList = LibraryList;
window.LibraryForm = LibraryForm;
window.TemplateList = TemplateList;
window.TemplateForm = TemplateForm;
window.AssemblyList = AssemblyList;
window.AssemblyForm = AssemblyForm;
window.ChangeOrderForm = ChangeOrderForm;
window.SettingsForm = SettingsForm;
window.PhotoNotesView = PhotoNotesView;
window.PhotoNoteForm = PhotoNoteForm;
window.SubBidsView = SubBidsView;
window.SubBidForm = SubBidForm;
window.JobCostsView = JobCostsView;
window.ActualCostForm = ActualCostForm;

// BACKUP & RESTORE
const BackupForm = {
    download() {
        try {
            const data = Storage.getBackupData();
            if (!data) {
                Toast.error('Failed to create backup');
                return;
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `allens-contractors-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            Toast.success('Backup downloaded');
        } catch (e) {
            console.error(e);
            Toast.error('Failed to download backup');
        }
    },

    restore(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);

                if (!data.version) {
                    Toast.error('Invalid backup file');
                    return;
                }

                Modal.open('Restore Backup', `
                    <p>Found backup from ${data.exportedAt || 'unknown date'}</p>
                    <p class="text-warning">This will replace ALL current data. Continue?</p>
                `, `
                    <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
                    <button class="btn btn-danger" onclick="BackupForm.doRestore()">Replace All Data</button>
                `);

                window.BackupForm_pendingData = data;
            } catch (err) {
                Toast.error('Failed to read backup file');
            }
        };
        reader.readAsText(file);
        input.value = '';
    },

    doRestore() {
        const data = window.BackupForm_pendingData;
        if (!data) return;

        const result = Storage.restoreBackupData(data, false);

        Modal.close();
        if (result.success) {
            Toast.success('Backup restored successfully');
            setTimeout(() => location.reload(), 1000);
        } else {
            Toast.error('Failed to restore: ' + result.error);
        }
    }
};

// TEAM MEMBERS
const TeamMemberForm = {
    open(memberId = null) {
        const members = Storage.getTeamMembers();
        const member = memberId ? members.find(m => m.id === memberId) : null;

        Modal.open(member ? 'Edit Team Member' : 'Add Team Member', `
            <form id="team-member-form">
                ${Forms.createInput('name', 'Name', 'text', member?.name || '', true)}
                ${Forms.createSelect('role', 'Role', TEAM_ROLES, member?.role || '')}
                ${Forms.createInput('email', 'Email', 'email', member?.email || '')}
                ${Forms.createInput('phone', 'Phone', 'tel', member?.phone || '')}
            </form>
        `, `
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
            ${member ? `<button class="btn btn-danger" onclick="confirm('Delete this team member?', () => { TeamMemberForm.delete('${member.id}'); })">Delete</button>` : ''}
            <button class="btn btn-primary" onclick="TeamMemberForm.save('${memberId || ''}')">${member ? 'Update' : 'Add'} Member</button>
        `);
    },

    save(existingId) {
        const values = Forms.getValues('team-member-form');
        if (!values.name) {
            Toast.error('Name is required');
            return;
        }

        const members = Storage.getTeamMembers();

        if (existingId) {
            const idx = members.findIndex(m => m.id === existingId);
            if (idx !== -1) {
                members[idx] = { ...members[idx], ...values };
            }
        } else {
            members.push(createTeamMember(values));
        }

        Storage.saveTeamMembers(members);
        Modal.close();
        Toast.success('Team member saved');
        Views.navigate('settings');
    },

    delete(memberId) {
        const members = Storage.getTeamMembers().filter(m => m.id !== memberId);
        Storage.saveTeamMembers(members);
        Modal.close();
        Toast.success('Team member deleted');
        Views.navigate('settings');
    }
};

// SIGNATURE CAPTURE
const SignaturePad = {
    canvas: null,
    ctx: null,
    isDrawing: false,
    lastX: 0,
    lastY: 0,

    init(canvasId, width = 400, height = 150) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;

        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';

        // Mouse events
        canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        canvas.addEventListener('mousemove', (e) => this.draw(e));
        canvas.addEventListener('mouseup', () => this.stopDrawing());
        canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrawing({ offsetX: touch.clientX - canvas.getBoundingClientRect().left, offsetY: touch.clientY - canvas.getBoundingClientRect().top });
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.draw({ offsetX: touch.clientX - canvas.getBoundingClientRect().left, offsetY: touch.clientY - canvas.getBoundingClientRect().top });
        });
        canvas.addEventListener('touchend', () => this.stopDrawing());
    },

    startDrawing(e) {
        this.isDrawing = true;
        this.lastX = e.offsetX;
        this.lastY = e.offsetY;
    },

    draw(e) {
        if (!this.isDrawing) return;

        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(e.offsetX, e.offsetY);
        this.ctx.stroke();

        this.lastX = e.offsetX;
        this.lastY = e.offsetY;
    },

    stopDrawing() {
        this.isDrawing = false;
    },

    clear() {
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    },

    getData() {
        if (!this.canvas) return '';
        return this.canvas.toDataURL();
    }
};

// Make additional components available
window.BackupForm = BackupForm;
window.TeamMemberForm = TeamMemberForm;
window.SignaturePad = SignaturePad;