export function formatEntityAddressLine(row) {
    if (!row) {
        return '—';
    }

    const city = row.city?.name ?? '';
    const state = row.city?.state?.name ?? row.city?.state_name ?? '';
    const parts = [
        row.street,
        row.external_number,
        row.internal_number,
        row.suburb,
        city,
        state,
    ].filter(Boolean);

    return parts.join(', ') || '—';
}
