# Network bypass rules

## Purpose

网络代理配置在自动模式和代理模式中提供一致、可持久化的直连绕过规则。

## Requirements

### Bypass rule normalization

绕过列表 MUST 接受每行或逗号分隔的规则，并忽略空白或无法识别的输入。有效规则 MUST 去除首尾空白、按大小写不敏感语义规范化为小写、去重并继续在界面中可见。

绕过列表 MUST 保持既有主机名、`<local>` 和 CIDR 规则支持。

### Wildcard subdomain rules

绕过列表 MUST 支持 `*.domain` 格式。该格式 MUST 匹配 `domain` 的任意子域名，且 MUST NOT 匹配根域名 `domain`。

### PAC precedence and shared behavior

代理模式与自动模式 MUST 使用相同的绕过规则匹配语义。自动模式启用 AutoProxy 规则列表时，任意命中绕过规则的请求 MUST 返回直连，即使该请求同时命中代理规则。

## Examples

- `*.guazi.com` 匹配 `www.guazi.com` 和 `api.guazi.com`，不匹配 `guazi.com`。
- `guazi.com` 作为单独规则匹配根域名，并保持既有域后缀匹配行为。
- `<LOCAL>` 规范化为 `<local>`。
