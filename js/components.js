// UI Components for Allen's Contractor's

// Toast notifications
const Toast = {
    container: null,

    init() {
        this.container = document.getElementById('toast-container');
    },

    show(message, type = 'info', duration = 3000) {
        if (!this.container) this.init();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;

        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 200);
        }, duration);
    },

    getIcon(type) {
        switch(type) {
            case 'success': return '✓';
            case 'warning': return '⚠';
            case 'error': return '✕';
            default: return 'ℹ';
        }
    },

    success(message) { this.show(message, 'success'); },
    warning(message) { this.show(message, 'warning'); },
    error(message) { this.show(message, 'error'); },
    info(message) { this.show(message, 'info'); }
};

// Modal
const Modal = {
    overlay: null,
    modal: null,
    titleEl: null,
    contentEl: null,
    closeBtn: null,
    actionsEl: null,

    init() {
        this.overlay = document.getElementById('modal-overlay');
        this.modal = document.getElementById('modal');
        this.titleEl = document.getElementById('modal-title');
        this.contentEl = document.getElementById('modal-content');
        this.closeBtn = document.getElementById('modal-close');

        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    },

    open(title, content, actions = '') {
        if (!this.init()) this.init();

        this.titleEl.textContent = title;
        this.contentEl.innerHTML = content;

        const actionsContainer = this.modal.querySelector('.modal-actions');
        if (actionsContainer) {
            actionsContainer.innerHTML = actions;
        } else if (actions) {
            this.contentEl.insertAdjacentHTML('afterend', `<div class="modal-actions">${actions}</div>`);
        }

        this.overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        setTimeout(() => {
            const firstInput = this.contentEl.querySelector('input, select, textarea');
            if (firstInput) firstInput.focus();
        }, 100);
    },

    close() {
        this.overlay.classList.add('hidden');
        document.body.style.overflow = '';
    },

    setContent(content) {
        this.contentEl.innerHTML = content;
    },

    setActions(actions) {
        let actionsContainer = this.modal.querySelector('.modal-actions');
        if (!actionsContainer && actions) {
            actionsContainer = document.createElement('div');
            actionsContainer.className = 'modal-actions';
            this.contentEl.after(actionsContainer);
        }
        if (actionsContainer) {
            actionsContainer.innerHTML = actions;
        }
    }
};

// Form helpers
const Forms = {
    createSelect(name, label, options, value = '', required = false) {
        const opts = options.map(opt =>
            `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`
        ).join('');

        return `
            <div class="form-group">
                <label class="form-label" for="${name}">${label}${required ? ' *' : ''}</label>
                <select class="form-select" id="${name}" name="${name}" ${required ? 'required' : ''}>
                    ${opts}
                </select>
            </div>
        `;
    },

    createInput(name, label, type = 'text', value = '', required = false, placeholder = '', help = '') {
        return `
            <div class="form-group">
                <label class="form-label" for="${name}">${label}${required ? ' *' : ''}</label>
                <input type="${type}" class="form-input" id="${name}" name="${name}"
                    value="${value}" ${required ? 'required' : ''} placeholder="${placeholder}">
                ${help ? `<div class="form-help">${help}</div>` : ''}
            </div>
        `;
    },

    createCurrencyInput(name, label, value = 0, required = false, help = '') {
        return `
            <div class="form-group">
                <label class="form-label" for="${name}">${label}${required ? ' *' : ''}</label>
                <div class="form-currency">
                    <input type="number" class="form-input" id="${name}" name="${name}"
                        value="${value}" ${required ? 'required' : ''} min="0" step="0.01">
                </div>
                ${help ? `<div class="form-help">${help}</div>` : ''}
            </div>
        `;
    },

    createTextarea(name, label, value = '', required = false, placeholder = '', rows = 3) {
        return `
            <div class="form-group">
                <label class="form-label" for="${name}">${label}${required ? ' *' : ''}</label>
                <textarea class="form-textarea" id="${name}" name="${name}" rows="${rows}"
                    ${required ? 'required' : ''} placeholder="${placeholder}">${value}</textarea>
            </div>
        `;
    },

    getValues(formId) {
        const form = document.getElementById(formId);
        if (!form) return {};

        const formData = new FormData(form);
        const values = {};

        for (let [key, value] of formData.entries()) {
            const el = form.querySelector(`[name="${key}"]`);
            if (el && el.type === 'number') {
                values[key] = parseFloat(value) || 0;
            } else {
                values[key] = value;
            }
        }

        return values;
    },

    validate(formId) {
        const form = document.getElementById(formId);
        if (!form) return { valid: false, errors: [] };

        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        const errors = [];

        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                errors.push(input.name);
            } else {
                input.classList.remove('error');
            }
        });

        return { valid: errors.length === 0, errors };
    }
};

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}

// Format date
function formatDate(isoString) {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format date/time
function formatDateTime(isoString) {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

// Format number
function formatNumber(num, decimals = 0) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num || 0);
}

// Get status color class
function getStatusClass(status) {
    return status.toLowerCase().replace(/\s+/g, '-');
}

// Get project type label
function getProjectTypeLabel(value) {
    const type = PROJECT_TYPES.find(t => t.value === value);
    return type ? type.label : value;
}

// Get job status label
function getJobStatusLabel(value) {
    const status = JOB_STATUSES.find(s => s.value === value);
    return status ? status.label : value;
}

// Get estimate status label
function getEstimateStatusLabel(value) {
    const status = ESTIMATE_STATUSES.find(s => s.value === value);
    return status ? status.label : value;
}

// Get category label
function getCategoryLabel(value) {
    const cat = LINE_ITEM_CATEGORIES.find(c => c.value === value);
    return cat ? cat.label : value;
}

// Get unit label
function getUnitLabel(value) {
    const unit = UNITS.find(u => u.value === value);
    return unit ? unit.label : value;
}

// Create status badge
function createStatusBadge(status, label) {
    return `<span class="status-badge ${getStatusClass(status)}">${label}</span>`;
}

// Create empty state
function createEmptyState(icon, title, text, action = '') {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <div class="empty-state-title">${title}</div>
            <div class="empty-state-text">${text}</div>
            ${action}
        </div>
    `;
}

// Confirm dialog
function confirm(message, onConfirm) {
    Modal.open('Confirm', `
        <p style="margin-bottom: var(--space-lg);">${message}</p>
    `, `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn btn-danger" id="confirm-yes">Delete</button>
    `);

    document.getElementById('confirm-yes').addEventListener('click', () => {
        onConfirm();
        Modal.close();
    });
}

// Confirm action with warning
function confirmAction(message, onConfirm, buttonText = 'Confirm', buttonClass = 'btn-danger') {
    Modal.open('Confirm', `
        <p style="margin-bottom: var(--space-lg);">${message}</p>
    `, `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
        <button class="btn ${buttonClass}" id="confirm-action">${buttonText}</button>
    `);

    document.getElementById('confirm-action').addEventListener('click', () => {
        onConfirm();
        Modal.close();
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make components available globally
window.Toast = Toast;
window.Modal = Modal;
window.Forms = Forms;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.formatNumber = formatNumber;
window.getStatusClass = getStatusClass;
window.getProjectTypeLabel = getProjectTypeLabel;
window.getJobStatusLabel = getJobStatusLabel;
window.getEstimateStatusLabel = getEstimateStatusLabel;
window.getCategoryLabel = getCategoryLabel;
window.getUnitLabel = getUnitLabel;
window.createStatusBadge = createStatusBadge;
window.createEmptyState = createEmptyState;
window.confirm = confirm;
window.confirmAction = confirmAction;
window.debounce = debounce;