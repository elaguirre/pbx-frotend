const DEFAULT_STYLE = 'bg-slate-100 text-slate-700';

export function getOrderPieceStatusBadgeProps(status) {
    const name =
        typeof status === 'string'
            ? status
            : status?.name ?? status?.label ?? null;

    return {
        text: name?.trim() || '—',
        style: status?.badge_style ?? status?.badgeStyle ?? DEFAULT_STYLE,
        icon: status?.icon ?? null,
    };
}
