import { useEffect, useState } from 'react';
import { Button, Modal, SaveButton, Select } from '@features/ui';
import { normalizeListResponse, parseApiErrors } from '@resources/helpers';
import { materialService, materialSupplierService, supplierService } from '@resources/services';

export function MaterialSupplierFormModal({
    materialId = null,
    supplierId = null,
    assignment = null,
    onSave,
    onClose,
    ...params
}) {
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
                    <Select
                        label="Material"
                        name="material_id"
                        value={values.material_id}
                        onChange={handleChange}
                        options={options}
                        required
                        disabled={isEdit}
                        error={errors.material_id}
                    />
                )}
                {fromMaterial && (
                    <Select
                        label="Proveedor"
                        name="supplier_id"
                        value={values.supplier_id}
                        onChange={handleChange}
                        options={options}
                        required
                        disabled={isEdit}
                        error={errors.supplier_id}
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
