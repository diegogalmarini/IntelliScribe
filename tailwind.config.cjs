/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./index.tsx",
        "./App.tsx",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#2563eb',
                'primary-hover': '#1d4ed8',
                'background-light': '#f8fafc',
                'background-dark': '#111827',
                'surface-dark': '#1f2937',
                'surface-light': '#ffffff',
                'border-dark': '#232f48',
                'border-light': '#e2e8f0',
                'text-secondary': '#94a3b8',
                'card-dark': '#1f2937',
                'brand-violet': '#8B5CF6',
                'brand-blue': '#2563eb',
                'brand-green': '#D3E97A',
                'brand-grey': '#64748b',
            },
            fontFamily: {
                display: ['Inter', 'sans-serif'],
                sans: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-brand': 'linear-gradient(135deg, #2563eb 0%, #8B5CF6 100%)',
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
