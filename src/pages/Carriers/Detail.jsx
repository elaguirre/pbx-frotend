import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { AppModule, Button, Table, Tabs, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { formatDate, formatQuantity } from '@resources/helpers';
import { useDatatable, useSectionIcon } from '@resources/hooks';
import { carrierService, carrierUnitService, driverService } from '@resources/services';
import { CarrierUnitFormModal } from './CarrierUnitFormModal';
import { DriverFormModal } from './DriverFormModal';
import { FormModal } from './FormModal';

function DetailField({ label, children }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{children}</dd>
        </div>
    );
}

export function CarrierDetail() {
    const sectionIcon = useSectionIcon();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const [carrier, setCarrier] = useState(null);
    const [loadingCarrier, setLoadingCarrier] = useState(true);

    const canViewUnits = userCan('carrier_units.view') || userCan('carriers.view');
    const canViewDrivers = userCan('drivers.view') || userCan('carriers.view');

    const defaultTab = canViewUnits ? 'units' : canViewDrivers ? 'drivers' : 'units';
    const [activeTab, setActiveTab] = useState(defaultTab);

    const {
        data: unitsData,
        controls: unitsControls,
        loading: unitsLoading,
        updateList: updateUnits,
    } = useDatatable({
        service: canViewUnits ? carrierUnitService : null,
        serviceParams: { carrier_id: id },
    });

    const {
        data: driversData,
        controls: driversControls,
        loading: driversLoading,
        updateList: updateDrivers,
    } = useDatatable({
        service: canViewDrivers ? driverService : null,
        serviceParams: { include: 'entity', carrier_id: id },
    });

    useEffect(() => {
        setLoadingCarrier(true);

        carrierService
            .get(id, { include: 'entity' })
            .then(setCarrier)
            .catch(() => setCarrier(null))
            .finally(() => setLoadingCarrier(false));
    }, [id]);

    function refreshCarrier() {
        return carrierService.get(id, { include: 'entity' }).then(setCarrier);
    }

    function openEditModal() {
        showModal(<FormModal />, {
            formValues: carrier,
            onSave: refreshCarrier,
        });
    }

    function openUnitModal(unitRecord = null) {
        showModal(<CarrierUnitFormModal />, {
            carrierId: id,
            unitRecord,
            onSave: updateUnits,
        });
    }

    function openDriverModal() {
        showModal(<DriverFormModal />, {
            carrierId: id,
            onSave: updateDrivers,
        });
    }

    async function handleDeleteUnit(row) {
        if (!(await confirm(`¿Eliminar la unidad "${row.description}"?`, { danger: true }))) {
            return;
        }

        await carrierUnitService.destroy(row.id);
        updateUnits();
    }

    async function handleDeleteDriver(row) {
        const name = row.entity?.name ?? `conductor #${row.id}`;

        if (!(await confirm(`¿Eliminar al conductor "${name}"?`, { danger: true }))) {
            return;
        }

        await driverService.destroy(row.id);
        updateDrivers();
    }

    const unitColumns = [
        { title: 'ID', column: 'id', isSortable: true },
        {
            title: 'Descripción',
            column: (row) => row.description ?? '—',
        },
        {
            title: 'Vol. (m³)',
            column: (row) => formatQuantity(row.load_volume_capacity),
            isSortable: true,
        },
        {
            title: 'Peso (kg)',
            column: (row) => formatQuantity(row.load_weight_capacity),
            isSortable: true,
        },
        tableActionsColumn({
            actions: [
                {
                    label: 'Editar',
                    icon: IconPencil,
                    show: userCan('carrier_units.edit'),
                    onClick: (row) => openUnitModal(row),
                },
                {
                    label: 'Eliminar',
                    icon: IconTrash,
                    show: userCan('carrier_units.delete'),
                    danger: true,
                    onClick: (row) => handleDeleteUnit(row),
                },
            ],
        }),
    ];

    const driverColumns = [
        { title: 'ID', column: 'id', isSortable: true },
        { title: 'Nombre', column: (row) => row.entity?.name ?? '—' },
        { title: 'RFC', column: (row) => row.entity?.rfc ?? '—' },
        tableActionsColumn({
            actions: [
                {
                    label: 'Eliminar',
                    icon: IconTrash,
                    show: userCan('drivers.delete'),
                    danger: true,
                    onClick: (row) => handleDeleteDriver(row),
                },
            ],
        }),
    ];

    const unitsTabContent = canViewUnits ? (
        <Table
            name="carrier-units"
            controls={unitsControls}
            columns={unitColumns}
            data={unitsData}
            loading={unitsLoading}
            headerRight={
                userCan('carrier_units.add') && (
                    <Button type="button" onClick={() => openUnitModal()}>
                        + Nueva unidad
                    </Button>
                )
            }
        />
    ) : (
        <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            No tiene permiso para ver unidades de transporte.
        </p>
    );

    const driversTabContent = canViewDrivers ? (
        <Table
            name="carrier-drivers"
            controls={driversControls}
            columns={driverColumns}
            data={driversData}
            loading={driversLoading}
            headerRight={
                userCan('drivers.add') && (
                    <Button type="button" onClick={openDriverModal}>
                        + Nuevo conductor
                    </Button>
                )
            }
        />
    ) : (
        <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            No tiene permiso para ver conductores.
        </p>
    );

    const tabs = [
        canViewUnits && {
            id: 'units',
            label: 'Unidades de transporte',
            content: unitsTabContent,
        },
        canViewDrivers && {
            id: 'drivers',
            label: 'Conductores',
            content: driversTabContent,
        },
    ].filter(Boolean);

    useEffect(() => {
        if (tabs.length > 0 && !tabs.some((tab) => tab.id === activeTab)) {
            setActiveTab(tabs[0].id);
        }
    }, [tabs, activeTab]);

    const resolvedActiveTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : tabs[0]?.id;

    if (!loadingCarrier && !carrier) {
        return (
            <AppModule
                icon={sectionIcon}
                title="Transportista no encontrado"
                toolbar={
                    <Button type="button" variant="secondary" onClick={() => navigate('/carriers')}>
                        Volver a transportistas
                    </Button>
                }
            />
        );
    }

    return (
        <AppModule
            icon={sectionIcon}
            title={loadingCarrier ? 'Cargando…' : carrier.entity?.name ?? `Transportista #${carrier.id}`}
            description="Unidades de transporte y conductores disponibles para embarques."
            onEdit={userCan('carriers.edit') && carrier ? openEditModal : undefined}
            toolbar={
                <Button type="button" variant="secondary" onClick={() => navigate('/carriers')}>
                    Volver a transportistas
                </Button>
            }
        >
            <div className={loadingCarrier ? 'pointer-events-none opacity-60' : undefined}>
                {!loadingCarrier && (
                    <>
                        <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailField label="ID">{carrier.id}</DetailField>
                            <DetailField label="RFC">{carrier.entity?.rfc ?? '—'}</DetailField>
                            <DetailField label="Registrado">{formatDate(carrier.created_at)}</DetailField>
                        </dl>

                        <div className="mt-6">
                            {tabs.length > 1 ? (
                                <Tabs
                                    tabs={tabs}
                                    activeTab={resolvedActiveTab}
                                    onTabChange={setActiveTab}
                                />
                            ) : (
                                tabs[0]?.content
                            )}
                        </div>
                    </>
                )}
            </div>
        </AppModule>
    );
}
