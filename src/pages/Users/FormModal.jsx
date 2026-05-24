import { useEffect, useState } from 'react';
import { Modal, SaveButton, Input, Select } from '@features/ui';
import { parseApiErrors } from '@resources/helpers';
import { adminService, roleService } from '@resources/services';

const emptyValues = {
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role_id: '',
    active: true,
};

export function FormModal({ onSave, formValues = {}, onClose, ...params }) {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState([]);
    const [values, setValues] = useState({ ...emptyValues, ...formValues });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        roleService.getAll().then(setRoles).catch(() => setRoles([]));
    }, []);

    function handleChange(event) {
        const { name, value, type, checked } = event.target;
        const nextValue = type === 'checkbox' ? checked : value;

        setValues((current) => ({ ...current, [name]: nextValue }));
        setErrors((current) => ({ ...current, [name]: null }));
    }

    function validate() {
        const nextErrors = {};

        if (!values.first_name?.trim()) nextErrors.first_name = 'El nombre es obligatorio';
        if (!values.last_name?.trim()) nextErrors.last_name = 'El apellido es obligatorio';
        if (!values.email?.trim()) nextErrors.email = 'El correo es obligatorio';
        if (!values.role_id) nextErrors.role_id = 'El rol es obligatorio';
        if (!values.id && !values.password?.trim()) nextErrors.password = 'La contraseña es obligatoria';

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
            first_name: values.first_name.trim(),
            last_name: values.last_name.trim(),
            email: values.email.trim(),
            role_id: Number(values.role_id),
            active: Boolean(values.active),
        };

        if (values.password?.trim()) {
            payload.password = values.password;
        }

        try {
            const response = values.id
                ? await adminService.update(values.id, payload)
                : await adminService.store(payload);

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

    return (
        <Modal {...params} title={values.id ? 'Editar usuario' : 'Crear usuario'} onClose={onClose}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        label="Nombre"
                        name="first_name"
                        value={values.first_name}
                        onChange={handleChange}
                        required
                        error={errors.first_name}
                    />
                    <Input
                        label="Apellido"
                        name="last_name"
                        value={values.last_name}
                        onChange={handleChange}
                        required
                        error={errors.last_name}
                    />
                </div>

                <Input
                    label="Correo"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    required
                    error={errors.email}
                />

                <Input
                    label={values.id ? 'Contraseña (opcional)' : 'Contraseña'}
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    required={!values.id}
                    error={errors.password}
                />

                <Select
                    label="Rol"
                    name="role_id"
                    value={values.role_id}
                    onChange={handleChange}
                    options={roles}
                    required
                    error={errors.role_id}
                />

                {values.id && (
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            name="active"
                            checked={values.active}
                            onChange={handleChange}
                            className="rounded border-slate-300"
                        />
                        Usuario activo
                    </label>
                )}

                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <SaveButton loading={loading} />
                </div>
            </form>
        </Modal>
    );
}
