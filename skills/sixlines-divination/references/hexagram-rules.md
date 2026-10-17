# 三钱与变卦

- 每枚：字（开元通宝面）= 阳 = 3；背 = 阴 = 2
- 三枚和：6 老阴（×，变阳）、7 少阳、8 少阴、9 老阳（○，变阴）
- 六次自下而上；`linesToHexagram` 产出 `primary` / 可选 `changed`
- 随机：`crypto.getRandomValues`；测试用 `createSeededRng`
- 查表：`BIN2WEN[bits]`，bit0 = 初爻
