// Data Models and Seed Data for Allen's Contractor's - Phase 2

// Generate unique ID
function generateId() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Get current timestamp
function now() {
    return new Date().toISOString();
}

// Enums
const PROJECT_TYPES = [
    { value: 'flip', label: 'Flip' },
    { value: 'remodel', label: 'Remodel' },
    { value: 'new_build', label: 'New Build' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'addition', label: 'Addition' },
    { value: 'roofing', label: 'Roofing' },
    { value: 'flooring', label: 'Flooring' },
    { value: 'painting', label: 'Painting' },
    { value: 'general_repair', label: 'General Repair' }
];

const JOB_STATUSES = [
    { value: 'lead', label: 'Lead' },
    { value: 'estimating', label: 'Estimating' },
    { value: 'proposal_sent', label: 'Proposal Sent' },
    { value: 'approved', label: 'Approved' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
];

const ESTIMATE_STATUSES = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'viewed', label: 'Viewed' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' }
];

const LINE_ITEM_CATEGORIES = [
    { value: 'demolition', label: 'Demolition' },
    { value: 'framing', label: 'Framing' },
    { value: 'drywall', label: 'Drywall' },
    { value: 'paint', label: 'Paint' },
    { value: 'flooring', label: 'Flooring' },
    { value: 'cabinets', label: 'Cabinets' },
    { value: 'countertops', label: 'Countertops' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'roofing', label: 'Roofing' },
    { value: 'windows_doors', label: 'Windows/Doors' },
    { value: 'finish_carpentry', label: 'Finish Carpentry' },
    { value: 'exterior', label: 'Exterior' },
    { value: 'cleanup', label: 'Cleanup' },
    { value: 'permits', label: 'Permits' },
    { value: 'miscellaneous', label: 'Miscellaneous' }
];

const UNITS = [
    { value: 'ea', label: 'Each' },
    { value: 'sf', label: 'Sq Ft' },
    { value: 'lf', label: 'Lin Ft' },
    { value: 'sfy', label: 'Sq Yd' },
    { value: 'gal', label: 'Gallon' },
    { value: 'hr', label: 'Hour' },
    { value: 'day', label: 'Day' },
    { value: 'lot', label: 'Lot' },
    { value: 'set', label: 'Set' },
    { value: 'box', label: 'Box' },
    { value: 'roll', label: 'Roll' },
    { value: 'sq', label: 'Square (100sf)' },
    { value: 'room', label: 'Room' },
    { value: 'allowance', label: 'Allowance' }
];

const ROOM_AREAS = [
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'living_room', label: 'Living Room' },
    { value: 'dining_room', label: 'Dining Room' },
    { value: 'family_room', label: 'Family Room' },
    { value: 'master_bedroom', label: 'Master Bedroom' },
    { value: 'bedroom_1', label: 'Bedroom 1' },
    { value: 'bedroom_2', label: 'Bedroom 2' },
    { value: 'bedroom_3', label: 'Bedroom 3' },
    { value: 'master_bath', label: 'Master Bath' },
    { value: 'hall_bath', label: 'Hall Bath' },
    { value: 'half_bath', label: 'Half Bath' },
    { value: 'entry', label: 'Entry/Foyer' },
    { value: 'hallway', label: 'Hallway' },
    { value: 'laundry', label: 'Laundry' },
    { value: 'utility', label: 'Utility Room' },
    { value: 'garage', label: 'Garage' },
    { value: 'basement', label: 'Basement' },
    { value: 'attic', label: 'Attic' },
    { value: 'exterior', label: 'Exterior' },
    { value: 'deck_patio', label: 'Deck/Patio' },
    { value: 'whole_house', label: 'Whole House' }
];

// Model: Room/Area for estimates
function createRoom(data = {}) {
    return {
        id: data.id || generateId(),
        name: data.name || '',
        sortOrder: data.sortOrder || 0
    };
}

// Model: Job
function createJob(data = {}) {
    return {
        id: data.id || generateId(),
        name: data.name || '',
        customerName: data.customerName || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        projectType: data.projectType || 'remodel',
        status: data.status || 'lead',
        squareFootage: data.squareFootage || 0,
        notes: data.notes || '',
        createdAt: data.createdAt || now(),
        updatedAt: data.updatedAt || now()
    };
}

// Model: Estimate Line Item (updated with room, notes)
function createLineItem(data = {}) {
    return {
        id: data.id || generateId(),
        name: data.name || '',
        description: data.description || '',
        category: data.category || 'miscellaneous',
        room: data.room || '',
        quantity: data.quantity || 1,
        unit: data.unit || 'ea',
        materialCost: data.materialCost || 0,
        laborHours: data.laborHours || 0,
        laborRate: data.laborRate || 0,
        subcontractorCost: data.subcontractorCost || 0,
        equipmentCost: data.equipmentCost || 0,
        wasteFactorPercent: data.wasteFactorPercent || 0,
        markupPercent: data.markupPercent || 0,
        taxPercent: data.taxPercent || 0,
        contingencyPercent: data.contingencyPercent || 0,
        notes: data.notes || '',
        internalNote: data.internalNote || '',
        sortOrder: data.sortOrder || 0
    };
}

// Model: Estimate (updated with acceptance tracking)
function createEstimate(data = {}) {
    return {
        id: data.id || generateId(),
        jobId: data.jobId || '',
        name: data.name || '',
        status: data.status || 'draft',
        scopeSummary: data.scopeSummary || '',
        internalNotes: data.internalNotes || '',
        lineItems: data.lineItems || [],
        rooms: data.rooms || [],
        refNumber: data.refNumber || '',
        validThrough: data.validThrough || '',
        createdBy: data.createdBy || '',
        preparedBy: data.preparedBy || '',
        sentDate: data.sentDate || '',
        viewedDate: data.viewedDate || '',
        acceptedDate: data.acceptedDate || '',
        acceptedBy: data.acceptedBy || '',
        acceptanceNotes: data.acceptanceNotes || '',
        depositAmount: data.depositAmount || 0,
        depositPercent: data.depositPercent || 0,
        estimatedStart: data.estimatedStart || '',
        estimatedDuration: data.estimatedDuration || '',
        rejectionReason: data.rejectionReason || '',
        signatureImage: data.signatureImage || '',
        createdAt: data.createdAt || now(),
        updatedAt: data.updatedAt || now(),
        lastSavedAt: data.lastSavedAt || data.updatedAt || now()
    };
}

// Model: Assembly (Phase 2)
function createAssembly(data = {}) {
    return {
        id: data.id || generateId(),
        name: data.name || '',
        category: data.category || 'miscellaneous',
        description: data.description || '',
        notes: data.notes || '',
        lineItems: data.lineItems || [],
        createdAt: data.createdAt || now(),
        updatedAt: data.updatedAt || now()
    };
}

// Model: Cost Library Item
function createCostLibraryItem(data = {}) {
    return {
        id: data.id || generateId(),
        name: data.name || '',
        category: data.category || 'miscellaneous',
        defaultUnit: data.defaultUnit || 'ea',
        defaultMaterialCost: data.defaultMaterialCost || 0,
        defaultLaborHours: data.defaultLaborHours || 0,
        defaultLaborRate: data.defaultLaborRate || 0,
        defaultSubcontractorCost: data.defaultSubcontractorCost || 0,
        defaultMarkup: data.defaultMarkup || 0,
        notes: data.notes || ''
    };
}

// Model: Template
function createTemplate(data = {}) {
    return {
        id: data.id || generateId(),
        name: data.name || '',
        description: data.description || '',
        lineItems: data.lineItems || [],
        createdAt: data.createdAt || now()
    };
}

// Model: Change Order
function createChangeOrder(data = {}) {
    return {
        id: data.id || generateId(),
        estimateId: data.estimateId || '',
        jobId: data.jobId || '',
        name: data.name || '',
        status: data.status || 'pending',
        lineItems: data.lineItems || [],
        reason: data.reason || '',
        createdAt: data.createdAt || now()
    };
}

// Model: Settings (updated with margin thresholds)
function createSettings(data = {}) {
    return {
        companyName: data.companyName || "Allen's Contractor's",
        contactName: data.contactName || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        defaultLaborRate: data.defaultLaborRate || 65,
        defaultMarkupPercent: data.defaultMarkupPercent || 20,
        defaultTaxPercent: data.defaultTaxPercent || 0,
        defaultContingencyPercent: data.defaultContingencyPercent || 10,
        targetMinMarkupPercent: data.targetMinMarkupPercent || 15,
        targetMinMarginPercent: data.targetMinMarginPercent || 25,
        targetMinContingencyPercent: data.targetMinContingencyPercent || 5,
        defaultTerms: data.defaultTerms || 'Payment due upon completion. 50% deposit required to start work.',
        defaultExclusions: data.defaultExclusions || 'Permit fees, utility connections, repairs not visibly damaged, hidden damage, landscaping, moving furniture, appliances unless listed.',
        ...data
    };
}

// Calculate line item totals
function calculateLineItem(item, settings = {}) {
    const laborCost = item.laborHours * item.laborRate;
    const materialWithWaste = item.materialCost * (1 + (item.wasteFactorPercent / 100));
    const materialWithMarkup = materialWithWaste * (1 + (item.markupPercent / 100));
    const laborWithMarkup = laborCost * (1 + (item.markupPercent / 100));
    const subcontractorWithMarkup = item.subcontractorCost * (1 + (item.markupPercent / 100));
    const equipmentWithMarkup = item.equipmentCost * (1 + (item.markupPercent / 100));

    const subtotalDirect = materialWithMarkup + laborWithMarkup + subcontractorWithMarkup + equipmentWithMarkup;
    const tax = subtotalDirect * (item.taxPercent / 100);
    const contingency = subtotalDirect * (item.contingencyPercent / 100);
    const total = subtotalDirect + tax + contingency;

    const directCost = item.materialCost + laborCost + item.subcontractorCost + item.equipmentCost;
    const profit = total - subtotalDirect - tax - contingency;
    const margin = total > 0 ? (profit / total) * 100 : 0;

    return {
        laborCost,
        materialWithWaste,
        materialWithMarkup,
        laborWithMarkup,
        subtotalDirect,
        tax,
        contingency,
        total,
        directCost,
        grossProfit: total - item.materialCost - item.subcontractorCost - item.equipmentCost,
        margin
    };
}

// Calculate estimate totals
function calculateEstimate(estimate, settings = {}) {
    let totalMaterials = 0;
    let totalLabor = 0;
    let totalSubcontractor = 0;
    let totalEquipment = 0;
    let totalTax = 0;
    let totalContingency = 0;
    let totalMarkup = 0;
    let totalDirectCost = 0;

    estimate.lineItems.forEach(item => {
        const calc = calculateLineItem(item, settings);
        totalMaterials += calc.materialWithMarkup;
        totalLabor += calc.laborWithMarkup;
        totalSubcontractor += item.subcontractorCost > 0 ? item.subcontractorCost * (1 + item.markupPercent / 100) : 0;
        totalEquipment += item.equipmentCost > 0 ? item.equipmentCost * (1 + item.markupPercent / 100) : 0;
        totalTax += calc.tax;
        totalContingency += calc.contingency;
        totalDirectCost += calc.directCost;

        const laborCost = item.laborHours * item.laborRate;
        const materialWithoutMarkup = item.materialCost;
        totalMarkup += (materialWithoutMarkup * (item.markupPercent / 100)) +
                      (laborCost * (item.markupPercent / 100)) +
                      (item.subcontractorCost * (item.markupPercent / 100)) +
                      (item.equipmentCost * (item.markupPercent / 100));
    });

    const subtotalDirect = totalMaterials + totalLabor + totalSubcontractor + totalEquipment;
    const grandTotal = subtotalDirect + totalTax + totalContingency;
    const grossProfit = grandTotal - totalDirectCost;
    const grossMargin = grandTotal > 0 ? (grossProfit / grandTotal) * 100 : 0;
    const totalMarkupApplied = totalMarkup;

    return {
        totalMaterials,
        totalLabor,
        totalSubcontractor,
        totalEquipment,
        subtotalDirect,
        totalTax,
        totalContingency,
        totalMarkupApplied,
        grandTotal,
        totalDirectCost,
        grossProfit,
        grossMargin
    };
}

// Calculate estimate warnings (Phase 2)
function calculateEstimateWarnings(estimate, settings = {}) {
    const warnings = [];
    const calc = calculateEstimate(estimate, settings);
    const thresholds = {
        minMarkup: settings.targetMinMarkupPercent || 15,
        minMargin: settings.targetMinMarginPercent || 25,
        minContingency: settings.targetMinContingencyPercent || 5
    };

    if (calc.grossMargin < thresholds.minMargin) {
        warnings.push({
            type: 'danger',
            message: `Margin is below target (${calc.grossMargin.toFixed(1)}% vs ${thresholds.minMargin}% minimum)`
        });
    }

    let hasContingency = false;
    let itemsWithNoLaborRate = 0;
    let itemsWithZeroQty = 0;
    let itemsMissingMarkup = 0;

    estimate.lineItems.forEach(item => {
        if (item.contingencyPercent > 0) hasContingency = true;
        if (item.laborHours > 0 && (!item.laborRate || item.laborRate === 0)) itemsWithNoLaborRate++;
        if (!item.quantity || item.quantity === 0) itemsWithZeroQty++;
        if (item.markupPercent === 0 && (item.materialCost > 0 || item.laborHours > 0)) itemsMissingMarkup++;
    });

    if (!hasContingency && estimate.lineItems.length > 0) {
        warnings.push({
            type: 'warning',
            message: 'Contingency is missing from estimate'
        });
    }

    if (itemsWithNoLaborRate > 0) {
        warnings.push({
            type: 'warning',
            message: `${itemsWithNoLaborRate} item(s) have labor hours but no labor rate set`
        });
    }

    if (itemsWithZeroQty > 0) {
        warnings.push({
            type: 'warning',
            message: `${itemsWithZeroQty} item(s) have zero quantity - may be incomplete`
        });
    }

    if (itemsMissingMarkup > 0) {
        warnings.push({
            type: 'warning',
            message: `${itemsMissingMarkup} item(s) have no markup - check pricing`
        });
    }

    if (calc.grandTotal === 0) {
        warnings.push({
            type: 'warning',
            message: 'Estimate has no line items'
        });
    }

    return warnings;
}

// Check proposal readiness
function checkProposalReadiness(estimate, job) {
    const checklist = [];
    const settings = Storage.getSettings() || {};

    checklist.push({
        label: 'Customer name present',
        complete: !!(job && job.customerName),
        required: true
    });

    checklist.push({
        label: 'Property address present',
        complete: !!(job && job.address),
        required: true
    });

    checklist.push({
        label: 'Estimate has line items',
        complete: estimate.lineItems && estimate.lineItems.length > 0,
        required: true
    });

    checklist.push({
        label: 'Exclusions defined',
        complete: !!(estimate.exclusions || settings.defaultExclusions),
        required: true
    });

    checklist.push({
        label: 'Terms defined',
        complete: !!(estimate.terms || settings.defaultTerms),
        required: true
    });

    const warnings = calculateEstimateWarnings(estimate, settings);
    checklist.push({
        label: 'No critical warnings',
        complete: !warnings.some(w => w.type === 'danger'),
        required: true
    });

    const ready = checklist.every(item => !item.required || item.complete);
    return { checklist, ready };
}

// Deep clone for duplication
function deepCloneEstimate(estimate, newName = '') {
    const cloned = JSON.parse(JSON.stringify(estimate));
    cloned.id = generateId();
    cloned.name = newName || (estimate.name + ' - Copy');
    cloned.status = 'draft';
    cloned.createdAt = now();
    cloned.updatedAt = now();
    cloned.lastSavedAt = now();
    cloned.refNumber = '';

    cloned.lineItems = cloned.lineItems.map((item, idx) => ({
        ...item,
        id: generateId(),
        sortOrder: idx + 1
    }));

    if (cloned.rooms) {
        cloned.rooms = cloned.rooms.map(room => ({
            ...room,
            id: generateId()
        }));
    }

    return cloned;
}

// Generate reference number
function generateRefNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `AC-${year}${month}-${random}`;
}

// Get room label
function getRoomLabel(value) {
    const room = ROOM_AREAS.find(r => r.value === value);
    return room ? room.label : value;
}

// Seed Data
function getSeedData() {
    const defaultSettings = createSettings();

    const jobs = [
        createJob({
            id: 'job_001',
            name: '123 Oak Street Flip',
            customerName: 'Bob Anderson',
            phone: '555-0101',
            email: 'bob@email.com',
            address: '123 Oak Street, Springfield, IL 62701',
            projectType: 'flip',
            status: 'approved',
            squareFootage: 2200,
            notes: 'Full interior flip. 3 bed, 2 bath ranch.',
            createdAt: '2026-01-15T10:00:00.000Z',
            updatedAt: '2026-02-01T14:30:00.000Z'
        }),
        createJob({
            id: 'job_002',
            name: 'Kitchen Remodel - Johnson',
            customerName: 'Sarah Johnson',
            phone: '555-0102',
            email: 'sarah@email.com',
            address: '456 Maple Ave, Springfield, IL 62702',
            projectType: 'kitchen',
            status: 'in_progress',
            squareFootage: 200,
            notes: 'Complete kitchen remodel. New cabinets, countertops, flooring.',
            createdAt: '2026-02-10T09:00:00.000Z',
            updatedAt: '2026-03-01T11:00:00.000Z'
        }),
        createJob({
            id: 'job_003',
            name: 'Ridgeview Addition',
            customerName: 'Mike Williams',
            phone: '555-0103',
            email: 'mike@email.com',
            address: '789 Ridgeview Drive, Springfield, IL 62703',
            projectType: 'addition',
            status: 'proposal_sent',
            squareFootage: 400,
            notes: '16x24 bedroom addition with bath.',
            createdAt: '2026-03-05T15:00:00.000Z',
            updatedAt: '2026-03-20T10:00:00.000Z'
        })
    ];

    const estimates = [
        createEstimate({
            id: 'est_001',
            jobId: 'job_001',
            name: 'Full Rehab Estimate',
            status: 'approved',
            refNumber: 'AC-2601-4823',
            scopeSummary: 'Complete interior remodel including demolition, framing, drywall, paint, flooring, kitchen, bathrooms, electrical and plumbing updates.',
            internalNotes: 'Client requested premium finishes. Allow for upgrades in flooring and cabinets.',
            lineItems: [
                createLineItem({ id: 'li_001', name: 'Complete Demolition', category: 'demolition', room: 'whole_house', quantity: 2200, unit: 'sf', materialCost: 0, laborHours: 80, laborRate: 45, markupPercent: 20, sortOrder: 1 }),
                createLineItem({ id: 'li_002', name: 'Drywall Install', category: 'drywall', room: 'whole_house', quantity: 4500, unit: 'sf', materialCost: 0.45, laborHours: 60, laborRate: 45, markupPercent: 20, sortOrder: 2 }),
                createLineItem({ id: 'li_003', name: 'Drywall Finish', category: 'drywall', room: 'whole_house', quantity: 4500, unit: 'sf', materialCost: 0.15, laborHours: 45, laborRate: 45, markupPercent: 20, sortOrder: 3 }),
                createLineItem({ id: 'li_004', name: 'Interior Paint', category: 'paint', room: 'whole_house', quantity: 4500, unit: 'sf', materialCost: 0.35, laborHours: 40, laborRate: 45, markupPercent: 20, sortOrder: 4 }),
                createLineItem({ id: 'li_005', name: 'Vinyl Plank Flooring', category: 'flooring', room: 'living_room', quantity: 1400, unit: 'sf', materialCost: 3.50, laborHours: 20, laborRate: 45, markupPercent: 20, contingencyPercent: 10, sortOrder: 5 }),
                createLineItem({ id: 'li_005b', name: 'Vinyl Plank Flooring', category: 'flooring', room: 'bedroom_1', quantity: 400, unit: 'sf', materialCost: 3.50, laborHours: 5, laborRate: 45, markupPercent: 20, contingencyPercent: 10, sortOrder: 5 }),
                createLineItem({ id: 'li_005c', name: 'Vinyl Plank Flooring', category: 'flooring', room: 'bedroom_2', quantity: 400, unit: 'sf', materialCost: 3.50, laborHours: 5, laborRate: 45, markupPercent: 20, contingencyPercent: 10, sortOrder: 5 }),
                createLineItem({ id: 'li_006', name: 'Cabinet Install - Base', category: 'cabinets', room: 'kitchen', quantity: 24, unit: 'lf', materialCost: 180, laborHours: 16, laborRate: 55, markupPercent: 20, sortOrder: 6 }),
                createLineItem({ id: 'li_007', name: 'Cabinet Install - Upper', category: 'cabinets', room: 'kitchen', quantity: 18, unit: 'lf', materialCost: 150, laborHours: 12, laborRate: 55, markupPercent: 20, sortOrder: 7 }),
                createLineItem({ id: 'li_008', name: 'Quartz Countertop', category: 'countertops', room: 'kitchen', quantity: 42, unit: 'sf', materialCost: 85, laborHours: 8, laborRate: 55, markupPercent: 20, sortOrder: 8 }),
                createLineItem({ id: 'li_009', name: 'Electrical Update', category: 'electrical', room: 'whole_house', quantity: 1, unit: 'lot', materialCost: 2500, laborHours: 24, laborRate: 65, markupPercent: 20, sortOrder: 9 }),
                createLineItem({ id: 'li_010', name: 'Plumbing Update', category: 'plumbing', room: 'whole_house', quantity: 1, unit: 'lot', materialCost: 1800, laborHours: 32, laborRate: 75, markupPercent: 20, sortOrder: 10 })
            ],
            rooms: [
                createRoom({ name: 'Living Room', sortOrder: 1 }),
                createRoom({ name: 'Bedroom 1', sortOrder: 2 }),
                createRoom({ name: 'Bedroom 2', sortOrder: 3 }),
                createRoom({ name: 'Kitchen', sortOrder: 4 }),
                createRoom({ name: 'Whole House', sortOrder: 5 })
            ],
            createdAt: '2026-01-20T10:00:00.000Z',
            updatedAt: '2026-02-15T16:00:00.000Z'
        }),
        createEstimate({
            id: 'est_002',
            jobId: 'job_002',
            name: 'Kitchen Estimate - Low Margin Demo',
            status: 'draft',
            scopeSummary: 'Complete kitchen remodel with new cabinets, quartz countertops, sink/faucet, flooring, and appliances.',
            internalNotes: 'Waiting on client approval for cabinet selection. This has lower margins to demo warnings.',
            lineItems: [
                createLineItem({ id: 'li_011', name: 'Cabinet - Base (No Markup)', category: 'cabinets', room: 'kitchen', quantity: 12, unit: 'lf', materialCost: 190, laborHours: 8, laborRate: 55, markupPercent: 0, sortOrder: 1 }),
                createLineItem({ id: 'li_012', name: 'Cabinet - Upper', category: 'cabinets', room: 'kitchen', quantity: 10, unit: 'lf', materialCost: 160, laborHours: 6, laborRate: 55, markupPercent: 20, sortOrder: 2 }),
                createLineItem({ id: 'li_013', name: 'Countertop Quartz', category: 'countertops', room: 'kitchen', quantity: 30, unit: 'sf', materialCost: 90, laborHours: 6, laborRate: 55, markupPercent: 20, sortOrder: 3 }),
                createLineItem({ id: 'li_014', name: 'Sink & Faucet', category: 'plumbing', room: 'kitchen', quantity: 1, unit: 'ea', materialCost: 650, laborHours: 4, laborRate: 75, sortOrder: 4 }),
                createLineItem({ id: 'li_015', name: 'Vinyl Flooring (No Labor)', category: 'flooring', room: 'kitchen', quantity: 200, unit: 'sf', materialCost: 4.50, laborHours: 0, laborRate: 0, sortOrder: 5 }),
                createLineItem({ id: 'li_016', name: 'Electrical', category: 'electrical', room: 'kitchen', quantity: 1, unit: 'lot', materialCost: 800, laborHours: 8, laborRate: 65, markupPercent: 20, sortOrder: 6 })
            ],
            rooms: [
                createRoom({ name: 'Kitchen', sortOrder: 1 })
            ],
            createdAt: '2026-02-12T10:00:00.000Z',
            updatedAt: '2026-03-01T11:00:00.000Z'
        })
    ];

    const costLibrary = [
        createCostLibraryItem({ id: 'lib_001', name: 'Drywall Installation (1/2")', category: 'drywall', defaultUnit: 'sf', defaultMaterialCost: 0.45, defaultLaborHours: 0.015, defaultLaborRate: 45, defaultMarkup: 20, notes: 'Includes tape, mud, and screws' }),
        createCostLibraryItem({ id: 'lib_002', name: 'Vinyl Plank Flooring', category: 'flooring', defaultUnit: 'sf', defaultMaterialCost: 3.50, defaultLaborHours: 0.012, defaultLaborRate: 45, defaultMarkup: 20, notes: 'Includes underlayment' }),
        createCostLibraryItem({ id: 'lib_003', name: 'Interior Paint (Eggshell)', category: 'paint', defaultUnit: 'sf', defaultMaterialCost: 0.35, defaultLaborHours: 0.009, defaultLaborRate: 45, defaultMarkup: 20, notes: 'Two coats, primed walls' }),
        createCostLibraryItem({ id: 'lib_004', name: 'Base Cabinet Install', category: 'cabinets', defaultUnit: 'lf', defaultMaterialCost: 5, defaultLaborHours: 0.6, defaultLaborRate: 55, defaultMarkup: 20, notes: 'Per linear foot' }),
        createCostLibraryItem({ id: 'lib_005', name: 'Ceramic Tile Install', category: 'flooring', defaultUnit: 'sf', defaultMaterialCost: 4, defaultLaborHours: 0.08, defaultLaborRate: 50, defaultMarkup: 20, notes: 'Standard 12x12 tile' }),
        createCostLibraryItem({ id: 'lib_006', name: 'Framing - Walls', category: 'framing', defaultUnit: 'sf', defaultMaterialCost: 1.50, defaultLaborHours: 0.04, defaultLaborRate: 45, defaultMarkup: 20, notes: 'Per square foot of wall' }),
        createCostLibraryItem({ id: 'lib_007', name: 'DEMO - Interior', category: 'demolition', defaultUnit: 'sf', defaultMaterialCost: 0, defaultLaborHours: 0.04, defaultLaborRate: 40, defaultMarkup: 15, notes: 'Per square foot of interior' })
    ];

    // Seed Assemblies (Phase 2)
    const assemblies = [
        createAssembly({
            id: 'asm_001',
            name: 'Bathroom Demo Package',
            category: 'demolition',
            description: 'Complete bathroom demolition including fixtures, tile, and drywall',
            lineItems: [
                createLineItem({ name: 'Remove Toilet', category: 'demolition', quantity: 1, unit: 'ea', materialCost: 0, laborHours: 1, laborRate: 45 }),
                createLineItem({ name: 'Remove Vanity', category: 'demolition', quantity: 1, unit: 'ea', materialCost: 0, laborHours: 1.5, laborRate: 45 }),
                createLineItem({ name: 'Remove Tub/Shower', category: 'demolition', quantity: 1, unit: 'ea', materialCost: 0, laborHours: 3, laborRate: 45 }),
                createLineItem({ name: 'Remove Tile Floor', category: 'demolition', quantity: 40, unit: 'sf', materialCost: 0, laborHours: 0.05, laborRate: 40 }),
                createLineItem({ name: 'Remove Drywall (Wet Area)', category: 'demolition', quantity: 80, unit: 'sf', materialCost: 0, laborHours: 0.04, laborRate: 40 }),
                createLineItem({ name: 'Haul Away Debris', category: 'demolition', quantity: 1, unit: 'lot', materialCost: 150, laborHours: 2, laborRate: 40 })
            ],
            createdAt: '2026-01-01T00:00:00.000Z'
        }),
        createAssembly({
            id: 'asm_002',
            name: 'Paint Room Package',
            category: 'paint',
            description: 'Complete interior paint for one room including prep and two coats',
            lineItems: [
                createLineItem({ name: 'Room Prep', category: 'paint', quantity: 1, unit: 'room', materialCost: 0, laborHours: 1, laborRate: 40 }),
                createLineItem({ name: 'Prime Walls', category: 'paint', quantity: 300, unit: 'sf', materialCost: 0.15, laborHours: 0.015, laborRate: 40 }),
                createLineItem({ name: 'Paint Walls (2 coats)', category: 'paint', quantity: 300, unit: 'sf', materialCost: 0.35, laborHours: 0.02, laborRate: 40 }),
                createLineItem({ name: 'Paint Ceiling', category: 'paint', quantity: 100, unit: 'sf', materialCost: 0.25, laborHours: 0.025, laborRate: 40 }),
                createLineItem({ name: 'Paint Trim', category: 'paint', quantity: 30, unit: 'lf', materialCost: 0.10, laborHours: 0.05, laborRate: 45 })
            ],
            createdAt: '2026-01-01T00:00:00.000Z'
        }),
        createAssembly({
            id: 'asm_003',
            name: 'LVP Flooring Package',
            category: 'flooring',
            description: 'Complete luxury vinyl plank flooring install with prep',
            lineItems: [
                createLineItem({ name: 'Floor Prep', category: 'flooring', quantity: 200, unit: 'sf', materialCost: 0.10, laborHours: 0.01, laborRate: 35 }),
                createLineItem({ name: 'Install LVP', category: 'flooring', quantity: 200, unit: 'sf', materialCost: 3.50, laborHours: 0.015, laborRate: 45 }),
                createLineItem({ name: 'Transition Strips', category: 'flooring', quantity: 2, unit: 'ea', materialCost: 25, laborHours: 0.5, laborRate: 40 }),
                createLineItem({ name: 'Final Cleaning', category: 'cleanup', quantity: 200, unit: 'sf', materialCost: 0, laborHours: 0.005, laborRate: 30 })
            ],
            createdAt: '2026-01-01T00:00:00.000Z'
        }),
        createAssembly({
            id: 'asm_004',
            name: 'Standard Drywall Repair',
            category: 'drywall',
            description: 'Drywall repair patch with finish and paint match',
            lineItems: [
                createLineItem({ name: 'Cut Out Damaged Area', category: 'drywall', quantity: 1, unit: 'ea', materialCost: 0, laborHours: 1, laborRate: 45 }),
                createLineItem({ name: 'Install Drywall Patch', category: 'drywall', quantity: 8, unit: 'sf', materialCost: 15, laborHours: 0.5, laborRate: 45 }),
                createLineItem({ name: 'Tape and Mud', category: 'drywall', quantity: 8, unit: 'sf', materialCost: 2, laborHours: 0.15, laborRate: 45 }),
                createLineItem({ name: 'Sand Smooth', category: 'drywall', quantity: 8, unit: 'sf', materialCost: 0, laborHours: 0.1, laborRate: 40 }),
                createLineItem({ name: 'Prime and Touch Up', category: 'paint', quantity: 8, unit: 'sf', materialCost: 3, laborHours: 0.1, laborRate: 40 })
            ],
            createdAt: '2026-01-01T00:00:00.000Z'
        })
    ];

    const templates = [
        createTemplate({
            id: 'tpl_001',
            name: 'Kitchen Remodel',
            description: 'Standard kitchen remodel with base and upper cabinets, countertop, sink, and flooring',
            lineItems: [
                createLineItem({ name: 'Cabinet - Base', category: 'cabinets', quantity: 12, unit: 'lf', materialCost: 180, laborHours: 8, laborRate: 55, sortOrder: 1 }),
                createLineItem({ name: 'Cabinet - Upper', category: 'cabinets', quantity: 10, unit: 'lf', materialCost: 150, laborHours: 6, laborRate: 55, sortOrder: 2 }),
                createLineItem({ name: 'Countertop', category: 'countertops', quantity: 30, unit: 'sf', materialCost: 85, laborHours: 6, laborRate: 55, sortOrder: 3 }),
                createLineItem({ name: 'Sink & Faucet', category: 'plumbing', quantity: 1, unit: 'ea', materialCost: 600, laborHours: 4, laborRate: 75, sortOrder: 4 }),
                createLineItem({ name: 'Flooring', category: 'flooring', quantity: 200, unit: 'sf', materialCost: 4, laborHours: 6, laborRate: 45, sortOrder: 5 }),
                createLineItem({ name: 'Electrical', category: 'electrical', quantity: 1, unit: 'lot', materialCost: 800, laborHours: 8, laborRate: 65, sortOrder: 6 })
            ],
            createdAt: '2026-01-01T00:00:00.000Z'
        }),
        createTemplate({
            id: 'tpl_002',
            name: 'Full Flip Rehab',
            description: 'Complete interior rehab for house flip',
            lineItems: [
                createLineItem({ name: 'Full Demolition', category: 'demolition', quantity: 2000, unit: 'sf', materialCost: 0, laborHours: 80, laborRate: 45, sortOrder: 1 }),
                createLineItem({ name: 'Drywall Install', category: 'drywall', quantity: 4000, unit: 'sf', materialCost: 0.45, laborHours: 50, laborRate: 45, sortOrder: 2 }),
                createLineItem({ name: 'Drywall Finish', category: 'drywall', quantity: 4000, unit: 'sf', materialCost: 0.15, laborHours: 40, laborRate: 45, sortOrder: 3 }),
                createLineItem({ name: 'Interior Paint', category: 'paint', quantity: 4000, unit: 'sf', materialCost: 0.35, laborHours: 35, laborRate: 45, sortOrder: 4 }),
                createLineItem({ name: 'Flooring', category: 'flooring', quantity: 2000, unit: 'sf', materialCost: 3.50, laborHours: 25, laborRate: 45, sortOrder: 5 }),
                createLineItem({ name: 'Cabinets - Base', category: 'cabinets', quantity: 20, unit: 'lf', materialCost: 180, laborHours: 14, laborRate: 55, sortOrder: 6 }),
                createLineItem({ name: 'Cabinets - Upper', category: 'cabinets', quantity: 16, unit: 'lf', materialCost: 150, laborHours: 10, laborRate: 55, sortOrder: 7 }),
                createLineItem({ name: 'Countertops', category: 'countertops', quantity: 36, unit: 'sf', materialCost: 85, laborHours: 7, laborRate: 55, sortOrder: 8 }),
                createLineItem({ name: 'Full Electrical', category: 'electrical', quantity: 1, unit: 'lot', materialCost: 2500, laborHours: 24, laborRate: 65, sortOrder: 9 }),
                createLineItem({ name: 'Full Plumbing', category: 'plumbing', quantity: 1, unit: 'lot', materialCost: 1800, laborHours: 30, laborRate: 75, sortOrder: 10 }),
                createLineItem({ name: 'Cleanup', category: 'cleanup', quantity: 1, unit: 'lot', materialCost: 300, laborHours: 8, laborRate: 35, sortOrder: 11 })
            ],
            createdAt: '2026-01-01T00:00:00.000Z'
        })
    ];

    return {
        settings: defaultSettings,
        jobs,
        estimates,
        costLibrary,
        templates,
        assemblies,
        changeOrders: []
    };
}

// PHASE 3 MODELS

// Model: Photo Note
function createPhotoNote(data = {}) {
    return {
        id: data.id || generateId(),
        jobId: data.jobId || '',
        estimateId: data.estimateId || '',
        title: data.title || '',
        description: data.description || '',
        imageData: data.imageData || '',
        tags: data.tags || [],
        room: data.room || '',
        createdAt: data.createdAt || now(),
        updatedAt: data.updatedAt || now()
    };
}

// Model: Subcontractor Bid
function createSubcontractorBid(data = {}) {
    return {
        id: data.id || generateId(),
        jobId: data.jobId || '',
        trade: data.trade || 'miscellaneous',
        companyName: data.companyName || '',
        contactName: data.contactName || '',
        phone: data.phone || '',
        email: data.email || '',
        bidAmount: data.bidAmount || 0,
        notes: data.notes || '',
        exclusions: data.exclusions || '',
        leadTime: data.leadTime || '',
        warranty: data.warranty || '',
        status: data.status || 'requested',
        createdAt: data.createdAt || now(),
        updatedAt: data.updatedAt || now()
    };
}

// Model: Actual Cost
function createActualCost(data = {}) {
    return {
        id: data.id || generateId(),
        jobId: data.jobId || '',
        estimateLineItemId: data.estimateLineItemId || '',
        category: data.category || 'material',
        vendor: data.vendor || '',
        description: data.description || '',
        amount: data.amount || 0,
        date: data.date || now().split('T')[0],
        room: data.room || '',
        notes: data.notes || '',
        createdAt: data.createdAt || now(),
        updatedAt: data.updatedAt || now()
    };
}

// Change Order (upgraded)
function createChangeOrder(data = {}) {
    return {
        id: data.id || generateId(),
        estimateId: data.estimateId || '',
        jobId: data.jobId || '',
        coNumber: data.coNumber || '',
        title: data.title || '',
        status: data.status || 'draft',
        reason: data.reason || '',
        customerNotes: data.customerNotes || '',
        scheduleImpact: data.scheduleImpact || '',
        lineItems: data.lineItems || [],
        createdAt: data.createdAt || now(),
        updatedAt: data.updatedAt || now()
    };
}

// Enums for Phase 3
const PHOTO_TAGS = [
    { value: 'demo', label: 'Demo' },
    { value: 'damage', label: 'Damage' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'flooring', label: 'Flooring' },
    { value: 'paint', label: 'Paint' },
    { value: 'framing', label: 'Framing' },
    { value: 'customer_request', label: 'Customer Request' },
    { value: 'change_order', label: 'Change Order' },
    { value: 'finish_selection', label: 'Finish Selection' },
    { value: 'exterior', label: 'Exterior' },
    { value: 'progress', label: 'Progress' },
    { value: 'issue', label: 'Issue' }
];

const COST_CATEGORIES = [
    { value: 'material', label: 'Material' },
    { value: 'labor', label: 'Labor' },
    { value: 'subcontractor', label: 'Subcontractor' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'permit', label: 'Permit' },
    { value: 'misc', label: 'Misc' }
];

const BID_STATUSES = [
    { value: 'requested', label: 'Requested' },
    { value: 'received', label: 'Received' },
    { value: 'selected', label: 'Selected' },
    { value: 'not_selected', label: 'Not Selected' }
];

const CO_STATUSES = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' }
];

const TRADES = [
    { value: 'electrical', label: 'Electrical' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'hvac', label: 'HVAC' },
    { value: 'roofing', label: 'Roofing' },
    { value: 'framing', label: 'Framing' },
    { value: 'drywall', label: 'Drywall' },
    { value: 'painting', label: 'Painting' },
    { value: 'flooring', label: 'Flooring' },
    { value: 'cabinets', label: 'Cabinets' },
    { value: 'countertops', label: 'Countertops' },
    { value: 'exterior', label: 'Exterior' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'other', label: 'Other' }
];

// Team Members (Phase 4)
const TEAM_ROLES = [
    { value: 'owner', label: 'Owner' },
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'estimator', label: 'Estimator' },
    { value: 'field_lead', label: 'Field Lead' },
    { value: 'field', label: 'Field' },
    { value: 'admin', label: 'Admin' }
];

function createTeamMember(data = {}) {
    return {
        id: data.id || generateId(),
        name: data.name || '',
        role: data.role || '',
        email: data.email || '',
        phone: data.phone || '',
        isActive: data.isActive !== false,
        createdAt: data.createdAt || now()
    };
}

// Signature (Phase 4)
function createSignature(data = {}) {
    return {
        id: data.id || generateId(),
        name: data.name || '',
        imageData: data.imageData || '',
        dateSigned: data.dateSigned || now(),
        linkedEstimateId: data.linkedEstimateId || '',
        linkedChangeOrderId: data.linkedChangeOrderId || ''
    };
}

// INVOICE MODELS (Phase 5)

const INVOICE_STATUSES = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'partially_paid', label: 'Partially Paid' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'void', label: 'Void' }
];

const INVOICE_TYPES = [
    { value: 'deposit', label: 'Deposit' },
    { value: 'progress', label: 'Progress Payment' },
    { value: 'milestone', label: 'Milestone' },
    { value: 'change_order', label: 'Change Order' },
    { value: 'final', label: 'Final' },
    { value: 'manual', label: 'Manual' }
];

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'card', label: 'Card' },
    { value: 'ach', label: 'ACH/Bank Transfer' },
    { value: 'other', label: 'Other' }
];

function createInvoice(data = {}) {
    return {
        id: data.id || generateId(),
        invoiceNumber: data.invoiceNumber || '',
        jobId: data.jobId || '',
        estimateId: data.estimateId || '',
        changeOrderId: data.changeOrderId || '',
        title: data.title || '',
        type: data.type || 'manual',
        status: data.status || 'draft',
        issueDate: data.issueDate || now().split('T')[0],
        dueDate: data.dueDate || '',
        billToName: data.billToName || '',
        billToAddress: data.billToAddress || '',
        billToPhone: data.billToPhone || '',
        billToEmail: data.billToEmail || '',
        lineItems: data.lineItems || [],
        notes: data.notes || '',
        paymentTerms: data.paymentTerms || '',
        preparedBy: data.preparedBy || '',
        createdBy: data.createdBy || '',
        createdAt: data.createdAt || now(),
        updatedAt: data.updatedAt || now()
    };
}

function createInvoiceLineItem(data = {}) {
    return {
        id: data.id || generateId(),
        name: data.name || '',
        description: data.description || '',
        quantity: data.quantity || 1,
        unit: data.unit || 'ea',
        unitPrice: data.unitPrice || 0,
        taxPercent: data.taxPercent || 0,
        room: data.room || '',
        category: data.category || ''
    };
}

function createPayment(data = {}) {
    return {
        id: data.id || generateId(),
        invoiceId: data.invoiceId || '',
        paymentDate: data.paymentDate || now().split('T')[0],
        amount: data.amount || 0,
        method: data.method || 'check',
        referenceNumber: data.referenceNumber || '',
        notes: data.notes || '',
        createdAt: data.createdAt || now()
    };
}

function createBranding(data = {}) {
    return {
        companyName: data.companyName || "Allen's Contractor's",
        logoData: data.logoData || '',
        primaryColor: data.primaryColor || '#1E3A5F',
        secondaryColor: data.secondaryColor || '#E67E22',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        website: data.website || '',
        licenseNumber: data.licenseNumber || '',
        footerText: data.footerText || '',
        paymentInstructions: data.paymentInstructions || '',
        tagline: data.tagline || '',
        updatedAt: data.updatedAt || now()
    };
}

// Invoice helpers
function calculateInvoice(invoice) {
    let subtotal = 0;
    let tax = 0;

    invoice.lineItems.forEach(item => {
        const lineTotal = item.quantity * item.unitPrice;
        subtotal += lineTotal;
        tax += lineTotal * (item.taxPercent / 100);
    });

    const total = subtotal + tax;
    return { subtotal, tax, total };
}

function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `INV-${year}${month}-${random}`;
}

// Job financial summary (computed)
function calculateJobFinancials(jobId) {
    const estimates = Storage.getEstimates().filter(e => e.jobId === jobId);
    const changeOrders = Storage.getChangeOrders().filter(co => co.jobId === jobId && co.status === 'approved');
    const actualCosts = Storage.getActualCosts().filter(ac => ac.jobId === jobId);
    const settings = Storage.getSettings() || {};

    let estimateTotal = 0;
    let approvedCO = 0;

    estimates.forEach(est => {
        if (est.status === 'accepted' || est.status === 'in_progress') {
            const calc = calculateEstimate(est, settings);
            estimateTotal += calc.grandTotal;
        }
    });

    changeOrders.forEach(co => {
        const calc = calculateEstimate({ lineItems: co.lineItems }, settings);
        approvedCO += calc.grandTotal;
    });

    let totalActualCost = 0;
    let materialCost = 0, laborCost = 0, subCost = 0, equipCost = 0, permitCost = 0, miscCost = 0;

    actualCosts.forEach(cost => {
        totalActualCost += cost.amount;
        switch (cost.category) {
            case 'material': materialCost += cost.amount; break;
            case 'labor': laborCost += cost.amount; break;
            case 'subcontractor': subCost += cost.amount; break;
            case 'equipment': equipCost += cost.amount; break;
            case 'permit': permitCost += cost.amount; break;
            case 'misc': miscCost += cost.amount; break;
        }
    });

    const totalRevenue = estimateTotal + approvedCO;
    const grossProfit = totalRevenue - totalActualCost;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const variance = totalRevenue - totalActualCost;
    const variancePercent = totalRevenue > 0 ? (variance / totalRevenue) * 100 : 0;

    return {
        estimateTotal,
        approvedChangeOrders: approvedCO,
        totalRevenue,
        totalActualCost,
        grossProfit,
        grossMargin,
        variance,
        variancePercent,
        materialCost,
        laborCost,
        subCost,
        equipCost,
        permitCost,
        miscCost,
        openChangeOrders: changeOrders.filter(co => co.status !== 'completed').length
    };
}

// Seed default data (Phase 2)
function seedDefaultData() {
    console.log('[Data] Seeding default data (Phase 2)...');

    const data = getSeedData();

    Storage.saveSettings(data.settings);
    Storage.saveJobs(data.jobs);
    Storage.saveEstimates(data.estimates);
    Storage.saveCostLibrary(data.costLibrary);
    Storage.saveTemplates(data.templates);
    Storage.saveAssemblies(data.assemblies);
    Storage.saveChangeOrders(data.changeOrders);

    console.log('[Data] Default data seeded successfully (Phase 2)');
}

// Make functions globally available
window.createJob = createJob;
window.createLineItem = createLineItem;
window.createEstimate = createEstimate;
window.createAssembly = createAssembly;
window.createCostLibraryItem = createCostLibraryItem;
window.createTemplate = createTemplate;
window.createChangeOrder = createChangeOrder;
window.createSettings = createSettings;
window.createRoom = createRoom;
window.createPhotoNote = createPhotoNote;
window.createSubcontractorBid = createSubcontractorBid;
window.createActualCost = createActualCost;
window.createTeamMember = createTeamMember;
window.createSignature = createSignature;
window.createInvoice = createInvoice;
window.createInvoiceLineItem = createInvoiceLineItem;
window.createPayment = createPayment;
window.createBranding = createBranding;
window.calculateLineItem = calculateLineItem;
window.calculateEstimate = calculateEstimate;
window.calculateEstimateWarnings = calculateEstimateWarnings;
window.checkProposalReadiness = checkProposalReadiness;
window.deepCloneEstimate = deepCloneEstimate;
window.generateRefNumber = generateRefNumber;
window.calculateJobFinancials = calculateJobFinancials;
window.calculateInvoice = calculateInvoice;
window.generateInvoiceNumber = generateInvoiceNumber;
window.PRoJECT_TYPES = PROJECT_TYPES;
window.JOB_STATUSES = JOB_STATUSES;
window.ESTIMATE_STATUSES = ESTIMATE_STATUSES;
window.LINE_ITEM_CATEGORIES = LINE_ITEM_CATEGORIES;
window.UNITS = UNITS;
window.ROOM_AREAS = ROOM_AREAS;
window.PHOTO_TAGS = PHOTO_TAGS;
window.COST_CATEGORIES = COST_CATEGORIES;
window.BID_STATUSES = BID_STATUSES;
window.CO_STATUSES = CO_STATUSES;
window.TRADES = TRADES;
window.TEAM_ROLES = TEAM_ROLES;
window.INVOICE_STATUSES = INVOICE_STATUSES;
window.INVOICE_TYPES = INVOICE_TYPES;
window.PAYMENT_METHODS = PAYMENT_METHODS;

// Contract Statuses
const CONTRACT_STATUSES = [
    { value: 'draft', label: 'Draft' },
    { value: 'issued', label: 'Issued' },
    { value: 'signed', label: 'Signed' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'void', label: 'Void' }
];

// Warranty Types
const WARRANTY_TYPES = [
    { value: 'labor', label: 'Labor' },
    { value: 'material', label: 'Material' },
    { value: 'manufacturer', label: 'Manufacturer' },
    { value: 'workmanship', label: 'Workmanship' },
    { value: 'other', label: 'Other' }
];

// Warranty Statuses
const WARRANTY_STATUSES = [
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'void', label: 'Void' }
];

// Punch List Statuses
const PUNCH_LIST_STATUSES = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
];

// Punch Item Priorities
const PUNCH_ITEM_PRIORITIES = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
];

// Punch Item Statuses
const PUNCH_ITEM_STATUSES = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
];

// Material List Statuses
const MATERIAL_LIST_STATUSES = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'ordered', label: 'Ordered' },
    { value: 'complete', label: 'Complete' }
];

// Material Units
const MATERIAL_UNITS = [
    { value: 'ea', label: 'Each' },
    { value: 'box', label: 'Box' },
    { value: 'sqft', label: 'Sq Ft' },
    { value: 'lnft', label: 'Lin Ft' },
    { value: 'gal', label: 'Gallon' },
    { value: 'qt', label: 'Quart' },
    { value: 'lb', label: 'Pound' },
    { value: 'roll', label: 'Roll' },
    { value: 'bundle', label: 'Bundle' },
    { value: 'pallet', label: 'Pallet' }
];

// Material Categories
const MATERIAL_CATEGORIES = [
    { value: 'lumber', label: 'Lumber' },
    { value: 'drywall', label: 'Drywall' },
    { value: 'flooring', label: 'Flooring' },
    { value: 'tile', label: 'Tile' },
    { value: 'paint', label: 'Paint' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'plumbing', label: 'Plumbing' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'fasteners', label: 'Fasteners' },
    { value: 'tools', label: 'Tools' },
    { value: 'misc', label: 'Miscellaneous' }
];

// Communication Types
const COMMUNICATION_TYPES = [
    { value: 'call', label: 'Phone Call' },
    { value: 'text', label: 'Text Message' },
    { value: 'email', label: 'Email' },
    { value: 'in_person', label: 'In Person' },
    { value: 'other', label: 'Other' }
];

window.CONTRACT_STATUSES = CONTRACT_STATUSES;
window.WARRANTY_TYPES = WARRANTY_TYPES;
window.WARRANTY_STATUSES = WARRANTY_STATUSES;
window.PUNCH_LIST_STATUSES = PUNCH_LIST_STATUSES;
window.PUNCH_ITEM_PRIORITIES = PUNCH_ITEM_PRIORITIES;
window.PUNCH_ITEM_STATUSES = PUNCH_ITEM_STATUSES;
window.MATERIAL_LIST_STATUSES = MATERIAL_LIST_STATUSES;
window.MATERIAL_UNITS = MATERIAL_UNITS;
window.MATERIAL_CATEGORIES = MATERIAL_CATEGORIES;
window.COMMUNICATION_TYPES = COMMUNICATION_TYPES;

// Create Contract
function createContract(data = {}) {
    return {
        id: data.id || generateId(),
        contractNumber: data.contractNumber || generateContractNumber(),
        jobId: data.jobId || null,
        estimateId: data.estimateId || null,
        proposalId: data.proposalId || null,
        title: data.title || '',
        status: data.status || 'draft',
        issueDate: data.issueDate || null,
        effectiveDate: data.effectiveDate || null,
        startDate: data.startDate || null,
        completionDate: data.completionDate || null,
        amount: data.amount || 0,
        scopeSummary: data.scopeSummary || '',
        exclusions: data.exclusions || '',
        termsConditions: data.termsConditions || '',
        paymentTerms: data.paymentTerms || '',
        cancellationText: data.cancellationText || '',
        warrantyText: data.warrantyText || '',
        customerSignature: data.customerSignature || null,
        contractorSignature: data.contractorSignature || null,
        signedDate: data.signedDate || null,
        preparedBy: data.preparedBy || '',
        createdBy: data.createdBy || '',
        createdDate: data.createdDate || now(),
        updatedDate: data.updatedDate || now()
    };
}

function generateContractNumber() {
    const year = new Date().getFullYear();
    const count = Storage.getContracts().length + 1;
    return `CON-${year}-${count.toString().padStart(4, '0')}`;
}

// Create Warranty
function createWarranty(data = {}) {
    return {
        id: data.id || generateId(),
        jobId: data.jobId || null,
        contractId: data.contractId || null,
        title: data.title || '',
        type: data.type || 'labor',
        coverageDescription: data.coverageDescription || '',
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        status: data.status || 'active',
        exclusions: data.exclusions || '',
        notes: data.notes || '',
        createdDate: data.createdDate || now(),
        updatedDate: data.updatedDate || now()
    };
}

// Create Punch List
function createPunchList(data = {}) {
    return {
        id: data.id || generateId(),
        jobId: data.jobId || null,
        title: data.title || 'Punch List',
        status: data.status || 'open',
        items: data.items || [],
        createdDate: data.createdDate || now(),
        updatedDate: data.updatedDate || now()
    };
}

// Create Punch List Item
function createPunchItem(data = {}) {
    return {
        id: data.id || generateId(),
        title: data.title || '',
        description: data.description || '',
        roomArea: data.roomArea || '',
        priority: data.priority || 'medium',
        assignedTo: data.assignedTo || '',
        status: data.status || 'open',
        dueDate: data.dueDate || null,
        completionDate: data.completionDate || null,
        photoRef: data.photoRef || null,
        notes: data.notes || ''
    };
}

// Create Material List
function createMaterialList(data = {}) {
    return {
        id: data.id || generateId(),
        jobId: data.jobId || null,
        estimateId: data.estimateId || null,
        title: data.title || 'Material List',
        status: data.status || 'draft',
        items: data.items || [],
        createdDate: data.createdDate || now(),
        updatedDate: data.updatedDate || now()
    };
}

// Create Material Item
function createMaterialItem(data = {}) {
    return {
        id: data.id || generateId(),
        name: data.name || '',
        description: data.description || '',
        quantity: data.quantity || 1,
        unit: data.unit || 'ea',
        category: data.category || 'misc',
        roomArea: data.roomArea || '',
        vendor: data.vendor || '',
        estimatedCost: data.estimatedCost || 0,
        actualCost: data.actualCost || 0,
        ordered: data.ordered || false,
        received: data.received || false,
        notes: data.notes || ''
    };
}

// Create Communication Log
function createCommunicationLog(data = {}) {
    return {
        id: data.id || generateId(),
        jobId: data.jobId || null,
        dateTime: data.dateTime || now(),
        type: data.type || 'call',
        contactPerson: data.contactPerson || '',
        subject: data.subject || '',
        notes: data.notes || '',
        followUpNeeded: data.followUpNeeded || false,
        followUpDate: data.followUpDate || null,
        createdBy: data.createdBy || '',
        createdDate: data.createdDate || now(),
        updatedDate: data.updatedDate || now()
    };
}

window.createContract = createContract;
window.createWarranty = createWarranty;
window.createPunchList = createPunchList;
window.createPunchItem = createPunchItem;
window.createMaterialList = createMaterialList;
window.createMaterialItem = createMaterialItem;
window.createCommunicationLog = createCommunicationLog;

// Calendar Event Types
const CALENDAR_EVENT_TYPES = [
    { value: 'estimate_appointment', label: 'Estimate Appointment' },
    { value: 'site_visit', label: 'Site Visit' },
    { value: 'demo', label: 'Demolition' },
    { value: 'framing', label: 'Framing' },
    { value: 'drywall', label: 'Drywall' },
    { value: 'paint', label: 'Paint' },
    { value: 'flooring', label: 'Flooring' },
    { value: 'install', label: 'Install' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'material_delivery', label: 'Material Delivery' },
    { value: 'punch_list', label: 'Punch List' },
    { value: 'final_walkthrough', label: 'Final Walkthrough' },
    { value: 'payment_due', label: 'Payment Due' },
    { value: 'other', label: 'Other' }
];

const CALENDAR_EVENT_STATUSES = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'canceled', label: 'Canceled' }
];

// Task Priorities
const TASK_PRIORITIES = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
];

const TASK_STATUSES = [
    { value: 'open', label: 'Open' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'completed', label: 'Completed' },
    { value: 'canceled', label: 'Canceled' }
];

// Milestone Statuses
const MILESTONE_STATUSES = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'due_soon', label: 'Due Soon' },
    { value: 'completed', label: 'Completed' },
    { value: 'delayed', label: 'Delayed' },
    { value: 'skipped', label: 'Skipped' }
];

// Job Schedule Statuses
const JOB_SCHEDULE_STATUSES = [
    { value: 'not_scheduled', label: 'Not Scheduled' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'delayed', label: 'Delayed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' }
];

window.CALENDAR_EVENT_TYPES = CALENDAR_EVENT_TYPES;
window.CALENDAR_EVENT_STATUSES = CALENDAR_EVENT_STATUSES;
window.TASK_PRIORITIES = TASK_PRIORITIES;
window.TASK_STATUSES = TASK_STATUSES;
window.MILESTONE_STATUSES = MILESTONE_STATUSES;
window.JOB_SCHEDULE_STATUSES = JOB_SCHEDULE_STATUSES;

// Create Calendar Event
function createCalendarEvent(data = {}) {
    return {
        id: data.id || generateId(),
        jobId: data.jobId || null,
        title: data.title || '',
        description: data.description || '',
        type: data.type || 'other',
        startDate: data.startDate || null,
        startTime: data.startTime || '',
        endDate: data.endDate || null,
        endTime: data.endTime || '',
        allDay: data.allDay || false,
        location: data.location || '',
        assignedTo: data.assignedTo || '',
        crewId: data.crewId || null,
        status: data.status || 'scheduled',
        notes: data.notes || '',
        createdDate: data.createdDate || now(),
        updatedDate: data.updatedDate || now()
    };
}

// Create Task
function createTask(data = {}) {
    return {
        id: data.id || generateId(),
        jobId: data.jobId || null,
        eventId: data.eventId || null,
        title: data.title || '',
        description: data.description || '',
        roomArea: data.roomArea || '',
        category: data.category || '',
        assignedTo: data.assignedTo || '',
        priority: data.priority || 'medium',
        status: data.status || 'open',
        dueDate: data.dueDate || null,
        completedDate: data.completedDate || null,
        estimatedHours: data.estimatedHours || 0,
        actualHours: data.actualHours || 0,
        notes: data.notes || '',
        createdDate: data.createdDate || now(),
        updatedDate: data.updatedDate || now()
    };
}

// Create Crew
function createCrew(data = {}) {
    return {
        id: data.id || generateId(),
        name: data.name || '',
        role: data.role || '',
        memberIds: data.memberIds || [],
        notes: data.notes || '',
        createdDate: data.createdDate || now(),
        updatedDate: data.updatedDate || now()
    };
}

// Create Milestone
function createMilestone(data = {}) {
    return {
        id: data.id || generateId(),
        jobId: data.jobId || null,
        title: data.title || '',
        description: data.description || '',
        targetDate: data.targetDate || null,
        actualDate: data.actualDate || null,
        status: data.status || 'upcoming',
        notes: data.notes || '',
        createdDate: data.createdDate || now(),
        updatedDate: data.updatedDate || now()
    };
}

// Create Daily Log
function createDailyLog(data = {}) {
    return {
        id: data.id || generateId(),
        jobId: data.jobId || null,
        logDate: data.logDate || now().split('T')[0],
        weather: data.weather || '',
        crewOnSite: data.crewOnSite || '',
        workCompleted: data.workCompleted || '',
        materialsDelivered: data.materialsDelivered || '',
        issues: data.issues || '',
        inspections: data.inspections || '',
        customerComm: data.customerComm || '',
        safetyNotes: data.safetyNotes || '',
        nextSteps: data.nextSteps || '',
        createdBy: data.createdBy || '',
        createdDate: data.createdDate || now(),
        updatedDate: data.updatedDate || now()
    };
}

window.createCalendarEvent = createCalendarEvent;
window.createTask = createTask;
window.createCrew = createCrew;
window.createMilestone = createMilestone;
window.createDailyLog = createDailyLog;

window.getSeedData = getSeedData;
window.getRoomLabel = getRoomLabel;