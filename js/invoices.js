// INVOICES VIEW FOR ALLEN'S CONTRACTOR'S

const InvoicesView = {
    render(container) {
        const invoices = Storage.getInvoices();
        const jobs = Storage.getJobs();
        const settings = Storage.getSettings() || {};
        let totalOutstanding = 0;
        let totalOverdue = 0;
        const payments = Storage.getPayments();
        
        invoices.forEach(function(inv) {
            const calc = calculateInvoice(inv);
            const paid = payments.filter(function(p) { return p.invoiceId === inv.id; }).reduce(function(sum, p) { return sum + p.amount; }, 0);
            const due = calc.total - paid;
            if (inv.status !== 'paid' && inv.status !== 'void') {
                totalOutstanding += due;
                if (inv.dueDate && new Date(inv.dueDate) < new Date() && due > 0) {
                    totalOverdue += due;
                }
            }
        });

        container.innerHTML = '<div class="stats-grid mb-md">' +
            '<div class="stat-card"><div class="stat-label">Total Invoices</div><div class="stat-value">' + invoices.length + '</div></div>' +
            '<div class="stat-card accent"><div class="stat-label">Outstanding</div><div class="stat-value currency">' + formatCurrency(totalOutstanding) + '</div></div>' +
            '<div class="stat-card"><div class="stat-label">Overdue</div><div class="stat-value ' + (totalOverdue > 0 ? 'text-danger' : '') + '">' + formatCurrency(totalOverdue) + '</div></div>' +
        '</div>' +
            '<div class="quick-actions mb-md"><button class="btn btn-primary btn-lg" onclick="InvoiceForm.open()"><span>📄</span> Create Invoice</button></div>' +
            '<div class="card"><div class="card-header"><h3 class="card-title">Invoices (' + invoices.length + ')</h3></div>' +
            '<div class="card-body no-padding">' + 
            (invoices.length > 0 ? this.renderList(invoices, jobs) : createEmptyState('📄', 'No Invoices', 'Create your first invoice to track payments.')) +
            '</div></div>';
    },

    renderList(invoices, jobs) {
        const payments = Storage.getPayments();
        return invoices.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }).map(function(inv) {
            const calc = calculateInvoice(inv);
            const paid = payments.filter(function(p) { return p.invoiceId === inv.id; }).reduce(function(sum, p) { return sum + p.amount; }, 0);
            const balance = calc.total - paid;
            const job = jobs.find(function(j) { return j.id === inv.jobId; });
            const statusClass = balance > 0 && inv.status !== 'paid' ? 'text-danger' : 'text-success';
            
            return '<div class="list-item" onclick="InvoiceForm.open(\'' + inv.id + '\')">' +
                '<div class="list-item-content"><div class="list-item-title">' + (inv.invoiceNumber || 'INV') + '</div>' +
                '<div class="list-item-subtitle">' + (inv.title || (job ? job.name : 'No job')) + '</div></div>' +
                '<div class="list-item-meta">' + createStatusBadge(inv.status, inv.status) + 
                '<div class="' + statusClass + '">' + formatCurrency(balance) + ' due</div></div></div>';
        }).join('');
    }
};

const InvoiceForm = {
    open(invoiceId) {
        const jobs = Storage.getJobs();
        const invoice = invoiceId ? Storage.getInvoices().find(function(i) { return i.id === invoiceId; }) : null;
        
        if (invoiceId && invoice) {
            this.showForm(invoice);
            return;
        }

        // New invoice
        Modal.open('Create Invoice', '<form id="new-invoice-form">' +
            Forms.createSelect('jobId', 'Job', jobs.map(function(j) { return { value: j.id, label: j.name }; }), currentJobId || '', true) +
            Forms.createSelect('type', 'Invoice Type', INVOICE_TYPES, 'manual', true) +
            Forms.createInput('title', 'Invoice Title', 'text', '', true, 'e.g., Deposit') + '</form>', 
            '<button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>' +
            '<button class="btn btn-primary" onclick="InvoiceForm.createFromJob()">Create</button>');
    },

    createFromJob() {
        const values = Forms.getValues('new-invoice-form');
        if (!values.jobId || !values.title) {
            Toast.error('Job and title required');
            return;
        }
        const job = Storage.getJobs().find(function(j) { return j.id === values.jobId; });
        const newInvoice = createInvoice({
            jobId: values.jobId,
            title: values.title,
            type: values.type,
            invoiceNumber: generateInvoiceNumber(),
            billToName: job ? job.customerName : '',
            billToAddress: job ? job.address : '',
            billToPhone: job ? job.phone : '',
            billToEmail: job ? job.email : ''
        });
        
        const invoices = Storage.getInvoices();
        invoices.push(newInvoice);
        Storage.saveInvoices(invoices);
        Modal.close();
        this.showForm(newInvoice);
    },

    showForm(invoice) {
        const existing = invoice;
        if (!existing) return;
        
        Modal.open(existing.invoiceNumber ? 'Edit Invoice' : 'New Invoice', '<form id="invoice-form">' +
            Forms.createInput('invoiceNumber', 'Invoice #', 'text', existing.invoiceNumber || '') +
            Forms.createInput('title', 'Title', 'text', existing.title || '', true) +
            '<div class="form-row">' + 
            Forms.createSelect('type', 'Type', INVOICE_TYPES, existing.type || 'manual', true) +
            Forms.createSelect('status', 'Status', INVOICE_STATUSES, existing.status || 'draft', true) + 
            '</div>' +
            '<div class="form-row">' +
            Forms.createInput('issueDate', 'Issue Date', 'date', existing.issueDate || new Date().toISOString().split('T')[0]) +
            Forms.createInput('dueDate', 'Due Date', 'date', existing.dueDate || '') +
            '</div>' +
            '<hr style="border:none;border-top:1px solid var(--border);margin:var(--space-md) 0;">' +
            '<h4>Bill To</h4>' +
            Forms.createInput('billToName', 'Name', 'text', existing.billToName || '') +
            Forms.createTextarea('billToAddress', 'Address', existing.billToAddress || '') +
            Forms.createTextarea('notes', 'Notes', existing.notes || '') + 
            '</form>',
            '<button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>' +
            (existing.id ? '<button class="btn btn-danger" onclick="confirm(\'Delete invoice?\', function() { InvoiceForm.delete(\'' + existing.id + '\'); })">Delete</button>' : '') +
            '<button class="btn btn-primary" onclick="InvoiceForm.save(\'' + (existing.id || '') + '\')">Save</button>');
    },

    save(existingId) {
        const values = Forms.getValues('invoice-form');
        if (!values.title) {
            Toast.error('Title required');
            return;
        }
        
        const invoices = Storage.getInvoices();
        if (existingId) {
            const idx = invoices.findIndex(function(i) { return i.id === existingId; });
            if (idx !== -1) {
                invoices[idx] = Object.assign({}, invoices[idx], values, { updatedAt: now() });
            }
        } else {
            invoices.push(createInvoice(Object.assign({}, values, { invoiceNumber: values.invoiceNumber || generateInvoiceNumber() })));
        }
        
        Storage.saveInvoices(invoices);
        Toast.success('Invoice saved');
        Modal.close();
        Views.navigate('invoices');
    },

    delete(invoiceId) {
        const invoices = Storage.getInvoices().filter(function(i) { return i.id !== invoiceId; });
        const payments = Storage.getPayments().filter(function(p) { return p.invoiceId !== invoiceId; });
        Storage.saveInvoices(invoices);
        Storage.savePayments(payments);
        Modal.close();
        Toast.success('Invoice deleted');
        Views.navigate('invoices');
    }
};

window.InvoicesView = InvoicesView;
window.InvoiceForm = InvoiceForm;