import { TableActionsCell } from './TableActionsCell';

/**
 * Columna de acciones con botón ver (izquierda) y menú (derecha).
 * El botón ver puede definirse en {@link Table} con `onRowView` y `showRowView`.
 *
 * @param {{
 *   onView?: (row: object) => void,
 *   showView?: boolean | ((row: object) => boolean),
 *   actions?: Array | ((row: object) => Array). Con array estático, onClick recibe la fila: (row) => ...
 *   title?: string,
 * }} options
 */
export function tableActionsColumn({ onView, showView, actions = [], title = 'Acciones' }) {
    return {
        title,
        align: 'right',
        column: (row) => (
            <TableActionsCell row={row} onView={onView} showView={showView} actions={actions} />
        ),
    };
}
