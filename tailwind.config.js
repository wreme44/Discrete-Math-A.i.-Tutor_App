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
              a: {
                color: theme('colors.blue.400'),
                '&:hover': {
                  color: theme('colors.blue.600'),
                },
              },
              h1: { color: theme('colors.white') },
              h2: { color: theme('colors.white') },
              h3: { color: theme('colors.white') },
              h4: { color: theme('colors.white') },
              h5: { color: theme('colors.white') },
              h6: { color: theme('colors.white') },
              strong: { color: theme('colors.white') },
              code: { color: theme('colors.white') },
              figcaption: { color: theme('colors.gray.400') },
              ul: {
                listStyleType: 'disc',
                color: theme('colors.gray.400'), // Style for bullet points
              },
              ol: {
                listStyleType: 'decimal',
                color: theme('colors.gray.400'), // Style for numbered lists
              },
              li: {
                color: theme('colors.gray.400'), // Style for list items
              },
            },
          },
          dark: {
            css: {
              color: theme('colors.white'),
              a: {
                color: theme('colors.blue.400'),
                '&:hover': {
                  color: theme('colors.blue.600'),
                },
              },
              h1: { color: theme('colors.white') },
              h2: { color: theme('colors.white') },
              h3: { color: theme('colors.white') },
              h4: { color: theme('colors.white') },
              h5: { color: theme('colors.white') },
              h6: { color: theme('colors.white') },
              strong: { color: theme('colors.white') },
              code: { color: theme('colors.white') },
              figcaption: { color: theme('colors.gray.400') },
              ul: {
                listStyleType: 'disc',
                color: theme('colors.gray.400'), // Style for bullet points
              },
              ol: {
                listStyleType: 'decimal',
                color: theme('colors.gray.400'), // Style for numbered lists
              },
              li: {
                color: theme('colors.gray.400'), // Style for list items
              },
            },
          },
        }),
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
    ],
    darkMode: 'class',
  }