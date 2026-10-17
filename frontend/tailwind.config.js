/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#006948",
        "on-primary": "#ffffff",
        "primary-container": "#00855d",
        "on-primary-container": "#f5fff7",
        "primary-fixed": "#85f8c4",
        "primary-fixed-dim": "#68dba9",
        "on-primary-fixed": "#002114",
        "on-primary-fixed-variant": "#005137",
        "inverse-primary": "#68dba9",

        "secondary": "#006398",
        "on-secondary": "#ffffff",
        "secondary-container": "#5bb8fe",
        "on-secondary-container": "#00476e",
        "secondary-fixed": "#cce5ff",
        "secondary-fixed-dim": "#93ccff",
        "on-secondary-fixed": "#001d31",
        "on-secondary-fixed-variant": "#004b73",

        "tertiary": "#006947",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#00855b",
        "on-tertiary-container": "#f5fff6",
        "tertiary-fixed": "#6ffbbe",
        "tertiary-fixed-dim": "#4edea3",
        "on-tertiary-fixed": "#002113",
        "on-tertiary-fixed-variant": "#005236",

        "surface": "#f8f9ff",
        "surface-dim": "#cbdbf5",
        "surface-bright": "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#3d4a42",
        "surface-variant": "#d3e4fe",
        "surface-tint": "#006c4a",
        "inverse-surface": "#213145",
        "inverse-on-surface": "#eaf1ff",

        "background": "#f8f9ff",
        "on-background": "#0b1c30",

        "outline": "#6d7a72",
        "outline-variant": "#bccac0",

        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        "gutter-mobile": "0.75rem",
        "gutter": "1.25rem",
        "margin-mobile": "1rem",
        "margin": "2rem"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "sans-serif"],
        "metric-val": ["Outfit", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "headline-sm": ["Outfit", "sans-serif"],
        "headline-md": ["Outfit", "sans-serif"],
        "headline-lg": ["Outfit", "sans-serif"],
        "headline-lg-mobile": ["Outfit", "sans-serif"],
        "display-hero": ["Outfit", "sans-serif"],
        "display-hero-mobile": ["Outfit", "sans-serif"]
      }
    }
  },
  plugins: []
}
