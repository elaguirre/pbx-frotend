import classNames from 'classnames';

const PLACEMENT_CLASSES = {
    top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
    'top-start': 'bottom-full left-0 mb-2',
    'top-end': 'bottom-full right-0 mb-2',
    'bottom-start': 'top-full left-0 mt-2',
    'bottom-end': 'top-full right-0 mt-2',
};

/**
 * Tooltip con contenido arbitrario (ReactNode) al hacer hover o focus en el disparador.
 *
 * @param {{
 *   content: import('react').ReactNode,
 *   children: import('react').ReactNode,
 *   placement?: keyof typeof PLACEMENT_CLASSES,
 *   className?: string,
 *   contentClassName?: string,
 * }} props
 */
export function Tooltip({
    content,
    children,
    placement = 'bottom-end',
    className,
    contentClassName,
}) {
    if (content == null || content === '') {
        return children;
    }

    return (
        <span className={classNames('group/tooltip relative inline-flex items-center', className)}>
            {children}
            <span
                role="tooltip"
                className={classNames(
                    'pointer-events-none absolute z-50 w-max max-w-xs rounded-lg border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 shadow-lg',
                    'invisible opacity-0 transition-opacity duration-150',
                    'group-hover/tooltip:visible group-hover/tooltip:opacity-100',
                    'group-focus-within/tooltip:visible group-focus-within/tooltip:opacity-100',
                    PLACEMENT_CLASSES[placement] ?? PLACEMENT_CLASSES['bottom-end'],
                    contentClassName,
                )}
            >
                {content}
            </span>
        </span>
    );
}
