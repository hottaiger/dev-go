# Agent Instructions

## Code Quality

- Follow the current project lint rules in `eslint.config.mjs` for all code changes.
- Before finishing any code change, run the same checks that can block `lint-staged`:
  - `pnpm compile`
  - `pnpm exec eslint <changed ts/js/mjs/cjs/tsx/jsx files>`
  - `pnpm exec prettier --check <changed files covered by lint-staged>`
- Do not rely on the commit hook to discover avoidable issues. Fix ESLint and TypeScript errors before handing work back.
- Keep TypeScript imports explicit with `import type` when an import is only used as a type.
- Use `_`-prefixed unused parameters when an API callback requires an argument that the implementation does not use.

## Local Development

- `web-ext.config.ts` is a gitignored local preference file. Keep browser-launch preferences there instead of adding `webExt.disabled` back to `wxt.config.ts`.
- `devgo-backup.json` is a gitignored local backup seed used by development builds. Do not commit personal backup data.

<comet-ambient-resume>
<!-- Managed by Comet. Edits inside this block may be replaced by comet init/update. -->
<!-- Contract: comet.resume_probe.v2 -->

## Comet Ambient Resume

在这个仓库中，开始处理需要改动或调查的任务前，如果可能存在活跃 Comet workflow，把当前用户请求传入只读探针：`comet resume-probe . --stdin --json`。

- 只信任返回的 `workflow`、`skill` 和 `entrySource`；它们只由项目配置或无配置兼容回退决定。不得扫描或切换另一套 workflow。
- 如果 probe 返回 `auto_resume`，简短说明选中的 active change，并进入 `nextCommand` 指向的永久入口。不要把状态命令当作恢复入口直接推进。
- 如果 probe 返回 `ask_user`，只问一个简短问题并等待用户回复。
- 如果 probe 返回 `out_of_scope` 或 `none`，不要进入 Comet workflow。
- 如果配置或状态无效且没有 `nextCommand`，停止并报告原因；不要猜测另一个 workflow。
- 不能只因为存在 active change 就把无关任务挂到该 change。Native 的未提交改动由 Native 入口检查，不由探针自动归因。
</comet-ambient-resume>
