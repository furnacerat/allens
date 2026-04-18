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
            contracts: 'Contracts',
            warranties: 'Warranties',
            punchlists: 'Punch Lists',
            materials: 'Materials',
            schedule: 'Schedule',
            tasks: 'Tasks',
            crews: 'Crews',
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
            contracts: () => ContractsView.render(content),
warranties: () => WarrantiesView.render(content),
            punchlists: () => PunchListsView.render(content),
            materials: () => MaterialsView.render(content),
            schedule: () => ScheduleView.render(content),
            tasks: () => TasksView.render(content),
            crews: () => CrewsView.render(content),
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
        const tasks = Storage.getTasks();
        const events = Storage.getCalendarEvents();
        
        const today = new Date().toISOString().split('T')[0];
        
        const totalJobs = jobs.length;
        const totalEstimates = estimates.length;
        const drafts = estimates.filter(e => e.status === 'draft').length;
        const approved = estimates.filter(e => e.status === 'approved').length;
        
        let totalValue = 0;
        estimates.forEach(est => {
            const calc = calculateEstimate(est, settings);
            totalValue += calc.grandTotal;
        });
        
        // Today's items
        const todayTasks = tasks.filter(t => t.dueDate === today && t.status !== 'completed');
        const todayEvents = events.filter(e => e.startDate === today);
        const overdueTasks = tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'completed');
        
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

            <!-- Today's Overview -->
            <div class="card today-overview mb-lg">
                <div class="card-header">
                    <h3 class="card-title">Today</h3>
                    <button class="btn btn-sm btn-primary" onclick="Views.navigate('schedule')">Full Schedule</button>
                </div>
                <div class="card-body">
                    <div class="overview-stats">
                        <div class="overview-stat">
                            <div class="overview-value">${todayEvents.length}</div>
                            <div class="overview-label">Events</div>
                        </div>
                        <div class="overview-stat">
                            <div class="overview-value">${todayTasks.length}</div>
                            <div class="overview-label">Tasks Due</div>
                        </div>
                        <div class="overview-stat danger">
                            <div class="overview-value">${overdueTasks.length}</div>
                            <div class="overview-label">Overdue</div>
                        </div>
                    </div>
                    
                    ${todayEvents.length > 0 ? `
                        <div class="overview-section">
                            <h4>Schedule</h4>
                            ${todayEvents.slice(0, 3).map(ev => `
                                <div class="overview-item">
                                    <span class="overview-time">${ev.startTime || ''}</span>
                                    <span>${ev.title}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${todayTasks.length > 0 ? `
                        <div class="overview-section">
                            <h4>Tasks</h4>
                            ${todayTasks.slice(0, 3).map(t => `
                                <div class="overview-item">
                                    <input type="checkbox" onchange="TasksView.toggleComplete('${t.id}')">
                                    <span>${t.title}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
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
                <input type="text" class="form-input" placeholder="Search jobs..." id="job-search" oninput="Views.filterJobList(this.value)">
            </div>
            <div class="quick-actions mb-md">
                <button class="btn btn-primary btn-lg" onclick="JobForm.open()">
                    <span>➕</span> New Job
                </button>
            </div>
            <div class="card">
                <div class="card-body no-padding" id="job-list">
                    ${Views.renderJobList(jobs)}
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
        const branding = Storage.getBranding();

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
                    <h3 class="card-title">Branding</h3>
                    <button class="btn btn-primary" onclick="BrandingForm.save()">Save Branding</button>
                </div>
                <div class="card-body">
                    <form id="branding-form">
                        ${BrandingForm.renderLogoUpload()}
                        <div class="form-row">
                            ${Forms.createInput('companyTagline', 'Tagline', 'text', branding.companyTagline || '', false, 'e.g., Quality Craftsmanship Since 1995')}
                        </div>
                        ${Forms.createTextarea('companyMessage', 'Company Message', branding.companyMessage || '')}
                        <div class="form-row form-row-2">
                            ${Forms.createInput('facebook', 'Facebook URL', 'url', branding.facebook || '')}
                            ${Forms.createInput('instagram', 'Instagram URL', 'url', branding.instagram || '')}
                        </div>
                    </form>
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
        </div>`;
    },

    // Job List
    renderJobList(jobs, searchTerm = '') {
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
            <button class="list-item" onclick="JobDetailView.render(document.getElementById('content'), '${job.id}')">
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

    filterJobList(term) {
        const jobs = Storage.getJobs();
        const list = document.getElementById('job-list');
        if (list) list.innerHTML = this.renderJobList(jobs, term);
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
// Team Member Form
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

// BRANDING FORM
const BrandingForm = {
    renderLogoUpload() {
        const branding = Storage.getBranding();
        return `
            <div class="form-group">
                <label>Company Logo (optional)</label>
                <input type="file" id="branding-logo" accept="image/*" onchange="BrandingForm.previewLogo()">
                <div id="logo-preview" class="logo-preview mt-sm">
                    ${branding.logo ? `<img src="${branding.logo}" style="max-width:200px;max-height:80px;">` : ''}
                </div>
            </div>
        `;
    },
    
    previewLogo() {
        const file = document.getElementById('branding-logo').files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('logo-preview').innerHTML = `<img src="${e.target.result}" style="max-width:200px;max-height:80px;">`;
        };
        reader.readAsDataURL(file);
    },
    
    save() {
        const branding = Storage.getBranding();
        
        // Get logo if uploaded
        const logoInput = document.getElementById('branding-logo');
        if (logoInput && logoInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.doSave(e.target.result);
            };
            reader.readAsDataURL(logoInput.files[0]);
        } else {
            this.doSave(branding.logo);
        }
    },
    
    doSave(logoData) {
        const branding = {
            logo: logoData || '',
            companyTagline: document.getElementById('companyTagline').value,
            companyMessage: document.getElementById('companyMessage').value,
            facebook: document.getElementById('facebook').value,
            instagram: document.getElementById('instagram').value,
            updatedAt: now()
        };
        
        Storage.saveBranding(branding);
        Toast.success('Branding saved');
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

// ==========================================
// CONTRACTS VIEW
// ==========================================
const ContractsView = {
    render(container) {
        const contracts = Storage.getContracts();
        const jobs = Storage.getJobs();
        
        const sorted = contracts.sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate));
        
        let html = `
            <div class="view-header">
                <button class="btn btn-primary" onclick="ContractsView.createNew()">
                    <span>+ New Contract</span>
                </button>
            </div>
            <div class="card-list">
        `;
        
        if (sorted.length === 0) {
            html += `
                <div class="empty-state">
                    <p>No contracts yet.</p>
                    <p class="text-muted">Create a contract from an accepted estimate or manually.</p>
                </div>
            `;
        } else {
            sorted.forEach(contract => {
                const job = jobs.find(j => j.id === contract.jobId);
                const statusClass = contract.status === 'signed' ? 'status-success' : contract.status === 'issued' ? 'status-warning' : contract.status === 'void' ? 'status-danger' : 'status-muted';
                
                html += `
                    <div class="card" onclick="ContractsView.viewContract('${contract.id}')">
                        <div class="card-header">
                            <span class="contract-number">${contract.contractNumber}</span>
                            <span class="badge ${statusClass}">${contract.status}</span>
                        </div>
                        <div class="card-body">
                            <h3 class="card-title">${contract.title}</h3>
                            <p class="card-meta">${job ? job.name : 'No job linked'}</p>
                            <p class="card-amount">${formatCurrency(contract.amount)}</p>
                        </div>
                        <div class="card-footer">
                            <span>${contract.issueDate ? 'Issued: ' + formatDate(contract.issueDate) : 'Draft'}</span>
                        </div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    createNew(jobId = null, estimateId = null) {
        const jobs = Storage.getJobs();
        const estimates = Storage.getEstimates();
        const settings = Storage.getSettings();
        
        let prefillJob = null;
        let prefillEstimate = null;
        
        if (jobId) {
            prefillJob = jobs.find(j => j.id === jobId);
            if (estimateId) {
                prefillEstimate = estimates.find(e => e.id === estimateId);
            } else {
                prefillEstimate = estimates.find(e => e.jobId === jobId && e.status === 'accepted');
            }
        }
        
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = 'New Contract';
        content.innerHTML = `
            <form id="contract-form" class="form">
                <div class="form-group">
                    <label>Job</label>
                    <select id="contract-job-id" onchange="ContractsView.onJobChange()">
                        <option value="">Select a job...</option>
                        ${jobs.map(j => `<option value="${j.id}" ${prefillJob && j.id === prefillJob.id ? 'selected' : ''}>${j.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Estimate (optional)</label>
                    <select id="contract-estimate-id" disabled>
                        <option value="">Select estimate...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Contract Title</label>
                    <input type="text" id="contract-title" value="${prefillEstimate ? prefillEstimate.name + ' Contract' : ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Issue Date</label>
                        <input type="date" id="contract-issue-date" value="${today()}">
                    </div>
                    <div class="form-group">
                        <label>Effective Date</label>
                        <input type="date" id="contract-effective-date">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Start Date</label>
                        <input type="date" id="contract-start-date">
                    </div>
                    <div class="form-group">
                        <label>Completion Date</label>
                        <input type="date" id="contract-completion-date">
                    </div>
                </div>
                <div class="form-group">
                    <label>Contract Amount</label>
                    <input type="number" id="contract-amount" step="0.01" value="${prefillEstimate ? calculateEstimate(prefillEstimate, settings).grandTotal : 0}">
                </div>
                <div class="form-group">
                    <label>Scope Summary</label>
                    <textarea id="contract-scope">${prefillEstimate ? prefillEstimate.scopeSummary : ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Exclusions</label>
                    <textarea id="contract-exclusions">${settings.defaultExclusions || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Terms & Conditions</label>
                    <textarea id="contract-terms">${settings.defaultTerms || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Payment Terms</label>
                    <input type="text" id="contract-payment-terms" value="${settings.defaultTerms || ''}">
                </div>
                <div class="form-group">
                    <label>Cancellation Text</label>
                    <textarea id="contract-cancellation">Either party may cancel with 48 hours written notice. Deposit refunded if no work started.</textarea>
                </div>
                <div class="form-group">
                    <label>Warranty Text</label>
                    <textarea id="contract-warranty">1-year workmanship warranty on all labor. Manufacturer warranties pass through to homeowner.</textarea>
                </div>
                <div class="form-group">
                    <label>Prepared By</label>
                    <input type="text" id="contract-prepared-by" value="${settings.contactName || ''}">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Contract</button>
                </div>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        document.getElementById('contract-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveContract();
        });
        
        if (prefillJob) {
            document.getElementById('contract-job-id').value = prefillJob.id;
            this.loadEstimatesForJob(prefillJob.id, prefillEstimate ? prefillEstimate.id : null);
        }
    },
    
    onJobChange() {
        const jobId = document.getElementById('contract-job-id').value;
        this.loadEstimatesForJob(jobId);
    },
    
    loadEstimatesForJob(jobId, prefillEstimateId = null) {
        const estimateSelect = document.getElementById('contract-estimate-id');
        if (!jobId) {
            estimateSelect.innerHTML = '<option value="">Select estimate...</option>';
            estimateSelect.disabled = true;
            return;
        }
        
        const estimates = Storage.getEstimates().filter(e => e.jobId === jobId);
        
        if (estimates.length === 0) {
            estimateSelect.innerHTML = '<option value="">No estimates for this job</option>';
            estimateSelect.disabled = true;
            return;
        }
        
        estimateSelect.innerHTML = '<option value="">Select estimate...</option>' +
            estimates.map(e => `<option value="${e.id}" ${prefillEstimateId && e.id === prefillEstimateId ? 'selected' : ''}>${e.name} (${e.status})</option>`).join('');
        estimateSelect.disabled = false;
    },
    
    saveContract() {
        const contracts = Storage.getContracts();
        const settings = Storage.getSettings();
        
        const contract = createContract({
            jobId: document.getElementById('contract-job-id').value || null,
            estimateId: document.getElementById('contract-estimate-id').value || null,
            title: document.getElementById('contract-title').value,
            issueDate: document.getElementById('contract-issue-date').value,
            effectiveDate: document.getElementById('contract-effective-date').value || null,
            startDate: document.getElementById('contract-start-date').value || null,
            completionDate: document.getElementById('contract-completion-date').value || null,
            amount: parseFloat(document.getElementById('contract-amount').value) || 0,
            scopeSummary: document.getElementById('contract-scope').value,
            exclusions: document.getElementById('contract-exclusions').value,
            termsConditions: document.getElementById('contract-terms').value,
            paymentTerms: document.getElementById('contract-payment-terms').value,
            cancellationText: document.getElementById('contract-cancellation').value,
            warrantyText: document.getElementById('contract-warranty').value,
            preparedBy: document.getElementById('contract-prepared-by').value,
            createdBy: settings.contactName || ''
        });
        
        contracts.push(contract);
        Storage.saveContracts(contracts);
        
        Modal.close();
        Toast.success('Contract created');
        Views.render('contracts');
    },
    
    viewContract(contractId) {
        const contract = Storage.getContracts().find(c => c.id === contractId);
        if (!contract) return;
        
        const job = Storage.getJobs().find(j => j.id === contract.jobId);
        
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = contract.contractNumber;
        
        const statusActions = contract.status === 'draft' ? `
            <button class="btn btn-warning" onclick="ContractsView.updateStatus('${contract.id}', 'issued')">Mark Issued</button>
        ` : contract.status === 'issued' ? `
            <button class="btn btn-success" onclick="ContractsView.openSignatureModal('${contract.id}')">Collect Signatures</button>
        ` : '';
        
        content.innerHTML = `
            <div class="contract-view">
                <div class="contract-header-section">
                    <div>
                        <h2>${contract.title}</h2>
                        <p class="text-muted">${job ? job.name : 'No job linked'}</p>
                    </div>
                    <span class="badge badge-${contract.status === 'signed' ? 'success' : contract.status === 'issued' ? 'warning' : 'muted'}">${contract.status}</span>
                </div>
                
                <div class="contract-details">
                    <div class="detail-row">
                        <span class="detail-label">Contract Amount</span>
                        <span class="detail-value">${formatCurrency(contract.amount)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Issue Date</span>
                        <span class="detail-value">${contract.issueDate ? formatDate(contract.issueDate) : '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Start Date</span>
                        <span class="detail-value">${contract.startDate ? formatDate(contract.startDate) : '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Completion Date</span>
                        <span class="detail-value">${contract.completionDate ? formatDate(contract.completionDate) : '-'}</span>
                    </div>
                </div>
                
                <div class="contract-section">
                    <h4>Scope</h4>
                    <p>${contract.scopeSummary || 'No scope defined'}</p>
                </div>
                
                <div class="contract-section">
                    <h4>Exclusions</h4>
                    <p>${contract.exclusions || 'None listed'}</p>
                </div>
                
                <div class="contract-section">
                    <h4>Terms</h4>
                    <p>${contract.termsConditions || 'None listed'}</p>
                </div>
                
                ${contract.customerSignature || contract.contractorSignature ? `
                <div class="contract-section">
                    <h4>Signatures</h4>
                    ${contract.customerSignature ? `<p><strong>Customer:</strong> ${contract.customerSignature.name || '(signed)'}</p>` : ''}
                    ${contract.contractorSignature ? `<p><strong>Contractor:</strong> ${contract.contractorSignature.name || '(signed)'}</p>` : ''}
                    ${contract.signedDate ? `<p class="text-muted">Signed: ${formatDate(contract.signedDate)}</p>` : ''}
                </div>
                ` : ''}
                
                <div class="contract-actions">
                    ${statusActions}
                    <button class="btn btn-secondary" onclick="ContractsView.editContract('${contract.id}')">Edit</button>
                    <button class="btn btn-secondary" onclick="ContractsView.printContract('${contract.id}')">Print</button>
                    <button class="btn btn-danger" onclick="ContractsView.deleteContract('${contract.id}')">Delete</button>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
    },
    
    openSignatureModal(contractId) {
        const contract = Storage.getContracts().find(c => c.id === contractId);
        if (!contract) return;
        
        const settings = Storage.getSettings();
        
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = 'Sign Contract';
        content.innerHTML = `
            <form id="signature-form" class="form">
                <div class="signature-section">
                    <h4>Customer Signature</h4>
                    <div id="customer-sig-pad"></div>
                    <div class="form-group">
                        <label>Typed Name</label>
                        <input type="text" id="sig-customer-name" placeholder="Type full name">
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="ContractsView.clearSignature('customer')">Clear</button>
                </div>
                
                <div class="signature-section">
                    <h4>Contractor Signature</h4>
                    <div id="contractor-sig-pad"></div>
                    <div class="form-group">
                        <label>Typed Name</label>
                        <input type="text" id="sig-contractor-name" value="${settings.contactName || ''}">
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="ContractsView.clearSignature('contractor')">Clear</button>
                </div>
                
                <div class="form-group">
                    <label>Date Signed</label>
                    <input type="date" id="sig-date" value="${today()}">
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="ContractsView.viewContract('${contract.id}')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Signatures</button>
                </div>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        setTimeout(() => {
            window.customerSigPad = new SignaturePad('customer-sig-pad');
            window.contractorSigPad = new SignaturePad('contractor-sig-pad');
        }, 100);
        
        document.getElementById('signature-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSignatures(contractId);
        });
    },
    
    clearSignature(type) {
        if (type === 'customer' && window.customerSigPad) {
            window.customerSigPad.clear();
        } else if (type === 'contractor' && window.contractorSigPad) {
            window.contractorSigPad.clear();
        }
    },
    
    saveSignatures(contractId) {
        const contracts = Storage.getContracts();
        const contract = contracts.find(c => c.id === contractId);
        if (!contract) return;
        
        const customerSigData = window.customerSigPad ? window.customerSigPad.getData() : '';
        const contractorSigData = window.contractorSigPad ? window.contractorSigPad.getData() : '';
        
        contract.customerSignature = customerSigData ? { data: customerSigData, name: document.getElementById('sig-customer-name').value } : null;
        contract.contractorSignature = contractorSigData ? { data: contractorSigData, name: document.getElementById('sig-contractor-name').value } : null;
        contract.signedDate = document.getElementById('sig-date').value;
        contract.status = 'signed';
        contract.updatedDate = now();
        
        Storage.saveContracts(contracts);
        
        Modal.close();
        Toast.success('Contract signed');
        Views.render('contracts');
    },
    
    updateStatus(contractId, status) {
        const contracts = Storage.getContracts();
        const contract = contracts.find(c => c.id === contractId);
        if (!contract) return;
        
        contract.status = status;
        contract.updatedDate = now();
        
        Storage.saveContracts(contracts);
        
        Modal.close();
        Toast.success('Contract ' + status);
        Views.render('contracts');
    },
    
    editContract(contractId) {
        const contract = Storage.getContracts().find(c => c.id === contractId);
        if (!contract) return;
        
        const jobs = Storage.getJobs();
        
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = 'Edit Contract';
        content.innerHTML = `
            <form id="contract-edit-form" class="form">
                <div class="form-group">
                    <label>Contract Title</label>
                    <input type="text" id="edit-contract-title" value="${contract.title}">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Issue Date</label>
                        <input type="date" id="edit-contract-issue-date" value="${contract.issueDate || ''}">
                    </div>
                    <div class="form-group">
                        <label>Effective Date</label>
                        <input type="date" id="edit-contract-effective-date" value="${contract.effectiveDate || ''}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Start Date</label>
                        <input type="date" id="edit-contract-start-date" value="${contract.startDate || ''}">
                    </div>
                    <div class="form-group">
                        <label>Completion Date</label>
                        <input type="date" id="edit-contract-completion-date" value="${contract.completionDate || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Contract Amount</label>
                    <input type="number" id="edit-contract-amount" step="0.01" value="${contract.amount}">
                </div>
                <div class="form-group">
                    <label>Scope Summary</label>
                    <textarea id="edit-contract-scope">${contract.scopeSummary || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Exclusions</label>
                    <textarea id="edit-contract-exclusions">${contract.exclusions || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Terms</label>
                    <textarea id="edit-contract-terms">${contract.termsConditions || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        document.getElementById('contract-edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateContract(contractId);
        });
    },
    
    updateContract(contractId) {
        const contracts = Storage.getContracts();
        const contract = contracts.find(c => c.id === contractId);
        if (!contract) return;
        
        contract.title = document.getElementById('edit-contract-title').value;
        contract.issueDate = document.getElementById('edit-contract-issue-date').value || null;
        contract.effectiveDate = document.getElementById('edit-contract-effective-date').value || null;
        contract.startDate = document.getElementById('edit-contract-start-date').value || null;
        contract.completionDate = document.getElementById('edit-contract-completion-date').value || null;
        contract.amount = parseFloat(document.getElementById('edit-contract-amount').value) || 0;
        contract.scopeSummary = document.getElementById('edit-contract-scope').value;
        contract.exclusions = document.getElementById('edit-contract-exclusions').value;
        contract.termsConditions = document.getElementById('edit-contract-terms').value;
        contract.updatedDate = now();
        
        Storage.saveContracts(contracts);
        
        Modal.close();
        Toast.success('Contract updated');
        Views.render('contracts');
    },
    
    printContract(contractId) {
        const contract = Storage.getContracts().find(c => c.id === contractId);
        if (!contract) return;
        
        const job = Storage.getJobs().find(j => j.id === contract.jobId);
        const settings = Storage.getSettings();
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${contract.contractNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                    h1 { text-align: center; }
                    .header { text-align: center; margin-bottom: 40px; }
                    .company { font-size: 18px; font-weight: bold; }
                    h2 { border-bottom: 1px solid #333; padding-bottom: 10px; }
                    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; }
                    .detail-label { font-weight: bold; }
                    .section { margin: 30px 0; }
                    .signature-section { margin-top: 60px; display: flex; justify-content: space-between; }
                    .sig-box { width: 45%; }
                    .sig-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 8px; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company">${settings.companyName || "Allen's Contractor's"}</div>
                    ${settings.address ? `<div>${settings.address}</div>` : ''}
                    ${settings.phone ? `<div>${settings.phone}</div>` : ''}
                </div>
                
                <h1>${contract.contractNumber}</h1>
                <h2>${contract.title}</h2>
                
                <div class="detail-row">
                    <span>Date:</span>
                    <span>${contract.issueDate || today()}</span>
                </div>
                ${job ? `
                <div class="detail-row">
                    <span>Job:</span>
                    <span>${job.name}</span>
                </div>
                <div class="detail-row">
                    <span>Address:</span>
                    <span>${job.address || '-'}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                    <span>Contract Amount:</span>
                    <span><strong>${formatCurrency(contract.amount)}</strong></span>
                </div>
                
                <div class="section">
                    <h3>Project Scope</h3>
                    <p>${contract.scopeSummary || 'See attached scope of work.'}</p>
                </div>
                
                <div class="section">
                    <h3>Exclusions</h3>
                    <p>${contract.exclusions || 'None'}</p>
                </div>
                
                <div class="section">
                    <h3>Terms & Conditions</h3>
                    <p>${contract.termsConditions || 'Standard terms apply.'}</p>
                </div>
                
                <div class="section">
                    <h3>Payment Terms</h3>
                    <p>${contract.paymentTerms || 'Payment due upon completion.'}</p>
                </div>
                
                <div class="section">
                    <h3>Warranty</h3>
                    <p>${contract.warrantyText || '1-year workmanship warranty.'}</p>
                </div>
                
                <div class="signature-section">
                    <div class="sig-box">
                        <p>Customer Signature:</p>
                        ${contract.customerSignature ? `<img src="${contract.customerSignature.data}" style="max-width:200px;max-height:60px;">` : '<div class="sig-line"></div>'}
                        <p>${contract.customerSignature ? contract.customerSignature.name : ''}</p>
                        <p>Date: ${contract.signedDate || '________'}</p>
                    </div>
                    <div class="sig-box">
                        <p>Contractor Signature:</p>
                        ${contract.contractorSignature ? `<img src="${contract.contractorSignature.data}" style="max-width:200px;max-height:60px;">` : '<div class="sig-line"></div>'}
                        <p>${contract.contractorSignature ? contract.contractorSignature.name : ''}</p>
                        <p>Date: ${contract.signedDate || '________'}</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },
    
    deleteContract(contractId) {
        if (!confirm('Delete this contract?')) return;
        
        const contracts = Storage.getContracts();
        const filtered = contracts.filter(c => c.id !== contractId);
        Storage.saveContracts(filtered);
        
        Modal.close();
        Toast.success('Contract deleted');
        Views.render('contracts');
    }
};

window.ContractsView = ContractsView;

// Make contracts available from main render
Views.renderContracts = function(container) {
    ContractsView.render(container);
};

// ==========================================
// WARRANTIES VIEW
// ==========================================
const WarrantiesView = {
    render(container) {
        const warranties = Storage.getWarranties();
        const jobs = Storage.getJobs();
        
        const sorted = warranties.sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate));
        
        let html = `
            <div class="view-header">
                <button class="btn btn-primary" onclick="WarrantiesView.createNew()">
                    <span>+ New Warranty</span>
                </button>
            </div>
            <div class="card-list">
        `;
        
        if (sorted.length === 0) {
            html += `
                <div class="empty-state">
                    <p>No warranties yet.</p>
                    <p class="text-muted">Track labor and product warranties here.</p>
                </div>
            `;
        } else {
            sorted.forEach(warranty => {
                const job = jobs.find(j => j.id === warranty.jobId);
                const isExpired = warranty.status === 'expired';
                const statusClass = isExpired ? 'status-expired' : warranty.status === 'active' ? 'status-success' : 'status-muted';
                
                html += `
                    <div class="card" onclick="WarrantiesView.viewWarranty('${warranty.id}')">
                        <div class="card-header">
                            <span class="warranty-type">${warranty.type}</span>
                            <span class="badge ${statusClass}">${warranty.status}</span>
                        </div>
                        <div class="card-body">
                            <h3 class="card-title">${warranty.title}</h3>
                            <p class="card-meta">${job ? job.name : 'No job linked'}</p>
                        </div>
                        <div class="card-footer">
                            <span>${warranty.endDate ? 'Expires: ' + formatDate(warranty.endDate) : ''}</span>
                        </div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    createNew(jobId = null) {
        const jobs = Storage.getJobs();
        const completedJobs = jobs.filter(j => j.status === 'completed');
        
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = 'New Warranty';
        content.innerHTML = `
            <form id="warranty-form" class="form">
                <div class="form-group">
                    <label>Job</label>
                    <select id="warranty-job-id" required onchange="WarrantiesView.onJobChange()">
                        <option value="">Select a job...</option>
                        ${completedJobs.map(j => `<option value="${j.id}">${j.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Warranty Title</label>
                    <input type="text" id="warranty-title" required>
                </div>
                <div class="form-group">
                    <label>Warranty Type</label>
                    <select id="warranty-type">
                        ${WARRANTY_TYPES.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Coverage Description</label>
                    <textarea id="warranty-coverage"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Start Date</label>
                        <input type="date" id="warranty-start-date" value="${today()}">
                    </div>
                    <div class="form-group">
                        <label>End Date</label>
                        <input type="date" id="warranty-end-date">
                    </div>
                </div>
                <div class="form-group">
                    <label>Exclusions</label>
                    <textarea id="warranty-exclusions"></textarea>
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea id="warranty-notes"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Warranty</button>
                </div>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        document.getElementById('warranty-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveWarranty();
        });
        
        if (jobId) {
            document.getElementById('warranty-job-id').value = jobId;
        }
    },
    
    onJobChange() {
        // Could auto-fill contract info if needed
    },
    
    saveWarranty() {
        const warranties = Storage.getWarranties();
        
        const warranty = createWarranty({
            jobId: document.getElementById('warranty-job-id').value,
            title: document.getElementById('warranty-title').value,
            type: document.getElementById('warranty-type').value,
            coverageDescription: document.getElementById('warranty-coverage').value,
            startDate: document.getElementById('warranty-start-date').value,
            endDate: document.getElementById('warranty-end-date').value,
            exclusions: document.getElementById('warranty-exclusions').value,
            notes: document.getElementById('warranty-notes').value
        });
        
        warranties.push(warranty);
        Storage.saveWarranties(warranties);
        
        Modal.close();
        Toast.success('Warranty created');
        Views.render('warranties');
    },
    
    viewWarranty(warrantyId) {
        const warranty = Storage.getWarranties().find(w => w.id === warrantyId);
        if (!warranty) return;
        
        const job = Storage.getJobs().find(j => j.id === warranty.jobId);
        
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = warranty.title;
        
        content.innerHTML = `
            <div class="warranty-view">
                <div class="warranty-header">
                    <span class="badge badge-${warranty.status === 'active' ? 'success' : 'muted'}">${warranty.status}</span>
                    <span class="warranty-type">${warranty.type}</span>
                </div>
                
                <div class="warranty-details">
                    ${job ? `<p><strong>Job:</strong> ${job.name}</p>` : ''}
                    <p><strong>Coverage:</strong> ${warranty.coverageDescription || 'None described'}</p>
                    <p><strong>Start:</strong> ${warranty.startDate ? formatDate(warranty.startDate) : '-'}</p>
                    <p><strong>End:</strong> ${warranty.endDate ? formatDate(warranty.endDate) : '-'}</p>
                    ${warranty.exclusions ? `<p><strong>Exclusions:</strong> ${warranty.exclusions}</p>` : ''}
                    ${warranty.notes ? `<p><strong>Notes:</strong> ${warranty.notes}</p>` : ''}
                </div>
                
                <div class="warranty-actions">
                    <button class="btn btn-secondary" onclick="WarrantiesView.editWarranty('${warranty.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="WarrantiesView.deleteWarranty('${warranty.id}')">Delete</button>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
    },
    
    editWarranty(warrantyId) {
        const warranty = Storage.getWarranties().find(w => w.id === warrantyId);
        if (!warranty) return;
        
        const jobs = Storage.getJobs();
        
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = 'Edit Warranty';
        content.innerHTML = `
            <form id="warranty-edit-form" class="form">
                <div class="form-group">
                    <label>Job</label>
                    <select id="edit-warranty-job-id">
                        <option value="">Select job...</option>
                        ${jobs.map(j => `<option value="${j.id}" ${j.id === warranty.jobId ? 'selected' : ''}>${j.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="edit-warranty-title" value="${warranty.title}">
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select id="edit-warranty-type">
                        ${WARRANTY_TYPES.map(t => `<option value="${t.value}" ${t.value === warranty.type ? 'selected' : ''}>${t.label}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Coverage</label>
                    <textarea id="edit-warranty-coverage">${warranty.coverageDescription || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Start Date</label>
                        <input type="date" id="edit-warranty-start-date" value="${warranty.startDate || ''}">
                    </div>
                    <div class="form-group">
                        <label>End Date</label>
                        <input type="date" id="edit-warranty-end-date" value="${warranty.endDate || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="edit-warranty-status">
                        ${WARRANTY_STATUSES.map(s => `<option value="${s.value}" ${s.value === warranty.status ? 'selected' : ''}>${s.label}</option>`).join('')}
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        document.getElementById('warranty-edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateWarranty(warrantyId);
        });
    },
    
    updateWarranty(warrantyId) {
        const warranties = Storage.getWarranties();
        const warranty = warranties.find(w => w.id === warrantyId);
        if (!warranty) return;
        
        warranty.jobId = document.getElementById('edit-warranty-job-id').value || null;
        warranty.title = document.getElementById('edit-warranty-title').value;
        warranty.type = document.getElementById('edit-warranty-type').value;
        warranty.coverageDescription = document.getElementById('edit-warranty-coverage').value;
        warranty.startDate = document.getElementById('edit-warranty-start-date').value || null;
        warranty.endDate = document.getElementById('edit-warranty-end-date').value || null;
        warranty.status = document.getElementById('edit-warranty-status').value;
        warranty.updatedDate = now();
        
        Storage.saveWarranties(warranties);
        
        Modal.close();
        Toast.success('Warranty updated');
        Views.render('warranties');
    },
    
    deleteWarranty(warrantyId) {
        if (!confirm('Delete this warranty?')) return;
        
        const warranties = Storage.getWarranties();
        const filtered = warranties.filter(w => w.id !== warrantyId);
        Storage.saveWarranties(filtered);
        
        Modal.close();
        Toast.success('Warranty deleted');
        Views.render('warranties');
    }
};

window.WarrantiesView = WarrantiesView;

// ==========================================
// PUNCH LISTS VIEW
// ==========================================
const PunchListsView = {
    render(container) {
        const punchLists = Storage.getPunchLists();
        const jobs = Storage.getJobs();
        
        const sorted = punchLists.sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate));
        
        let html = `
            <div class="view-header">
                <button class="btn btn-primary" onclick="PunchListsView.createNew()">
                    <span>+ New Punch List</span>
                </button>
            </div>
            <div class="card-list">
        `;
        
        if (sorted.length === 0) {
            html += `
                <div class="empty-state">
                    <p>No punch lists yet.</p>
                    <p class="text-muted">Track remaining tasks and closeout items.</p>
                </div>
            `;
        } else {
            sorted.forEach(pl => {
                const job = jobs.find(j => j.id === pl.jobId);
                const totalItems = pl.items ? pl.items.length : 0;
                const completedItems = pl.items ? pl.items.filter(i => i.status === 'completed').length : 0;
                const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                
                html += `
                    <div class="card" onclick="PunchListsView.viewPunchList('${pl.id}')">
                        <div class="card-header">
                            <span class="punch-status">${pl.status}</span>
                        </div>
                        <div class="card-body">
                            <h3 class="card-title">${pl.title}</h3>
                            <p class="card-meta">${job ? job.name : 'No job linked'}</p>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width:${percent}%"></div>
                            </div>
                            <p class="progress-text">${completedItems}/${totalItems} complete (${percent}%)</p>
                        </div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    createNew(jobId = null) {
        const jobs = Storage.getJobs();
        
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = 'New Punch List';
        content.innerHTML = `
            <form id="punchlist-form" class="form">
                <div class="form-group">
                    <label>Job</label>
                    <select id="punchlist-job-id" required>
                        <option value="">Select a job...</option>
                        ${jobs.map(j => `<option value="${j.id}" ${j.id === jobId ? 'selected' : ''}>${j.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="punchlist-title" value="Punch List" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create</button>
                </div>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        document.getElementById('punchlist-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePunchList();
        });
    },
    
    savePunchList() {
        const punchLists = Storage.getPunchLists();
        
        const pl = createPunchList({
            jobId: document.getElementById('punchlist-job-id').value,
            title: document.getElementById('punchlist-title').value
        });
        
        punchLists.push(pl);
        Storage.savePunchLists(punchLists);
        
        Modal.close();
        Toast.success('Punch list created');
        Views.render('punchlists');
    },
    
    viewPunchList(punchListId) {
        const pl = Storage.getPunchLists().find(p => p.id === punchListId);
        if (!pl) return;
        
        const job = Storage.getJobs().find(j => j.id === pl.jobId);
        
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = pl.title;
        
        const totalItems = pl.items ? pl.items.length : 0;
        const completedItems = pl.items ? pl.items.filter(i => i.status === 'completed').length : 0;
        
        content.innerHTML = `
            <div class="punchlist-view">
                <div class="punchlist-header">
                    <p class="text-muted">${job ? job.name : 'No job linked'}</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width:${totalItems > 0 ? (completedItems/totalItems)*100 : 0}%"></div>
                    </div>
                    <p>${completedItems}/${totalItems} complete</p>
                </div>
                
                <div class="punchlist-items">
                    ${this.renderPunchItems(pl)}
                </div>
                
                <button class="btn btn-primary" onclick="PunchListsView.addItem('${pl.id}')">+ Add Item</button>
                
                <div class="punchlist-actions">
                    <button class="btn btn-secondary" onclick="PunchListsView.printPunchList('${pl.id}')">Print</button>
                    <button class="btn btn-danger" onclick="PunchListsView.deletePunchList('${pl.id}')">Delete</button>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
        window.currentPunchListId = punchListId;
    },
    
    renderPunchItems(pl) {
        if (!pl.items || pl.items.length === 0) {
            return '<p class="text-muted">No items yet.</p>';
        }
        
        return pl.items.map(item => `
            <div class="punch-item ${item.status}" onclick="event.stopPropagation()">
                <div class="punch-item-check">
                    <input type="checkbox" ${item.status === 'completed' ? 'checked' : ''} 
                           onchange="PunchListsView.toggleItem('${pl.id}', '${item.id}')">
                </div>
                <div class="punch-item-content">
                    <p class="punch-item-title">${item.title}</p>
                    <p class="punch-item-meta">${item.roomArea} | ${item.priority}</p>
                </div>
                <button class="btn-icon" onclick="PunchListsView.editItem('${pl.id}', '${item.id}')">✎</button>
            </div>
        `).join('');
    },
    
    addItem(punchListId) {
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = 'Add Punch Item';
        content.innerHTML = `
            <form id="punchitem-form" class="form">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="punchitem-title" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="punchitem-description"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Room/Area</label>
                        <input type="text" id="punchitem-room">
                    </div>
                    <div class="form-group">
                        <label>Priority</label>
                        <select id="punchitem-priority">
                            ${PUNCH_ITEM_PRIORITIES.map(p => `<option value="${p.value}">${p.label}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Due Date</label>
                    <input type="date" id="punchitem-due-date">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="PunchListsView.viewPunchList('${punchListId}')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Item</button>
                </div>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        document.getElementById('punchitem-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveItem(punchListId);
        });
    },
    
    saveItem(punchListId) {
        const punchLists = Storage.getPunchLists();
        const pl = punchLists.find(p => p.id === punchListId);
        if (!pl) return;
        
        if (!pl.items) pl.items = [];
        
        pl.items.push(createPunchItem({
            title: document.getElementById('punchitem-title').value,
            description: document.getElementById('punchitem-description').value,
            roomArea: document.getElementById('punchitem-room').value,
            priority: document.getElementById('punchitem-priority').value,
            dueDate: document.getElementById('punchitem-due-date').value || null
        }));
        
        pl.updatedDate = now();
        Storage.savePunchLists(punchLists);
        
        Modal.close();
        Toast.success('Item added');
        this.viewPunchList(punchListId);
    },
    
    toggleItem(punchListId, itemId) {
        const punchLists = Storage.getPunchLists();
        const pl = punchLists.find(p => p.id === punchListId);
        if (!pl || !pl.items) return;
        
        const item = pl.items.find(i => i.id === itemId);
        if (!item) return;
        
        item.status = item.status === 'completed' ? 'open' : 'completed';
        item.completionDate = item.status === 'completed' ? now() : null;
        pl.updatedDate = now();
        
        Storage.savePunchLists(punchLists);
        
        this.viewPunchList(punchListId);
    },
    
    editItem(punchListId, itemId) {
        const punchLists = Storage.getPunchLists();
        const pl = punchLists.find(p => p.id === punchListId);
        if (!pl || !pl.items) return;
        
        const item = pl.items.find(i => i.id === itemId);
        if (!item) return;
        
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = 'Edit Punch Item';
        content.innerHTML = `
            <form id="punchitem-edit-form" class="form">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="edit-punchitem-title" value="${item.title}">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="edit-punchitem-description">${item.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Room/Area</label>
                    <input type="text" id="edit-punchitem-room" value="${item.roomArea || ''}">
                </div>
                <div class="form-group">
                    <label>Priority</label>
                    <select id="edit-punchitem-priority">
                        ${PUNCH_ITEM_PRIORITIES.map(p => `<option value="${p.value}" ${p.value === item.priority ? 'selected' : ''}>${p.label}</option>`).join('')}
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-danger" onclick="PunchListsView.deleteItem('${punchListId}', '${itemId}')">Delete</button>
                    <button type="button" class="btn btn-secondary" onclick="PunchListsView.viewPunchList('${punchListId}')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        document.getElementById('punchitem-edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateItem(punchListId, itemId);
        });
    },
    
    updateItem(punchListId, itemId) {
        const punchLists = Storage.getPunchLists();
        const pl = punchLists.find(p => p.id === punchListId);
        if (!pl || !pl.items) return;
        
        const item = pl.items.find(i => i.id === itemId);
        if (!item) return;
        
        item.title = document.getElementById('edit-punchitem-title').value;
        item.description = document.getElementById('edit-punchitem-description').value;
        item.roomArea = document.getElementById('edit-punchitem-room').value;
        item.priority = document.getElementById('edit-punchitem-priority').value;
        pl.updatedDate = now();
        
        Storage.savePunchLists(punchLists);
        
        Modal.close();
        Toast.success('Item updated');
        this.viewPunchList(punchListId);
    },
    
    deleteItem(punchListId, itemId) {
        if (!confirm('Delete this item?')) return;
        
        const punchLists = Storage.getPunchLists();
        const pl = punchLists.find(p => p.id === punchListId);
        if (!pl || !pl.items) return;
        
        pl.items = pl.items.filter(i => i.id !== itemId);
        pl.updatedDate = now();
        
        Storage.savePunchLists(punchLists);
        
        Modal.close();
        Toast.success('Item deleted');
        this.viewPunchList(punchListId);
    },
    
    printPunchList(punchListId) {
        const pl = Storage.getPunchLists().find(p => p.id === punchListId);
        if (!pl) return;
        
        const job = Storage.getJobs().find(j => j.id === pl.jobId);
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${pl.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                    h1 { text-align: center; }
                    .item { display: flex; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .checkbox { width: 20px; height: 20px; border: 1px solid #333; margin-right: 15px; }
                    .title { flex: 1; }
                    .meta { color: #666; font-size: 12px; }
                    .priority-high { color: #c00; }
                    .priority-medium { color: #c90; }
                </style>
            </head>
            <body>
                <h1>${pl.title}</h1>
                ${job ? `<p><strong>Job:</strong> ${job.name}</p>` : ''}
                
                ${pl.items && pl.items.length > 0 ? pl.items.map(item => `
                    <div class="item">
                        <div class="checkbox"></div>
                        <div>
                            <div class="title">${item.title}</div>
                            <div class="meta">${item.roomArea} | ${item.priority}</div>
                        </div>
                    </div>
                `).join('') : '<p>No items</p>'}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },
    
    deletePunchList(punchListId) {
        if (!confirm('Delete this punch list?')) return;
        
        const punchLists = Storage.getPunchLists();
        const filtered = punchLists.filter(p => p.id !== punchListId);
        Storage.savePunchLists(filtered);
        
        Modal.close();
        Toast.success('Punch list deleted');
        Views.render('punchlists');
    }
};

window.PunchListsView = PunchListsView;

// ==========================================
// MATERIALS VIEW
// ==========================================
const MaterialsView = {
    render(container) {
        const materialLists = Storage.getMaterialLists();
        const jobs = Storage.getJobs();
        
        const sorted = materialLists.sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate));
        
        let html = `
            <div class="view-header">
                <button class="btn btn-primary" onclick="MaterialsView.createNew()">
                    <span>+ New Material List</span>
                </button>
            </div>
            <div class="card-list">
        `;
        
        if (sorted.length === 0) {
            html += `
                <div class="empty-state">
                    <p>No material lists yet.</p>
                    <p class="text-muted">Create shopping lists for jobs.</p>
                </div>
            `;
        } else {
            sorted.forEach(ml => {
                const job = jobs.find(j => j.id === ml.jobId);
                const totalItems = ml.items ? ml.items.length : 0;
                const orderedItems = ml.items ? ml.items.filter(i => i.ordered).length : 0;
                const totalCost = ml.items ? ml.items.reduce((sum, i) => sum + (i.estimatedCost || 0), 0) : 0;
                
                html += `
                    <div class="card" onclick="MaterialsView.viewMaterialList('${ml.id}')">
                        <div class="card-header">
                            <span class="material-status">${ml.status}</span>
                        </div>
                        <div class="card-body">
                            <h3 class="card-title">${ml.title}</h3>
                            <p class="card-meta">${job ? job.name : 'No job linked'}</p>
                            <p class="card-amount">Est: ${formatCurrency(totalCost)}</p>
                            <p class="card-meta">${orderedItems}/${totalItems} ordered</p>
                        </div>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    createNew(jobId = null, estimateId = null) {
        const jobs = Storage.getJobs();
        
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = 'New Material List';
        content.innerHTML = `
            <form id="materiallist-form" class="form">
                <div class="form-group">
                    <label>Job</label>
                    <select id="materiallist-job-id" required>
                        <option value="">Select a job...</option>
                        ${jobs.map(j => `<option value="${j.id}" ${j.id === jobId ? 'selected' : ''}>${j.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="materiallist-title" value="Material List" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create</button>
                </div>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        document.getElementById('materiallist-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMaterialList();
        });
    },
    
    saveMaterialList() {
        const materialLists = Storage.getMaterialLists();
        
        const ml = createMaterialList({
            jobId: document.getElementById('materiallist-job-id').value,
            title: document.getElementById('materiallist-title').value
        });
        
        materialLists.push(ml);
        Storage.saveMaterialLists(materialLists);
        
        Modal.close();
        Toast.success('Material list created');
        Views.render('materials');
    },
    
    viewMaterialList(materialListId) {
        const ml = Storage.getMaterialLists().find(m => m.id === materialListId);
        if (!ml) return;
        
        const job = Storage.getJobs().find(j => j.id === ml.jobId);
        
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = ml.title;
        
        const totalEst = ml.items ? ml.items.reduce((s, i) => s + (i.estimatedCost || 0), 0) : 0;
        const orderedCount = ml.items ? ml.items.filter(i => i.ordered).length : 0;
        
        content.innerHTML = `
            <div class="materiallist-view">
                <div class="materiallist-header">
                    <p class="text-muted">${job ? job.name : 'No job linked'}</p>
                    <p><strong>Total Estimated:</strong> ${formatCurrency(totalEst)}</p>
                    <p>${orderedCount}/${ml.items ? ml.items.length : 0} ordered</p>
                </div>
                
                <div class="materiallist-items">
                    ${this.renderMaterialItems(ml)}
                </div>
                
                <button class="btn btn-primary" onclick="MaterialsView.addItem('${ml.id}')">+ Add Item</button>
                
                <div class="materiallist-actions">
                    <button class="btn btn-secondary" onclick="MaterialsView.printMaterialList('${ml.id}')">Print</button>
                    <button class="btn btn-danger" onclick="MaterialsView.deleteMaterialList('${ml.id}')">Delete</button>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
        window.currentMaterialListId = materialListId;
    },
    
    renderMaterialItems(ml) {
        if (!ml.items || ml.items.length === 0) {
            return '<p class="text-muted">No items yet.</p>';
        }
        
        const grouped = {};
        ml.items.forEach(item => {
            const cat = item.category || 'misc';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
        });
        
        let html = '';
        for (const cat in grouped) {
            html += `<div class="material-category"><h4>${cat.toUpperCase()}</h4>`;
            html += grouped[cat].map(item => `
                <div class="material-item" onclick="event.stopPropagation()">
                    <div class="material-item-check">
                        <input type="checkbox" ${item.ordered ? 'checked' : ''} 
                               onchange="MaterialsView.toggleOrdered('${ml.id}', '${item.id}')">
                    </div>
                    <div class="material-item-content" onclick="MaterialsView.editItem('${ml.id}', '${item.id}')">
                        <p class="material-item-name">${item.name}</p>
                        <p class="material-item-meta">${item.quantity} ${item.unit} | ${formatCurrency(item.estimatedCost)}</p>
                    </div>
                    ${item.received ? '<span class="badge badge-success">✓</span>' : ''}
                </div>
            `).join('');
            html += '</div>';
        }
        
        return html;
    },
    
    addItem(materialListId) {
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = 'Add Material Item';
        content.innerHTML = `
            <form id="materialitem-form" class="form">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="materialitem-name" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" id="materialitem-description">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Quantity</label>
                        <input type="number" id="materialitem-quantity" value="1" min="1">
                    </div>
                    <div class="form-group">
                        <label>Unit</label>
                        <select id="materialitem-unit">
                            ${MATERIAL_UNITS.map(u => `<option value="${u.value}">${u.label}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Category</label>
                        <select id="materialitem-category">
                            ${MATERIAL_CATEGORIES.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Room/Area</label>
                        <input type="text" id="materialitem-room">
                    </div>
                </div>
                <div class="form-group">
                    <label>Vendor</label>
                    <input type="text" id="materialitem-vendor">
                </div>
                <div class="form-group">
                    <label>Estimated Cost</label>
                    <input type="number" id="materialitem-cost" step="0.01" value="0">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="MaterialsView.viewMaterialList('${materialListId}')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Item</button>
                </div>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        document.getElementById('materialitem-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveItem(materialListId);
        });
    },
    
    saveItem(materialListId) {
        const materialLists = Storage.getMaterialLists();
        const ml = materialLists.find(m => m.id === materialListId);
        if (!ml) return;
        
        if (!ml.items) ml.items = [];
        
        ml.items.push(createMaterialItem({
            name: document.getElementById('materialitem-name').value,
            description: document.getElementById('materialitem-description').value,
            quantity: parseFloat(document.getElementById('materialitem-quantity').value) || 1,
            unit: document.getElementById('materialitem-unit').value,
            category: document.getElementById('materialitem-category').value,
            roomArea: document.getElementById('materialitem-room').value,
            vendor: document.getElementById('materialitem-vendor').value,
            estimatedCost: parseFloat(document.getElementById('materialitem-cost').value) || 0
        }));
        
        ml.updatedDate = now();
        Storage.saveMaterialLists(materialLists);
        
        Modal.close();
        Toast.success('Item added');
        this.viewMaterialList(materialListId);
    },
    
    toggleOrdered(materialListId, itemId) {
        const materialLists = Storage.getMaterialLists();
        const ml = materialLists.find(m => m.id === materialListId);
        if (!ml || !ml.items) return;
        
        const item = ml.items.find(i => i.id === itemId);
        if (!item) return;
        
        item.ordered = !item.ordered;
        ml.updatedDate = now();
        
        Storage.saveMaterialLists(materialLists);
        this.viewMaterialList(materialListId);
    },
    
    editItem(materialListId, itemId) {
        const materialLists = Storage.getMaterialLists();
        const ml = materialLists.find(m => m.id === materialListId);
        if (!ml || !ml.items) return;
        
        const item = ml.items.find(i => i.id === itemId);
        if (!item) return;
        
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = 'Edit Material Item';
        content.innerHTML = `
            <form id="materialitem-edit-form" class="form">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="edit-materialitem-name" value="${item.name}">
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" id="edit-materialitem-quantity" value="${item.quantity}" min="1">
                </div>
                <div class="form-group">
                    <label>Unit</label>
                    <select id="edit-materialitem-unit">
                        ${MATERIAL_UNITS.map(u => `<option value="${u.value}" ${u.value === item.unit ? 'selected' : ''}>${u.label}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select id="edit-materialitem-category">
                        ${MATERIAL_CATEGORIES.map(c => `<option value="${c.value}" ${c.value === item.category ? 'selected' : ''}>${c.label}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Estimated Cost</label>
                    <input type="number" id="edit-materialitem-cost" step="0.01" value="${item.estimatedCost || 0}">
                </div>
                <div class="form-group">
                    <label>Received</label>
                    <input type="checkbox" id="edit-materialitem-received" ${item.received ? 'checked' : ''}>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-danger" onclick="MaterialsView.deleteItem('${materialListId}', '${itemId}')">Delete</button>
                    <button type="button" class="btn btn-secondary" onclick="MaterialsView.viewMaterialList('${materialListId}')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        document.getElementById('materialitem-edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateItem(materialListId, itemId);
        });
    },
    
    updateItem(materialListId, itemId) {
        const materialLists = Storage.getMaterialLists();
        const ml = materialLists.find(m => m.id === materialListId);
        if (!ml || !ml.items) return;
        
        const item = ml.items.find(i => i.id === itemId);
        if (!item) return;
        
        item.name = document.getElementById('edit-materialitem-name').value;
        item.quantity = parseFloat(document.getElementById('edit-materialitem-quantity').value) || 1;
        item.unit = document.getElementById('edit-materialitem-unit').value;
        item.category = document.getElementById('edit-materialitem-category').value;
        item.estimatedCost = parseFloat(document.getElementById('edit-materialitem-cost').value) || 0;
        item.received = document.getElementById('edit-materialitem-received').checked;
        ml.updatedDate = now();
        
        Storage.saveMaterialLists(materialLists);
        
        Modal.close();
        Toast.success('Item updated');
        this.viewMaterialList(materialListId);
    },
    
    deleteItem(materialListId, itemId) {
        if (!confirm('Delete this item?')) return;
        
        const materialLists = Storage.getMaterialLists();
        const ml = materialLists.find(m => m.id === materialListId);
        if (!ml || !ml.items) return;
        
        ml.items = ml.items.filter(i => i.id !== itemId);
        ml.updatedDate = now();
        
        Storage.saveMaterialLists(materialLists);
        
        Modal.close();
        Toast.success('Item deleted');
        this.viewMaterialList(materialListId);
    },
    
    printMaterialList(materialListId) {
        const ml = Storage.getMaterialLists().find(m => m.id === materialListId);
        if (!ml) return;
        
        const job = Storage.getJobs().find(j => j.id === ml.jobId);
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${ml.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                    h1 { text-align: center; }
                    .item { display: flex; padding: 8px 0; border-bottom: 1px solid #eee; }
                    .checkbox { width: 15px; height: 15px; border: 1px solid #333; margin-right: 10px; }
                    .name { flex: 1; }
                    .qty { width: 60px; }
                    .cost { width: 80px; text-align: right; }
                </style>
            </head>
            <body>
                <h1>${ml.title}</h1>
                ${job ? `<p><strong>Job:</strong> ${job.name}</p>` : ''}
                
                <table style="width:100%;margin-top:20px;">
                    <tr style="font-weight:bold;border-bottom:2px solid #333;">
                        <td></td><td>Item</td><td>Qty</td><td style="text-align:right;">Est Cost</td>
                    </tr>
                    ${ml.items ? ml.items.map(item => `
                        <tr class="item">
                            <td><div class="checkbox"></div></td>
                            <td>${item.name}</td>
                            <td>${item.quantity} ${item.unit}</td>
                            <td class="cost">${formatCurrency(item.estimatedCost)}</td>
                        </tr>
                    `).join('') : ''}
                </table>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },
    
    deleteMaterialList(materialListId) {
        if (!confirm('Delete this material list?')) return;
        
        const materialLists = Storage.getMaterialLists();
        const filtered = materialLists.filter(m => m.id !== materialListId);
        Storage.saveMaterialLists(filtered);
        
        Modal.close();
        Toast.success('Material list deleted');
        Views.render('materials');
    }
};

window.MaterialsView = MaterialsView;

// ==========================================
// COMMUNICATION LOG VIEW
// ==========================================
const CommunicationLogView = {
    renderForJob(container, jobId) {
        const logs = Storage.getCommunicationLogs().filter(l => l.jobId === jobId).sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
        
        let html = `
            <div class="comm-log-list">
                <button class="btn btn-primary btn-sm" onclick="CommunicationLogView.addLog('${jobId}')">+ Add Note</button>
        `;
        
        if (logs.length === 0) {
            html += '<p class="text-muted mt-md">No communications logged.</p>';
        } else {
            logs.forEach(log => {
                const followUpBadge = log.followUpNeeded ? '<span class="badge badge-warning">Follow-up</span>' : '';
                html += `
                    <div class="comm-log-item" onclick="CommunicationLogView.editLog('${log.id}')">
                        <div class="comm-log-header">
                            <span class="comm-log-type">${log.type}</span>
                            <span class="comm-log-date">${formatDateTime(log.dateTime)}</span>
                            ${followUpBadge}
                        </div>
                        <p class="comm-log-subject">${log.subject}</p>
                        <p class="comm-log-contact">${log.contactPerson}</p>
                        <p class="comm-log-notes">${log.notes.substring(0, 100)}${log.notes.length > 100 ? '...' : ''}</p>
                    </div>
                `;
            });
        }
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    addLog(jobId) {
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = 'Add Communication';
        content.innerHTML = `
            <form id="commlog-form" class="form">
                <div class="form-group">
                    <label>Type</label>
                    <select id="commlog-type">
                        ${COMMUNICATION_TYPES.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Contact Person</label>
                    <input type="text" id="commlog-contact" required>
                </div>
                <div class="form-group">
                    <label>Subject</label>
                    <input type="text" id="commlog-subject" required>
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea id="commlog-notes" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label><input type="checkbox" id="commlog-followup"> Follow-up needed</label>
                </div>
                <div class="form-group">
                    <label>Follow-up Date</label>
                    <input type="date" id="commlog-followup-date">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        document.getElementById('commlog-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveLog(jobId);
        });
    },
    
    saveLog(jobId) {
        const logs = Storage.getCommunicationLogs();
        
        logs.push(createCommunicationLog({
            jobId: jobId,
            type: document.getElementById('commlog-type').value,
            contactPerson: document.getElementById('commlog-contact').value,
            subject: document.getElementById('commlog-subject').value,
            notes: document.getElementById('commlog-notes').value,
            followUpNeeded: document.getElementById('commlog-followup').checked,
            followUpDate: document.getElementById('commlog-followup-date').value || null
        }));
        
        Storage.saveCommunicationLogs(logs);
        Modal.close();
        Toast.success('Communication logged');
        
        // Refresh job detail if open
        if (window.currentJobDetailId) {
            const content = document.getElementById('content');
            JobDetailView.render(content, window.currentJobDetailId);
        }
    },
    
    editLog(logId) {
        const log = Storage.getCommunicationLogs().find(l => l.id === logId);
        if (!log) return;
        
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const content = document.getElementById('modal-content');
        
        title.textContent = 'Edit Communication';
        content.innerHTML = `
            <form id="commlog-edit-form" class="form">
                <div class="form-group">
                    <label>Type</label>
                    <select id="edit-commlog-type">
                        ${COMMUNICATION_TYPES.map(t => `<option value="${t.value}" ${t.value === log.type ? 'selected' : ''}>${t.label}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Contact Person</label>
                    <input type="text" id="edit-commlog-contact" value="${log.contactPerson}">
                </div>
                <div class="form-group">
                    <label>Subject</label>
                    <input type="text" id="edit-commlog-subject" value="${log.subject}">
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea id="edit-commlog-notes" rows="4">${log.notes || ''}</textarea>
                </div>
                <div class="form-group">
                    <label><input type="checkbox" id="edit-commlog-followup" ${log.followUpNeeded ? 'checked' : ''}> Follow-up needed</label>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-danger" onclick="CommunicationLogView.deleteLog('${logId}')">Delete</button>
                    <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        document.getElementById('commlog-edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateLog(logId);
        });
    },
    
    updateLog(logId) {
        const logs = Storage.getCommunicationLogs();
        const log = logs.find(l => l.id === logId);
        if (!log) return;
        
        log.type = document.getElementById('edit-commlog-type').value;
        log.contactPerson = document.getElementById('edit-commlog-contact').value;
        log.subject = document.getElementById('edit-commlog-subject').value;
        log.notes = document.getElementById('edit-commlog-notes').value;
        log.followUpNeeded = document.getElementById('edit-commlog-followup').checked;
        log.updatedDate = now();
        
        Storage.saveCommunicationLogs(logs);
        Modal.close();
        Toast.success('Communication updated');
        
        if (window.currentJobDetailId) {
            const content = document.getElementById('content');
            JobDetailView.render(content, window.currentJobDetailId);
        }
    },
    
    deleteLog(logId) {
        if (!confirm('Delete this communication?')) return;
        
        const logs = Storage.getCommunicationLogs();
        const filtered = logs.filter(l => l.id !== logId);
        Storage.saveCommunicationLogs(filtered);
        
        Modal.close();
        Toast.success('Communication deleted');
        
        if (window.currentJobDetailId) {
            const content = document.getElementById('content');
            JobDetailView.render(content, window.currentJobDetailId);
        }
    }
};

window.CommunicationLogView = CommunicationLogView;

// ==========================================
// JOB DETAIL VIEW
// ==========================================
const JobDetailView = {
    render(container, jobId) {
        window.currentJobDetailId = jobId;
        
        const job = Storage.getJobs().find(j => j.id === jobId);
        if (!job) {
            container.innerHTML = '<p>Job not found.</p>';
            return;
        }
        
        const estimates = Storage.getEstimates().filter(e => e.jobId === jobId);
        const contracts = Storage.getContracts().filter(c => c.jobId === jobId);
        const invoices = Storage.getInvoices().filter(i => i.jobId === jobId);
        const warranties = Storage.getWarranties().filter(w => w.jobId === jobId);
        const punchLists = Storage.getPunchLists().filter(p => p.jobId === jobId);
        const materialLists = Storage.getMaterialLists().filter(m => m.jobId === jobId);
        const commLogs = Storage.getCommunicationLogs().filter(l => l.jobId === jobId);
        const photoNotes = Storage.getPhotoNotes().filter(p => p.jobId === jobId);
        
        const activeWarranties = warranties.filter(w => w.status === 'active').length;
        const expiringWarranties = warranties.filter(w => {
            if (w.status !== 'active' || !w.endDate) return false;
            const days = Math.ceil((new Date(w.endDate) - new Date()) / (1000 * 60 * 60 * 24));
            return days <= 30 && days > 0;
        }).length;
        
        container.innerHTML = `
            <div class="job-detail">
                <div class="job-header">
                    <div>
                        <h2>${job.name}</h2>
                        <p class="text-muted">${job.customerName} | ${job.phone}</p>
                        <p class="text-muted">${job.address}</p>
                    </div>
                    <span class="badge badge-${job.status === 'completed' ? 'success' : job.status === 'in_progress' ? 'warning' : 'muted'}">${job.status}</span>
                </div>
                
                <div class="doc-center">
                    <h3>📁 Project Documents</h3>
                    
                    <div class="doc-grid">
                        <div class="doc-card" onclick="Views.navigate('estimates'); setTimeout(() => Views.render('estimates', {jobId:'${job.id}'}), 100)">
                            <span class="doc-icon">📐</span>
                            <span class="doc-label">Estimates</span>
                            <span class="doc-count">${estimates.length}</span>
                        </div>
                        
                        <div class="doc-card" onclick="ContractsView.createNew('${job.id}')">
                            <span class="doc-icon">📜</span>
                            <span class="doc-label">Contracts</span>
                            <span class="doc-count">${contracts.length}</span>
                        </div>
                        
                        <div class="doc-card" onclick="InvoicesView.render(document.getElementById('content'))">
                            <span class="doc-icon">📄</span>
                            <span class="doc-label">Invoices</span>
                            <span class="doc-count">${invoices.length}</span>
                        </div>
                        
                        <div class="doc-card" onclick="WarrantiesView.createNew('${job.id}')">
                            <span class="doc-icon">🛡</span>
                            <span class="doc-label">Warranties</span>
                            <span class="doc-count">${activeWarranties} active</span>
                            ${expiringWarranties > 0 ? `<span class="badge badge-warning" style="margin-left:4px">${expiringWarranties} expiring</span>` : ''}
                        </div>
                        
                        <div class="doc-card" onclick="PunchListsView.createNew('${job.id}')">
                            <span class="doc-icon">✓</span>
                            <span class="doc-label">Punch Lists</span>
                            <span class="doc-count">${punchLists.length}</span>
                        </div>
                        
                        <div class="doc-card" onclick="MaterialsView.createNew('${job.id}')">
                            <span class="doc-icon">🛒</span>
                            <span class="doc-label">Materials</span>
                            <span class="doc-count">${materialLists.length}</span>
                        </div>
                        
                        <div class="doc-card" onclick="CommunicationLogView.renderForJob(document.getElementById('comm-log-container'), '${job.id}')">
                            <span class="doc-icon">📞</span>
                            <span class="doc-label">Comm Log</span>
                            <span class="doc-count">${commLogs.length}</span>
                        </div>
                        
                        <div class="doc-card" onclick="PhotoNotesView.render(document.getElementById('content'))">
                            <span class="doc-icon">📷</span>
                            <span class="doc-label">Photos</span>
                            <span class="doc-count">${photoNotes.length}</span>
                        </div>
                    </div>
                    
                    <div id="comm-log-container" class="comm-log-section mt-md" style="display:none"></div>
                </div>
                
                <div class="job-closeout mt-lg">
                    <h3>📋 Job Closeout</h3>
                    ${this.renderCloseoutChecklist(job, estimates, contracts, invoices, punchLists, warranties)}
                </div>
                
                <div class="job-actions mt-lg">
                    <button class="btn btn-primary" onclick="JobForm.open('${job.id}')">Edit Job</button>
                    ${job.status !== 'completed' ? `<button class="btn btn-success" onclick="JobDetailView.completeJob('${job.id}')">Mark Complete</button>` : ''}
                </div>
            </div>
        `;
    },
    
    renderCloseoutChecklist(job, estimates, contracts, invoices, punchLists, warranties) {
        const estimateApproved = estimates.some(e => e.status === 'approved');
        const signedContract = contracts.some(c => c.status === 'signed');
        const paidInvoices = invoices.filter(i => i.status === 'paid');
        const allInvoicesPaid = invoices.length === 0 || paidInvoices.length === invoices.length;
        const punchItems = punchLists.reduce((sum, pl) => sum + (pl.items ? pl.items.filter(i => i.status !== 'completed').length : 0), 0);
        const warrantiesRecorded = warranties.length > 0;
        
        const items = [
            { label: 'Estimate Approved', done: estimateApproved },
            { label: 'Contract Signed', done: signedContract },
            { label: 'Invoices Paid', done: allInvoicesPaid },
            { label: 'Punch List Complete', done: punchItems === 0 },
            { label: 'Warranty Recorded', done: warrantiesRecorded }
        ];
        
        const completed = items.filter(i => i.done).length;
        
        return `
            <div class="closeout-progress mb-md">
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${(completed/items.length)*100}%"></div>
                </div>
                <p>${completed}/${items.length} complete</p>
            </div>
            <div class="closeout-checklist">
                ${items.map((item, idx) => `
                    <div class="closeout-item ${item.done ? 'done' : ''}">
                        <input type="checkbox" ${item.done ? 'checked' : ''} disabled>
                        <span>${item.label}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    completeJob(jobId) {
        if (!confirm('Mark this job as completed? This will close the project.')) return;
        
        const jobs = Storage.getJobs();
        const job = jobs.find(j => j.id === jobId);
        if (!job) return;
        
        job.status = 'completed';
        job.updatedAt = now();
        
        Storage.saveJobs(jobs);
        
        Toast.success('Job marked as completed');
        Views.navigate('jobs');
    }
};

window.JobDetailView = JobDetailView;

// ==========================================
// SCHEDULE VIEW
// ==========================================
const ScheduleView = {
    render(container) {
        const events = Storage.getCalendarEvents();
        const jobs = Storage.getJobs();
        const today = new Date().toISOString().split('T')[0];
        
        // Sort by date
        const sorted = events.sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
        
        // Group by date
        const grouped = {};
        sorted.forEach(ev => {
            const date = ev.startDate || 'unscheduled';
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(ev);
        });
        
        let html = `
            <div class="view-header">
                <button class="btn btn-primary" onclick="ScheduleView.createNew()">
                    <span>+ Add Event</span>
                </button>
            </div>
        `;
        
        // Today's events highlight
        const todayEvents = grouped[today] || [];
        if (todayEvents.length > 0) {
            html += `
                <div class="card today-card mb-md">
                    <div class="card-header">
                        <h3 class="card-title">Today</h3>
                    </div>
                    <div class="card-body">
                        ${this.renderEventList(todayEvents, jobs)}
                    </div>
                </div>
            `;
        }
        
        // All events
        html += '<div class="card-list">';
        
        if (sorted.length === 0) {
            html += `
                <div class="empty-state">
                    <p>No scheduled events.</p>
                    <p class="text-muted">Add events to track your schedule.</p>
                </div>
            `;
        } else {
            for (const date in grouped) {
                if (date === today) continue;
                const isPast = date < today;
                html += `
                    <div class="card ${isPast ? 'past' : ''}" onclick="ScheduleView.viewEventList('${date}')">
                        <div class="card-header">
                            <span class="date-header">${date === 'unscheduled' ? 'Unscheduled' : this.formatDateHeader(date)}</span>
                            <span class="badge">${grouped[date].length}</span>
                        </div>
                        <div class="card-body">
                            ${this.renderEventList(grouped[date].slice(0, 3), jobs)}
                            ${grouped[date].length > 3 ? `<p class="text-muted">+${grouped[date].length - 3} more...</p>` : ''}
                        </div>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        container.innerHTML = html;
    },
    
    renderEventList(events, jobs) {
        return events.map(ev => {
            const job = jobs.find(j => j.id === ev.jobId);
            const statusClass = ev.status === 'completed' ? 'done' : ev.status === 'canceled' ? 'canceled' : '';
            return `
                <div class="schedule-event ${statusClass}" onclick="event.stopPropagation(); ScheduleView.editEvent('${ev.id}')">
                    <div class="event-time">${ev.startTime || 'All day'}</div>
                    <div class="event-content">
                        <p class="event-title">${ev.title}</p>
                        <p class="event-meta">${ev.type.replace('_', ' ')} ${job ? '| ' + job.name : ''} ${ev.location ? '| ' + ev.location : ''}</p>
                    </div>
                    <span class="badge badge-${ev.status === 'completed' ? 'success' : ev.status === 'canceled' ? 'muted' : 'warning'}">${ev.status}</span>
                </div>
            `;
        }).join('');
    },
    
    formatDateHeader(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (dateStr === today.toISOString().split('T')[0]) return 'Today';
        if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
        
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    },
    
    createNew() {
        const jobs = Storage.getJobs();
        
        Modal.open('New Event', `
            <form id="event-form" class="form">
                <div class="form-group">
                    <label>Job (optional)</label>
                    <select id="event-job-id">
                        <option value="">No job linked</option>
                        ${jobs.map(j => `<option value="${j.id}">${j.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="event-title" required>
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select id="event-type">
                        ${CALENDAR_EVENT_TYPES.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" id="event-date" value="${today()}" required>
                    </div>
                    <div class="form-group">
                        <label>Time</label>
                        <input type="time" id="event-time" value="08:00">
                    </div>
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" id="event-location">
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea id="event-notes"></textarea>
                </div>
            </form>
        `, `
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
            <button class="btn btn-primary" onclick="ScheduleView.saveEvent()">Create</button>
        `);
    },
    
    saveEvent() {
        const events = Storage.getCalendarEvents();
        
        events.push(createCalendarEvent({
            jobId: document.getElementById('event-job-id').value || null,
            title: document.getElementById('event-title').value,
            type: document.getElementById('event-type').value,
            startDate: document.getElementById('event-date').value,
            startTime: document.getElementById('event-time').value,
            location: document.getElementById('event-location').value,
            notes: document.getElementById('event-notes').value
        }));
        
        Storage.saveCalendarEvents(events);
        Modal.close();
        Toast.success('Event created');
        Views.render('schedule');
    },
    
    editEvent(eventId) {
        const event = Storage.getCalendarEvents().find(e => e.id === eventId);
        if (!event) return;
        
        const jobs = Storage.getJobs();
        
        Modal.open('Edit Event', `
            <form id="event-edit-form" class="form">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="edit-event-title" value="${event.title}">
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select id="edit-event-type">
                        ${CALENDAR_EVENT_TYPES.map(t => `<option value="${t.value}" ${t.value === event.type ? 'selected' : ''}>${t.label}</option>`).join('')}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" id="edit-event-date" value="${event.startDate || ''}">
                    </div>
                    <div class="form-group">
                        <label>Time</label>
                        <input type="time" id="edit-event-time" value="${event.startTime || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="edit-event-status">
                        ${CALENDAR_EVENT_STATUSES.map(s => `<option value="${s.value}" ${s.value === event.status ? 'selected' : ''}>${s.label}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" id="edit-event-location" value="${event.location || ''}">
                </div>
            </form>
        `, `
            <button class="btn btn-danger" onclick="ScheduleView.deleteEvent('${event.id}')">Delete</button>
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
            <button class="btn btn-primary" onclick="ScheduleView.updateEvent('${event.id}')">Save</button>
        `);
    },
    
    updateEvent(eventId) {
        const events = Storage.getCalendarEvents();
        const event = events.find(e => e.id === eventId);
        if (!event) return;
        
        event.title = document.getElementById('edit-event-title').value;
        event.type = document.getElementById('edit-event-type').value;
        event.startDate = document.getElementById('edit-event-date').value || null;
        event.startTime = document.getElementById('edit-event-time').value;
        event.status = document.getElementById('edit-event-status').value;
        event.location = document.getElementById('edit-event-location').value;
        event.updatedDate = now();
        
        Storage.saveCalendarEvents(events);
        Modal.close();
        Toast.success('Event updated');
        Views.render('schedule');
    },
    
    deleteEvent(eventId) {
        if (!confirm('Delete this event?')) return;
        
        const events = Storage.getCalendarEvents().filter(e => e.id !== eventId);
        Storage.saveCalendarEvents(events);
        
        Modal.close();
        Toast.success('Event deleted');
        Views.render('schedule');
    },
    
    viewEventList(date) {
        // Could expand to show full day's events
    }
};

window.ScheduleView = ScheduleView;

// ==========================================
// TASKS VIEW
// ==========================================
const TasksView = {
    render(container) {
        const tasks = Storage.getTasks();
        const jobs = Storage.getJobs();
        
        // Sort by due date then priority
        const sorted = tasks.sort((a, b) => {
            if (a.dueDate !== b.dueDate) return (a.dueDate || '').localeCompare(b.dueDate || '');
            const priOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
            return (priOrder[a.priority] || 2) - (priOrder[b.priority] || 2);
        });
        
        // Group by status
        const openTasks = sorted.filter(t => t.status === 'open' || t.status === 'in_progress');
        const completedTasks = sorted.filter(t => t.status === 'completed');
        
        container.innerHTML = `
            <div class="view-header">
                <button class="btn btn-primary" onclick="TasksView.createNew()">
                    <span>+ Add Task</span>
                </button>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Open (${openTasks.length})</h3>
                </div>
                <div class="card-body">
                    ${openTasks.length === 0 ? '<p class="text-muted">No open tasks.</p>' : 
                    openTasks.map(task => this.renderTaskItem(task, jobs)).join('')}
                </div>
            </div>
            
            <div class="card mt-lg">
                <div class="card-header">
                    <h3 class="card-title">Completed (${completedTasks.length})</h3>
                </div>
                <div class="card-body">
                    ${completedTasks.length === 0 ? '<p class="text-muted">No completed tasks.</p>' : 
                    completedTasks.slice(0, 10).map(task => this.renderTaskItem(task, jobs)).join('')}
                </div>
            </div>
        `;
    },
    
    renderTaskItem(task, jobs) {
        const job = jobs.find(j => j.id === task.jobId);
        const priClass = task.priority === 'urgent' ? 'prio-urgent' : task.priority === 'high' ? 'prio-high' : '';
        
        return `
            <div class="task-item ${task.status}" onclick="TasksView.editTask('${task.id}')">
                <div class="task-check">
                    <input type="checkbox" ${task.status === 'completed' ? 'checked' : ''} 
                           onchange="event.stopPropagation(); TasksView.toggleComplete('${task.id}')">
                </div>
                <div class="task-content">
                    <p class="task-title ${task.status === 'completed' ? 'done' : ''}">${task.title}</p>
                    <p class="task-meta">${task.dueDate ? 'Due: ' + formatDate(task.dueDate) : ''} ${job ? ' | ' + job.name : ''} ${task.roomArea ? ' | ' + task.roomArea : ''}</p>
                </div>
                <span class="badge ${task.priority === 'urgent' ? 'badge-danger' : task.priority === 'high' ? 'badge-warning' : 'badge-muted'}">${task.priority}</span>
            </div>
        `;
    },
    
    createNew() {
        const jobs = Storage.getJobs();
        
        Modal.open('New Task', `
            <form id="task-form" class="form">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="task-title" required>
                </div>
                <div class="form-group">
                    <label>Job</label>
                    <select id="task-job-id">
                        <option value="">No job</option>
                        ${jobs.map(j => `<option value="${j.id}">${j.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Due Date</label>
                        <input type="date" id="task-due-date">
                    </div>
                    <div class="form-group">
                        <label>Priority</label>
                        <select id="task-priority">
                            ${TASK_PRIORITIES.map(p => `<option value="${p.value}">${p.label}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Room/Area</label>
                    <input type="text" id="task-room">
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea id="task-notes"></textarea>
                </div>
            </form>
        `, `
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
            <button class="btn btn-primary" onclick="TasksView.saveTask()">Create</button>
        `);
    },
    
    saveTask() {
        const tasks = Storage.getTasks();
        
        tasks.push(createTask({
            jobId: document.getElementById('task-job-id').value || null,
            title: document.getElementById('task-title').value,
            dueDate: document.getElementById('task-due-date').value || null,
            priority: document.getElementById('task-priority').value,
            roomArea: document.getElementById('task-room').value,
            notes: document.getElementById('task-notes').value
        }));
        
        Storage.saveTasks(tasks);
        Modal.close();
        Toast.success('Task created');
        Views.render('tasks');
    },
    
    editTask(taskId) {
        const task = Storage.getTasks().find(t => t.id === taskId);
        if (!task) return;
        
        Modal.open('Edit Task', `
            <form id="task-edit-form" class="form">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="edit-task-title" value="${task.title}">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="edit-task-status">
                        ${TASK_STATUSES.map(s => `<option value="${s.value}" ${s.value === task.status ? 'selected' : ''}>${s.label}</option>`).join('')}
                    </select>
                </div>
            </form>
        `, `
            <button class="btn btn-danger" onclick="TasksView.deleteTask('${task.id}')">Delete</button>
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
            <button class="btn btn-primary" onclick="TasksView.updateTask('${task.id}')">Save</button>
        `);
    },
    
    updateTask(taskId) {
        const tasks = Storage.getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.title = document.getElementById('edit-task-title').value;
        task.status = document.getElementById('edit-task-status').value;
        if (task.status === 'completed') task.completedDate = now();
        task.updatedDate = now();
        
        Storage.saveTasks(tasks);
        Modal.close();
        Toast.success('Task updated');
        Views.render('tasks');
    },
    
    toggleComplete(taskId) {
        const tasks = Storage.getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.status = task.status === 'completed' ? 'open' : 'completed';
        if (task.status === 'completed') task.completedDate = now();
        task.updatedDate = now();
        
        Storage.saveTasks(tasks);
        Views.render('tasks');
    },
    
    deleteTask(taskId) {
        if (!confirm('Delete this task?')) return;
        
        const tasks = Storage.getTasks().filter(t => t.id !== taskId);
        Storage.saveTasks(tasks);
        
        Modal.close();
        Toast.success('Task deleted');
        Views.render('tasks');
    }
};

window.TasksView = TasksView;

// ==========================================
// CREWS VIEW
// ==========================================
const CrewsView = {
    render(container) {
        const crews = Storage.getCrews();
        
        container.innerHTML = `
            <div class="view-header">
                <button class="btn btn-primary" onclick="CrewsView.createNew()">
                    <span>+ Add Crew</span>
                </button>
            </div>
            <div class="card-list">
        `;
        
        if (crews.length === 0) {
            container.innerHTML += `
                <div class="empty-state">
                    <p>No crews yet.</p>
                    <p class="text-muted">Create crews to assign to jobs and events.</p>
                </div>
            `;
        } else {
            container.innerHTML += crews.map(crew => `
                <div class="card" onclick="CrewsView.editCrew('${crew.id}')">
                    <div class="card-body">
                        <h3 class="card-title">${crew.name}</h3>
                        <p class="card-meta">${crew.role || 'General'}</p>
                        <p class="text-muted">${crew.memberIds?.length || 0} members</p>
                    </div>
                </div>
            `).join('');
        }
        
        container.innerHTML += '</div>';
    },
    
    createNew() {
        Modal.open('New Crew', `
            <form id="crew-form" class="form">
                <div class="form-group">
                    <label>Crew Name</label>
                    <input type="text" id="crew-name" required>
                </div>
                <div class="form-group">
                    <label>Role/Trade</label>
                    <input type="text" id="crew-role">
                </div>
                <div class="form-group">
                    <label>Notes</label>
                    <textarea id="crew-notes"></textarea>
                </div>
            </form>
        `, `
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
            <button class="btn btn-primary" onclick="CrewsView.saveCrew()">Create</button>
        `);
    },
    
    saveCrew() {
        const crews = Storage.getCrews();
        
        crews.push(createCrew({
            name: document.getElementById('crew-name').value,
            role: document.getElementById('crew-role').value,
            notes: document.getElementById('crew-notes').value
        }));
        
        Storage.saveCrews(crews);
        Modal.close();
        Toast.success('Crew created');
        Views.render('crews');
    },
    
    editCrew(crewId) {
        const crew = Storage.getCrews().find(c => c.id === crewId);
        if (!crew) return;
        
        Modal.open('Edit Crew', `
            <form id="crew-edit-form" class="form">
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" id="edit-crew-name" value="${crew.name}">
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <input type="text" id="edit-crew-role" value="${crew.role || ''}">
                </div>
            </form>
        `, `
            <button class="btn btn-danger" onclick="CrewsView.deleteCrew('${crew.id}')">Delete</button>
            <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
            <button class="btn btn-primary" onclick="CrewsView.updateCrew('${crew.id}')">Save</button>
        `);
    },
    
    updateCrew(crewId) {
        const crews = Storage.getCrews();
        const crew = crews.find(c => c.id === crewId);
        if (!crew) return;
        
        crew.name = document.getElementById('edit-crew-name').value;
        crew.role = document.getElementById('edit-crew-role').value;
        crew.updatedDate = now();
        
        Storage.saveCrews(crews);
        Modal.close();
        Toast.success('Crew updated');
        Views.render('crews');
    },
    
    deleteCrew(crewId) {
        if (!confirm('Delete this crew?')) return;
        
        const crews = Storage.getCrews().filter(c => c.id !== crewId);
        Storage.saveCrews(crews);
        
        Modal.close();
        Toast.success('Crew deleted');
        Views.render('crews');
    }
};

window.CrewsView = CrewsView;