import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconTrash } from '@tabler/icons-react';
import { AppModule, Button, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { formatCatalogCost, formatDate, formatMoney } from '@resources/helpers';
import { useDatatable, useSectionIcon } from '@resources/hooks';
import { materialService, materialSupplierService } from '@resources/services';
import { MaterialSupplierFormModal } from './MaterialSupplierFormModal';
import { FormModal } from './FormModal';

function DetailField({ label, children }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{children}</dd>
        </div>
    );
}

export function MaterialDetail() {
    const sectionIcon = useSectionIcon();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const [material, setMaterial] = useState(null);
    const [loadingMaterial, setLoadingMaterial] = useState(true);

    const {
        data: suppliersData,
        controls: suppliersControls,
        loading: suppliersLoading,
        updateList: updateSuppliers,
    } = useDatatable({
        service: materialSupplierService,
        serviceParams: { include: 'supplier.entity,latestPrice', material_id: id },
    });

    useEffect(() => {
        setLoadingMaterial(true);

        materialService
            .get(id)
            .then(setMaterial)
            .catch(() => setMaterial(null))
            .finally(() => setLoadingMaterial(false));
    }, [id]);

    function refreshMaterial() {
        return materialService.get(id).then(setMaterial);
    }

    function openEditModal() {
        showModal(<FormModal />, {
            formValues: material,
            onSave: refreshMaterial,
        });
    }

    function openSupplierModal() {
        showModal(<MaterialSupplierFormModal />, {
            materialId: id,
            onSave: updateSuppliers,
        });
    }

    async function handleDeleteSupplier(row) {
        const name = row.supplier?.entity?.name ?? `proveedor #${row.supplier_id}`;

        if (!(await confirm(`¿Quitar "${name}" de este material?`, { danger: true }))) {
            return;
        }

        await materialSupplierService.destroy(row.id);
        updateSuppliers();
    }

    const canViewMaterialSupplier =
        userCan('material_suppliers.view') || userCan('material_supplier_prices.view');

    const supplierColumns = [
        { title: 'ID', column: 'id', isSortable: true },
        {
            title: 'Proveedor',
            column: (row) => row.supplier?.entity?.name ?? `Proveedor #${row.supplier_id}`,
        },
        { title: 'RFC', column: (row) => row.supplier?.entity?.rfc ?? '—' },
        {
            title: 'Precio vigente',
            column: (row) =>
                row.latest_price ? formatMoney(row.latest_price.price) : '—',
        },
        tableActionsColumn({
            actions: [
                {
                    label: 'Eliminar',
                    icon: IconTrash,
                    show: userCan('material_suppliers.delete'),
                    danger: true,
                    onClick: (row) => handleDeleteSupplier(row),
                },
            ],
        }),
    ];

    if (!loadingMaterial && !material) {
        return (
            <AppModule icon={sectionIcon}
                title="Material no encontrado"
                description="El material solicitado no existe o no tiene permiso para verlo."
                toolbar={
                    <Button type="button" variant="secondary" onClick={() => navigate('/materials')}>
                        Volver a materiales
                    </Button>
                }
            />
        );
    }

    return (
        <AppModule icon={sectionIcon}
            title={loadingMaterial ? 'Cargando material…' : material.name}
            description={loadingMaterial ? '' : 'Proveedores y precio vigente por proveedor.'}
            onEdit={userCan('materials.edit') && material ? openEditModal : undefined}
            toolbar={
                <Button type="button" variant="secondary" onClick={() => navigate('/materials')}>
                    Volver a materiales
                </Button>
            }
        >
            <div className={loadingMaterial ? 'pointer-events-none opacity-60' : undefined}>
                {!loadingMaterial && (
                    <>
                        <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailField label="ID">{material.id}</DetailField>
                            <DetailField label="Unidad de medida">{material.uom}</DetailField>
                            <DetailField label="Costo unitario (mejor precio)">
                                {formatCatalogCost(material.cost)}
                            </DetailField>
                            <DetailField label="Creado">{formatDate(material.created_at)}</DetailField>
                            <DetailField label="Actualizado">{formatDate(material.updated_at)}</DetailField>
                        </dl>

                        <div className="mt-6 space-y-3">
                            <h2 className="text-sm font-semibold text-slate-900">Proveedores</h2>
                            <Table
                                name="material-detail-suppliers"
                                controls={suppliersControls}
                                columns={supplierColumns}
                                data={suppliersData}
                                loading={suppliersLoading}
                                onRowView={(row) => navigate(`/material-suppliers/${row.id}`)}
                                showRowView={canViewMaterialSupplier}
                                headerRight={
                                    userCan('material_suppliers.add') && (
                                        <Button type="button" onClick={openSupplierModal}>
                                            + Nuevo proveedor
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
