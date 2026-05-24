import {
    IconAlertTriangle,
    IconBan,
    IconCircleCheck,
    IconCircleX,
    IconInfoCircle,
} from '@tabler/icons-react';

export const MANUFACTURING_FOLLOW_UP_RESULTS = [
    {
        value: 'completed_pieces',
        label: 'Piezas completadas',
        style: 'bg-green-50 text-green-700',
        icon: IconCircleCheck,
        requiresQuantity: true,
        requiresDetails: false,
    },
    {
        value: 'canceled_pieces',
        label: 'Piezas canceladas',
        style: 'bg-red-50 text-red-700',
        icon: IconCircleX,
        requiresQuantity: true,
        requiresDetails: false,
    },
    {
        value: 'blocking',
        label: 'Bloqueo',
        style: 'bg-red-100 text-red-800',
        icon: IconBan,
        requiresQuantity: false,
        requiresDetails: true,
    },
    {
        value: 'warning',
        label: 'Advertencia',
        style: 'bg-amber-50 text-amber-700',
        icon: IconAlertTriangle,
        requiresQuantity: false,
        requiresDetails: true,
    },
    {
        value: 'info',
        label: 'Informativo',
        style: 'bg-blue-50 text-blue-700',
        icon: IconInfoCircle,
        requiresQuantity: false,
        requiresDetails: true,
    },
];

export const MANUFACTURING_FOLLOW_UP_RESULT_OPTIONS = MANUFACTURING_FOLLOW_UP_RESULTS.map(
    ({ value, label }) => ({ value, label }),
);

export function resolveManufacturingFollowUpResult(result) {
    const key = typeof result === 'object' ? result?.value ?? result : result;

    return MANUFACTURING_FOLLOW_UP_RESULTS.find((item) => item.value === key);
}

export function getManufacturingFollowUpResultBadgeProps(result) {
    const config = resolveManufacturingFollowUpResult(result);

    return {
        text: config?.label ?? (result != null ? String(result) : '—'),
        style: config?.style ?? 'bg-slate-100 text-slate-600',
        icon: config?.icon ?? null,
    };
}

export function followUpRequiresQuantity(result) {
    return Boolean(resolveManufacturingFollowUpResult(result)?.requiresQuantity);
}

export function followUpRequiresDetails(result) {
    return Boolean(resolveManufacturingFollowUpResult(result)?.requiresDetails);
}
