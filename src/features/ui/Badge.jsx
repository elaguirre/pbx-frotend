import { Icon } from './Icon';

/**
 * @param {{
 *   style?: string,
 *   text?: React.ReactNode,
 *   icon?: import('@tabler/icons-react').Icon,
 *   className?: string,
 * }} props
 */
export function Badge({ style = 'slate', text, icon, className }) {
    return (
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium bg-${style}-50 text-${style}-700 ${className}`}>
            {icon && <Icon icon={icon} size="sm" className="text-current" />}
            {text}
        </span>
    );
}
