# Outcome

网络面板的自动模式与代理模式支持保存 `*.guazi.com` 通配符绕过规则，使子域名直连。

# Scope

- 规范化绕过规则并生成符合相同语义的自动模式 PAC。
- 更新网络面板帮助文案。
- 添加规则规范化与 PAC 匹配自动测试。

# Non-goals

- 不改变既有主机名、`<local>`、CIDR、AutoProxy 规则语义或网络面板布局。

# Acceptance examples

- `*.GUAZI.COM` 保存为 `*.guazi.com`，并使 `www.guazi.com` 与 `api.guazi.com` 直连。
- `*.guazi.com` 不匹配 `guazi.com`；配置 `guazi.com` 后根域名直连。
- 自动模式中绕过规则优先于命中的 AutoProxy 代理规则。
- 空白或非法规则不影响其他有效规则。

# Constraints and invariants

- 自动与代理模式复用同一绕过规则语义。
- 有效规则去首尾空白、转小写、去重，并在保存后保持可见。

# Decisions

- `*.domain` 只匹配至少一个子域名。
- 用户要求使用 Comet `0.4.0-beta.17` 在新分支重新实现和验证。

# Open questions

无；沿用已确认的 Issue #28 语义。

# Verification expectations

- 运行通配符、根域名、无效输入与自动模式优先级的自动测试。
- 运行 `pnpm compile`、变更文件 ESLint 和 Prettier。
