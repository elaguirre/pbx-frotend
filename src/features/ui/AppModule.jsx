import { IconPencil } from '@tabler/icons-react';
import { Button } from './Button';
import { Icon } from './Icon';

export function AppModule({
    title,
    description = '',
    icon = null,
    children,
    toolbar = null,
    onEdit = null,
    editLabel = 'Editar',
}) {
    const showToolbar = Boolean(toolbar || onEdit);

    return (
        <div className="space-y-6">
            {(title || showToolbar) && (
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="flex min-w-0 items-start gap-3">
                        {icon && (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                                <Icon icon={icon} size="lg" className="text-primary-600" />
                            </span>
                        )}
                        <div className="min-w-0 pt-1">
                            {title && (
                                <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
                            )}
                            {description && (
                                <p className="mt-1 text-sm text-slate-600">{description}</p>
                            )}
                        </div>
                    </div>
                    {showToolbar && (
                        <div className="flex flex-wrap items-center gap-2">
                            {onEdit && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    icon={IconPencil}
                                    onClick={onEdit}
                                    aria-label={editLabel}
                                    title={editLabel}
                                    className="px-2.5"
                                />
                            )}
                            {toolbar}
                        </div>
                    )}
                </div>
            )}
            {children}
        </div>
    );
}
