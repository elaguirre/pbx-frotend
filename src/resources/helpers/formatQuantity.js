/**
 * Redondea a 2 decimales (cantidades, no montos).
 *
 * @param {number|string|null|undefined} value
 * @returns {number|null}
 */
export function roundQuantity(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const num = Number(value);

    if (Number.isNaN(num)) {
        return null;
    }

    return Math.round(num * 100) / 100;
}

/**
 * Formatea cantidades: máximo 2 decimales; sin decimales si el valor es entero.
 *
 * @param {number|string|null|undefined} value
 * @param {{ locale?: string, fallback?: string }} [options]
 * @returns {string}
 */
export function formatQuantity(value, options = {}) {
    const { locale = 'es-MX', fallback = '—' } = options;
    const rounded = roundQuantity(value);

    if (rounded === null) {
        return fallback;
    }

    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(rounded);
}

/**
 * Valor para inputs numéricos de cantidad (sin ceros decimales sobrantes).
 *
 * @param {number|string|null|undefined} value
 * @returns {string}
 */
export function quantityToInputValue(value) {
    const rounded = roundQuantity(value);

    if (rounded === null) {
        return '';
    }

    return String(rounded);
}
