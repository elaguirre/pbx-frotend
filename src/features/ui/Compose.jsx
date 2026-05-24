import React from 'react';

export function Compose({ components = [], children }) {
    return components.reduceRight((child, Component) => <Component>{child}</Component>, children);
}
