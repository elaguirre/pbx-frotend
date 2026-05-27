import { Fragment } from 'react';

/**
 * Recuadro de contexto para modales de alta/edición de registros asociados.
 *
 * @param {{
 *   title: React.ReactNode,
 *   data?: Record<string, React.ReactNode>,
 * }} props
 */
export function ParentRecordFormHeader({ title, data = {} }) {
    const entries = Object.entries(data).filter(([, value]) => value != null && value !== '');

    return (
        <div className="rounded-lg border border-primary-700 border-opacity-30 bg-primary-50 px-3 py-2 text-primary-700">
            <p className="text-sm font-semibold text-primary-900">{title}</p>
            {entries.length > 0 && (
                <dl className="mt-1 grid grid-cols-[auto,1fr] gap-x-3 gap-y-0.5 text-xs">
                    {entries.map(([label, value]) => (
                        <Fragment key={label}>
                            <dt className="font-medium text-primary-700">{label}:</dt>
                            <dd className="min-w-0 break-words text-primary-700">{value}</dd>
                        </Fragment>
                    ))}
                </dl>
            )}
        </div>
    );
}
