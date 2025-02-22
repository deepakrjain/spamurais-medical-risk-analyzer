# .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

```

# package.json

```json
{
  "name": "medical-risk-analyzer",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@testing-library/user-event": "^13.5.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}

```

# postcss.config.js

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

```

# public\favicon.ico

This is a binary file of the type: Binary

# public\index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Webcrumbs Plugin</title>
    <style>
      @import url(https://fonts.googleapis.com/css2?family=Poppins&display=swap);
      
      @import url(https://fonts.googleapis.com/css2?family=Roboto&display=swap);
      
      @import url(https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200);
      
      /*! tailwindcss v3.4.11 | MIT License | https://tailwindcss.com*/
      *,
      :after,
      :before {
        border: 0 solid #e5e7eb;
        box-sizing: border-box;
      }
      :after,
      :before {
        --tw-content: "";
      }
      :host,
      html {
        line-height: 1.5;
        -webkit-text-size-adjust: 100%;
        font-family:
          Poppins,
          ui-sans-serif,
          system-ui,
          sans-serif,
          Apple Color Emoji,
          Segoe UI Emoji,
          Segoe UI Symbol,
          Noto Color Emoji;
        font-feature-settings: normal;
        font-variation-settings: normal;
        -moz-tab-size: 4;
        tab-size: 4;
        -webkit-tap-highlight-color: transparent;
      }
      body {
        line-height: inherit;
        margin: 0;
      }
      hr {
        border-top-width: 1px;
        color: inherit;
        height: 0;
      }
      abbr:where([title]) {
        text-decoration: underline dotted;
      }
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font-size: inherit;
        font-weight: inherit;
      }
      a {
        color: inherit;
        text-decoration: inherit;
      }
      b,
      strong {
        font-weight: bolder;
      }
      code,
      kbd,
      pre,
      samp {
        font-family:
          ui-monospace,
          SFMono-Regular,
          Menlo,
          Monaco,
          Consolas,
          Liberation Mono,
          Courier New,
          monospace;
        font-feature-settings: normal;
        font-size: 1em;
        font-variation-settings: normal;
      }
      small {
        font-size: 80%;
      }
      sub,
      sup {
        font-size: 75%;
        line-height: 0;
        position: relative;
        vertical-align: baseline;
      }
      sub {
        bottom: -0.25em;
      }
      sup {
        top: -0.5em;
      }
      table {
        border-collapse: collapse;
        border-color: inherit;
        text-indent: 0;
      }
      button,
      input,
      optgroup,
      select,
      textarea {
        color: inherit;
        font-family: inherit;
        font-feature-settings: inherit;
        font-size: 100%;
        font-variation-settings: inherit;
        font-weight: inherit;
        letter-spacing: inherit;
        line-height: inherit;
        margin: 0;
        padding: 0;
      }
      button,
      select {
        text-transform: none;
      }
      button,
      input:where([type="button"]),
      input:where([type="reset"]),
      input:where([type="submit"]) {
        -webkit-appearance: button;
        background-color: transparent;
        background-image: none;
      }
      :-moz-focusring {
        outline: auto;
      }
      :-moz-ui-invalid {
        box-shadow: none;
      }
      progress {
        vertical-align: baseline;
      }
      ::-webkit-inner-spin-button,
      ::-webkit-outer-spin-button {
        height: auto;
      }
      [type="search"] {
        -webkit-appearance: textfield;
        outline-offset: -2px;
      }
      ::-webkit-search-decoration {
        -webkit-appearance: none;
      }
      ::-webkit-file-upload-button {
        -webkit-appearance: button;
        font: inherit;
      }
      summary {
        display: list-item;
      }
      blockquote,
      dd,
      dl,
      figure,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      hr,
      p,
      pre {
        margin: 0;
      }
      fieldset {
        margin: 0;
      }
      fieldset,
      legend {
        padding: 0;
      }
      menu,
      ol,
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      dialog {
        padding: 0;
      }
      textarea {
        resize: vertical;
      }
      input::placeholder,
      textarea::placeholder {
        color: #9ca3af;
        opacity: 1;
      }
      [role="button"],
      button {
        cursor: pointer;
      }
      :disabled {
        cursor: default;
      }
      audio,
      canvas,
      embed,
      iframe,
      img,
      object,
      svg,
      video {
        display: block;
        vertical-align: middle;
      }
      img,
      video {
        height: auto;
        max-width: 100%;
      }
      [hidden] {
        display: none;
      }
      *,
      :after,
      :before {
        --tw-border-spacing-x: 0;
        --tw-border-spacing-y: 0;
        --tw-translate-x: 0;
        --tw-translate-y: 0;
        --tw-rotate: 0;
        --tw-skew-x: 0;
        --tw-skew-y: 0;
        --tw-scale-x: 1;
        --tw-scale-y: 1;
        --tw-pan-x: ;
        --tw-pan-y: ;
        --tw-pinch-zoom: ;
        --tw-scroll-snap-strictness: proximity;
        --tw-gradient-from-position: ;
        --tw-gradient-via-position: ;
        --tw-gradient-to-position: ;
        --tw-ordinal: ;
        --tw-slashed-zero: ;
        --tw-numeric-figure: ;
        --tw-numeric-spacing: ;
        --tw-numeric-fraction: ;
        --tw-ring-inset: ;
        --tw-ring-offset-width: 0px;
        --tw-ring-offset-color: #fff;
        --tw-ring-color: rgba(59, 130, 246, 0.5);
        --tw-ring-offset-shadow: 0 0 #0000;
        --tw-ring-shadow: 0 0 #0000;
        --tw-shadow: 0 0 #0000;
        --tw-shadow-colored: 0 0 #0000;
        --tw-blur: ;
        --tw-brightness: ;
        --tw-contrast: ;
        --tw-grayscale: ;
        --tw-hue-rotate: ;
        --tw-invert: ;
        --tw-saturate: ;
        --tw-sepia: ;
        --tw-drop-shadow: ;
        --tw-backdrop-blur: ;
        --tw-backdrop-brightness: ;
        --tw-backdrop-contrast: ;
        --tw-backdrop-grayscale: ;
        --tw-backdrop-hue-rotate: ;
        --tw-backdrop-invert: ;
        --tw-backdrop-opacity: ;
        --tw-backdrop-saturate: ;
        --tw-backdrop-sepia: ;
        --tw-contain-size: ;
        --tw-contain-layout: ;
        --tw-contain-paint: ;
        --tw-contain-style: ;
      }
      ::backdrop {
        --tw-border-spacing-x: 0;
        --tw-border-spacing-y: 0;
        --tw-translate-x: 0;
        --tw-translate-y: 0;
        --tw-rotate: 0;
        --tw-skew-x: 0;
        --tw-skew-y: 0;
        --tw-scale-x: 1;
        --tw-scale-y: 1;
        --tw-pan-x: ;
        --tw-pan-y: ;
        --tw-pinch-zoom: ;
        --tw-scroll-snap-strictness: proximity;
        --tw-gradient-from-position: ;
        --tw-gradient-via-position: ;
        --tw-gradient-to-position: ;
        --tw-ordinal: ;
        --tw-slashed-zero: ;
        --tw-numeric-figure: ;
        --tw-numeric-spacing: ;
        --tw-numeric-fraction: ;
        --tw-ring-inset: ;
        --tw-ring-offset-width: 0px;
        --tw-ring-offset-color: #fff;
        --tw-ring-color: rgba(59, 130, 246, 0.5);
        --tw-ring-offset-shadow: 0 0 #0000;
        --tw-ring-shadow: 0 0 #0000;
        --tw-shadow: 0 0 #0000;
        --tw-shadow-colored: 0 0 #0000;
        --tw-blur: ;
        --tw-brightness: ;
        --tw-contrast: ;
        --tw-grayscale: ;
        --tw-hue-rotate: ;
        --tw-invert: ;
        --tw-saturate: ;
        --tw-sepia: ;
        --tw-drop-shadow: ;
        --tw-backdrop-blur: ;
        --tw-backdrop-brightness: ;
        --tw-backdrop-contrast: ;
        --tw-backdrop-grayscale: ;
        --tw-backdrop-hue-rotate: ;
        --tw-backdrop-invert: ;
        --tw-backdrop-opacity: ;
        --tw-backdrop-saturate: ;
        --tw-backdrop-sepia: ;
        --tw-contain-size: ;
        --tw-contain-layout: ;
        --tw-contain-paint: ;
        --tw-contain-style: ;
      }
      #webcrumbs .absolute {
        position: absolute;
      }
      #webcrumbs .relative {
        position: relative;
      }
      #webcrumbs .sticky {
        position: sticky;
      }
      #webcrumbs .left-1\/2 {
        left: 50%;
      }
      #webcrumbs .top-0 {
        top: 0;
      }
      #webcrumbs .top-1\/2 {
        top: 50%;
      }
      #webcrumbs .z-50 {
        z-index: 50;
      }
      #webcrumbs .mx-auto {
        margin-left: auto;
        margin-right: auto;
      }
      #webcrumbs .mb-2 {
        margin-bottom: 8px;
      }
      #webcrumbs .mb-4 {
        margin-bottom: 16px;
      }
      #webcrumbs .mb-6 {
        margin-bottom: 24px;
      }
      #webcrumbs .mb-8 {
        margin-bottom: 32px;
      }
      #webcrumbs .mt-20 {
        margin-top: 80px;
      }
      #webcrumbs .mt-4 {
        margin-top: 16px;
      }
      #webcrumbs .mt-8 {
        margin-top: 32px;
      }
      #webcrumbs .flex {
        display: flex;
      }
      #webcrumbs .grid {
        display: grid;
      }
      #webcrumbs .h-5 {
        height: 20px;
      }
      #webcrumbs .h-\[800px\] {
        height: 800px;
      }
      #webcrumbs .h-full {
        height: 100%;
      }
      #webcrumbs .w-5 {
        width: 20px;
      }
      #webcrumbs .w-\[1280px\] {
        width: 1280px;
      }
      #webcrumbs .w-\[800px\] {
        width: 800px;
      }
      #webcrumbs .w-full {
        width: 100%;
      }
      #webcrumbs .max-w-2xl {
        max-width: 42rem;
      }
      #webcrumbs .-translate-x-1\/2 {
        --tw-translate-x: -50%;
      }
      #webcrumbs .-translate-x-1\/2,
      #webcrumbs .-translate-y-1\/2 {
        transform: translate(var(--tw-translate-x), var(--tw-translate-y))
          rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
          scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
      }
      #webcrumbs .-translate-y-1\/2 {
        --tw-translate-y: -50%;
      }
      #webcrumbs .translate-y-0 {
        --tw-translate-y: 0px;
      }
      #webcrumbs .transform,
      #webcrumbs .translate-y-0 {
        transform: translate(var(--tw-translate-x), var(--tw-translate-y))
          rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
          scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
      }
      @keyframes bounce {
        0%,
        to {
          animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          transform: translateY(-25%);
        }
        50% {
          animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          transform: none;
        }
      }
      #webcrumbs .animate-bounce {
        animation: bounce 1s infinite;
      }
      #webcrumbs .cursor-pointer {
        cursor: pointer;
      }
      #webcrumbs .grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      #webcrumbs .grid-cols-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      #webcrumbs .flex-row {
        flex-direction: row;
      }
      #webcrumbs .items-center {
        align-items: center;
      }
      #webcrumbs .justify-between {
        justify-content: space-between;
      }
      #webcrumbs .gap-2 {
        gap: 8px;
      }
      #webcrumbs .gap-4 {
        gap: 16px;
      }
      #webcrumbs .gap-8 {
        gap: 32px;
      }
      #webcrumbs :is(.space-y-6 > :not([hidden]) ~ :not([hidden])) {
        --tw-space-y-reverse: 0;
        margin-bottom: calc(24px * var(--tw-space-y-reverse));
        margin-top: calc(24px * (1 - var(--tw-space-y-reverse)));
      }
      #webcrumbs .overflow-hidden {
        overflow: hidden;
      }
      #webcrumbs .rounded {
        border-radius: 12px;
      }
      #webcrumbs .rounded-2xl {
        border-radius: 48px;
      }
      #webcrumbs .rounded-full {
        border-radius: 9999px;
      }
      #webcrumbs .rounded-lg {
        border-radius: 24px;
      }
      #webcrumbs .rounded-xl {
        border-radius: 36px;
      }
      #webcrumbs .border {
        border-width: 1px;
      }
      #webcrumbs .border-b {
        border-bottom-width: 1px;
      }
      #webcrumbs .bg-blue-600 {
        --tw-bg-opacity: 1;
        background-color: rgb(37 99 235 / var(--tw-bg-opacity));
      }
      #webcrumbs .bg-gray-50\/80 {
        background-color: rgba(249, 250, 251, 0.8);
      }
      #webcrumbs .bg-white\/80 {
        background-color: hsla(0, 0%, 100%, 0.8);
      }
      #webcrumbs .bg-white\/90 {
        background-color: hsla(0, 0%, 100%, 0.9);
      }
      #webcrumbs .bg-gradient-to-b {
        background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
      }
      #webcrumbs .from-blue-50 {
        --tw-gradient-from: #eff6ff var(--tw-gradient-from-position);
        --tw-gradient-to: rgba(239, 246, 255, 0) var(--tw-gradient-to-position);
        --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
      }
      #webcrumbs .to-white {
        --tw-gradient-to: #fff var(--tw-gradient-to-position);
      }
      #webcrumbs .p-6 {
        padding: 24px;
      }
      #webcrumbs .p-8 {
        padding: 32px;
      }
      #webcrumbs .px-4 {
        padding-left: 16px;
        padding-right: 16px;
      }
      #webcrumbs .px-6 {
        padding-left: 24px;
        padding-right: 24px;
      }
      #webcrumbs .px-8 {
        padding-left: 32px;
        padding-right: 32px;
      }
      #webcrumbs .py-12 {
        padding-bottom: 48px;
        padding-top: 48px;
      }
      #webcrumbs .py-2 {
        padding-bottom: 8px;
        padding-top: 8px;
      }
      #webcrumbs .py-3 {
        padding-bottom: 12px;
        padding-top: 12px;
      }
      #webcrumbs .py-4 {
        padding-bottom: 16px;
        padding-top: 16px;
      }
      #webcrumbs .text-center {
        text-align: center;
      }
      #webcrumbs .font-sans {
        font-family:
          Poppins,
          ui-sans-serif,
          system-ui,
          sans-serif,
          Apple Color Emoji,
          Segoe UI Emoji,
          Segoe UI Symbol,
          Noto Color Emoji;
      }
      #webcrumbs .text-2xl {
        font-size: 24px;
        line-height: 31.200000000000003px;
      }
      #webcrumbs .text-3xl {
        font-size: 30px;
        line-height: 36px;
      }
      #webcrumbs .text-5xl {
        font-size: 48px;
        line-height: 52.800000000000004px;
      }
      #webcrumbs .text-6xl {
        font-size: 60px;
        line-height: 66px;
      }
      #webcrumbs .text-lg {
        font-size: 18px;
        line-height: 27px;
      }
      #webcrumbs .text-xl {
        font-size: 20px;
        line-height: 28px;
      }
      #webcrumbs .font-bold {
        font-weight: 700;
      }
      #webcrumbs .font-semibold {
        font-weight: 600;
      }
      #webcrumbs .text-blue-600 {
        --tw-text-opacity: 1;
        color: rgb(37 99 235 / var(--tw-text-opacity));
      }
      #webcrumbs .text-white {
        --tw-text-opacity: 1;
        color: rgb(255 255 255 / var(--tw-text-opacity));
      }
      #webcrumbs .opacity-100 {
        opacity: 1;
      }
      #webcrumbs .shadow-lg {
        --tw-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
          0 4px 6px -4px rgba(0, 0, 0, 0.1);
        --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color),
          0 4px 6px -4px var(--tw-shadow-color);
        box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
          var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
      }
      #webcrumbs .outline-none {
        outline: 2px solid transparent;
        outline-offset: 2px;
      }
      #webcrumbs .backdrop-blur-md {
        --tw-backdrop-blur: blur(12px);
      }
      #webcrumbs .backdrop-blur-md,
      #webcrumbs .backdrop-blur-sm {
        -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness)
          var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale)
          var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert)
          var(--tw-backdrop-opacity) var(--tw-backdrop-saturate)
          var(--tw-backdrop-sepia);
        backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness)
          var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale)
          var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert)
          var(--tw-backdrop-opacity) var(--tw-backdrop-saturate)
          var(--tw-backdrop-sepia);
      }
      #webcrumbs .backdrop-blur-sm {
        --tw-backdrop-blur: blur(4px);
      }
      #webcrumbs .transition-all {
        transition-duration: 0.15s;
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }
      #webcrumbs .transition-colors {
        transition-duration: 0.15s;
        transition-property: color, background-color, border-color,
          text-decoration-color, fill, stroke;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }
      #webcrumbs .transition-transform {
        transition-duration: 0.15s;
        transition-property: transform;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }
      #webcrumbs .duration-1000 {
        transition-duration: 1s;
      }
      #webcrumbs .duration-300 {
        transition-duration: 0.3s;
      }
      #webcrumbs .duration-500 {
        transition-duration: 0.5s;
      }
      #webcrumbs {
        font-family: Roboto !important;
        font-size: 16px !important;
      }
      #webcrumbs .hover\:-translate-y-0\.5:hover {
        --tw-translate-y: -2px;
      }
      #webcrumbs .hover\:-translate-y-0\.5:hover,
      #webcrumbs .hover\:-translate-y-2:hover {
        transform: translate(var(--tw-translate-x), var(--tw-translate-y))
          rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
          scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
      }
      #webcrumbs .hover\:-translate-y-2:hover {
        --tw-translate-y: -8px;
      }
      #webcrumbs .hover\:scale-105:hover {
        --tw-scale-x: 1.05;
        --tw-scale-y: 1.05;
        transform: translate(var(--tw-translate-x), var(--tw-translate-y))
          rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
          scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
      }
      #webcrumbs .hover\:border-blue-300:hover {
        --tw-border-opacity: 1;
        border-color: rgb(147 197 253 / var(--tw-border-opacity));
      }
      #webcrumbs .hover\:bg-blue-700:hover {
        --tw-bg-opacity: 1;
        background-color: rgb(29 78 216 / var(--tw-bg-opacity));
      }
      #webcrumbs .hover\:bg-gray-50:hover {
        --tw-bg-opacity: 1;
        background-color: rgb(249 250 251 / var(--tw-bg-opacity));
      }
      #webcrumbs .hover\:text-blue-600:hover {
        --tw-text-opacity: 1;
        color: rgb(37 99 235 / var(--tw-text-opacity));
      }
      #webcrumbs .hover\:shadow-2xl:hover {
        --tw-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        --tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);
      }
      #webcrumbs .hover\:shadow-2xl:hover,
      #webcrumbs .hover\:shadow-lg:hover {
        box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
          var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
      }
      #webcrumbs .hover\:shadow-lg:hover {
        --tw-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
          0 4px 6px -4px rgba(0, 0, 0, 0.1);
        --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color),
          0 4px 6px -4px var(--tw-shadow-color);
      }
      #webcrumbs .hover\:shadow-xl:hover {
        --tw-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
          0 8px 10px -6px rgba(0, 0, 0, 0.1);
        --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color),
          0 8px 10px -6px var(--tw-shadow-color);
        box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
          var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
      }
      #webcrumbs .focus\:ring-2:focus {
        --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
          var(--tw-ring-offset-width) var(--tw-ring-offset-color);
        --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
          calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
        box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
          var(--tw-shadow, 0 0 #0000);
      }
      #webcrumbs .focus\:ring-blue-500:focus {
        --tw-ring-opacity: 1;
        --tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity));
      }
      #webcrumbs :is(.group:hover .group-hover\:rotate-12) {
        --tw-rotate: 12deg;
        transform: translate(var(--tw-translate-x), var(--tw-translate-y))
          rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
          scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
      }
      #webcrumbs :is(.group:hover .group-hover\:scale-110) {
        --tw-scale-x: 1.1;
        --tw-scale-y: 1.1;
        transform: translate(var(--tw-translate-x), var(--tw-translate-y))
          rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
          scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
      }
      #webcrumbs :is(.group:hover .group-hover\:text-blue-600) {
        --tw-text-opacity: 1;
        color: rgb(37 99 235 / var(--tw-text-opacity));
      }
      #webcrumbs :is(.group:hover .group-hover\:ring-2) {
        --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
          var(--tw-ring-offset-width) var(--tw-ring-offset-color);
        --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
          calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
        box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
          var(--tw-shadow, 0 0 #0000);
      }
      #webcrumbs :is(.group:hover .group-hover\:ring-blue-300) {
        --tw-ring-opacity: 1;
        --tw-ring-color: rgb(147 197 253 / var(--tw-ring-opacity));
      }
      
      body {
        line-height: inherit;
        padding: 24px;
        display: flex;
        flex-direction: column;
        min-width: 100vw;
        min-height: 100vh;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #ffffff, #d4d4d4);
      }
    </style>
  </head>
  <body>
    <div id="webcrumbs"><div class="w-[1280px] font-sans relative overflow-hidden"> <div class="absolute w-full h-full bg-gradient-to-b from-blue-50 to-white"> <div class="absolute w-[800px] h-[800px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[url(&#x27;https://images.unsplash.com/photo-1584982751601-97dcc096659c&#x27;)] bg-cover bg-center opacity-10 transform rotate-12 scale-150 transition-transform duration-1000"></div> </div> <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md py-4 border-b"> <div class="flex items-center justify-between px-8"> <div class="flex items-center gap-2 group"> <span class="material-symbols-outlined text-blue-600 text-3xl group-hover:rotate-12 transition-transform">medical_services</span> <h1 class="text-xl font-bold group-hover:text-blue-600 transition-colors">MedRisk AI</h1> </div> <div class="flex items-center gap-8"> <a class="hover:text-blue-600 transition-colors hover:-translate-y-0.5">Home</a> <a class="hover:text-blue-600 transition-colors hover:-translate-y-0.5">Take Assessment</a> <a class="hover:text-blue-600 transition-colors hover:-translate-y-0.5">Dashboard</a> <button class="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all hover:shadow-lg hover:scale-105">Login</button> </div> </div> </nav> <main class="px-8 py-12"> <section class="text-center transform translate-y-0 opacity-100 transition-all duration-1000"> <h1 class="text-6xl font-bold mb-6 animate-fadeIn">AI-Powered Medical Risk Analyzer</h1> <p class="text-xl mb-8 max-w-2xl mx-auto animate-slideUp">Advanced artificial intelligence to analyze your health risks and provide personalized insights for better healthcare decisions.</p> <button class="bg-blue-600 text-white px-8 py-3 rounded-full text-lg hover:bg-blue-700 transition-all transform hover:scale-105 hover:shadow-xl animate-bounce">Take Assessment</button> </section> <section class="mt-20 grid grid-cols-3 gap-8"> <div class="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"> <span class="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">assessment</span> <h2 class="text-2xl font-bold mt-4 mb-2">Risk Assessment</h2> <p>Advanced AI algorithms analyze your health data to identify potential risks.</p> </div> <div class="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"> <span class="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">analytics</span> <h2 class="text-2xl font-bold mt-4 mb-2">Health Analytics</h2> <p>Comprehensive analysis of your health metrics with detailed insights.</p> </div> <div class="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"> <span class="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">medication</span> <h2 class="text-2xl font-bold mt-4 mb-2">Personalized Care</h2> <p>Tailored recommendations based on your unique health profile.</p> </div> </section> <section class="mt-20 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg transform transition-all duration-500 hover:shadow-2xl"> <h2 class="text-3xl font-bold mb-8">Quick Assessment</h2> <div class="space-y-6"> <div class="bg-gray-50/80 backdrop-blur-sm p-6 rounded-xl transition-all duration-300 hover:bg-gray-50"> <h3 class="text-xl font-semibold mb-4">Basic Information</h3> <div class="grid grid-cols-2 gap-4"> <input type="text" placeholder="Age" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 hover:border-blue-300"/> <select class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 hover:border-blue-300"> <option>Select Gender</option> <option>Male</option> <option>Female</option> <option>Other</option> </select> </div> </div> <div class="bg-gray-50/80 backdrop-blur-sm p-6 rounded-xl transition-all duration-300 hover:bg-gray-50"> <h3 class="text-xl font-semibold mb-4">Symptoms</h3> <div class="grid grid-cols-2 gap-4"> <label class="flex items-center gap-2 cursor-pointer group"> <input type="checkbox" class="w-5 h-5 rounded text-blue-600 transition-all duration-300 group-hover:ring-2 group-hover:ring-blue-300"/> <span class="group-hover:text-blue-600 transition-colors">Headache</span> </label> <label class="flex items-center gap-2 cursor-pointer group"> <input type="checkbox" class="w-5 h-5 rounded text-blue-600 transition-all duration-300 group-hover:ring-2 group-hover:ring-blue-300"/> <span class="group-hover:text-blue-600 transition-colors">Fever</span> </label> </div> </div> </div> <button class="mt-8 bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-all transform hover:scale-105 hover:shadow-xl">Continue Assessment</button> </section> </main> </div></div>


  </body>
</html>
```

# public\logo192.png

This is a binary file of the type: Image

# public\logo512.png

This is a binary file of the type: Image

# public\manifest.json

```json
{
  "short_name": "React App",
  "name": "Create React App Sample",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}

```

# public\robots.txt

```txt
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:

```

# README.md

```md
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

```

# src\App.css

```css
.App {
  text-align: center;
}

.App-logo {
  height: 40vmin;
  pointer-events: none;
}

@media (prefers-reduced-motion: no-preference) {
  .App-logo {
    animation: App-logo-spin infinite 20s linear;
  }
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

.App-link {
  color: #61dafb;
}

@keyframes App-logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

```

# src\App.js

```js
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;

```

# src\App.test.js

```js
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

```

# src\components\Dashboard.js

```js
export default function Dashboard() {
    return (
      <div className="p-6 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="dashboard-container mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Patient Risk Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-gray-600 hover:text-blue-600 cursor-pointer">notifications</span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">person</span>
                <span className="font-medium">Dr. Smith</span>
              </div>
            </div>
          </div>
        </div>
  
        {/* Risk Metrics */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="risk-card bg-green-50">
            <h3 className="text-4xl font-bold text-green-600 mb-2">45%</h3>
            <p className="text-gray-600 uppercase text-sm font-medium">Low Risk Patients</p>
          </div>
          <div className="risk-card bg-red-50">
            <h3 className="text-4xl font-bold text-red-600 mb-2">15%</h3>
            <p className="text-gray-600 uppercase text-sm font-medium">High Risk Patients</p>
          </div>
        </div>
  
        {/* Actions */}
        <div className="dashboard-container">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button className="secondary-btn">
              <span className="material-symbols-outlined">description</span>
              Export Report
            </button>
            <button className="secondary-btn">
              <span className="material-symbols-outlined">calendar_month</span>
              Schedule Follow-up
            </button>
          </div>
        </div>
      </div>
    );
  }
```

# src\components\Home.js

```js
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="hero-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navbar */}
        <nav className="navbar flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-600 text-4xl">medical_services</span>
            <h1 className="text-2xl font-bold text-gray-900">MedRisk AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <Link to="/assessment" className="hover:text-blue-600">Assessment</Link>
            <Link to="/dashboard" className="primary-btn">
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="text-center mb-20">
          <h1 className="mb-6">AI-Powered Medical Risk Analysis</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Advanced predictive analytics for early detection of health risks using machine learning models
          </p>
          <Link to="/assessment" className="primary-btn text-lg px-10 py-4">
            Start Risk Assessment
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="feature-card">
            <div className="text-blue-600 text-4xl mb-4">
              <span className="material-symbols-outlined">clinical_notes</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Comprehensive Analysis</h3>
            <p className="text-gray-600">Multi-factor risk assessment using latest medical research</p>
          </div>
          <div className="feature-card">
            <div className="text-blue-600 text-4xl mb-4">
              <span className="material-symbols-outlined">monitor_heart</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Monitoring</h3>
            <p className="text-gray-600">Track health metrics and risk factors over time</p>
          </div>
          <div className="feature-card">
            <div className="text-blue-600 text-4xl mb-4">
              <span className="material-symbols-outlined">security</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">HIPAA Compliant</h3>
            <p className="text-gray-600">Secure patient data with enterprise-grade encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

# src\components\ui\button.js

```js
export const Button = ({ className, children, ...props }) => (
    <button 
      className={`px-4 py-2 rounded-lg transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
```

# src\index.css

```css
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

```

# src\index.js

```js
import React from "react";

import "./style.css";

export const MyPlugin = () => {
  return (
    <div id="webcrumbs"> 
            	<div className="w-[1280px] font-sans relative overflow-hidden">
    	  <div className="absolute w-full h-full bg-gradient-to-b from-blue-50 to-white">
    	    <div className="absolute w-[800px] h-[800px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[url('https://images.unsplash.com/photo-1584982751601-97dcc096659c')] bg-cover bg-center opacity-10 transform rotate-12 scale-150 transition-transform duration-1000" />
    	  </div>
    	
    	  <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md py-4 border-b">
    	    <div className="flex items-center justify-between px-8">
    	      <div className="flex items-center gap-2 group">
    	        <span className="material-symbols-outlined text-blue-600 text-3xl group-hover:rotate-12 transition-transform">medical_services</span>
    	        <h1 className="text-xl font-bold group-hover:text-blue-600 transition-colors">MedRisk AI</h1>
    	      </div>
    	      <div className="flex items-center gap-8">
    	        <a className="hover:text-blue-600 transition-colors hover:-translate-y-0.5">Home</a>
    	        <a className="hover:text-blue-600 transition-colors hover:-translate-y-0.5">Take Assessment</a>
    	        <a className="hover:text-blue-600 transition-colors hover:-translate-y-0.5">Dashboard</a>
    	        <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all hover:shadow-lg hover:scale-105">Login</button>
    	      </div>
    	    </div>
    	  </nav>
    	
    	  <main className="px-8 py-12">
    	    <section className="text-center transform translate-y-0 opacity-100 transition-all duration-1000">
    	      <h1 className="text-6xl font-bold mb-6 animate-fadeIn">AI-Powered Medical Risk Analyzer</h1>
    	      <p className="text-xl mb-8 max-w-2xl mx-auto animate-slideUp">Advanced artificial intelligence to analyze your health risks and provide personalized insights for better healthcare decisions.</p>
    	      <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg hover:bg-blue-700 transition-all transform hover:scale-105 hover:shadow-xl animate-bounce">Take Assessment</button>
    	    </section>
    	
    	    <section className="mt-20 grid grid-cols-3 gap-8">
    	      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
    	        <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">assessment</span>
    	        <h2 className="text-2xl font-bold mt-4 mb-2">Risk Assessment</h2>
    	        <p>Advanced AI algorithms analyze your health data to identify potential risks.</p>
    	      </div>
    	      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
    	        <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">analytics</span>
    	        <h2 className="text-2xl font-bold mt-4 mb-2">Health Analytics</h2>
    	        <p>Comprehensive analysis of your health metrics with detailed insights.</p>
    	      </div>
    	      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
    	        <span className="material-symbols-outlined text-5xl text-blue-600 group-hover:scale-110 transition-transform">medication</span>
    	        <h2 className="text-2xl font-bold mt-4 mb-2">Personalized Care</h2>
    	        <p>Tailored recommendations based on your unique health profile.</p>
    	      </div>
    	    </section>
    	
    	    <section className="mt-20 bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg transform transition-all duration-500 hover:shadow-2xl">
    	      <h2 className="text-3xl font-bold mb-8">Quick Assessment</h2>
    	      <div className="space-y-6">
    	        <div className="bg-gray-50/80 backdrop-blur-sm p-6 rounded-xl transition-all duration-300 hover:bg-gray-50">
    	          <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
    	          <div className="grid grid-cols-2 gap-4">
    	            <input type="text" placeholder="Age" className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 hover:border-blue-300" />
    	            <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 hover:border-blue-300">
    	              <option>Select Gender</option>
    	              <option>Male</option>
    	              <option>Female</option>
    	              <option>Other</option>
    	            </select>
    	          </div>
    	        </div>
    	        <div className="bg-gray-50/80 backdrop-blur-sm p-6 rounded-xl transition-all duration-300 hover:bg-gray-50">
    	          <h3 className="text-xl font-semibold mb-4">Symptoms</h3>
    	          <div className="grid grid-cols-2 gap-4">
    	            <label className="flex items-center gap-2 cursor-pointer group">
    	              <input type="checkbox" className="w-5 h-5 rounded text-blue-600 transition-all duration-300 group-hover:ring-2 group-hover:ring-blue-300" />
    	              <span className="group-hover:text-blue-600 transition-colors">Headache</span>
    	            </label>
    	            <label className="flex items-center gap-2 cursor-pointer group">
    	              <input type="checkbox" className="w-5 h-5 rounded text-blue-600 transition-all duration-300 group-hover:ring-2 group-hover:ring-blue-300" />
    	              <span className="group-hover:text-blue-600 transition-colors">Fever</span>
    	            </label>
    	          </div>
    	        </div>
    	      </div>
    	      <button className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-all transform hover:scale-105 hover:shadow-xl">Continue Assessment</button>
    	    </section>
    	  </main>
    	</div> 
            </div>
  )
}
```

# src\logo.svg

This is a file of the type: SVG Image

# src\reportWebVitals.js

```js
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;

```

# src\setupTests.js

```js
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

```

# src\style.css

```css
@import url(https://fonts.googleapis.com/css2?family=Poppins&display=swap);

@import url(https://fonts.googleapis.com/css2?family=Roboto&display=swap);

@import url(https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200);

/*! tailwindcss v3.4.11 | MIT License | https://tailwindcss.com*/
*,
:after,
:before {
  border: 0 solid #e5e7eb;
  box-sizing: border-box;
}
:after,
:before {
  --tw-content: "";
}
:host,
html {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  font-family:
    Poppins,
    ui-sans-serif,
    system-ui,
    sans-serif,
    Apple Color Emoji,
    Segoe UI Emoji,
    Segoe UI Symbol,
    Noto Color Emoji;
  font-feature-settings: normal;
  font-variation-settings: normal;
  -moz-tab-size: 4;
  tab-size: 4;
  -webkit-tap-highlight-color: transparent;
}
body {
  line-height: inherit;
  margin: 0;
}
hr {
  border-top-width: 1px;
  color: inherit;
  height: 0;
}
abbr:where([title]) {
  text-decoration: underline dotted;
}
h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}
a {
  color: inherit;
  text-decoration: inherit;
}
b,
strong {
  font-weight: bolder;
}
code,
kbd,
pre,
samp {
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    Liberation Mono,
    Courier New,
    monospace;
  font-feature-settings: normal;
  font-size: 1em;
  font-variation-settings: normal;
}
small {
  font-size: 80%;
}
sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}
sub {
  bottom: -0.25em;
}
sup {
  top: -0.5em;
}
table {
  border-collapse: collapse;
  border-color: inherit;
  text-indent: 0;
}
button,
input,
optgroup,
select,
textarea {
  color: inherit;
  font-family: inherit;
  font-feature-settings: inherit;
  font-size: 100%;
  font-variation-settings: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  line-height: inherit;
  margin: 0;
  padding: 0;
}
button,
select {
  text-transform: none;
}
button,
input:where([type="button"]),
input:where([type="reset"]),
input:where([type="submit"]) {
  -webkit-appearance: button;
  background-color: transparent;
  background-image: none;
}
:-moz-focusring {
  outline: auto;
}
:-moz-ui-invalid {
  box-shadow: none;
}
progress {
  vertical-align: baseline;
}
::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}
[type="search"] {
  -webkit-appearance: textfield;
  outline-offset: -2px;
}
::-webkit-search-decoration {
  -webkit-appearance: none;
}
::-webkit-file-upload-button {
  -webkit-appearance: button;
  font: inherit;
}
summary {
  display: list-item;
}
blockquote,
dd,
dl,
figure,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
p,
pre {
  margin: 0;
}
fieldset {
  margin: 0;
}
fieldset,
legend {
  padding: 0;
}
menu,
ol,
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
dialog {
  padding: 0;
}
textarea {
  resize: vertical;
}
input::placeholder,
textarea::placeholder {
  color: #9ca3af;
  opacity: 1;
}
[role="button"],
button {
  cursor: pointer;
}
:disabled {
  cursor: default;
}
audio,
canvas,
embed,
iframe,
img,
object,
svg,
video {
  display: block;
  vertical-align: middle;
}
img,
video {
  height: auto;
  max-width: 100%;
}
[hidden] {
  display: none;
}
*,
:after,
:before {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x: ;
  --tw-pan-y: ;
  --tw-pinch-zoom: ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position: ;
  --tw-gradient-via-position: ;
  --tw-gradient-to-position: ;
  --tw-ordinal: ;
  --tw-slashed-zero: ;
  --tw-numeric-figure: ;
  --tw-numeric-spacing: ;
  --tw-numeric-fraction: ;
  --tw-ring-inset: ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur: ;
  --tw-brightness: ;
  --tw-contrast: ;
  --tw-grayscale: ;
  --tw-hue-rotate: ;
  --tw-invert: ;
  --tw-saturate: ;
  --tw-sepia: ;
  --tw-drop-shadow: ;
  --tw-backdrop-blur: ;
  --tw-backdrop-brightness: ;
  --tw-backdrop-contrast: ;
  --tw-backdrop-grayscale: ;
  --tw-backdrop-hue-rotate: ;
  --tw-backdrop-invert: ;
  --tw-backdrop-opacity: ;
  --tw-backdrop-saturate: ;
  --tw-backdrop-sepia: ;
  --tw-contain-size: ;
  --tw-contain-layout: ;
  --tw-contain-paint: ;
  --tw-contain-style: ;
}
::backdrop {
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x: ;
  --tw-pan-y: ;
  --tw-pinch-zoom: ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position: ;
  --tw-gradient-via-position: ;
  --tw-gradient-to-position: ;
  --tw-ordinal: ;
  --tw-slashed-zero: ;
  --tw-numeric-figure: ;
  --tw-numeric-spacing: ;
  --tw-numeric-fraction: ;
  --tw-ring-inset: ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur: ;
  --tw-brightness: ;
  --tw-contrast: ;
  --tw-grayscale: ;
  --tw-hue-rotate: ;
  --tw-invert: ;
  --tw-saturate: ;
  --tw-sepia: ;
  --tw-drop-shadow: ;
  --tw-backdrop-blur: ;
  --tw-backdrop-brightness: ;
  --tw-backdrop-contrast: ;
  --tw-backdrop-grayscale: ;
  --tw-backdrop-hue-rotate: ;
  --tw-backdrop-invert: ;
  --tw-backdrop-opacity: ;
  --tw-backdrop-saturate: ;
  --tw-backdrop-sepia: ;
  --tw-contain-size: ;
  --tw-contain-layout: ;
  --tw-contain-paint: ;
  --tw-contain-style: ;
}
#webcrumbs .absolute {
  position: absolute;
}
#webcrumbs .relative {
  position: relative;
}
#webcrumbs .sticky {
  position: sticky;
}
#webcrumbs .left-1\/2 {
  left: 50%;
}
#webcrumbs .top-0 {
  top: 0;
}
#webcrumbs .top-1\/2 {
  top: 50%;
}
#webcrumbs .z-50 {
  z-index: 50;
}
#webcrumbs .mx-auto {
  margin-left: auto;
  margin-right: auto;
}
#webcrumbs .mb-2 {
  margin-bottom: 8px;
}
#webcrumbs .mb-4 {
  margin-bottom: 16px;
}
#webcrumbs .mb-6 {
  margin-bottom: 24px;
}
#webcrumbs .mb-8 {
  margin-bottom: 32px;
}
#webcrumbs .mt-20 {
  margin-top: 80px;
}
#webcrumbs .mt-4 {
  margin-top: 16px;
}
#webcrumbs .mt-8 {
  margin-top: 32px;
}
#webcrumbs .flex {
  display: flex;
}
#webcrumbs .grid {
  display: grid;
}
#webcrumbs .h-5 {
  height: 20px;
}
#webcrumbs .h-\[800px\] {
  height: 800px;
}
#webcrumbs .h-full {
  height: 100%;
}
#webcrumbs .w-5 {
  width: 20px;
}
#webcrumbs .w-\[1280px\] {
  width: 1280px;
}
#webcrumbs .w-\[800px\] {
  width: 800px;
}
#webcrumbs .w-full {
  width: 100%;
}
#webcrumbs .max-w-2xl {
  max-width: 42rem;
}
#webcrumbs .-translate-x-1\/2 {
  --tw-translate-x: -50%;
}
#webcrumbs .-translate-x-1\/2,
#webcrumbs .-translate-y-1\/2 {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
#webcrumbs .-translate-y-1\/2 {
  --tw-translate-y: -50%;
}
#webcrumbs .translate-y-0 {
  --tw-translate-y: 0px;
}
#webcrumbs .transform,
#webcrumbs .translate-y-0 {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
@keyframes bounce {
  0%,
  to {
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    transform: translateY(-25%);
  }
  50% {
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    transform: none;
  }
}
#webcrumbs .animate-bounce {
  animation: bounce 1s infinite;
}
#webcrumbs .cursor-pointer {
  cursor: pointer;
}
#webcrumbs .grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
#webcrumbs .grid-cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
#webcrumbs .flex-row {
  flex-direction: row;
}
#webcrumbs .items-center {
  align-items: center;
}
#webcrumbs .justify-between {
  justify-content: space-between;
}
#webcrumbs .gap-2 {
  gap: 8px;
}
#webcrumbs .gap-4 {
  gap: 16px;
}
#webcrumbs .gap-8 {
  gap: 32px;
}
#webcrumbs :is(.space-y-6 > :not([hidden]) ~ :not([hidden])) {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(24px * var(--tw-space-y-reverse));
  margin-top: calc(24px * (1 - var(--tw-space-y-reverse)));
}
#webcrumbs .overflow-hidden {
  overflow: hidden;
}
#webcrumbs .rounded {
  border-radius: 12px;
}
#webcrumbs .rounded-2xl {
  border-radius: 48px;
}
#webcrumbs .rounded-full {
  border-radius: 9999px;
}
#webcrumbs .rounded-lg {
  border-radius: 24px;
}
#webcrumbs .rounded-xl {
  border-radius: 36px;
}
#webcrumbs .border {
  border-width: 1px;
}
#webcrumbs .border-b {
  border-bottom-width: 1px;
}
#webcrumbs .bg-blue-600 {
  --tw-bg-opacity: 1;
  background-color: rgb(37 99 235 / var(--tw-bg-opacity));
}
#webcrumbs .bg-gray-50\/80 {
  background-color: rgba(249, 250, 251, 0.8);
}
#webcrumbs .bg-white\/80 {
  background-color: hsla(0, 0%, 100%, 0.8);
}
#webcrumbs .bg-white\/90 {
  background-color: hsla(0, 0%, 100%, 0.9);
}
#webcrumbs .bg-gradient-to-b {
  background-image: linear-gradient(to bottom, var(--tw-gradient-stops));
}
#webcrumbs .from-blue-50 {
  --tw-gradient-from: #eff6ff var(--tw-gradient-from-position);
  --tw-gradient-to: rgba(239, 246, 255, 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}
#webcrumbs .to-white {
  --tw-gradient-to: #fff var(--tw-gradient-to-position);
}
#webcrumbs .p-6 {
  padding: 24px;
}
#webcrumbs .p-8 {
  padding: 32px;
}
#webcrumbs .px-4 {
  padding-left: 16px;
  padding-right: 16px;
}
#webcrumbs .px-6 {
  padding-left: 24px;
  padding-right: 24px;
}
#webcrumbs .px-8 {
  padding-left: 32px;
  padding-right: 32px;
}
#webcrumbs .py-12 {
  padding-bottom: 48px;
  padding-top: 48px;
}
#webcrumbs .py-2 {
  padding-bottom: 8px;
  padding-top: 8px;
}
#webcrumbs .py-3 {
  padding-bottom: 12px;
  padding-top: 12px;
}
#webcrumbs .py-4 {
  padding-bottom: 16px;
  padding-top: 16px;
}
#webcrumbs .text-center {
  text-align: center;
}
#webcrumbs .font-sans {
  font-family:
    Poppins,
    ui-sans-serif,
    system-ui,
    sans-serif,
    Apple Color Emoji,
    Segoe UI Emoji,
    Segoe UI Symbol,
    Noto Color Emoji;
}
#webcrumbs .text-2xl {
  font-size: 24px;
  line-height: 31.200000000000003px;
}
#webcrumbs .text-3xl {
  font-size: 30px;
  line-height: 36px;
}
#webcrumbs .text-5xl {
  font-size: 48px;
  line-height: 52.800000000000004px;
}
#webcrumbs .text-6xl {
  font-size: 60px;
  line-height: 66px;
}
#webcrumbs .text-lg {
  font-size: 18px;
  line-height: 27px;
}
#webcrumbs .text-xl {
  font-size: 20px;
  line-height: 28px;
}
#webcrumbs .font-bold {
  font-weight: 700;
}
#webcrumbs .font-semibold {
  font-weight: 600;
}
#webcrumbs .text-blue-600 {
  --tw-text-opacity: 1;
  color: rgb(37 99 235 / var(--tw-text-opacity));
}
#webcrumbs .text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
#webcrumbs .opacity-100 {
  opacity: 1;
}
#webcrumbs .shadow-lg {
  --tw-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color),
    0 4px 6px -4px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
#webcrumbs .outline-none {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
#webcrumbs .backdrop-blur-md {
  --tw-backdrop-blur: blur(12px);
}
#webcrumbs .backdrop-blur-md,
#webcrumbs .backdrop-blur-sm {
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness)
    var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale)
    var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert)
    var(--tw-backdrop-opacity) var(--tw-backdrop-saturate)
    var(--tw-backdrop-sepia);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness)
    var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale)
    var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert)
    var(--tw-backdrop-opacity) var(--tw-backdrop-saturate)
    var(--tw-backdrop-sepia);
}
#webcrumbs .backdrop-blur-sm {
  --tw-backdrop-blur: blur(4px);
}
#webcrumbs .transition-all {
  transition-duration: 0.15s;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
#webcrumbs .transition-colors {
  transition-duration: 0.15s;
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
#webcrumbs .transition-transform {
  transition-duration: 0.15s;
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
#webcrumbs .duration-1000 {
  transition-duration: 1s;
}
#webcrumbs .duration-300 {
  transition-duration: 0.3s;
}
#webcrumbs .duration-500 {
  transition-duration: 0.5s;
}
#webcrumbs {
  font-family: Roboto !important;
  font-size: 16px !important;
}
#webcrumbs .hover\:-translate-y-0\.5:hover {
  --tw-translate-y: -2px;
}
#webcrumbs .hover\:-translate-y-0\.5:hover,
#webcrumbs .hover\:-translate-y-2:hover {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
#webcrumbs .hover\:-translate-y-2:hover {
  --tw-translate-y: -8px;
}
#webcrumbs .hover\:scale-105:hover {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
#webcrumbs .hover\:border-blue-300:hover {
  --tw-border-opacity: 1;
  border-color: rgb(147 197 253 / var(--tw-border-opacity));
}
#webcrumbs .hover\:bg-blue-700:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(29 78 216 / var(--tw-bg-opacity));
}
#webcrumbs .hover\:bg-gray-50:hover {
  --tw-bg-opacity: 1;
  background-color: rgb(249 250 251 / var(--tw-bg-opacity));
}
#webcrumbs .hover\:text-blue-600:hover {
  --tw-text-opacity: 1;
  color: rgb(37 99 235 / var(--tw-text-opacity));
}
#webcrumbs .hover\:shadow-2xl:hover {
  --tw-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);
}
#webcrumbs .hover\:shadow-2xl:hover,
#webcrumbs .hover\:shadow-lg:hover {
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
#webcrumbs .hover\:shadow-lg:hover {
  --tw-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color),
    0 4px 6px -4px var(--tw-shadow-color);
}
#webcrumbs .hover\:shadow-xl:hover {
  --tw-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color),
    0 8px 10px -6px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
#webcrumbs .focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
    var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
    calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
    var(--tw-shadow, 0 0 #0000);
}
#webcrumbs .focus\:ring-blue-500:focus {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity));
}
#webcrumbs :is(.group:hover .group-hover\:rotate-12) {
  --tw-rotate: 12deg;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
#webcrumbs :is(.group:hover .group-hover\:scale-110) {
  --tw-scale-x: 1.1;
  --tw-scale-y: 1.1;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y))
    rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y))
    scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
#webcrumbs :is(.group:hover .group-hover\:text-blue-600) {
  --tw-text-opacity: 1;
  color: rgb(37 99 235 / var(--tw-text-opacity));
}
#webcrumbs :is(.group:hover .group-hover\:ring-2) {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
    var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
    calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
    var(--tw-shadow, 0 0 #0000);
}
#webcrumbs :is(.group:hover .group-hover\:ring-blue-300) {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgb(147 197 253 / var(--tw-ring-opacity));
}
```

# tailwind.config.js

```js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

