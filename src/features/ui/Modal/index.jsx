import { IconX } from '@tabler/icons-react';
import classNames from 'classnames';
import { Icon } from '../Icon';

const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
};

export function Modal({
    opened = true,
    onClose,
    canHideModal = true,
    size = 'md',
    zIndex = 100,
    title,
    children,
}) {
    if (!opened) {
        return null;
    }

    function handleClose() {
        if (canHideModal && onClose) {
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex }}>
            <button
                type="button"
                className="absolute inset-0 bg-slate-900/50"
                aria-label="Cerrar modal"
                onClick={handleClose}
            />

            <div
                role="dialog"
                aria-modal="true"
                className={classNames(
                    'relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-xl bg-white shadow-xl',
                    sizes[size] || sizes.md
                )}
            >
                {title && (
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                        {canHideModal && (
                            <button
                                type="button"
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                onClick={handleClose}
                                aria-label="Cerrar"
                            >
                                <Icon icon={IconX} size="md" />
                            </button>
                        )}
                    </div>
                )}

                <div className="overflow-y-auto px-5 py-4">{children}</div>
            </div>
        </div>
    );
}
