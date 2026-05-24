import classNames from 'classnames';
import { usePagination } from '@resources/hooks';

function PageItem({ active = false, disabled = false, separator = false, onClick, children }) {
    function handleClick(event) {
        event.preventDefault();

        if (!disabled && onClick) {
            onClick();
        }
    }

    if (separator) {
        return <span className="px-2 text-slate-400">…</span>;
    }

    return (
        <button
            type="button"
            className={classNames(
                'min-w-8 rounded-lg border px-2 py-1 text-sm transition',
                active
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                disabled && 'cursor-not-allowed opacity-50'
            )}
            disabled={disabled}
            onClick={handleClick}
        >
            {children}
        </button>
    );
}

export function Pagination({ currentPage, siblingCount = 3, perPage, total, onChange }) {
    const { totalPages, middleRange, leftDots, rightDots } = usePagination({
        currentPage,
        siblingCount,
        perPage,
        totalRecords: total,
    });

    function handleSelectPage(page) {
        if (onChange) {
            onChange(Math.min(Math.max(page, 1), totalPages));
        }
    }

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-1">
            <PageItem disabled={currentPage === 1} onClick={() => handleSelectPage(currentPage - 1)}>
                ‹
            </PageItem>

            <PageItem active={currentPage === 1} onClick={() => handleSelectPage(1)}>
                1
            </PageItem>

            {leftDots && <PageItem separator />}
            {middleRange.map((page) => (
                <PageItem key={page} active={currentPage === page} onClick={() => handleSelectPage(page)}>
                    {page}
                </PageItem>
            ))}
            {rightDots && <PageItem separator />}

            {totalPages > 1 && (
                <PageItem active={currentPage === totalPages} onClick={() => handleSelectPage(totalPages)}>
                    {totalPages}
                </PageItem>
            )}

            <PageItem
                disabled={currentPage === totalPages}
                onClick={() => handleSelectPage(currentPage + 1)}
            >
                ›
            </PageItem>
        </div>
    );
}
