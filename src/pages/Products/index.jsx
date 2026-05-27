import { IconPencil, IconShoppingCartPlus, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppModule, Button, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { formatCatalogCost, formatMoney, getMainImageUrl } from '@resources/helpers';
import { useDatatable } from '@resources/hooks';
import { useAppStore } from '@resources/store';
import { getMenuIconByLink } from '@resources/menu';
import { productService } from '@resources/services';
import { OrderConceptFormModal } from '@pages/Orders/OrderConceptFormModal';
import { FormModal } from './FormModal';

export function Products() {
    const { userCan } = useAuth();
    const navigate = useNavigate();
    const { confirm, alert } = useConfirm();
    const { showModal } = useGlobalModals();
    const currentOrder = useAppStore((state) => state.currentOrder);
    const fetchCurrentOrder = useAppStore((state) => state.fetchCurrentOrder);
    const { data, controls, loading, updateList } = useDatatable({
        service: productService,
    });

    function openModal(formValues = {}) {
        showModal(<FormModal />, {
            formValues,
            onSave: updateList,
        });
    }

    async function handleDelete(row) {
        if (!(await confirm(`¿Eliminar el producto "${row.name}"?`, { danger: true }))) {
            return;
        }

        await productService.destroy(row.id);
        updateList();
    }

    function handleAddToOrder(row) {
        if (!currentOrder?.id) {
            alert('Inicie un pedido desde Clientes antes de agregar productos.');

            return;
        }

        showModal(<OrderConceptFormModal />, {
            orderId: currentOrder.id,
            product: row,
            onSave: fetchCurrentOrder,
        });
    }

    const hasDropdownActions =
        userCan('products.edit') ||
        userCan('products.delete') ||
        (userCan('order_concepts.add') && currentOrder?.id);

    const columns = [
        {
            title: 'Imagen',
            column: (row) => {
                const mainImageUrl = getMainImageUrl(row.images);

                return mainImageUrl ? (
                    <img src={mainImageUrl} alt={row.name} className="h-auto w-20 rounded object-contain" />
                ) : (
                    <span className="text-slate-400">—</span>
                );
            },
        },
        { title: 'ID', column: 'id', isSortable: true },
        { title: 'SKU', column: 'sku', isSortable: true },
        { title: 'Slug', column: 'slug', isSortable: true },
        { title: 'Nombre', column: 'name', isSortable: true },
        {
            title: 'Precio',
            column: (row) => formatMoney(row.price),
            isSortable: true,
        },
        {
            title: 'Costo',
            column: (row) => formatCatalogCost(row.cost),
        },
        {
            title: 'Detalles',
            column: (row) => (
                <span className="line-clamp-2 max-w-xs" title={row.details || ''}>
                    {row.details || '—'}
                </span>
            ),
        },
        ...(userCan('products.view') || hasDropdownActions
            ? [
                  tableActionsColumn({
                      actions: [
                          {
                              label: 'Agregar al pedido',
                              icon: IconShoppingCartPlus,
                              show: userCan('order_concepts.add') && Boolean(currentOrder?.id),
                              onClick: (row) => handleAddToOrder(row),
                          },
                          {
                              label: 'Editar',
                              icon: IconPencil,
                              show: userCan('products.edit'),
                              onClick: (row) => openModal(row),
                          },
                          {
                              label: 'Eliminar',
                              icon: IconTrash,
                              show: userCan('products.delete'),
                              danger: true,
                              onClick: (row) => handleDelete(row),
                          },
                      ],
                  }),
              ]
            : []),
    ];

    return (
        <AppModule
            title="Productos"
            description="Catálogo de productos del tenant."
            icon={getMenuIconByLink('/products')}
        >
            <Table
                name="products-table"
                controls={controls}
                columns={columns}
                data={data}
                loading={loading}
                onRowView={(row) => navigate(`/products/${row.id}`)}
                showRowView={userCan('products.view')}
                headerRight={
                    userCan('products.add') && (
                        <Button type="button" onClick={() => openModal()}>
                            + Nuevo producto
                        </Button>
                    )
                }
            />
        </AppModule>
    );
}
