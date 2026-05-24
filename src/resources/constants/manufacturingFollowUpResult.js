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
        style: 'success',
        icon: IconCircleCheck,
        requiresQuantity: true,
        requiresDetails: false,
    },
    {
        value: 'canceled_pieces',
        label: 'Piezas canceladas',
        style: 'danger',
        icon: IconCircleX,
        requiresQuantity: true,
        requiresDetails: false,
    },
    {
        value: 'blocking',
        label: 'Bloqueo',
        style: 'danger',
        icon: IconBan,
        requiresQuantity: false,
        requiresDetails: true,
    },
    {
        value: 'warning',
        label: 'Advertencia',
        style: 'warning',
        icon: IconAlertTriangle,
        requiresQuantity: false,
        requiresDetails: true,
    },
    {
        value: 'info',
        label: 'Informativo',
        style: 'info',
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
        style: config?.style ?? 'slate',
        icon: config?.icon ?? null,
    };
}

export function followUpRequiresQuantity(result) {
    return Boolean(resolveManufacturingFollowUpResult(result)?.requiresQuantity);
}

export function followUpRequiresDetails(result) {
    return Boolean(resolveManufacturingFollowUpResult(result)?.requiresDetails);
}
