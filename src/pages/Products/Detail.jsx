import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { AppModule, Button, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { formatCatalogCost, formatDate, formatMoney } from '@resources/helpers';
import { useDatatable, useSectionIcon } from '@resources/hooks';
import { productService, productPieceService } from '@resources/services';
import { ProductPieceFormModal } from './ProductPieceFormModal';
import { FormModal } from './FormModal';

function DetailField({ label, children }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{children}</dd>
        </div>
    );
}

export function ProductDetail() {
    const sectionIcon = useSectionIcon();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const [product, setProduct] = useState(null);
    const [loadingProduct, setLoadingProduct] = useState(true);

    const {
        data: piecesData,
        controls: piecesControls,
        loading: piecesLoading,
        updateList: updatePieces,
    } = useDatatable({
        service: productPieceService,
        serviceParams: { include: 'piece', product_id: id },
    });

    useEffect(() => {
        setLoadingProduct(true);

        productService
            .get(id)
            .then(setProduct)
            .catch(() => setProduct(null))
            .finally(() => setLoadingProduct(false));
    }, [id]);

    function refreshProduct() {
        return productService.get(id).then(setProduct);
    }

    function openEditModal() {
        showModal(<FormModal />, {
            formValues: product,
            onSave: refreshProduct,
        });
    }

    function openPieceModal(assignment = {}) {
        showModal(<ProductPieceFormModal />, {
            productId: id,
            assignment,
            onSave: updatePieces,
        });
    }

    async function handleDeletePiece(row) {
        const name = row.piece?.name ?? `pieza #${row.piece_id}`;

        if (!(await confirm(`¿Quitar "${name}" de este producto?`, { danger: true }))) {
            return;
        }

        await productPieceService.destroy(row.id);
        updatePieces();
    }

    const pieceColumns = [
        { title: 'ID', column: 'id', isSortable: true },
        { title: 'Pieza', column: (row) => row.piece?.name ?? `Pieza #${row.piece_id}` },
        { title: 'Cantidad', column: 'quantity', isSortable: true },
        {
            title: 'Costo',
            column: (row) => formatCatalogCost(row.cost),
        },
        tableActionsColumn({
            actions: [
                {
                    label: 'Editar',
                    icon: IconPencil,
                    show: userCan('product_pieces.edit'),
                    onClick: (row) => openPieceModal(row),
                },
                {
                    label: 'Eliminar',
                    icon: IconTrash,
                    show: userCan('product_pieces.delete'),
                    danger: true,
                    onClick: (row) => handleDeletePiece(row),
                },
            ],
        }),
    ];

    if (!loadingProduct && !product) {
        return (
            <AppModule icon={sectionIcon}
                title="Producto no encontrado"
                description="El producto solicitado no existe o no tiene permiso para verlo."
                toolbar={
                    <Button type="button" variant="secondary" onClick={() => navigate('/products')}>
                        Volver a productos
                    </Button>
                }
            />
        );
    }

    return (
        <AppModule icon={sectionIcon}
            title={loadingProduct ? 'Cargando producto…' : product.name}
            description={loadingProduct ? '' : 'Detalle del producto y piezas que lo conforman.'}
            onEdit={userCan('products.edit') && product ? openEditModal : undefined}
            toolbar={
                <Button type="button" variant="secondary" onClick={() => navigate('/products')}>
                    Volver a productos
                </Button>
            }
        >
            <div className={loadingProduct ? 'pointer-events-none opacity-60' : undefined}>
                {!loadingProduct && (
                    <>
                        <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailField label="ID">{product.id}</DetailField>
                            <DetailField label="SKU">{product.sku}</DetailField>
                            <DetailField label="Slug">
                                <span className="font-mono text-slate-700">{product.slug}</span>
                            </DetailField>
                            <DetailField label="Precio venta">{formatMoney(product.price)}</DetailField>
                            <DetailField label="Costo">{formatCatalogCost(product.cost)}</DetailField>
                            <DetailField label="Creado">{formatDate(product.created_at)}</DetailField>
                            <DetailField label="Actualizado">{formatDate(product.updated_at)}</DetailField>
                            <DetailField label="Detalles">
                                <span className="whitespace-pre-wrap">{product.details?.trim() || '—'}</span>
                            </DetailField>
                        </dl>

                        <div className="mt-6 space-y-3">
                            <h2 className="text-sm font-semibold text-slate-900">Piezas</h2>
                            <Table
                                name="product-detail-pieces"
                                controls={piecesControls}
                                columns={pieceColumns}
                                data={piecesData}
                                loading={piecesLoading}
                                onRowView={(row) => navigate(`/pieces/${row.piece_id}`)}
                                showRowView={(row) => userCan('pieces.view') && Boolean(row.piece_id)}
                                headerRight={
                                    userCan('product_pieces.add') && (
                                        <Button type="button" onClick={() => openPieceModal()}>
                                            + Nueva pieza
                                        </Button>
                                    )
                                }
                            />
                        </div>
                    </>
                )}
            </div>
        </AppModule>
    );
}
