# UR Delegated Mode Demo Sandbox

一个交互式演示应用，展示如何在 **Delegated Mode（委托模式）** 下通过合作伙伴签名触发 UR 核心银行操作（Offramp、Onramp、FX），无需用户每次签署交易。

## 在线体验

<https://ur-app.github.io/deletated-mode-demo/>

## 功能概览

- **Offramp** — 将链上 USDC 兑换为法币 USD（含报价 + 执行）
- **Onramp** — 将法币 USD 兑换为链上 USDC（含报价 + 执行）
- **FX** — 法币之间的货币兑换（如 USD → EUR）
- **状态刷新** — 查询用户 Profile 和余额信息
- **交互式控制台** — 实时展示每次 API 请求/响应的完整详情

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 6 |
| 状态管理 | Zustand |
| 样式 | Tailwind CSS |
| 签名 | viem（浏览器端 Ethereum personal sign）|
| 测试 | Vitest |

## 项目结构

```
src/
├── main.tsx                        # 入口
├── App.tsx                         # 根组件（三栏布局）
├── constants/index.ts              # 默认配置、链选项、操作标签
├── types/index.ts                  # TypeScript 类型定义
├── hooks/use-action.ts             # 操作执行 hook
├── lib/
│   ├── api.ts                      # 各操作的 API 调用逻辑
│   ├── signing.ts                  # 请求签名（viem）
│   ├── utils.ts                    # 工具函数
│   └── format.ts                   # 格式化工具
├── store/
│   ├── config-store.ts             # 配置状态
│   ├── account-store.ts            # 账户状态
│   └── console-store.ts            # 控制台日志状态
└── components/
    ├── layout/Header.tsx           # 头部
    ├── config/                     # 配置表单 + 操作按钮
    ├── console/                    # API 请求/响应控制台
    └── status/                     # 账户状态展示面板
```

## 快速开始

### 前置条件

- Node.js >= 18
- npm

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器（端口 3000）
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 使用步骤

1. 打开浏览器访问 `http://localhost:3000`
2. 粘贴 Quick Start Guide 中的 Demo Partner Private Key
3. 填入用户 URID 和 User Address（或使用默认值）
4. 选择目标链（Mantle Sepolia / Arbitrum Sepolia / Mantle Mainnet）
5. 点击操作按钮，在控制台面板中查看完整的请求/响应详情

## API 签名机制

所有请求均在浏览器端使用合作伙伴私钥签名：

1. 将请求体 JSON + deadline 拼接为待签名消息
2. 使用 `viem` 的 `signMessage` 进行 Ethereum personal sign
3. 签名信息通过 HTTP Header 传递：
   - `X-Api-Signature` — 签名值
   - `X-Api-Deadline` — 签名过期时间（当前时间 + 300s）
   - `X-Api-PublicKey` — 合作伙伴公钥地址

## 支持的链

| Chain ID | 网络 |
|----------|------|
| `eip155:5003` | Mantle Sepolia (测试网) |
| `eip155:421614` | Arbitrum Sepolia (测试网) |
| `eip155:5000` | Mantle Mainnet |

## 测试

```bash
# 运行测试
npm test

# 监听模式
npm run test:watch
```

## 部署

项目通过 GitHub Actions 自动部署到 GitHub Pages，push 到 `main` 分支即可触发。

## 相关文档

- [UR Delegated Mode API Reference](https://docs.ur.app/developer-resources/api-reference-delegated-contract-mode)
