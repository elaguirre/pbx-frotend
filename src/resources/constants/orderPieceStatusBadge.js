export function getOrderPieceStatusBadgeProps(status) {
    const name =
        typeof status === 'string'
            ? status
            : status?.name ?? status?.label ?? null;

    return {
        text: name?.trim() || '—',
        style: status?.badge_style ?? status?.badgeStyle ?? 'slate',
        icon: status?.icon ?? null,
    };
}
