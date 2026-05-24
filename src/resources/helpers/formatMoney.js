/**
 * Formatea un valor numérico como moneda con separador de miles y decimales.
 *
 * @param {number|string|null|undefined} value
 * @param {{
 *   locale?: string,
 *   currency?: string,
 *   fallback?: string,
 *   minimumFractionDigits?: number,
 *   maximumFractionDigits?: number,
 * }} [options]
 * @returns {string}
 */
export function formatMoney(value, options = {}) {
    const {
        locale = 'es-MX',
        currency = 'MXN',
        fallback = '—',
        minimumFractionDigits = 2,
        maximumFractionDigits = 2,
        ...intlOptions
    } = options;

    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    const amount = Number(value);

    if (Number.isNaN(amount)) {
        return fallback;
    }

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
        ...intlOptions,
    }).format(amount);
}
