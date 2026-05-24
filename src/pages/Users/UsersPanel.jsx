import { useEffect, useState } from 'react';
import { IconPencil, IconShieldLock, IconTrash } from '@tabler/icons-react';
import { Button, Table, TableActionsDropdown } from '@features/ui';
import { useAuth, useConfirm, useGlobalModals } from '@resources/contexts';
import { useDatatable } from '@resources/hooks';
import { adminService, roleService } from '@resources/services';
import { FormModal } from './FormModal';
import { PermissionsModal } from './PermissionsModal';

export function UsersPanel() {
    const { userCan } = useAuth();
    const { confirm } = useConfirm();
    const { showModal } = useGlobalModals();
    const [roles, setRoles] = useState([]);
    const { data, controls, loading, updateList } = useDatatable({
        service: adminService,
    });

    useEffect(() => {
        roleService.getAll().then(setRoles).catch(() => setRoles([]));
    }, []);

    function openFormModal(formValues = {}) {
        showModal(<FormModal />, {
            formValues,
            onSave: updateList,
        });
    }

    function openPermissionsModal(row) {
        showModal(<PermissionsModal />, {
            user: row,
        });
    }

    async function handleDelete(row) {
        if (!(await confirm(`¿Eliminar al usuario "${row.full_name}"?`, { danger: true }))) {
            return;
        }

        await adminService.destroy(row.id);
        updateList();
    }

    function getRoleLabel(roleId) {
        return roles.find((role) => Number(role.value) === Number(roleId))?.label ?? '—';
    }

    const hasRowActions =
        userCan('users.edit') || userCan('users.delete') || userCan('users.permissions');

    const columns = [
        { title: 'ID', column: 'id', isSortable: true },
        {
            title: 'Usuario',
            column: (row) => (
                <div>
                    <p className="font-medium text-slate-900">{row.full_name}</p>
                    <p className="text-xs text-slate-500">{row.email}</p>
                </div>
            ),
        },
        {
            title: 'Rol',
            column: (row) => getRoleLabel(row.role_id),
        },
        {
            title: 'Estatus',
            column: (row) => (
                <span
                    className={
                        row.active
                            ? 'inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700'
                            : 'inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600'
                    }
                >
                    {row.active ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        ...(hasRowActions
            ? [
                  {
                      title: 'Acciones',
                      align: 'right',
                      column: (row) => (
                          <TableActionsDropdown
                              actions={[
                                  {
                                      label: 'Editar',
                                      icon: IconPencil,
                                      show: userCan('users.edit'),
                                      onClick: () => openFormModal(row),
                                  },
                                  {
                                      label: 'Permisos',
                                      icon: IconShieldLock,
                                      show: userCan('users.permissions'),
                                      onClick: () => openPermissionsModal(row),
                                  },
                                  {
                                      label: 'Eliminar',
                                      icon: IconTrash,
                                      show: userCan('users.delete'),
                                      danger: true,
                                      onClick: () => handleDelete(row),
                                  },
                              ]}
                          />
                      ),
                  },
              ]
            : []),
    ];

    return (
        <Table
            name="users-table"
            controls={controls}
            columns={columns}
            data={data}
            loading={loading}
            headerRight={
                userCan('users.add') && (
                    <Button type="button" onClick={() => openFormModal()}>
                        + Nuevo usuario
                    </Button>
                )
            }
        />
    );
}
