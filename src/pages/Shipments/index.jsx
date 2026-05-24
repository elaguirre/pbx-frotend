import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AppModule, Button, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { formatQuantity } from '@resources/helpers';
import { useDatatable } from '@resources/hooks';
import { getMenuIconByLink } from '@resources/menu';
import { shipmentService } from '@resources/services';
import { FormModal } from './FormModal';

export function Shipments() {
    const { userCan } = useAuth();
    const navigate = useNavigate();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const { data, controls, loading, updateList } = useDatatable({
        service: shipmentService,
        serviceParams: {
            include: 'carrier.entity,carrierUnit,driver.entity',
        },
    });

    function openModal(formValues = {}) {
        showModal(<FormModal />, {
            formValues,
            onSave: updateList,
        });
    }

    async function handleDelete(row) {
        if (!(await confirm(`¿Eliminar el embarque #${row.id}?`, { danger: true }))) {
            return;
        }

        await shipmentService.destroy(row.id);
        updateList();
    }

    const hasDropdownActions = userCan('shipments.edit') || userCan('shipments.delete');

    const columns = [
        { title: 'ID', column: 'id', isSortable: true },
        {
            title: 'Transportista',
            column: (row) => row.carrier?.entity?.name ?? `Transportista #${row.carrier_id}`,
        },
        {
            title: 'Unidad',
            column: (row) =>
                row.carrier_unit?.description ?? row.carrierUnit?.description ?? '—',
        },
        {
            title: 'Vol. (m³)',
            column: (row) =>
                formatQuantity(
                    row.carrier_unit?.load_volume_capacity ??
                        row.carrierUnit?.load_volume_capacity,
                ),
        },
        {
            title: 'Peso (kg)',
            column: (row) =>
                formatQuantity(
                    row.carrier_unit?.load_weight_capacity ??
                        row.carrierUnit?.load_weight_capacity,
                ),
        },
        {
            title: 'Conductor',
            column: (row) => row.driver?.entity?.name ?? '—',
        },
        ...(hasDropdownActions
            ? [
                  tableActionsColumn({
                      actions: [
                          {
                              label: 'Editar',
                              icon: IconPencil,
                              show: userCan('shipments.edit'),
                              onClick: (row) => openModal(row),
                          },
                          {
                              label: 'Eliminar',
                              icon: IconTrash,
                              show: userCan('shipments.delete'),
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
            title="Embarques"
            description="Grupos de piezas recogidas en fábrica del maquilador para su transporte."
            icon={getMenuIconByLink('/shipments')}
        >
            <Table
                name="shipments-table"
                controls={controls}
                columns={columns}
                data={data}
                loading={loading}
                onRowView={(row) => navigate(`/shipments/${row.id}`)}
                showRowView={userCan('shipments.view')}
                headerRight={
                    userCan('shipments.add') && (
                        <Button type="button" onClick={() => openModal()}>
                            + Nuevo embarque
                        </Button>
                    )
                }
            />
        </AppModule>
    );
}
