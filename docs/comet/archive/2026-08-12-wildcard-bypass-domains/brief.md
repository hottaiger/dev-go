# Outcome

网络面板的自动模式与代理模式可将 `*.guazi.com` 这类通配符域名保存为绕过规则，使子域名直连。

# Scope

- 统一绕过列表的规范化与 PAC 匹配语义。
- 支持 `*.domain` 仅匹配其子域名；绕过规则优先于自动模式的代理规则。
- 为规范化和 PAC 生成补充自动化测试。

# Non-goals

- 不改变已有主机名、`<local>`、CIDR 或 AutoProxy 规则语义。
- 不新增其他通配符表达式或修改网络面板布局。

# Acceptance examples

- 保存 `*.GUAZI.COM` 后，存储值为可见的 `*.guazi.com`，`www.guazi.com` 与 `api.guazi.com` 返回 `DIRECT`。
- `guazi.com` 不匹配 `*.guazi.com`；单独添加 `guazi.com` 后才返回 `DIRECT`。
- 自动模式的绕过规则在命中 AutoProxy 代理规则时仍优先返回 `DIRECT`。
- 空白或非法规则被忽略，不影响其他有效规则。

# Constraints and invariants

- 自动模式和代理模式复用同一份绕过规则规范化与 PAC 匹配实现。
- 每行或逗号分隔的一条有效规则去重、去首尾空白并按小写持久化。

# Decisions

- Issue #28 明确 `*.domain` 只匹配至少一个子域名，不匹配根域名。
- 沿用 PAC 脚本直接执行匹配，避免为 UI 与后台维护两套语义。
- 用户已确认仅实现 Issue #28 所列绕过规则、优先级、兼容性、测试与必要帮助文案范围。

# Open questions

无。

# Verification expectations

- 为 `*.guazi.com`、根域名、大小写/空白、非法输入和自动模式优先级执行单元测试。
- 运行 `pnpm compile`、变更文件 ESLint 与 Prettier 检查。
