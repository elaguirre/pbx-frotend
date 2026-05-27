import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppModule, Button, DetailField, Tabs } from '@features/ui';
import { ContactDataPanel } from '@pages/ContactData/ContactDataPanel';
import { EntityAddressPanel } from '@pages/EntityAddresses/EntityAddressPanel';
import { getEntityTypeLabel } from '@resources/constants/catalog';
import { formatDate, getMainImageUrl } from '@resources/helpers';
import { useAuth, useGlobalModals } from '@resources/contexts';
import { useSectionIcon } from '@resources/hooks';
import { entityService } from '@resources/services';
import { FormModal } from './FormModal';

export function EntityDetail() {
    const sectionIcon = useSectionIcon();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userCan } = useAuth();
    const { showModal } = useGlobalModals();
    const [entity, setEntity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('contact');

    useEffect(() => {
        setLoading(true);

        entityService
            .get(id)
            .then(setEntity)
            .catch(() => setEntity(null))
            .finally(() => setLoading(false));
    }, [id]);

    function refreshEntity() {
        return entityService.get(id).then(setEntity);
    }

    function openEditModal() {
        showModal(<FormModal />, {
            formValues: entity,
            onSave: refreshEntity,
        });
    }

    if (loading) {
        return (
            <AppModule icon={sectionIcon}
                title="Cargando entidad…"
                toolbar={
                    <Button type="button" variant="secondary" onClick={() => navigate('/settings')}>
                        Volver a configuración
                    </Button>
                }
            />
        );
    }

    if (!entity) {
        return (
            <AppModule icon={sectionIcon}
                title="Entidad no encontrada"
                description="La entidad solicitada no existe o no tiene permiso para verla."
                toolbar={
                    <Button type="button" variant="secondary" onClick={() => navigate('/settings')}>
                        Volver a configuración
                    </Button>
                }
            />
        );
    }

    const contactTabContent = (
        <div className="space-y-3">
            <p className="text-sm text-slate-500">
                Correos, teléfonos y WhatsApp asociados a esta entidad.
            </p>
            <ContactDataPanel entityId={id} />
        </div>
    );

    const addressesTabContent = (
        <div className="space-y-3">
            <p className="text-sm text-slate-500">
                Domicilios, facturación, envío y otras direcciones de la entidad.
            </p>
            <EntityAddressPanel entityId={id} />
        </div>
    );

    const tabs = [
        {
            id: 'contact',
            label: 'Contacto',
            content: contactTabContent,
        },
        ...(userCan('entity_addresses.view')
            ? [
                  {
                      id: 'addresses',
                      label: 'Direcciones',
                      content: addressesTabContent,
                  },
              ]
            : []),
    ];

    return (
        <AppModule icon={sectionIcon}
            title={entity.name}
            description="Contacto y direcciones de la entidad."
            onEdit={userCan('entities.edit') && entity ? openEditModal : undefined}
            toolbar={
                <Button type="button" variant="secondary" onClick={() => navigate('/settings')}>
                    Volver a configuración
                </Button>
            }
        >
            <dl className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
                <DetailField label="ID">{entity.id}</DetailField>
                <DetailField label="RFC">{entity.rfc || '—'}</DetailField>
                <DetailField label="Tipo">{getEntityTypeLabel(entity.type)}</DetailField>
                <DetailField label="Creada">{formatDate(entity.created_at)}</DetailField>
            </dl>

            {getMainImageUrl(entity.images) && (
                <div className="mt-4">
                    <img
                        src={getMainImageUrl(entity.images)}
                        alt={entity.name}
                        className="h-24 w-24 rounded-lg object-cover"
                    />
                </div>
            )}

            <div className="mt-6">
                {tabs.length > 1 ? (
                    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                ) : (
                    contactTabContent
                )}
            </div>
        </AppModule>
    );
}
