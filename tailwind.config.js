/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                },
                success: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    700: '#15803d',
                    800: '#166534',
                },
                warning: {
                    50: '#fffbeb',
                    100: '#fef3c7',
                    700: '#b45309',
                    800: '#92400e',
                },
                danger: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    700: '#b91c1c',
                    800: '#991b1b',
                },
                info: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    700: '#1d4ed8',
                    800: '#1e40af',
                },
            },
        },
    },
    safelist: [
        'bg-slate-50',
        'text-slate-700',
        {
            pattern: /bg-(primary|success|warning|danger|info|violet|sky|slate)-50/,
        },
        {
            pattern: /text-(primary|success|warning|danger|info|violet|sky|slate)-700/,
        },
    ],
    plugins: [],
};
