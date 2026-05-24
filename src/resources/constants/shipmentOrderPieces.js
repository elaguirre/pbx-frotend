export const SHIPMENT_ORDER_PIECE_STATUSES = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'returned', label: 'Devuelto' },
];

export function getShipmentOrderPieceStatusLabel(value) {
    const statusValue = value?.value ?? value;

    return (
        SHIPMENT_ORDER_PIECE_STATUSES.find((item) => item.value === statusValue)?.label ??
        statusValue ??
        '—'
    );
}

export function getShipmentOrderPieceStatusBadgeProps(value) {
    const statusValue = value?.value ?? value;

    switch (statusValue) {
        case 'delivered':
            return { style: 'bg-emerald-100 text-emerald-800', text: 'Entregado' };
        case 'returned':
            return { style: 'bg-amber-100 text-amber-800', text: 'Devuelto' };
        case 'pending':
        default:
            return { style: 'bg-slate-100 text-slate-700', text: 'Pendiente' };
    }
}
