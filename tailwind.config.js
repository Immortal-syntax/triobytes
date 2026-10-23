/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '360px',
      },
      fontSize: {
        'base': ['1.125rem', { lineHeight: '1.75rem' }], // 18px min base
        'lg': ['1.25rem', { lineHeight: '1.875rem' }],   // 20px
        'xl': ['1.375rem', { lineHeight: '2rem' }],      // 22px
        '2xl': ['1.625rem', { lineHeight: '2.25rem' }],  // 26px
        '3xl': ['1.875rem', { lineHeight: '2.375rem' }],  // 30px
        '4xl': ['2.25rem', { lineHeight: '2.75rem' }],   // 36px
      },
      minHeight: {
        'touch': '56px',
        'button': '56px',
      },
      minWidth: {
        'touch': '56px',
        'button': '56px',
      },
      colors: {
        hospital: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
        },
        emergency: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
        }
      }
    },
  },
  plugins: [],
}
