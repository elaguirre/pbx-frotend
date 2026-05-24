export function getTenantId() {
    const tenantId = import.meta.env.VITE_APP_TENANT;
    const host = window.location.hostname;

    if (!tenantId) {
        const subdomain = host.split('.')[0];

        return subdomain !== 'localhost' ? subdomain : null;
    }

    return tenantId;
}
