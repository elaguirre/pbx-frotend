import { formatQuantity, getNestedValue } from '@resources/helpers';

function getColumnValue(column, row) {
    const usesQuantityFormat =
        column.format === 'quantity' || column.column === 'quantity';

    if (typeof column.column === 'function') {
        const value = column.column(row);

        return usesQuantityFormat ? formatQuantity(value) : value;
    }

    const value = getNestedValue(row, column.column);

    return usesQuantityFormat ? formatQuantity(value) : value;
}

export function TBody({ columns, data }) {
    if (!data?.length) {
        return (
            <tbody>
                <tr>
                    <td colSpan={columns?.length || 1} className="px-3 py-8 text-center text-sm text-slate-500">
                        Sin registros
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody className="divide-y divide-slate-100">
            {data.map((row, index) => (
                <tr key={row.id ?? index} className="hover:bg-slate-50 bg-opacity-50 transition-all">
                    {columns
                        ?.filter((column) => column.show !== false)
                        ?.map((column, columnIndex) => (
                            <td key={columnIndex} className="px-3 py-3 text-sm text-slate-700" align={column.align || 'left'}>
                                {getColumnValue(column, row)}
                            </td>
                        ))}
                </tr>
            ))}
        </tbody>
    );
}
