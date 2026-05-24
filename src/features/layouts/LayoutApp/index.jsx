import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useAuth, useGlobalModals } from '@resources/contexts';
import { useConfig } from '@resources/contexts';
import { formatMoney, getOrderTotal } from '@resources/helpers';
import { Button, Icon } from '@features/ui';
import { getVisibleMenuGroups } from '@resources/menu';
import { useAppStore } from '@resources/store';
import { CartModal } from '@pages/Orders/CartModal';
import { IconShoppingCart, IconUser } from '@tabler/icons-react';

export function LayoutApp() {
    const navigate = useNavigate();
    const { user, userCan } = useAuth();
    const { getConfig } = useConfig();
    const { showModal } = useGlobalModals();
    const currentOrder = useAppStore((state) => state.currentOrder);
    const fetchCurrentOrder = useAppStore((state) => state.fetchCurrentOrder);

    useEffect(() => {
        if (userCan('orders.view')) {
            fetchCurrentOrder();
        }
    }, []);

    const menuGroups = getVisibleMenuGroups(userCan);
    const orderConcepts = currentOrder?.concepts ?? [];
    const orderConceptCount = orderConcepts.length;
    const orderTotal = getOrderTotal(orderConcepts);

    return (
        <div className="flex min-h-full">
            <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
                <div className="border-b border-slate-200 p-4">
                    <p className="text-lg font-semibold">{getConfig('app.title', import.meta.env.VITE_APP_TITLE)}</p>
                    <p className="text-xs text-slate-500">{user?.full_name}</p>
                </div>
                <nav className="flex flex-col gap-1 p-3">
                    {menuGroups.map((group, groupIndex) => (
                        <div
                            key={group.id}
                            className={classNames(
                                groupIndex > 0 ? 'mt-4 border-t border-slate-200 pt-4' : undefined,
                            )}
                        >
                            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {group.label}
                            </p>
                            <div className="flex flex-col gap-1">
                                {group.items.map((item) => (
                                    <NavLink
                                        key={item.link}
                                        to={item.link}
                                        className={({ isActive }) =>
                                            classNames(
                                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                                                isActive
                                                    ? 'bg-primary-50 font-medium text-primary-700'
                                                    : 'text-slate-700 hover:bg-slate-100',
                                            )
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon
                                                    icon={item.icon}
                                                    size="md"
                                                    className={
                                                        isActive ? 'text-primary-600' : 'text-slate-400'
                                                    }
                                                />
                                                <span>{item.label}</span>
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex items-center justify-end gap-3 border-b border-slate-200 bg-white px-6 py-3">
                    {userCan('orders.view') && (
                        <Button
                            variant="secondary"
                            onClick={() => showModal(<CartModal />, {})}
                            icon={IconShoppingCart}
                        >
                            Pedido
                            {orderConceptCount > 0 && (
                                <span className="ml-1 rounded-full bg-primary-600 px-2 py-0.5 text-xs text-white">
                                    {orderConceptCount} - {formatMoney(orderTotal)}
                                </span>
                            )}
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/profile')}
                        icon={IconUser}
                    />
                </header>
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
