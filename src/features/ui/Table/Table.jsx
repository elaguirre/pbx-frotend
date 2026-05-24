import classNames from 'classnames';
import { Pagination } from '@features/ui/Pagination';
import { TableProvider } from './TableContext';
import { TBody } from './TBody';
import { THead } from './THead';

export function Table({
    name,
    controls,
    columns,
    optionsPerPage = [15, 20, 50, 100],
    data,
    showFooter = true,
    showHeader = true,
    showSearcher = true,
    headerRight = null,
    loading = false,
    isDatatable = true,
    onRowView,
    showRowView = true,
}) {
    const tableData = isDatatable ? data?.data || [] : data || [];
    const pagination = isDatatable ? data : null;
    const hasRows = tableData.length > 0;

    function handleChangeLimit(event) {
        controls?.setLimit?.(Number(event.target.value));
    }

    function handleChangeSearch(event) {
        controls?.setQuery?.(event.target.value);
    }

    return (
        <TableProvider onRowView={onRowView} showRowView={showRowView}>
        <div className={classNames('relative rounded-xl border border-slate-200 bg-white', loading && 'opacity-60')}>
            {isDatatable && showHeader && (showSearcher || headerRight) && (
                <div
                    className={classNames(
                        'flex flex-wrap items-center justify-between gap-3 px-4 py-3',
                        hasRows && 'border-b border-slate-200',
                    )}
                >
                    {showSearcher ? (
                        <input
                            type="search"
                            className="form-input max-w-xs"
                            placeholder="Buscar..."
                            onChange={handleChangeSearch}
                        />
                    ) : (
                        <span />
                    )}
                    {headerRight && <div className="flex shrink-0 items-center gap-2">{headerRight}</div>}
                </div>
            )}

            {hasRows && (
                <div>
                    <table id={name} className="min-w-full">
                        <THead columns={columns} controls={controls} />
                        <TBody columns={columns} data={tableData} />
                    </table>
                </div>
            )}

            {isDatatable && showFooter && pagination && hasRows && (
                <div className="flex flex-col gap-4 border-t border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>Mostrar</span>
                        <select className="form-input w-20 py-1" value={pagination.per_page} onChange={handleChangeLimit}>
                            {optionsPerPage.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <span>por página</span>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <span className="text-sm text-slate-600">
                            {pagination.from || 0}-{pagination.to || 0} de {pagination.total || 0}
                        </span>
                        <Pagination
                            currentPage={pagination.current_page}
                            perPage={pagination.per_page}
                            total={pagination.total}
                            onChange={controls.setPage}
                        />
                    </div>
                </div>
            )}
        </div>
        </TableProvider>
    );
}
