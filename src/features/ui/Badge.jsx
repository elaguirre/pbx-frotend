import classNames from 'classnames';
import { Icon } from './Icon';

const BADGE_BASE = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium';

/**
 * @param {{ style?: string, text?: React.ReactNode, icon?: import('@tabler/icons-react').Icon, className?: string }} props
 */
export function Badge({ style = 'bg-slate-100 text-slate-700', text, icon, className }) {
    if (text == null || text === '') {
        return <span className="text-slate-400">—</span>;
    }

    return (
        <span className={classNames(BADGE_BASE, style, className)}>
            {icon && <Icon icon={icon} size="sm" className="text-current" />}
            {text}
        </span>
    );
}
