import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LayoutApp } from '@features/layouts';
import { OrderDetail } from '@pages/Orders/Detail';
import { ProductDetail } from '@pages/Products/Detail';
import { PieceDetail } from '@pages/Pieces/Detail';
import { MaterialDetail } from '@pages/Materials/Detail';
import { SupplierDetail } from '@pages/Suppliers/Detail';
import { MaterialSupplierDetail } from '@pages/MaterialSuppliers/Detail';
import { ManufacturerDetail } from '@pages/Manufacturers/Detail';
import { ProductionOrderDetail } from '@pages/ProductionOrders/Detail';
import { ManufacturerOrderPieceDetail } from '@pages/ProductionOrders/ManufacturerOrderPieceDetail';
import { EntityDetail } from '@pages/Entities/Detail';
import { ClientDetail } from '@pages/Clients/Detail';
import { CarrierDetail } from '@pages/Carriers/Detail';
import { ShipmentDetail } from '@pages/Shipments/Detail';
import { Profile } from '@pages/Profile';
import { useAuth, useConfig } from '@resources/contexts';
import { getDefaultAppPath, isMenuItemVisible, menuOptions } from '@resources/menu';

function DefaultAppRedirect() {
    const { userCan } = useAuth();

    return <Navigate replace to={getDefaultAppPath(userCan)} />;
}

export function PrivateRoutes() {
    const { userCan } = useAuth();
    const { init } = useConfig();

    const visibleMenu = menuOptions.filter((item) => isMenuItemVisible(item, userCan));
    const defaultPath = getDefaultAppPath(userCan);

    useEffect(() => {
        init();
    }, []);

    return (
        <Routes>
            <Route element={<LayoutApp />}>
                <Route index element={<DefaultAppRedirect />} />
                <Route path="profile" element={<Profile />} />
                {visibleMenu.map((item) => (
                        <Route key={item.link} path={item.link.replace(/^\//, '')} element={item.element} />
                    ))}
                {userCan('orders.view') && <Route path="orders/:id" element={<OrderDetail />} />}
                {userCan('clients.view') && <Route path="clients/:id" element={<ClientDetail />} />}
                {userCan('products.view') && <Route path="products/:id" element={<ProductDetail />} />}
                {userCan('pieces.view') && <Route path="pieces/:id" element={<PieceDetail />} />}
                {userCan('materials.view') && <Route path="materials/:id" element={<MaterialDetail />} />}
                {userCan('suppliers.view') && <Route path="suppliers/:id" element={<SupplierDetail />} />}
                {(userCan('material_suppliers.view') || userCan('material_supplier_prices.view')) && (
                    <Route path="material-suppliers/:id" element={<MaterialSupplierDetail />} />
                )}
                {userCan('manufacturers.view') && (
                    <Route path="manufacturers/:id" element={<ManufacturerDetail />} />
                )}
                {(userCan('production_orders.view') || userCan('manufacturer_order_pieces.view')) && (
                    <Route path="production-orders/:id" element={<ProductionOrderDetail />} />
                )}
                {userCan('manufacturer_order_pieces.view') && (
                    <Route
                        path="manufacturer-order-pieces/:id"
                        element={<ManufacturerOrderPieceDetail />}
                    />
                )}
                {userCan('entities.view') && <Route path="entities/:id" element={<EntityDetail />} />}
                {userCan('carriers.view') && <Route path="carriers/:id" element={<CarrierDetail />} />}
                {userCan('shipments.view') && <Route path="shipments/:id" element={<ShipmentDetail />} />}
                <Route path="*" element={<Navigate replace to={defaultPath} />} />
            </Route>
        </Routes>
    );
}
