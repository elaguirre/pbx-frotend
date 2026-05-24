import { createContext, useContext } from 'react';

const TableContext = createContext(null);

export function TableProvider({ onRowView, showRowView, children }) {
    return (
        <TableContext.Provider value={{ onRowView, showRowView }}>
            {children}
        </TableContext.Provider>
    );
}

export function useTableContext() {
    return useContext(TableContext) ?? {};
}
