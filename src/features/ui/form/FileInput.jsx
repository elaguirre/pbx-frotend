import classNames from 'classnames';

export function FileInput({ label, error, className, id, hint, previewUrl, accept = 'image/*', onChange, ...props }) {
    const inputId = id || props.name;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={inputId} className="form-label">
                    {label}
                </label>
            )}
            {previewUrl && (
                <img
                    src={previewUrl}
                    alt=""
                    className="mb-3 h-20 w-20 rounded-lg border border-slate-200 object-cover"
                />
            )}
            <input
                id={inputId}
                type="file"
                accept={accept}
                className={classNames(
                    'block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200',
                    error && 'form-input-error',
                )}
                onChange={onChange}
                {...props}
            />
            {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}
