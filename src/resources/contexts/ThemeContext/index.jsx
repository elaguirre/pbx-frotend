import React, { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext({});

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => localStorage.getItem('pbx_theme') || 'light');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('pbx_theme', theme);
    }, [theme]);

    function toggleTheme() {
        setTheme((current) => (current === 'light' ? 'dark' : 'light'));
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
