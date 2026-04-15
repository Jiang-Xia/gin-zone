import { MessagePlugin } from 'tdesign-react';

// 统一接口错误转文案：减少每个页面重复写 error instanceof Error
function resolveErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useApiMessage() {
  // 成功提示：用于新增/删除/保存等操作反馈
  const success = (message: string) => {
    MessagePlugin.success(message);
  };

  // 警告提示：用于前置参数校验
  const warning = (message: string) => {
    MessagePlugin.warning(message);
  };

  // 失败提示：统一兜底文案策略
  const error = (reason: unknown, fallback: string) => {
    MessagePlugin.error(resolveErrorMessage(reason, fallback));
  };

  return {
    success,
    warning,
    error,
  };
}
