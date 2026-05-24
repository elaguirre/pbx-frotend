import { formatMoney } from './formatMoney';

/** Costo de catálogo (null si no hay precios de proveedor). */
export function formatCatalogCost(value) {
    if (value == null || value === '') {
        return '—';
    }

    return formatMoney(value);
}
