// Tailwind runs as a PostCSS step so it sees the CSS that Sass produces
// (the Vite plugin does not process .scss output, leaving `@apply` untouched).
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
