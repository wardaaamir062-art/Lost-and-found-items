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

// ----- Validate form and highlight empty required fields -----
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

// ----- Handle new item submission with visual validation -----
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
// ----- Generate category icon SVG based on category name -----
function getCategoryIconSvg(cat) {
    const icons = {
        electronics:  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2" y="5" width="20" height="12" rx="2"/><line x1="8" y1="19" x2="16" y2="19"/><line x1="12" y1="17" x2="12" y2="19"/></svg>`,
        clothing:     `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20.38 3.4a1.6 1.6 0 0 0-2.29.08l-2.25 2.34A7.5 7.5 0 1 0 9.25 18.88l-2.3 2.4a1.6 1.6 0 0 0 2.29 1.08l11-11.5a1.6 1.6 0 0 0 .14-2.16z"/><path d="M15.5 8.5 11 13"/></svg>`,
        accessories:  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v2"/><path d="M12 19v2"/><path d="M3 12h2"/><path d="M19 12h2"/></svg>`,
        documents:    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>`,
        keys:         `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/><path d="M12 10.5 8.5 14"/></svg>`,
        other:        `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="none"/></svg>`
    };
    return icons[cat] || icons.other;
}

// ----- Format date for display (Today, Yesterday, X days ago, or short date) -----
function formatDateSimple(dateStr) {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ----- Core rendering: filter items based on search & type, then generate HTML -----
function renderItems() {
    const container  = document.getElementById('items-list');
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();

    let filtered = items.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchTerm) ||
            item.location.toLowerCase().includes(searchTerm) ||
            (item.description && item.description.toLowerCase().includes(searchTerm)) ||
            item.category.toLowerCase().includes(searchTerm);
        const matchesType = currentFilter === 'all' || item.type === currentFilter;
        return matchesSearch && matchesType;
    });

    filtered.sort((a, b) => b.timestamp - a.timestamp);

    if (filtered.length === 0) {
        container.innerHTML = '';
        document.getElementById('empty-state').classList.remove('hidden');
        return;
    }
    document.getElementById('empty-state').classList.add('hidden');

    container.innerHTML = filtered.map(item => `
        <div class="item-card bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div class="flex gap-3">
                <div class="icon-placeholder">
                    ${getCategoryIconSvg(item.category)}
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start flex-wrap gap-1">
                        <div>
                            <h3 class="font-bold text-gray-800 pr-2">${escapeHtml(item.name)}</h3>
                            <p class="text-xs text-gray-500 mt-0.5 flex items-center gap-1 flex-wrap">
                                <span>📍 ${escapeHtml(item.location)}</span>
                                <span class="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>📅 ${formatDateSimple(item.date)}</span>
                            </p>
                        </div>
                        <span class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${item.type === 'lost' ? 'status-lost' : 'status-found'}">${item.type === 'lost' ? 'LOST' : 'FOUND'}</span>
                    </div>
                    ${item.description ? `<p class="text-sm text-gray-600 mt-2 leading-relaxed">${escapeHtml(item.description)}</p>` : ''}
                    <div class="mt-3 pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                        <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full capitalize flex items-center gap-1">
                            <span>🏷️</span> ${item.category}
                        </span>
                        <div class="flex items-center gap-1.5 text-xs bg-indigo-50/70 px-3 py-1.5 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-indigo-600"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            <span class="font-mono text-gray-800 font-medium text-xs break-all">${escapeHtml(item.contact)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function filterItems() { renderItems(); }

function filterByType(type) {
    currentFilter = type;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === type) {
            btn.classList.remove('bg-white', 'text-gray-600', 'border', 'border-gray-200');
            btn.classList.add('bg-gray-800', 'text-white');
        } else {
            btn.classList.add('bg-white', 'text-gray-600', 'border', 'border-gray-200');
            btn.classList.remove('bg-gray-800', 'text-white');
        }
    });
    renderItems();
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').innerHTML = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 2600);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
        if (m === '&')  return '&amp;';
        if (m === '<')  return '&lt;';
        if (m === '>')  return '&gt;';
        if (m === '"')  return '&quot;';
        if (m === "'")  return '&#39;';
        return m;
    });
}
