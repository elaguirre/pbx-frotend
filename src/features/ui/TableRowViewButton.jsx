import { IconEye } from '@tabler/icons-react';
import classNames from 'classnames';
import { Icon } from './Icon';

export function TableRowViewButton({ onClick, title = 'Ver detalle', className }) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            onClick={onClick}
            className={classNames(
                'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900',
                className,
            )}
        >
            <Icon icon={IconEye} size="sm" />
        </button>
    );
}
