/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './demo.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Sora',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      colors: {
        dark: '#110e1b',
        light: '#fcfcfc',
        support: '#b6bdcc',
        personal: '#ffe114',
        'primary-10': '#4df2c1',
        'primary-20': '#00eda6',
        'primary-30': '#00d595',
        'primary-40': '#00be85',
        'primary-50': '#00a674',
        'extra-input': '#443a70',
        'backdrop-alt-1': '#221c36',
        'backdrop-alt-2': '#30284c',
        'error-20': '#f65757',
        link: {
          DEFAULT: '#00eda6',
          active: '#4df2c1',
        },
      },
      borderRadius: {
        1: '0.25rem',
        2: '0.5rem',
        4: '1rem',
        6: '1.5rem',
      },
      maxWidth: {
        108: '27rem',
      },
      fontSize: {
        'caption-m': ['0.75rem', { lineHeight: '1.125rem' }],
        'caption-l': ['0.875rem', { lineHeight: '1.3125rem' }],
        body: ['1rem', { lineHeight: '1.5rem' }],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #eb02e2 0%, #2797ff 100%)',
      },
      transitionTimingFunction: {
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
};
