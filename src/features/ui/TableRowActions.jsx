import { TableActionsDropdown } from './TableActionsDropdown';
import { TableRowViewButton } from './TableRowViewButton';

/**
 * @param {{
 *   onView?: () => void,
 *   showView?: boolean,
 *   actions?: Array<{
 *     label: string,
 *     icon?: import('@tabler/icons-react').Icon,
 *     onClick: () => void,
 *     show?: boolean,
 *     danger?: boolean,
 *   }>,
 * }} props
 */
export function TableRowActions({ onView, showView = true, actions = [] }) {
    const visibleActions = actions.filter((action) => action.show !== false);
    const canView = Boolean(onView) && showView;

    if (!canView && visibleActions.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center justify-end gap-1">
            {canView && <TableRowViewButton onClick={onView} />}
            {visibleActions.length > 0 && <TableActionsDropdown actions={actions} />}
        </div>
    );
}
