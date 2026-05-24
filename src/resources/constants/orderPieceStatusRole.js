export const ORDER_PIECE_STATUS_ROLES = [
    { value: '', label: 'Sin rol' },
    { value: 'initial', label: 'Inicial (al cerrar pedido)' },
    { value: 'shippable', label: 'Embarcable' },
];

export function getOrderPieceStatusRoleLabel(role) {
    if (!role) {
        return '—';
    }

    return ORDER_PIECE_STATUS_ROLES.find((entry) => entry.value === role)?.label ?? role;
}
