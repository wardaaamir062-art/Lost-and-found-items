// ----------JS DATA STORE (in-memory array) ----------
// Each item represents a lost or found report.
let items = [
    { id: 101, type: 'lost', name: 'Black Leather Wallet', category: 'accessories', location: 'Central Park Station', date: '2024-12-10',
      description: 'Contains ID & credit cards, brown interior, vintage stitch', contact: 'john.d@example.com', timestamp: 1733817600000 },
    { id: 102, type: 'found', name: 'iPhone 13', category: 'electronics', location: 'Starbucks Main St', date: '2024-12-12',
      description: 'Blue silicone case with cardholder, screen slightly scratched', contact: 'lost@coffee.com', timestamp: 1733968800000 },
    { id: 103, type: 'lost', name: 'Car Keys with VW fob', category: 'keys', location: 'Parking lot A', date: '2024-12-08',
      description: '3 keys + gym tag (blue) + small lego figure attached', contact: 'sarah.k@example.com', timestamp: 1733644800000 }
];

let currentFilter = 'all'; // Tracks active filter: 'all', 'lost', or 'found'

// DOM element references & initial setup
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('item-date').valueAsDate = new Date(); // Pre-fill date input with today
    updateCount();
    renderItems();
});

// ----- Helper: Update total count badge in header -----
function updateCount() {
    document.getElementById('total-items').innerText = items.length;
}

// ----- Clear all red error outlines from form fields -----
function clearAllFieldErrors() {
    const errorFields = ['item-name', 'item-location', 'item-contact', 'item-date'];
    errorFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.remove('input-error');
        }
        // Hide corresponding error message
        const errorMsg = document.getElementById(`error-${fieldId.replace('item-', '')}`);
        if (errorMsg) errorMsg.classList.remove('show');
    });
}

// ----- Mark a specific field as invalid with red outline -----
function markFieldError(fieldId, errorMsgId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('input-error');
        // Add focus listener to remove error when user starts typing
        field.addEventListener('input', function removeError() {
            field.classList.remove('input-error');
            const msg = document.getElementById(errorMsgId);
            if (msg) msg.classList.remove('show');
            field.removeEventListener('input', removeError);
        }, { once: true });
    }
    const errorDiv = document.getElementById(errorMsgId);
    if (errorDiv) errorDiv.classList.add('show');
}

// ----- Validate form and highlight empty required fields (no alert popups) -----
function validateFormAndHighlight() {
    let isValid = true;

    const itemName     = document.getElementById('item-name').value.trim();
    const itemLocation = document.getElementById('item-location').value.trim();
    const itemContact  = document.getElementById('item-contact').value.trim();
    const itemDate     = document.getElementById('item-date').value;

    // Clear previous red outlines
    clearAllFieldErrors();

    if (!itemName) {
        markFieldError('item-name', 'error-name');
        isValid = false;
    }
    if (!itemLocation) {
        markFieldError('item-location', 'error-location');
        isValid = false;
    }
    if (!itemContact) {
        markFieldError('item-contact', 'error-contact');
        isValid = false;
    }
    if (!itemDate) {
        markFieldError('item-date', 'error-date');
        isValid = false;
    }

    return isValid;
}

// ----- Switch between "Report" and "Browse" views -----
function switchMode(mode) {
    const reportDiv = document.getElementById('section-report');
    const browseDiv = document.getElementById('section-browse');
    const btnReport  = document.getElementById('btn-report');
    const btnBrowse  = document.getElementById('btn-browse');

    // Clear any error styling when switching away from report form
    if (mode === 'browse') {
        clearAllFieldErrors();
    }

    if (mode === 'report') {
        reportDiv.classList.remove('hidden');
        browseDiv.classList.add('hidden');
        btnReport.classList.add('tab-active');
        btnReport.classList.remove('text-gray-600');
        btnBrowse.classList.remove('tab-active');
        btnBrowse.classList.add('text-gray-600');
    } else {
        reportDiv.classList.add('hidden');
        browseDiv.classList.remove('hidden');
        renderItems(); // Re-render items to ensure latest data
        btnBrowse.classList.add('tab-active');
        btnBrowse.classList.remove('text-gray-600');
        btnReport.classList.remove('tab-active');
        btnReport.classList.add('text-gray-600');
    }
}

// ----- Handle new item submission with visual validation (no alert popups) -----
function handleSubmit(e) {
    e.preventDefault(); // Prevent page reload

    if (!validateFormAndHighlight()) {
        // Show a brief non-intrusive toast instead of an alert dialog
        const toastMsg = document.getElementById('toast-message');
        const toast    = document.getElementById('toast');
        toastMsg.innerHTML = '⚠️ Please fill in all required fields';
        toast.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 2000);
        return;
    }

    const type        = document.querySelector('input[name="type"]:checked').value;
    const nameInput   = document.getElementById('item-name').value.trim();
    const locationVal = document.getElementById('item-location').value.trim();
    const contactVal  = document.getElementById('item-contact').value.trim();
    const dateVal     = document.getElementById('item-date').value;

    const newItem = {
        id:          Date.now(),
        type:        type,
        name:        nameInput,
        category:    document.getElementById('item-category').value,
        location:    locationVal,
        date:        dateVal,
        description: document.getElementById('item-desc').value.trim(),
        contact:     contactVal,
        timestamp:   Date.now()
    };

    items.unshift(newItem); // Add to beginning of array (newest shows first)
    updateCount();          // Refresh total count

    showToast(`✅ ${type === 'lost' ? 'Lost' : 'Found'} item reported!`);

    // Reset the entire form and clear any error styling
    document.getElementById('item-form').reset();
    document.getElementById('item-date').valueAsDate = new Date();
    document.querySelector('input[name="type"][value="lost"]').checked = true;
    clearAllFieldErrors();

    // Auto-navigate to browse mode after short delay, filtering by the submitted type
    setTimeout(() => {
        switchMode('browse');
        filterByType(type);
    }, 650);
}
