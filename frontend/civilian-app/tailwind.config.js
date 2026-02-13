/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary:      '#2E7D61',
        secondary:    '#8FBFA3',
        background:   '#F7FBF9',
        surface:      '#FFFFFF',
        accent:       '#F2E9DC',
        alert:        '#F6B042',
        danger:       '#D96C6C',
        txtPrimary:   '#2B2B2B',
        txtSecondary: '#5A5A5A',
        divider:      '#E4EFEA',
      },
      fontFamily: {
        sans:  ['Inter', 'Noto Sans Devanagari', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
      },
      fontSize: {
        body:    ['16px', { lineHeight: '1.6' }],
        button:  ['18px', { lineHeight: '1.5' }],
        heading: ['24px', { lineHeight: '1.4' }],
      },
      borderRadius: {
        xl:  '16px',
        '2xl': '20px',
      },
      maxWidth: {
        app: '480px',
      },
    },
  },
  plugins: [],
};
