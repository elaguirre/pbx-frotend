/**
 * Barra de avance. El porcentaje es obligatorio; colores del relleno y fondo vienen del API (progress).
 *
 * @param {{ percent?: number, progress?: { percent: number, bar_class?: string, track_class?: string } }} props
 */
export function CompletionProgressBar({ percent: percentProp, progress }) {
    const raw = progress?.percent ?? percentProp;

    if (raw == null || raw === '') {
        return <span className="text-sm text-slate-400">—</span>;
    }

    const percent = Math.min(100, Math.max(0, Number(raw) || 0));
    const barClass = progress?.bar_class ?? 'bg-slate-400';
    const trackClass = progress?.track_class ?? 'bg-slate-100';
    const label =
        Number.isInteger(percent) || percent % 1 === 0
            ? String(Math.round(percent))
            : String(percent);

    const getColor = (progress) => {
        if (progress < 20) return 'bg-red-500';
        if (progress < 40) return 'bg-orange-500';
        if (progress < 60) return 'bg-yellow-500';
        if (progress < 80) return 'bg-green-500';
        return 'bg-blue-500';
    };

    return (
        <div className={`bg-slate-100 relative h-4 min-w-[2rem] max-w-[11rem] rounded-full ${trackClass}`}>
            <div
                className={`absolute inset-y-0 left-0 rounded-full ${barClass} transition-[width] duration-300 ${getColor(percent)}`}
                style={{ width: `${percent}%` }}
            />
            <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-xs font-bold tabular-nums text-black/50">
                {label}%
            </span>
        </div>
    );
}
