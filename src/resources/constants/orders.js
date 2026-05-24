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
        style: 'bg-amber-50 text-amber-700',
        icon: IconPlayerPlay,
    },
    {
        value: 1,
        label: 'En proceso',
        style: 'bg-blue-50 text-blue-700',
        icon: IconPackage,
    },
    {
        value: 2,
        label: 'Completado',
        style: 'bg-violet-50 text-violet-700',
        icon: IconCircleCheck,
    },
    {
        value: 3,
        label: 'Enviado',
        style: 'bg-sky-50 text-sky-700',
        icon: IconTruck,
    },
    {
        value: 4,
        label: 'Entregado',
        style: 'bg-green-50 text-green-700',
        icon: IconCircleCheck,
    },
    {
        value: 5,
        label: 'Pagado',
        style: 'bg-emerald-50 text-emerald-700',
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
        style: config?.style ?? 'bg-slate-100 text-slate-600',
        icon: config?.icon ?? null,
    };
}

/** @deprecated Usar getOrderStatusBadgeProps con Badge */
export function getOrderStatusBadgeClassName(value) {
    const { style } = getOrderStatusBadgeProps(value);

    return `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${style}`;
}
