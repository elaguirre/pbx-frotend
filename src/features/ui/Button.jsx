import classNames from 'classnames';
import { Icon } from './Icon';

export function Button({
    type = 'button',
    variant = 'primary',
    loading = false,
    icon,
    iconPosition = 'left',
    className,
    children,
    ...props
}) {
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700',
        secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
        danger: 'bg-red-600 text-white hover:bg-red-700',
    };

    const iconElement =
        icon && !loading ? <Icon icon={icon} size="sm" className="text-current" /> : null;

    return (
        <button
            type={type}
            disabled={loading || props.disabled}
            className={classNames(
                'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
                variants[variant],
                className,
            )}
            {...props}
        >
            {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {!loading && iconPosition === 'left' && iconElement}
            {children}
            {!loading && iconPosition === 'right' && iconElement}
        </button>
    );
}
