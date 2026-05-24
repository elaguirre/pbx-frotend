export function getShipmentRouteStatusBadgeProps(value) {
    const statusValue = value?.value ?? value;

    switch (statusValue) {
        case 'complete':
            return { style: 'bg-emerald-100 text-emerald-800', text: 'Completo' };
        case 'pending':
        default:
            return { style: 'bg-slate-100 text-slate-700', text: 'Pendiente' };
    }
}
