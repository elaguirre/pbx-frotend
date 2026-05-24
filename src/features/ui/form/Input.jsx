import classNames from 'classnames';

export function Input({ label, error, className, id, ...props }) {
    const inputId = id || props.name;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={inputId} className="form-label">
                    {label}
                </label>
            )}
            <input id={inputId} className={classNames('form-input', error && 'form-input-error')} {...props} />
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}
