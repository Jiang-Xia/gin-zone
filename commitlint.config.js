// @see: https://cz-git.qbenben.com/zh/guide
/** @type {import('cz-git').UserConfig} */

module.exports = {
  ignores: [(commit) => commit.includes("init")],
  extends: ["@commitlint/config-conventional"],
  rules: {
    // @see: https://commitlint.js.org/#/reference-rules
    "body-leading-blank": [2, "always"],
    "footer-leading-blank": [1, "always"],
    "header-max-length": [2, "always", 108],
    "subject-empty": [2, "never"],
    "type-empty": [2, "never"],
    "subject-case": [0],
    "type-enum": [
      2,
      "always",
      [
        "feat",// feat: 新功能、新特性
        "fix",// fix: 修改 bug
        "docs",// docs: 文档修改
        "style",// style: 代码格式修改, 注意不是 css 修改（例如分号修改）
        "refactor",// refactor: 代码重构（重构，在不影响代码内部行为、功能下的代码修改）
        "perf",// perf: 更改代码，以提高性能（在不影响代码内部行为的前提下，对程序性能进行优化）
        "test",// test: 测试用例新增、修改
        "build",// build: 影响项目构建或依赖项修改
        "ci",// ci: 持续集成相关文件修改
        "chore",// chore: 其他修改（不在上述类型中的修改）
        "revert",// revert: 恢复上一次提交
        "wip",
        "workflow",// workflow: 工作流相关文件修改
        "types",
        "release",// release: 发布新版本
      ],
    ],
  },
  prompt: {
    messages: {
      // 中文版
      type: "选择你要提交的类型 :",
      scope: "选择一个提交范围（可选）:",
      customScope: "请输入自定义的提交范围 :",
      subject: "填写简短精炼的变更描述 :\n",
      body: '填写更加详细的变更描述（可选）。使用 "|" 换行 :\n',
      breaking: '列举非兼容性重大的变更（可选）。使用 "|" 换行 :\n',
      footerPrefixsSelect: "选择关联issue前缀（可选）:",
      customFooterPrefixs: "输入自定义issue前缀 :",
      footer: "列举关联issue (可选) 例如: #31, #I3244 :\n",
      confirmCommit: "是否提交或修改commit ?"
    },
    types: [
      // 中文版
      { value: "特性", name: "特性:   🚀  新增功能", emoji: "🚀" },
      { value: "修复", name: "修复:   🧩  修复缺陷", emoji: "🧩" },
      { value: "文档", name: "文档:   📚  文档变更", emoji: "📚" },
      { value: "格式", name: "格式:   🎨  代码格式（不影响功能，例如空格、分号等格式修正）", emoji: "🎨" },
      { value: "重构", name: "重构:   ♻️  代码重构（不包括 bug 修复、功能新增）", emoji: "♻️" },
      { value: "性能", name: "性能:   ⚡️  性能优化", emoji: "⚡️" },
      { value: "测试", name: "测试:   ✅  添加疏漏测试或已有测试改动", emoji: "✅" },
      { value: "构建", name: "构建:   📦️  构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）", emoji: "📦️" },
      { value: "集成", name: "集成:   🎡  修改 CI 配置、脚本", emoji: "🎡" },
      { value: "回退", name: "回退:   ⏪️  回滚 commit", emoji: "⏪️" },
      { value: "其他", name: "其他:   🔨  对构建过程或辅助工具和库的更改（不影响源文件、测试用例）", emoji: "🔨" }
    ]
  },
};

