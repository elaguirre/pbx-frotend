import classNames from 'classnames';
import { Icon } from './Icon';

/**
 * @param {{
 *   style?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'slate',
 *   icon?: import('@tabler/icons-react').Icon,
 *   className?: string,
 *   children?: React.ReactNode,
 * }} props
 */
export function Alert({ style = 'info', icon, className, children }) {
    return (
        <div
            className={classNames(
                'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm',
                `bg-${style}-50 text-${style}-700 border-${style}-700 border-opacity-30`,
                className,
            )}
            role="alert"
        >
            {icon && <Icon icon={icon} size="sm" className="mt-0.5 text-current" />}
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}
