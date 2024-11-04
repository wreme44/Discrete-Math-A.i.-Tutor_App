/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        color: theme('colors.white'),
                        h1: { color: theme('colors.white') },
                        h2: { color: theme('colors.white') },
                        h3: { color: theme('colors.white') },
                        h4: { color: theme('colors.white') },
                        h5: { color: theme('colors.white') },
                        h6: { color: theme('colors.white') },
                        strong: { color: theme('colors.white') },
                        code: { color: theme('colors.white') },
                        figcaption: { color: theme('colors.gray.400') },
                    },
                },
                dark: {
                    css: {
                        color: theme('colors.white'),
                        h1: { color: theme('colors.white') },
                        h2: { color: theme('colors.white') },
                        h3: { color: theme('colors.white') },
                        h4: { color: theme('colors.white') },
                        h5: { color: theme('colors.white') },
                        h6: { color: theme('colors.white') },
                        strong: { color: theme('colors.white') },
                        code: { color: theme('colors.white') },
                        figcaption: { color: theme('colors.gray.400') },
                    },
                },
            }),
        },
        screens: {
            'xxxsm': '240px',
            'xxsm': '320px',
            'xsm': '480px',
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
    darkMode: 'class',
}