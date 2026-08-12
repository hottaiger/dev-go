# Network bypass rules

## Requirements

绕过列表 MUST 接受每行或逗号分隔的规则，忽略空白或非法规则，并以小写、去重形式保存既有主机名、`<local>` 与 CIDR 规则。

绕过列表 MUST 支持 `*.domain`。该规则 MUST 匹配该域名的任意子域名，且 MUST NOT 匹配根域名。

代理模式与自动模式 MUST 使用相同的绕过语义。自动模式启用 AutoProxy 规则列表时，绕过规则 MUST 优先返回直连。
