import { useEffect, useRef, useState } from 'react';
import { IconDotsVertical } from '@tabler/icons-react';
import classNames from 'classnames';
import { Icon } from './Icon';

/**
 * @param {{ actions: Array<{ label: string, icon?: import('@tabler/icons-react').Icon, onClick: () => void, show?: boolean, danger?: boolean }> }} props
 */
export function TableActionsDropdown({ actions = [] }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    const visibleActions = actions.filter((action) => action.show !== false);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    if (!visibleActions.length) {
        return null;
    }

    return (
        <div ref={containerRef} className="relative inline-block text-left">
            <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen((current) => !current)}
                aria-expanded={open}
                aria-haspopup="menu"
            >
                <Icon icon={IconDotsVertical} size="sm" className="text-slate-700" />
            </button>

            {open && (
                <div
                    className="absolute right-0 z-30 mt-1 min-w-[10rem] origin-top-right rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
                    role="menu"
                >
                    {visibleActions.map((action) => (
                        <button
                            key={action.label}
                            type="button"
                            role="menuitem"
                            className={classNames(
                                'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50',
                                action.danger ? 'text-red-600' : 'text-slate-700',
                            )}
                            onClick={() => {
                                action.onClick();
                                setOpen(false);
                            }}
                        >
                            {action.icon && (
                                <Icon
                                    icon={action.icon}
                                    size="sm"
                                    className={action.danger ? 'text-red-500' : 'text-slate-400'}
                                />
                            )}
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
