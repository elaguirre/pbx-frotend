import classNames from 'classnames';

export function Textarea({ label, error, className, id, ...props }) {
    const fieldId = id || props.name;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={fieldId} className="form-label">
                    {label}
                </label>
            )}
            <textarea
                id={fieldId}
                className={classNames('form-input min-h-[100px] resize-y', error && 'form-input-error')}
                {...props}
            />
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}
