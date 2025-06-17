import { createRequire } from 'node:module'

import builtinModules from 'builtin-modules'

import type { EvaluateOptions } from './types'

import { AsyncFunction } from './utils/helper'
import { getImportBase, setImportBase } from './utils/import-base'
import { exportDefaultRegex, exportRegex, importAsRegex, importDefaultRegex, importObjectRegex, importRegex } from './utils/regexp'

export type { EvaluateOptions }

// https://github.com/unocss/unocss/blob/1266143d689cc7400247056abf674a13da98e74b/virtual-shared/docs/src/#L31-L33
async function wrappedImport(name: string, base?: string) {
  if (builtinModules.includes(name)) {
    return await import(name)
  }

  const require = createRequire(base ?? import.meta.dirname)
  return require(name)
}

// https://github.com/unocss/unocss/blob/1266143d689cc7400247056abf674a13da98e74b/virtual-shared/docs/src/#L27-L37
// bypass vite interop
async function dynamicImportAnyModule(name: string, base?: string): Promise<any> {
  try {
    const module = await wrappedImport(name, base)

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
export async function evaluate<T>(source: string, options?: EvaluateOptions): Promise<T | undefined> {
  const noExternal = options?.noExternal ?? []

  const noExternalRegexps = noExternal.map(name => ({
    match: new RegExp(`import\\s(.*?)\\sfrom\\s*(['"])${name}\\2`, 'g'),
    to: `const $1 = await import("${name}");`,
  }))

  let transformedCode = source
  if (noExternalRegexps?.length) {
    noExternalRegexps.forEach((regex) => {
      transformedCode = transformedCode.replace(regex.match, regex.to)
    })
  }

  transformedCode = transformedCode
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
  return await wrappedDynamicImport(name => dynamicImportAnyModule(name, options?.base))
}
export {
  getImportBase,
  setImportBase,
}
