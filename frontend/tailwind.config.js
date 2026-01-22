/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // CITEON Brand Colors - Cyan/Blue gradient theme
                primary: {
                    50: '#e0f7ff',
                    100: '#b3e9ff',
                    200: '#80dbff',
                    300: '#4dcdff',
                    400: '#26c1ff',
                    500: '#00b4ff', // Main brand cyan
                    600: '#00a3e6',
                    700: '#008fcc',
                    800: '#007bb3',
                    900: '#005a85',
                },
                secondary: {
                    50: '#e6f0ff',
                    100: '#b3d1ff',
                    200: '#80b3ff',
                    300: '#4d94ff',
                    400: '#267aff',
                    500: '#0061ff', // Vibrant blue
                    600: '#0056e6',
                    700: '#004acc',
                    800: '#003fb3',
                    900: '#002e85',
                },
                accent: {
                    50: '#f0e6ff',
                    100: '#d1b3ff',
                    200: '#b380ff',
                    300: '#944dff',
                    400: '#7a26ff',
                    500: '#6100ff', // Purple accent
                    600: '#5600e6',
                    700: '#4a00cc',
                    800: '#3f00b3',
                    900: '#2e0085',
                },
                success: {
                    500: '#10b981',
                    600: '#059669',
                },
                warning: {
                    500: '#f59e0b',
                    600: '#d97706',
                },
                danger: {
                    500: '#ef4444',
                    600: '#dc2626',
                },
                dark: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'Inter', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(0, 180, 255, 0.3)',
                'glow-lg': '0 0 40px rgba(0, 180, 255, 0.4)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
