import classNames from 'classnames';

function THeadColumn({ column, controls = {} }) {
    const { isSortable = false, align = 'left', width = null, title, column: columnKey } = column;
    const sortableColumn = column.sortableColumn || columnKey;
    const isSortedColumn = controls?.sort?.column === sortableColumn;
    const columnTitle = title || (typeof columnKey === 'string' ? columnKey : '');

    function handleClick() {
        if (isSortable) {
            controls.sort.setColumn(sortableColumn);
        }
    }

    return (
        <th
            style={{ width, textAlign: align }}
            className={classNames(
                'px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 border-b border-slate-200',
                isSortable && 'cursor-pointer select-none hover:bg-slate-100'
            )}
            onClick={handleClick}
        >
            {columnTitle}
            {isSortedColumn && <span className="ml-1">{controls.sort.asc ? '↑' : '↓'}</span>}
        </th>
    );
}

export function THead({ columns, controls }) {
    return (
        <thead>
            <tr>
                {columns
                    ?.filter((column) => column.show !== false)
                    ?.map((column, index) => (
                        <THeadColumn key={index} column={column} controls={controls} />
                    ))}
            </tr>
        </thead>
    );
}
