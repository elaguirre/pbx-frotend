import {
    IconPackage,
    IconPuzzle,
    IconStack2,
    IconTruck,
    IconTruckDelivery,
    IconBuildingStore,
    IconBuildingFactory,
    IconStar,
    IconSettings,
    IconCheckupList,
    IconUser,
} from '@tabler/icons-react';
import { Products } from '@pages/Products';
import { Pieces } from '@pages/Pieces';
import { Materials } from '@pages/Materials';
import { Suppliers } from '@pages/Suppliers';
import { Manufacturers } from '@pages/Manufacturers';
import { Carriers } from '@pages/Carriers';
import { Shipments } from '@pages/Shipments';
import { Clients } from '@pages/Clients';
import { Orders } from '@pages/Orders';
import { Settings } from '@pages/Settings';

/** Orden y etiquetas de los grupos del menú lateral (`group` en cada ítem). */
export const menuGroups = [
    { id: 'operations', label: 'Operación' },
    { id: 'content', label: 'Contenido' },
    { id: 'system', label: 'Sistema' },
];

export const menuOptions = [
    // Operaciones
    {
        label: 'Pedidos',
        link: '/orders',
        icon: IconCheckupList,
        group: 'operations',
        permission: 'orders.view',
        element: <Orders />,
    },
    {
        label: 'Clientes',
        link: '/clients',
        icon: IconStar,
        group: 'operations',
        permission: 'clients.view',
        element: <Clients />,
    },
    {
        label: 'Maquiladores',
        link: '/manufacturers',
        icon: IconBuildingFactory,
        group: 'operations',
        permission: 'manufacturers.view',
        element: <Manufacturers />,
    },
    {
        label: 'Transportistas',
        link: '/carriers',
        icon: IconTruck,
        group: 'operations',
        permission: 'carriers.view',
        element: <Carriers />,
    },
    {
        label: 'Embarques',
        link: '/shipments',
        icon: IconTruckDelivery,
        group: 'operations',
        permission: 'shipments.view',
        element: <Shipments />,
    },

    // Contenido
    {
        label: 'Productos',
        link: '/products',
        icon: IconPackage,
        group: 'content',
        permission: 'products.view',
        element: <Products />,
    },
    {
        label: 'Piezas',
        link: '/pieces',
        icon: IconPuzzle,
        group: 'content',
        permission: 'pieces.view',
        element: <Pieces />,
    },
    {
        label: 'Materiales',
        link: '/materials',
        icon: IconStack2,
        group: 'content',
        permission: 'materials.view',
        element: <Materials />,
    },
    {
        label: 'Proveedores',
        link: '/suppliers',
        icon: IconBuildingStore,
        group: 'content',
        permission: 'suppliers.view',
        element: <Suppliers />,
    },
    
    // Sistema
    {
        label: 'Configuración',
        link: '/settings',
        icon: IconSettings,
        group: 'system',
        isVisible: (userCan) =>
            userCan('entities.view') ||
            userCan('order_piece_statuses.view') ||
            userCan('users.view'),
        element: <Settings />,
    },
];

export function isMenuItemVisible(item, userCan) {
    if (typeof item.isVisible === 'function') {
        return item.isVisible(userCan);
    }

    return !item.permission || userCan(item.permission);
}

export function getVisibleMenuGroups(userCan) {
    const visibleItems = menuOptions.filter((item) => isMenuItemVisible(item, userCan));

    return menuGroups
        .map((group) => ({
            ...group,
            items: visibleItems.filter((item) => item.group === group.id),
        }))
        .filter((group) => group.items.length > 0);
}

export function getDefaultAppPath(userCan) {
    return getVisibleMenuGroups(userCan)[0]?.items[0]?.link ?? '/settings';
}

/** Rutas de detalle sin entrada directa en el menú lateral. */
const detailSectionIcons = {
    'production-orders': IconBuildingFactory,
    'manufacturer-order-pieces': IconBuildingFactory,
    'material-suppliers': IconBuildingStore,
    entities: IconSettings,
    profile: IconUser,
    'order-concepts': IconCheckupList,
};

export function getMenuIconByLink(link) {
    return menuOptions.find((entry) => entry.link === link)?.icon ?? null;
}

export function getMenuIconForPath(pathname) {
    const normalized = pathname.replace(/\/$/, '') || '/';

    const menuItem = [...menuOptions]
        .sort((a, b) => b.link.length - a.link.length)
        .find(
            (entry) =>
                normalized === entry.link || normalized.startsWith(`${entry.link}/`),
        );

    if (menuItem?.icon) {
        return menuItem.icon;
    }

    const segment = normalized.split('/').filter(Boolean)[0];

    return detailSectionIcons[segment] ?? null;
}
