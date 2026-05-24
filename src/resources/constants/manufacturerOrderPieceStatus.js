import { IconCircleCheck, IconClock, IconTool } from '@tabler/icons-react';

export const MANUFACTURER_ORDER_PIECE_STATUSES = [
    {
        value: 'pending',
        label: 'Pendiente',
        style: 'warning',
        icon: IconClock,
    },
    {
        value: 'in_production',
        label: 'En fabricación',
        style: 'primary',
        icon: IconTool,
    },
    {
        value: 'completed',
        label: 'Completado',
        style: 'success',
        icon: IconCircleCheck,
    },
];

export const MANUFACTURER_ORDER_PIECE_STATUS_OPTIONS = MANUFACTURER_ORDER_PIECE_STATUSES.map(
    ({ value, label }) => ({ value, label }),
);

export function resolveManufacturerOrderPieceStatus(status) {
    const key = typeof status === 'object' ? status?.value ?? status : status;

    return MANUFACTURER_ORDER_PIECE_STATUSES.find((item) => item.value === key);
}

export function getManufacturerOrderPieceStatusLabel(status) {
    return resolveManufacturerOrderPieceStatus(status)?.label ?? status ?? '—';
}

export function getManufacturerOrderPieceStatusBadgeProps(status) {
    const config = resolveManufacturerOrderPieceStatus(status);

    return {
        text: config?.label ?? (status != null ? String(status) : '—'),
        style: config?.style ?? 'slate',
        icon: config?.icon ?? null,
    };
}

/** @deprecated Usar getManufacturerOrderPieceStatusBadgeProps con Badge */
export function getManufacturerOrderPieceStatusBadgeClassName(status) {
    const { style } = getManufacturerOrderPieceStatusBadgeProps(status);
    const name = style === 'slate' || !style ? 'slate' : style;

    if (name === 'slate') {
        return 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-slate-50 text-slate-700';
    }

    return `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-${name}-50 text-${name}-700`;
}
