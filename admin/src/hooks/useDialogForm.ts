import { useState } from 'react';

interface UseDialogFormOptions<TForm> {
  // 表单初始值：用于首次渲染和重置
  initialValues: TForm;
  // 是否启用弹窗内容重建 key（默认开启，适配 Dialog + FormItem 回填场景）
  enableRemountKey?: boolean;
}

export function useDialogForm<TForm>({ initialValues, enableRemountKey = true }: UseDialogFormOptions<TForm>) {
  // 弹窗显隐状态
  const [visible, setVisible] = useState(false);
  // 表单数据状态
  const [form, setForm] = useState<TForm>(initialValues);
  // 中文注释：弹窗表单重建标记，用于强制重新挂载 Form 触发 initialData 回填
  const [dialogKey, setDialogKey] = useState(0);

  // 打开弹窗：可选合并一部分默认值（如回填当前用户）
  const openDialog = (patch?: Partial<TForm>) => {
    // 中文注释：先更新表单数据，再打开弹窗；避免弹窗内容首次挂载时拿到旧值导致“不回显”
    if (patch) {
      // 中文注释：不要与 prev 合并，避免上次残留字段导致回显异常
      setForm({ ...(initialValues as object), ...(patch as object) } as TForm);
      if (enableRemountKey) {
        setDialogKey((prev) => prev + 1);
      }
      setVisible(true);
      return;
    }
    if (enableRemountKey) {
      setDialogKey((prev) => prev + 1);
    }
    setVisible(true);
  };

  // 关闭弹窗：默认重置表单，避免残留上次输入
  const closeDialog = (shouldReset = true) => {
    setVisible(false);
    if (shouldReset) {
      setForm(initialValues);
    }
  };

  // 手动重置表单：用于“提交成功后保留弹窗”等场景
  const resetForm = () => {
    setForm(initialValues);
    if (enableRemountKey) {
      setDialogKey((prev) => prev + 1);
    }
  };

  return {
    visible,
    form,
    dialogKey,
    setForm,
    openDialog,
    closeDialog,
    resetForm,
  };
}
