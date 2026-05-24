export function InputWrapper({ label, error, children, className }) {
    return (
        <div className={className}>
            {label && <label className="form-label">{label}</label>}
            {children}
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}
