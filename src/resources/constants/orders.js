import {
    IconCircleCheck,
    IconPackage,
    IconTruck,
    IconCreditCard,
    IconPlayerPlay,
} from '@tabler/icons-react';

export const ORDER_STATUSES = [
    {
        value: 0,
        label: 'Iniciado',
        style: 'warning',
        icon: IconPlayerPlay,
    },
    {
        value: 1,
        label: 'En proceso',
        style: 'primary',
        icon: IconPackage,
    },
    {
        value: 2,
        label: 'Completado',
        style: 'violet',
        icon: IconCircleCheck,
    },
    {
        value: 3,
        label: 'Enviado',
        style: 'sky',
        icon: IconTruck,
    },
    {
        value: 4,
        label: 'Entregado',
        style: 'success',
        icon: IconCircleCheck,
    },
    {
        value: 5,
        label: 'Pagado',
        style: 'success',
        icon: IconCreditCard,
    },
];

export function resolveOrderStatus(value) {
    const status = typeof value === 'object' ? value?.value ?? value : value;

    return ORDER_STATUSES.find((item) => Number(item.value) === Number(status));
}

export function getOrderStatusLabel(value) {
    return resolveOrderStatus(value)?.label ?? '—';
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

    return `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-${name}-50 text-${name}-700`;
}
