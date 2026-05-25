import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconTrash } from '@tabler/icons-react';
import { AppModule, Button, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { formatDate, formatMoney } from '@resources/helpers';
import { useDatatable, useSectionIcon } from '@resources/hooks';
import { materialSupplierService, supplierService } from '@resources/services';
import { MaterialSupplierFormModal } from '@pages/Materials/MaterialSupplierFormModal';
import { FormModal } from './FormModal';

function DetailField({ label, children }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{children}</dd>
        </div>
    );
}

export function SupplierDetail() {
    const sectionIcon = useSectionIcon();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const [supplier, setSupplier] = useState(null);
    const [loadingSupplier, setLoadingSupplier] = useState(true);

    const {
        data: materialsData,
        controls: materialsControls,
        loading: materialsLoading,
        updateList: updateMaterials,
    } = useDatatable({
        service: materialSupplierService,
        serviceParams: { include: 'material,latestPrice', supplier_id: id },
    });

    useEffect(() => {
        setLoadingSupplier(true);

        supplierService
            .get(id, { include: 'entity' })
            .then(setSupplier)
            .catch(() => setSupplier(null))
            .finally(() => setLoadingSupplier(false));
    }, [id]);

    function refreshSupplier() {
        return supplierService.get(id, { include: 'entity' }).then(setSupplier);
    }

    function openEditModal() {
        showModal(<FormModal />, {
            formValues: supplier,
            onSave: refreshSupplier,
        });
    }

    function openMaterialModal() {
        showModal(<MaterialSupplierFormModal />, {
            supplierId: id,
            parentRecord: supplier && {
                title: supplier.entity?.name ?? `Proveedor #${supplier.id}`,
                data: {
                    ID: supplier.id,
                    RFC: supplier.entity?.rfc,
                },
            },
            onSave: updateMaterials,
        });
    }

    async function handleDeleteMaterial(row) {
        const name = row.material?.name ?? `material #${row.material_id}`;

        if (!(await confirm(`¿Quitar "${name}" de este proveedor?`, { danger: true }))) {
            return;
        }

        await materialSupplierService.destroy(row.id);
        updateMaterials();
    }

    const canViewMaterialSupplier =
        userCan('material_suppliers.view') || userCan('material_supplier_prices.view');

    const materialColumns = [
        { title: 'ID', column: 'id', isSortable: true },
        { title: 'Material', column: (row) => row.material?.name ?? `Material #${row.material_id}` },
        { title: 'Unidad', column: (row) => row.material?.uom ?? '—' },
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
                    onClick: (row) => handleDeleteMaterial(row),
                },
            ],
        }),
    ];

    if (!loadingSupplier && !supplier) {
        return (
            <AppModule icon={sectionIcon}
                title="Proveedor no encontrado"
                description="El proveedor solicitado no existe o no tiene permiso para verlo."
                toolbar={
                    <Button type="button" variant="secondary" onClick={() => navigate('/suppliers')}>
                        Volver a proveedores
                    </Button>
                }
            />
        );
    }

    return (
        <AppModule icon={sectionIcon}
            title={loadingSupplier ? 'Cargando proveedor…' : supplier.entity?.name ?? `Proveedor #${supplier.id}`}
            description={loadingSupplier ? '' : 'Materiales vinculados y precio vigente por material.'}
            onEdit={userCan('suppliers.edit') && supplier ? openEditModal : undefined}
            toolbar={
                <Button type="button" variant="secondary" onClick={() => navigate('/suppliers')}>
                    Volver a proveedores
                </Button>
            }
        >
            <div className={loadingSupplier ? 'pointer-events-none opacity-60' : undefined}>
                {!loadingSupplier && (
                    <>
                        <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailField label="ID">{supplier.id}</DetailField>
                            <DetailField label="RFC">{supplier.entity?.rfc ?? '—'}</DetailField>
                            <DetailField label="Creado">{formatDate(supplier.created_at)}</DetailField>
                        </dl>

                        <div className="mt-6 space-y-3">
                            <h2 className="text-sm font-semibold text-slate-900">Materiales</h2>
                            <Table
                                name="supplier-detail-materials"
                                controls={materialsControls}
                                columns={materialColumns}
                                data={materialsData}
                                loading={materialsLoading}
                                onRowView={(row) => navigate(`/material-suppliers/${row.id}`)}
                                showRowView={canViewMaterialSupplier}
                                headerRight={
                                    userCan('material_suppliers.add') && (
                                        <Button type="button" onClick={openMaterialModal}>
                                            + Nuevo material
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
