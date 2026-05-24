import { Button } from './Button';

export function SaveButton({ loading, children = 'Guardar', ...props }) {
    return (
        <Button type="submit" loading={loading} {...props}>
            {children}
        </Button>
    );
}
