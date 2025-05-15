import { describe, expect, it } from 'vitest'

import { evaluate } from './node'

describe('node', () => {
  it('should evaluate', async () => {
    await evaluate('console.log("Hello, world!");', { base: './' })
  })

  it('should evaluate with imports', async () => {
    await evaluate(`
import path from 'path'

console.log(path.resolve('..'))
`, { base: './' })
  })

  it('should evalute and return the result', async () => {
    const result = await evaluate('return "Hello, world!";')
    expect(result).toBe('Hello, world!')
  })
})
