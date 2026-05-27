import {
    IconCircleCheck,
    IconCreditCard,
    IconPackage,
    IconPlayerPlay,
    IconTruck,
    IconX,
} from '@tabler/icons-react';

export const ORDER_STATUS_STARTED = 0;
export const ORDER_STATUS_IN_PROGRESS = 1;
export const ORDER_STATUS_COMPLETED = 2;
export const ORDER_STATUS_SENT = 3;
export const ORDER_STATUS_DELIVERED = 4;
export const ORDER_STATUS_PAID = 5;
export const ORDER_STATUS_CANCELED = 6;

export const ORDER_STATUSES = [
    {
        value: ORDER_STATUS_STARTED,
        label: 'Iniciado',
        style: 'warning',
        icon: IconPlayerPlay,
    },
    {
        value: ORDER_STATUS_IN_PROGRESS,
        label: 'En proceso',
        style: 'primary',
        icon: IconPackage,
    },
    {
        value: ORDER_STATUS_COMPLETED,
        label: 'Completado',
        style: 'violet',
        icon: IconCircleCheck,
    },
    {
        value: ORDER_STATUS_SENT,
        label: 'Enviado',
        style: 'sky',
        icon: IconTruck,
    },
    {
        value: ORDER_STATUS_DELIVERED,
        label: 'Entregado',
        style: 'success',
        icon: IconCircleCheck,
    },
    {
        value: ORDER_STATUS_PAID,
        label: 'Pagado',
        style: 'success',
        icon: IconCreditCard,
    },
    {
        value: ORDER_STATUS_CANCELED,
        label: 'Cancelado',
        style: 'danger',
        icon: IconX,
    },
];

export const ORDER_STATUS_OPTIONS = ORDER_STATUSES.map(({ value, label }) => ({
    value: String(value),
    label,
}));

export function resolveOrderStatus(value) {
    const status = typeof value === 'object' ? value?.value ?? value : value;

    return ORDER_STATUSES.find((item) => Number(item.value) === Number(status));
}

export function getOrderStatusLabel(value) {
    return resolveOrderStatus(value)?.label ?? '—';
}

export function isOrderStatusCanceled(value) {
    return Number(typeof value === 'object' ? value?.value ?? value : value) === ORDER_STATUS_CANCELED;
}

export function getOrderStatusBadgeProps(value) {
    const config = resolveOrderStatus(value);

    return {
        text: config?.label ?? '—',
        style: config?.style ?? 'slate',
        icon: config?.icon ?? null,
    };
}

/** @deprecated Usar getOrderStatusBadgeProps con Badge */
export function getOrderStatusBadgeClassName(value) {
    const { style } = getOrderStatusBadgeProps(value);
    const name = style === 'slate' || !style ? 'slate' : style;

    if (name === 'slate') {
        return 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-slate-50 text-slate-700';
    }

    return `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-${name}-50 text-${name}-700`;
}
