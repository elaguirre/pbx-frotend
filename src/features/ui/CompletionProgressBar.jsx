import { Badge } from './Badge';

function formatPercentLabel(raw) {
    const percent = Math.min(100, Math.max(0, Number(raw) || 0));

    if (Number.isInteger(percent) || percent % 1 === 0) {
        return `${Math.round(percent)}%`;
    }

    return `${percent}%`;
}

function progressToBadgeStyle(progress) {
    const textClass = progress?.text_class ?? '';

    if (textClass.includes('green')) {
        return 'success';
    }

    if (textClass.includes('red')) {
        return 'danger';
    }

    if (textClass.includes('amber')) {
        return 'warning';
    }

    return 'slate';
}

/**
 * Avance de orden de producción como Badge (color según API, texto = porcentaje).
 *
 * @param {{ percent?: number, progress?: { percent: number, text_class?: string } }} props
 */
export function CompletionProgressBar({ percent: percentProp, progress }) {
    const raw = progress?.percent ?? percentProp;

    if (raw == null || raw === '') {
        return <span className="text-sm text-slate-400">—</span>;
    }

    return (
        <Badge
            style={progressToBadgeStyle(progress)}
            text={formatPercentLabel(raw)}
        />
    );
}
