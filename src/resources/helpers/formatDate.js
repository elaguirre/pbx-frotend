import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

const DEFAULT_FORMAT = 'D [de] MMMM [de] YYYY, HH:mm';
const SHORT_FORMAT = 'D [de] MMMM [de] YYYY';

/**
 * Formatea una fecha en español (ej. "19 de mayo de 2026, 14:30").
 *
 * @param {string|Date|number|null|undefined} value
 * @param {{ format?: string, fallback?: string }} [options]
 * @returns {string}
 */
export function formatDate(value, options = {}) {
    const { format = DEFAULT_FORMAT, fallback = '—' } = options;

    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    const date = dayjs(value);

    if (!date.isValid()) {
        return fallback;
    }

    return date.format(format);
}

/**
 * Fecha sin hora (ej. "19 de mayo de 2026").
 */
export function formatDateShort(value, options = {}) {
    return formatDate(value, { format: SHORT_FORMAT, ...options });
}
