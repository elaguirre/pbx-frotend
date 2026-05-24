import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { AppModule, Button, Table, TableActionsDropdown } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { formatDate, formatMoney } from '@resources/helpers';
import { useDatatable, useSectionIcon } from '@resources/hooks';
import { materialSupplierService, materialSupplierPriceService } from '@resources/services';
import { MaterialSupplierFormModal } from '@pages/Materials/MaterialSupplierFormModal';
import { MaterialSupplierPriceFormModal } from './MaterialSupplierPriceFormModal';

function DetailField({ label, children }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{children}</dd>
        </div>
    );
}

export function MaterialSupplierDetail() {
    const sectionIcon = useSectionIcon();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const [assignment, setAssignment] = useState(null);
    const [loadingAssignment, setLoadingAssignment] = useState(true);

    const {
        data: pricesData,
        controls: pricesControls,
        loading: pricesLoading,
        updateList: updatePrices,
    } = useDatatable({
        service: materialSupplierPriceService,
        serviceParams: { material_supplier_id: id },
    });

    useEffect(() => {
        setLoadingAssignment(true);

        materialSupplierService
            .get(id, { include: 'material,supplier.entity,latestPrice' })
            .then(setAssignment)
            .catch(() => setAssignment(null))
            .finally(() => setLoadingAssignment(false));
    }, [id]);

    function refreshAssignment() {
        return materialSupplierService
            .get(id, { include: 'material,supplier.entity,latestPrice' })
            .then(setAssignment);
    }

    function openEditModal() {
        showModal(<MaterialSupplierFormModal />, {
            assignment,
            onSave: refreshAssignment,
        });
    }

    function openPriceModal(priceRecord = null) {
        showModal(<MaterialSupplierPriceFormModal />, {
            materialSupplierId: id,
            priceRecord,
            onSave: () => {
                updatePrices();
                refreshAssignment();
            },
        });
    }

    async function handleDeletePrice(row) {
        if (!(await confirm(`¿Eliminar el precio ${formatMoney(row.price)}?`, { danger: true }))) {
            return;
        }

        await materialSupplierPriceService.destroy(row.id);
        updatePrices();
        await refreshAssignment();
    }

    const supplierId = assignment?.supplier_id;
    const backLabel = supplierId ? 'Volver al proveedor' : 'Volver a materiales';
    const backPath = supplierId ? `/suppliers/${supplierId}` : `/materials/${assignment?.material_id ?? ''}`;

    const priceColumns = [
        { title: 'ID', column: 'id', isSortable: true },
        {
            title: 'Precio',
            column: (row) => formatMoney(row.price),
            isSortable: true,
        },
        {
            title: 'Registrado',
            column: (row) => formatDate(row.created_at),
            isSortable: true,
        },
        {
            title: 'Acciones',
            align: 'right',
            column: (row) => (
                <TableActionsDropdown
                    actions={[
                        {
                            label: 'Editar',
                            icon: IconPencil,
                            show: userCan('material_supplier_prices.edit'),
                            onClick: () => openPriceModal(row),
                        },
                        {
                            label: 'Eliminar',
                            icon: IconTrash,
                            show: userCan('material_supplier_prices.delete'),
                            danger: true,
                            onClick: () => handleDeletePrice(row),
                        },
                    ]}
                />
            ),
        },
    ];

    if (!loadingAssignment && !assignment) {
        return (
            <AppModule icon={sectionIcon}
                title="Asignación no encontrada"
                description="El vínculo material-proveedor no existe o no tiene permiso para verlo."
                toolbar={
                    <Button type="button" variant="secondary" onClick={() => navigate('/suppliers')}>
                        Volver a proveedores
                    </Button>
                }
            />
        );
    }

    const title = loadingAssignment
        ? 'Cargando…'
        : `${assignment.material?.name ?? 'Material'} · ${assignment.supplier?.entity?.name ?? 'Proveedor'}`;

    return (
        <AppModule icon={sectionIcon}
            title={title}
            description={loadingAssignment ? '' : 'Historial de precios del proveedor para este material.'}
            onEdit={userCan('material_suppliers.edit') && assignment ? openEditModal : undefined}
            toolbar={
                <Button type="button" variant="secondary" onClick={() => navigate(backPath)}>
                    {backLabel}
                </Button>
            }
        >
            <div className={loadingAssignment ? 'pointer-events-none opacity-60' : undefined}>
                {!loadingAssignment && (
                    <>
                        <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailField label="Material">{assignment.material?.name ?? '—'}</DetailField>
                            <DetailField label="Unidad">{assignment.material?.uom ?? '—'}</DetailField>
                            <DetailField label="Proveedor">
                                {assignment.supplier?.entity?.name ?? '—'}
                            </DetailField>
                            <DetailField label="Precio vigente">
                                {assignment.latest_price
                                    ? formatMoney(assignment.latest_price.price)
                                    : '—'}
                            </DetailField>
                        </dl>

                        <div className="mt-6 space-y-3">
                            <h2 className="text-sm font-semibold text-slate-900">Historial de precios</h2>
                            <Table
                                name="material-supplier-prices"
                                controls={pricesControls}
                                columns={priceColumns}
                                data={pricesData}
                                loading={pricesLoading}
                                headerRight={
                                    userCan('material_supplier_prices.add') && (
                                        <Button type="button" onClick={openPriceModal}>
                                            + Nuevo precio
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
