const containerId = 'pbx-toast-container';

function ensureContainer() {
    let container = document.getElementById(containerId);

    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2';
        document.body.appendChild(container);
    }

    return container;
}

function showToast(message, type = 'info') {
    const colors = {
        success: 'bg-emerald-600',
        error: 'bg-red-600',
        warning: 'bg-amber-500',
        info: 'bg-slate-800',
    };

    const toast = document.createElement('div');
    toast.className = `max-w-sm rounded-lg px-4 py-3 text-sm text-white shadow-lg ${colors[type] || colors.info}`;
    toast.textContent = message;

    ensureContainer().appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
}

export const notify = {
    success: (message) => showToast(message, 'success'),
    error: (message) => showToast(message, 'error'),
    warning: (message) => showToast(message, 'warning'),
    info: (message) => showToast(message, 'info'),
};
