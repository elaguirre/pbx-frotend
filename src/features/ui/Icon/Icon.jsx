import classNames from 'classnames';

const sizes = {
    sm: 16,
    md: 20,
    lg: 24,
};

/**
 * Envoltorio de íconos Tabler con tamaños y estilos por defecto del proyecto.
 *
 * @example
 * import { IconShoppingCart } from '@tabler/icons-react';
 * <Icon icon={IconShoppingCart} size="md" />
 */
export function Icon({
    icon: IconComponent,
    size = 'md',
    stroke = 1.75,
    className,
    ...props
}) {
    if (!IconComponent) {
        return null;
    }

    const pixelSize = typeof size === 'number' ? size : sizes[size] ?? sizes.md;

    return (
        <IconComponent
            size={pixelSize}
            stroke={stroke}
            aria-hidden={props['aria-label'] ? undefined : true}
            className={classNames('shrink-0', className)}
            {...props}
        />
    );
}
