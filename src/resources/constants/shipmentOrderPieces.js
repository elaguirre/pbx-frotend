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
            return { style: 'success', text: 'Entregado' };
        case 'returned':
            return { style: 'warning', text: 'Devuelto' };
        case 'pending':
        default:
            return { style: 'slate', text: 'Pendiente' };
    }
}
