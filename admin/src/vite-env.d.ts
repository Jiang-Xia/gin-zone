/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vite/client" />

// Vite 环境变量类型声明：用于 import.meta.env 的 TS 提示与校验
interface ImportMetaEnv {
  readonly VITE_BASE_URL: string;
  readonly VITE_FILE_URL?: string;
  readonly VITE_API_PROXY_TARGET?: string;
  readonly VITE_APP_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// CSS Modules（Less）类型声明：允许 `import styles from './xxx.module.less'`
declare module '*.module.less' {
  const classes: Record<string, string>;
  export default classes;
}