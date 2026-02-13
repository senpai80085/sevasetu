/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2E7D61',    // Trusted Green
                secondary: '#E8F5E9',  // Soft Green
                background: '#F7FBF9', // Mint White
                surface: '#FFFFFF',    // Pure White
                accent: '#F2E9DC',     // Warm Beige
                alert: '#E9C46A',      // Soft Warning
                danger: '#D96C6C',     // Soft Red
                txtPrimary: '#1A1C1B', // Nearly Black
                txtSecondary: '#58625E',// Muted Green-Grey
                divider: '#E2E8E5',    // Soft Border
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                hindi: ['Noto Sans Devanagari', 'sans-serif'],
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
            },
            borderRadius: {
                'xl': '12px',
                '2xl': '16px',
            },
            maxWidth: {
                'mobile': '480px',
            }
        },
    },
    plugins: [],
}
