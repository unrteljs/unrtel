import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

function createColorSchemeConfig(hueOffset = 0) {
  return {
    DEFAULT: `oklch(62% var(--theme-colors-chroma) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    50: `color-mix(in srgb, oklch(95% var(--theme-colors-chroma-50) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha) 30%, oklch(100% 0 360 / %alpha))`,
    100: `color-mix(in srgb, oklch(95% var(--theme-colors-chroma-100) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha) 80%, oklch(100% 0 360 / %alpha))`,
    200: `oklch(90% var(--theme-colors-chroma-200) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    300: `oklch(85% var(--theme-colors-chroma-300) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    400: `oklch(74% var(--theme-colors-chroma-400) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    500: `oklch(62% var(--theme-colors-chroma) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    600: `oklch(54% var(--theme-colors-chroma-600) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    700: `oklch(49% var(--theme-colors-chroma-700) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    800: `oklch(42% var(--theme-colors-chroma-800) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    900: `oklch(37% var(--theme-colors-chroma-900) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
    950: `oklch(29% var(--theme-colors-chroma-950) calc(var(--theme-colors-hue) + ${hueOffset}) / %alpha)`,
  }
}

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
    presetIcons({
      scale: 1.2,
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  theme: {
    colors: {
      primary: createColorSchemeConfig(),
      complementary: createColorSchemeConfig(180),
    },
  },
})
