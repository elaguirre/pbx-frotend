import { useEffect, useState } from 'react';
import { applySelectPlusRecord, Button, Modal, SaveButton, SelectPlus } from '@features/ui';
import { useAuth, useGlobalModals } from '@resources/contexts';
import { normalizeListResponse, parseApiErrors } from '@resources/helpers';
import { FormModal as MaterialFormModal } from '@pages/Materials/FormModal';
import { FormModal as SupplierFormModal } from '@pages/Suppliers/FormModal';
import { materialService, materialSupplierService, supplierService } from '@resources/services';

export function MaterialSupplierFormModal({
    materialId = null,
    supplierId = null,
    assignment = null,
    onSave,
    onClose,
    ...params
}) {
    const { userCan } = useAuth();
    const { showModal } = useGlobalModals();
    const isEdit = Boolean(assignment?.id);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const [values, setValues] = useState({
        material_id: assignment?.material_id != null ? String(assignment.material_id) : materialId ? String(materialId) : '',
        supplier_id: assignment?.supplier_id != null ? String(assignment.supplier_id) : supplierId ? String(supplierId) : '',
    });
    const [errors, setErrors] = useState({});

    const fromMaterial = Boolean(materialId);
    const fromSupplier = Boolean(supplierId);

    useEffect(() => {
        const loader = fromMaterial
            ? supplierService.getAll({ limit: 500, include: 'entity' })
            : materialService.getAll({ limit: 500 });

        loader
            .then((response) => {
                const list = normalizeListResponse(response);

                setOptions(
                    list.map((row) => ({
                        value: String(row.id),
                        label: fromMaterial
                            ? row.entity?.name ?? `Proveedor #${row.id}`
                            : row.name,
                    })),
                );
            })
            .catch(() => setOptions([]));
    }, [fromMaterial]);

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function handleMaterialCreated(record) {
        applySelectPlusRecord({
            onOptionsChange: setOptions,
            record,
            mapToOption: (material) => ({
                value: String(material.id),
                label: material.name,
            }),
            onChange: handleChange,
            name: 'material_id',
        });
        setErrors((current) => ({ ...current, material_id: null }));
    }

    function handleSupplierCreated(record) {
        const supplier = record?.data ?? record;

        applySelectPlusRecord({
            onOptionsChange: setOptions,
            record: supplier,
            mapToOption: (row) => ({
                value: String(row.id),
                label: row.entity?.name ?? `Proveedor #${row.id}`,
            }),
            onChange: handleChange,
            name: 'supplier_id',
        });
        setErrors((current) => ({ ...current, supplier_id: null }));
    }

    function openMaterialModal() {
        showModal(<MaterialFormModal />, {
            onSave: handleMaterialCreated,
        });
    }

    function openSupplierModal() {
        showModal(<SupplierFormModal />, {
            onSave: handleSupplierCreated,
        });
    }

    function validate() {
        const nextErrors = {};

        if (!values.material_id) nextErrors.material_id = 'Seleccione un material';
        if (!values.supplier_id) nextErrors.supplier_id = 'Seleccione un proveedor';

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);

        const payload = {
            material_id: Number(values.material_id),
            supplier_id: Number(values.supplier_id),
        };

        try {
            const response = isEdit
                ? await materialSupplierService.update(assignment.id, payload)
                : await materialSupplierService.store(payload);

            onSave?.(response?.data ?? response);
            onClose?.();
        } catch (error) {
            const apiErrors = parseApiErrors(error);

            if (apiErrors) {
                setErrors(apiErrors);
            }
        } finally {
            setLoading(false);
        }
    }

    const title = isEdit
        ? 'Editar asignación'
        : fromSupplier
          ? 'Asignar material al proveedor'
          : 'Asignar proveedor al material';

    return (
        <Modal {...params} title={title} onClose={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                {fromSupplier && (
                    <SelectPlus
                        label="Material"
                        name="material_id"
                        value={values.material_id}
                        onChange={handleChange}
                        options={options}
                        required
                        disabled={isEdit}
                        error={errors.material_id}
                        showAdd={!isEdit && userCan('materials.add')}
                        addLabel="Nuevo material"
                        onAddClick={openMaterialModal}
                    />
                )}
                {fromMaterial && (
                    <SelectPlus
                        label="Proveedor"
                        name="supplier_id"
                        value={values.supplier_id}
                        onChange={handleChange}
                        options={options}
                        required
                        disabled={isEdit}
                        error={errors.supplier_id}
                        showAdd={!isEdit && userCan('suppliers.add')}
                        addLabel="Nuevo proveedor"
                        onAddClick={openSupplierModal}
                    />
                )}
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
