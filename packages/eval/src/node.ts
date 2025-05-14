// https://github.com/nolebase/obsidian-plugin-vue/blob/main/src/import.ts

import { createRequire } from 'node:module'

import { AsyncFunction } from './utils/helper'
import { getImportBase, setImportBase } from './utils/import-base'
import { exportDefaultRegex, exportRegex, importAsRegex, importDefaultRegex, importObjectRegex, importRegex } from './utils/regexp'
// https://github.com/unocss/unocss/blob/6d94efc56b0c966f25f46d8988b3fd30ebc189aa/packages/shared-docs/src/config.ts#L31-L33
async function wrappedImport(name: string, basePath?: string) {
  const require = createRequire(basePath ?? import.meta.dirname)
  return require(name)
}

// https://github.com/unocss/unocss/blob/6d94efc56b0c966f25f46d8988b3fd30ebc189aa/packages/shared-docs/src/config.ts#L27-L37
// bypass vite interop
async function dynamicImportAnyModule(name: string, basePath?: string): Promise<any> {
  try {
    const module = await wrappedImport(name, basePath)

    if (module && module.__esModule) {
      const finalModule = module['module.exports'] || module
      return finalModule
    }

    return module
  }
  catch (error) {
    console.error(`Failed to import module ${name}`, error)
  }
}

// https://github.com/unocss/unocss/blob/main/packages/shared-docs/src/config.ts
export async function evaluateAnyModule<T>(configCode: string, basePath?: string): Promise<T | undefined> {
  const transformedCode = configCode
    .replace(importObjectRegex, (_match, p1, _p2, p3) => {
      // Replace `as` with `:` within the destructuring assignment
      const transformedP1 = p1.replace(importAsRegex, '$1: $2')
      return `const {${transformedP1}} = await __import("${p3}");`
    })
    .replace(importDefaultRegex, 'const $1 = (await __import("$3")).default;')
    .replace(exportDefaultRegex, 'return ')
    .replace(importRegex, '__import(')
    .replace(exportRegex, 'return function ')

  const wrappedDynamicImport = new AsyncFunction('__import', transformedCode)
  return await wrappedDynamicImport(name => dynamicImportAnyModule(name, basePath))
}
export {
  getImportBase,
  setImportBase,
}
