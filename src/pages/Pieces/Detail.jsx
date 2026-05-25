import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { AppModule, Button, Table, tableActionsColumn } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { formatCatalogCost, formatDate } from '@resources/helpers';
import { useDatatable, useSectionIcon } from '@resources/hooks';
import { pieceService, pieceMaterialService } from '@resources/services';
import { PieceMaterialFormModal } from './PieceMaterialFormModal';
import { FormModal } from './FormModal';

function DetailField({ label, children }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm text-slate-900">{children}</dd>
        </div>
    );
}

export function PieceDetail() {
    const sectionIcon = useSectionIcon();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const [piece, setPiece] = useState(null);
    const [loadingPiece, setLoadingPiece] = useState(true);

    const {
        data: materialsData,
        controls: materialsControls,
        loading: materialsLoading,
        updateList: updateMaterials,
    } = useDatatable({
        service: pieceMaterialService,
        serviceParams: { include: 'material', piece_id: id },
    });

    useEffect(() => {
        setLoadingPiece(true);

        pieceService
            .get(id)
            .then(setPiece)
            .catch(() => setPiece(null))
            .finally(() => setLoadingPiece(false));
    }, [id]);

    function refreshPiece() {
        return pieceService.get(id).then(setPiece);
    }

    function openEditModal() {
        showModal(<FormModal />, {
            formValues: piece,
            onSave: refreshPiece,
        });
    }

    function openMaterialModal(assignment = {}) {
        showModal(<PieceMaterialFormModal />, {
            pieceId: id,
            parentRecord: piece && {
                title: piece.name,
                data: {
                    ID: piece.id,
                    Costo: formatCatalogCost(piece.cost),
                },
            },
            assignment,
            onSave: updateMaterials,
        });
    }

    async function handleDeleteMaterial(row) {
        const name = row.material?.name ?? `material #${row.material_id}`;

        if (!(await confirm(`¿Quitar "${name}" de esta pieza?`, { danger: true }))) {
            return;
        }

        await pieceMaterialService.destroy(row.id);
        updateMaterials();
    }

    const materialColumns = [
        { title: 'ID', column: 'id', isSortable: true },
        {
            title: 'Material',
            column: (row) => row.material?.name ?? `Material #${row.material_id}`,
        },
        { title: 'Unidad', column: (row) => row.material?.uom ?? '—' },
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
                    show: userCan('piece_materials.edit'),
                    onClick: (row) => openMaterialModal(row),
                },
                {
                    label: 'Eliminar',
                    icon: IconTrash,
                    show: userCan('piece_materials.delete'),
                    danger: true,
                    onClick: (row) => handleDeleteMaterial(row),
                },
            ],
        }),
    ];

    if (!loadingPiece && !piece) {
        return (
            <AppModule icon={sectionIcon}
                title="Pieza no encontrada"
                description="La pieza solicitada no existe o no tiene permiso para verla."
                toolbar={
                    <Button type="button" variant="secondary" onClick={() => navigate('/pieces')}>
                        Volver a piezas
                    </Button>
                }
            />
        );
    }

    return (
        <AppModule icon={sectionIcon}
            title={loadingPiece ? 'Cargando pieza…' : piece.name}
            description={loadingPiece ? '' : 'Detalle de la pieza y materiales que la conforman.'}
            onEdit={userCan('pieces.edit') && piece ? openEditModal : undefined}
            toolbar={
                <Button type="button" variant="secondary" onClick={() => navigate('/pieces')}>
                    Volver a piezas
                </Button>
            }
        >
            <div className={loadingPiece ? 'pointer-events-none opacity-60' : undefined}>
                {!loadingPiece && (
                    <>
                        <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailField label="ID">{piece.id}</DetailField>
                            <DetailField label="Costo">{formatCatalogCost(piece.cost)}</DetailField>
                            <DetailField label="Creado">{formatDate(piece.created_at)}</DetailField>
                            <DetailField label="Actualizado">{formatDate(piece.updated_at)}</DetailField>
                        </dl>

                        <div className="mt-6 space-y-3">
                            <h2 className="text-sm font-semibold text-slate-900">Materiales</h2>
                            <Table
                                name="piece-detail-materials"
                                controls={materialsControls}
                                columns={materialColumns}
                                data={materialsData}
                                loading={materialsLoading}
                                onRowView={(row) => navigate(`/materials/${row.material_id}`)}
                                showRowView={(row) => userCan('materials.view') && Boolean(row.material_id)}
                                headerRight={
                                    userCan('piece_materials.add') && (
                                        <Button type="button" onClick={() => openMaterialModal()}>
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
