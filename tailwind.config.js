import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: colors.blue,
                success: colors.green,
                warning: colors.amber,
                danger: colors.red,
                info: colors.sky,
            },
        },
    },
    safelist: [
        {
            pattern:
                /(bg|text|border)-(primary|success|warning|danger|info|violet|sky|slate)-(50|100|200|300|400|500|600|700|800|900|950)/,
        },
    ],
    plugins: [],
};
