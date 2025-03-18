/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './styles/**/*.css',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Red light district theme
        primary: {
          DEFAULT: '#FF0033',
          light: '#FF3355',
          dark: '#CC0022',
        },
        secondary: {
          DEFAULT: '#101010',
          light: '#202020',
          dark: '#0a0a0a',
        },
        accent: {
          DEFAULT: '#DD0033',
          light: '#FF1144',
          dark: '#990022',
        },
        midnight: {
          DEFAULT: '#121212',
          lighter: '#1a1a1a',
          darker: '#0a0a0a',
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: '#0A0A0A',
            a: {
              color: theme('colors.primary.DEFAULT'),
              '&:hover': {
                color: theme('colors.primary.dark'),
              },
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
        dark: {
          css: {
            color: '#E0E0E0',
            a: {
              color: theme('colors.primary.DEFAULT'),
              '&:hover': {
                color: theme('colors.primary.light'),
              },
            },
            h1: {
              color: '#FFFFFF',
            },
            h2: {
              color: '#FFFFFF',
            },
            h3: {
              color: '#FFFFFF',
            },
            h4: {
              color: '#FFFFFF',
            },
            code: {
              color: '#FFFFFF',
              backgroundColor: theme('colors.secondary.light'),
            },
            blockquote: {
              color: '#E0E0E0',
              borderLeftColor: theme('colors.primary.dark'),
            },
            strong: {
              color: theme('colors.primary.light'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
