// https://github.com/unocss/unocss/blob/1266143d689cc7400247056abf674a13da98e74b/virtual-shared/docs/src/config.ts#L5

import type { EvaluateOptions } from './types'

import { AsyncFunction } from './utils/helper'
import { getImportBase } from './utils/import-base'
import { exportDefaultRegex, exportRegex, importAsRegex, importDefaultRegex, importObjectRegex, importRegex } from './utils/regexp'

export type { EvaluateOptions }

// https://github.com/unocss/unocss/blob/1266143d689cc7400247056abf674a13da98e74b/virtual-shared/docs/src/config.ts#L7-L9
const modulesCache = new Map<string, Promise<unknown> | unknown>()

// https://github.com/unocss/unocss/blob/1266143d689cc7400247056abf674a13da98e74b/virtual-shared/docs/src/config.ts#L26
// eslint-disable-next-line no-new-func
const nativeImport = new Function('a', 'return import(a);')

// https://github.com/unocss/unocss/blob/1266143d689cc7400247056abf674a13da98e74b/virtual-shared/docs/src/config.ts#L31-L33
async function fetchAndImportAnyModuleWithCDNCapabilities(name: string) {
  if (name.endsWith('.json')) {
    const response = await fetch(getImportBase() + name)
    const json = await response.json()

    return { default: json }
  }

  return nativeImport(getImportBase() + name)
}

// https://github.com/unocss/unocss/blob/1266143d689cc7400247056abf674a13da98e74b/virtual-shared/docs/src/config.ts#L27-L37
// bypass vite interop
async function dynamicImportAnyModule(name: string): Promise<any> {
  if (modulesCache.has(name))
    return modulesCache.get(name)

  try {
    const module = await fetchAndImportAnyModuleWithCDNCapabilities(name)
    modulesCache.set(name, module)

    return module
  }
  catch (error) {
    console.error(`Failed to import module ${name} from CDN`, error)
  }
}

// https://github.com/unocss/unocss/blob/1266143d689cc7400247056abf674a13da98e74b/virtual-shared/docs/src/config.ts#L27-L37
export async function evaluate<T>(source: string, options?: EvaluateOptions): Promise<T | undefined> {
  const noExternal = options?.noExternal ?? []

  const noExternalRegexps = noExternal.map(name => ({
    match: new RegExp(`import\\s(.*?)\\sfrom\\s*(['"])${name}\\2`, 'g'),
    to: `const $1 = await __import("${name}");`,
  }))

  let transformedCode = source

  if (noExternalRegexps?.length) {
    noExternalRegexps.forEach((regex) => {
      transformedCode = transformedCode.replace(regex.match, regex.to)
    })
  }

  transformedCode = transformedCode
  // Handle 'export * from "module"'
    .replace(/export\s+\*\s+from\s+(['"])([^'"]+)\1/g, 'Object.assign(exports, await __import("$2"));')

  // Handle 'export { namedExport } from "module"'
  // eslint-disable-next-line regexp/no-super-linear-backtracking, regexp/optimal-quantifier-concatenation
    .replace(/export\s*\{\s*([^}]+)\s*\}\s*from\s+(['"])([^'"]+)\2/g, (_match, p1, _p2, p3) => {
      return `const { ${p1} } = await __import("${p3}");\nObject.assign(exports, { ${p1} });`
    })
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
  return await wrappedDynamicImport(dynamicImportAnyModule)
}
