import { useEffect, useId, useRef, useState } from 'react';
import { IconArrowBackUp, IconPhoto, IconTrash, IconUpload } from '@tabler/icons-react';
import classNames from 'classnames';
import { getMainImageUrl } from '@resources/helpers';
import { Button } from '../Button';

function revokeBlobUrl(url) {
    if (url?.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
}

export function ImageInput({
    label,
    images = [],
    onChange,
    error,
    hint,
    name = 'image',
    accept = 'image/*',
    className,
}) {
    const inputId = useId();
    const fileInputRef = useRef(null);
    const initialUrlRef = useRef(getMainImageUrl(images));
    const [file, setFile] = useState(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(() => initialUrlRef.current);

    useEffect(() => {
        return () => revokeBlobUrl(previewUrl);
    }, [previewUrl]);

    function notifyChange(nextFile, nextRemoveImage) {
        onChange?.({ file: nextFile, removeImage: nextRemoveImage });
    }

    const isDirty = file !== null || removeImage;
    const canDiscard = Boolean(previewUrl) || isDirty;
    const canRestore = isDirty;

    function handleLoadClick() {
        fileInputRef.current?.click();
    }

    function handleFileChange(event) {
        const selectedFile = event.target.files?.[0] ?? null;

        event.target.value = '';

        if (!selectedFile) {
            return;
        }

        revokeBlobUrl(previewUrl);
        setFile(selectedFile);
        setRemoveImage(false);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        notifyChange(selectedFile, false);
    }

    function handleDiscard() {
        const nextRemoveImage = Boolean(initialUrlRef.current);

        revokeBlobUrl(previewUrl);
        setFile(null);
        setRemoveImage(nextRemoveImage);
        setPreviewUrl(null);
        notifyChange(null, nextRemoveImage);
    }

    function handleRestore() {
        revokeBlobUrl(previewUrl);
        setFile(null);
        setRemoveImage(false);
        setPreviewUrl(initialUrlRef.current);
        notifyChange(null, false);
    }

    return (
        <div className={className}>
            {label && <label className="form-label">{label}</label>}

            <div
                className={classNames(
                    'flex flex-row gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4',
                    error && 'border-red-300',
                )}
            >
                <div className="flex justify-center w-2/3">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt=""
                            className="w-full rounded-lg border border-slate-200 object-cover"
                        />
                    ) : (
                        <div className="flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 bg-white text-slate-400">
                            <IconPhoto size={28} stroke={1.5} />
                            <span className="text-xs">Sin imagen</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col justify-center gap-2 w-1/3">
                    <Button type="button" variant="secondary" icon={IconUpload} onClick={handleLoadClick}>
                        Cargar
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        icon={IconTrash}
                        disabled={!canDiscard}
                        onClick={handleDiscard}
                    >
                        Descartar
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        icon={IconArrowBackUp}
                        disabled={!canRestore}
                        onClick={handleRestore}
                    >
                        Restaurar
                    </Button>
                </div>

                <input
                    ref={fileInputRef}
                    id={inputId}
                    type="file"
                    name={name}
                    accept={accept}
                    className="sr-only"
                    onChange={handleFileChange}
                />
            </div>

            {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}
