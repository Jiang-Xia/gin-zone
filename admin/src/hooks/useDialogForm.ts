import { useState } from 'react';

interface UseDialogFormOptions<TForm> {
  // 表单初始值：用于首次渲染和重置
  initialValues: TForm;
}

export function useDialogForm<TForm>({ initialValues }: UseDialogFormOptions<TForm>) {
  // 弹窗显隐状态
  const [visible, setVisible] = useState(false);
  // 表单数据状态
  const [form, setForm] = useState<TForm>(initialValues);

  // 打开弹窗：可选合并一部分默认值（如回填当前用户）
  const openDialog = (patch?: Partial<TForm>) => {
    if (patch) {
      setForm((prev) => ({ ...prev, ...patch }));
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
  };

  return {
    visible,
    form,
    setForm,
    openDialog,
    closeDialog,
    resetForm,
  };
}
