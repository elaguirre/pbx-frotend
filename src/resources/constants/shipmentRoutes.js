export function getShipmentRouteStatusBadgeProps(value) {
    const statusValue = value?.value ?? value;

    switch (statusValue) {
        case 'complete':
            return { style: 'success', text: 'Completo' };
        case 'pending':
        default:
            return { style: 'slate', text: 'Pendiente' };
    }
}
