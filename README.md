# `unrtel`

Unified RTEL (Read-Transform-Evaluate Loop) for JavaScript modules.

> What is RTEL (Read-Transform-Eval Loop)? Why this name?
>
> While you may heard of [REPL (Read-Eval-Print Loop)](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop), however, in environments where JavaScript actually runs, before the **Eval** step, there would always be a **Transformation** step where tools like `esbuild` or CDN based [`esm.sh`](https://esm.sh) involves in between, and `print` yet doesn't actually mean what they used to mean (output to `console` or `stdout`), instead, frontend vDOM based modules like Vue SFC and JSX/TSX, they will mount to a specific DOM node for rendering.
>
> In summary:
>
> - Read (takes input)
> - Transform (build, transform, transpile with `esbuild`, `rolldown`, `swc`)
> - Evaluate (evaluate the transformed code / module in runtime, on the fly)
>
> Which is the RTEL loop.
>
> Therefore we somehow created a new name for this kind of process in more idiomatical way which capable of expressing the meaning in much obvious way, **RTEL**.

## Development

```shell
pnpm i
```

```shell
pnpm -F @unrteljs/playground dev
```

> [!NOTE]
>
> For [@antfu/ni](https://github.com/antfu-collective/ni) users, you can
>
> ```shell
> nr -F @unrteljs/playground dev
> ```
