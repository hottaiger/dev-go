# Popup 上次活动功能页

## Purpose

DevGo popup 必须在面板关闭并再次通过工具栏入口打开时，恢复用户上次选中的功能页。

## Requirements

### Requirement: 持久化当前功能页

系统 SHALL 在用户切换 popup 功能页时，将该有效功能页标识持久化到本机存储。

#### Scenario: 用户选择待办页

- **WHEN** 用户在 popup 中选择“待办”页
- **THEN** 系统保存“待办”页作为上次活动功能页

### Requirement: 恢复上次活动功能页

系统 SHALL 在没有一次性指定打开页时，使用本机存储中有效的上次活动功能页作为 popup 的初始页。

#### Scenario: popup 因失焦关闭后重新打开

- **WHEN** 用户选择“待办”页后点击浏览器空白处关闭 popup，再点击工具栏入口
- **THEN** popup 显示“待办”页

### Requirement: 保持指定打开页优先级

系统 MUST 在快捷键或后台消息提供有效的一次性指定功能页时，优先显示该指定功能页并更新上次活动功能页。

#### Scenario: 快捷键指定打开网络页

- **WHEN** popup 通过快捷键收到打开“网络”页的一次性信号
- **THEN** popup 显示“网络”页，而非之前保存的功能页

### Requirement: 无有效历史时回退默认页

系统 SHALL 在上次活动功能页缺失或无效时，使用已有默认功能页设置；默认设置无效时使用“翻译”页。

#### Scenario: 首次打开 popup

- **WHEN** 本机没有保存上次活动功能页
- **THEN** popup 显示已有默认功能页设置
