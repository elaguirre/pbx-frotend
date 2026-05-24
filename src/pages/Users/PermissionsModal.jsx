import { useEffect, useMemo, useState } from 'react';
import { Button, Modal } from '@features/ui';
import { useAuth } from '@resources/contexts';
import { abilityService, adminService } from '@resources/services';

export function PermissionsModal({ user, onClose, ...params }) {
    const { userCan } = useAuth();
    const canSave = userCan('users.permissions');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [query, setQuery] = useState('');
    const [abilities, setAbilities] = useState([]);
    const [checkedIds, setCheckedIds] = useState([]);

    useEffect(() => {
        setLoading(true);

        Promise.all([abilityService.getAll(), adminService.getAbilities(user.id)])
            .then(([allAbilities, userAbilities]) => {
                setAbilities(allAbilities.filter((ability) => ability.name !== '*'));
                setCheckedIds(userAbilities.map((ability) => ability.id));
            })
            .finally(() => setLoading(false));
    }, [user.id]);

    const filteredAbilities = useMemo(() => {
        const text = query.trim().toLowerCase();

        if (!text) {
            return abilities;
        }

        return abilities.filter(
            (ability) =>
                ability.name?.toLowerCase().includes(text) ||
                ability.title?.toLowerCase().includes(text) ||
                ability.group?.toLowerCase().includes(text),
        );
    }, [abilities, query]);

    function toggleAbility(abilityId, checked) {
        setCheckedIds((current) =>
            checked ? [...current, abilityId] : current.filter((id) => id !== abilityId),
        );
    }

    function toggleAll(checked) {
        setCheckedIds(checked ? filteredAbilities.map((ability) => ability.id) : []);
    }

    async function handleSave() {
        setSaving(true);

        try {
            await adminService.updateAbilities(user.id, checkedIds);
            onClose?.();
        } finally {
            setSaving(false);
        }
    }

    const allFilteredChecked =
        filteredAbilities.length > 0 &&
        filteredAbilities.every((ability) => checkedIds.includes(ability.id));

    return (
        <Modal
            {...params}
            title={`Permisos — ${user.full_name || user.email}`}
            onClose={onClose}
            size="lg"
        >
            <div className="flex flex-col gap-4">
                <input
                    type="search"
                    placeholder="Buscar permiso..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />

                {loading ? (
                    <p className="py-8 text-center text-sm text-slate-500">Cargando permisos...</p>
                ) : (
                    <div className="max-h-[50vh] overflow-auto rounded-lg border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-100 text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    {canSave && (
                                        <th className="w-10 px-3 py-2">
                                            <input
                                                type="checkbox"
                                                checked={allFilteredChecked}
                                                onChange={(event) => toggleAll(event.target.checked)}
                                            />
                                        </th>
                                    )}
                                    <th className="px-3 py-2 text-left font-medium text-slate-600">Grupo</th>
                                    <th className="px-3 py-2 text-left font-medium text-slate-600">Permiso</th>
                                    <th className="px-3 py-2 text-left font-medium text-slate-600">Descripción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAbilities.map((ability) => (
                                    <tr key={ability.id} className="hover:bg-slate-50">
                                        {canSave && (
                                            <td className="px-3 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={checkedIds.includes(ability.id)}
                                                    onChange={(event) =>
                                                        toggleAbility(ability.id, event.target.checked)
                                                    }
                                                />
                                            </td>
                                        )}
                                        <td className="px-3 py-2 text-slate-600">{ability.group}</td>
                                        <td className="px-3 py-2 font-medium text-slate-800">{ability.title}</td>
                                        <td className="px-3 py-2 text-slate-600">{ability.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {canSave && (
                    <div className="flex justify-end border-t border-slate-100 pt-4">
                        <Button type="button" loading={saving} onClick={handleSave}>
                            Guardar
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
