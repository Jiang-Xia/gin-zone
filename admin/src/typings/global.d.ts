// * Menu
declare namespace Menu {
  interface MenuOptions {
    path: string;
    title: string;
    icon?: string;
    isLink?: string;
    close?: boolean;
    children?: MenuOptions[];
  }
}

interface ImportMeta {
  glob<Module = { [key: string]: any }>(pattern: string, options?: any): Record<string, () => Promise<Module>>;

  globEager<Module = { [key: string]: any }>(pattern: string, options?: any): Record<string, Module>;
}
