# client 商业化改造清单（留存）

目标：把 `client`（uniapp 项目）逐步改造成更像商业项目的工程结构与工程体验（网络层、Loading、错误处理、鉴权会话、安全、业务拆分等）。

## 改造清单（按建议顺序）

1. 先做工程化开关统一管理：把 `NODE_ENV`、`baseUrl/fileUrl/wsUrl`、mock 开关、crypto 开关从 `client/common/request/api.js` 抽离到 `client/common/request/config.*`，并确保多端编译条件集中管理。
2. 新增“商业化请求层”并保持兼容：不要直接大改现有 `client/common/request/api.js`，先新增入口（例如 `api.commercial.js`），保证旧页面不受影响；之后再逐步切换到新入口（例如修改 `client/main.js`）。
3. 给请求层补齐三件套：统一 `Loading`（全局并发计数 + 防闪烁）、统一错误处理（网络错误/业务错误/鉴权失效）、统一响应规范（`resolve` 的结果形态尽量固定）。
4. 为请求层做拦截器思路但不引入依赖：把 `restful/request/complete` 内拆成 `buildRequest`、`handleResponse` 两段逻辑，避免把环境/加密/路由替换/toast 混在一个函数里。
5. 统一 token/会话存取：把 `uni.getStorageSync("zoneToken")/zoneUserInfo/zoneSessionId/zoneWorkKey` 等散落 Key 集中成一个 session 管理模块（例如 `client/common/request/session.js`），减少硬编码与不一致风险。
6. 安全整改：把旧 `client/common/request/api.js` 里硬编码的 `privateKey`、`sm4Key` 等敏感材料迁移为构建注入/受控下发（至少不要长期保留在源码里），并给出默认更安全的 crypto 策略。
7. 明确加密上下文策略：把 `openCrypto` 从“全局开关”升级为“按接口/按业务标签开关”（白名单/黑名单），并把“signIn 不加密”的规则写成明确配置项。
8. 把 REST 模板 URL 替换逻辑做成复用方法：把 `"/path/{id}"` 的 `{id}` 替换抽出，避免页面或调用处手拼重复逻辑。
9. 标准化 `data` 入参形态：保证 `GET/POST/PUT` 在“空对象不传/undefined 入参处理”策略一致，减少后端解析差异导致的偶发 bug。
10. 统一全局提示策略：规定 toast 只允许在请求层与少量业务组件出现（减少页面各自 catch 后任意 toast），同时避免 toast 被 `showLoading({ mask: true })` 遮挡（可复用你在 `shopkeeper` 里类似的处理思路）。
11. 抽出 API 接口层：把页面直接调用 `this.$api.get/post` 逐步改成 `client/common/request/apis/*.js` 风格，让业务只关心方法名与参数，不关心 URL 细节。
12. 支付链路做业务封装：把 `client/packageB/pages/business/pay/*` 里“订单串联（ApplyOrder -> QueryOrder -> PayOrder）/轮询/状态写 storage”的逻辑抽到 `client/packageB/services/payService.js`（或类似）里，页面只保留 UI 状态。
13. 对支付相关页面做职责切分：例如 `all-pay` 只负责“支付方式选择与发起下单”，`status` 只负责“查询结果恢复与轮询”，减少页面体积与耦合。
14. Mock 数据从请求层抽离：你现在 `client/common/utils/tool.js` 里有静态 json 模拟请求的写法；建议改成“统一 Mock Handler”（按接口名/环境返回），减少散落导致维护成本高。
15. 统一通用工具归并：把 `client/common/utils/tool.js`（金额/编码/防抖/脚本加载/关闭窗口/脱敏等）按“支付/表单/时间/安全/平台”拆目录，保留一个 `index.js` 聚合导出，避免单文件无限膨胀。
16. 替换 mixins 全局副作用：`client/common/utils/common.js` 当前混合了分享、定位、通用跳转等；建议逐步改为独立 composables/工具函数（至少把分享逻辑从混入里拆出来），减少每页额外注入与隐式依赖。
17. 用户态管理从 `App.vue.globalData` 逐步迁移到 pinia：现在 `App.vue` 用 `zoneToken/zoneUserInfo` + `initChat`；建议新增 `stores/user.js`（pinia persist）统一管理，让 `App.vue` 只负责生命周期初始化与订阅 store 变化。
18. 工程规范落地：确保已有（或补齐）eslint/prettier、路径别名规范（`@/`）、统一代码风格与命名（导入顺序、错误处理方式），避免后续改造越改越乱。
19. 加最小可回归的检查项：至少做手动验证清单（登录、下单、结果轮询、H5 唤起、host-pay 短信验证码、token 失效跳转），改造阶段每一步切换到新实现都能验证。

## 建议的交付节奏

- Phase 1：先完成“商业化请求层（不破坏旧页面）”与“Loading/错误处理/响应规范”三件套。
- Phase 2：再逐步切换支付链路页面到新服务封装。
- Phase 3：最后做用户态/安全/工程规范/Mock 抽离等收敛工作。

