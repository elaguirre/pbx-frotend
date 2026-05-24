import { TableRowActions } from './TableRowActions';
import { useTableContext } from './Table/TableContext';

function resolveRowActions(actions, row) {
    if (typeof actions === 'function') {
        return actions(row);
    }

    return actions.map((action) => ({
        ...action,
        onClick: () => {
            if (action.onClick.length > 0) {
                action.onClick(row);
            } else {
                action.onClick();
            }
        },
    }));
}

/**
 * @param {{
 *   row: object,
 *   onView?: (row: object) => void,
 *   showView?: boolean | ((row: object) => boolean),
 *   actions?: Array | ((row: object) => Array),
 * }} props
 */
export function TableActionsCell({ row, onView, showView, actions = [] }) {
    const { onRowView, showRowView } = useTableContext();
    const resolvedOnView = onView ?? onRowView;
    const resolvedShowView = showView !== undefined ? showView : (showRowView ?? true);
    const visible = typeof resolvedShowView === 'function' ? resolvedShowView(row) : resolvedShowView;
    const actionList = resolveRowActions(actions, row);

    return (
        <TableRowActions
            onView={resolvedOnView && visible ? () => resolvedOnView(row) : undefined}
            showView={visible}
            actions={actionList}
        />
    );
}
