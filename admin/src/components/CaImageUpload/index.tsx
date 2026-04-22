import { useCallback, useMemo, useState } from 'react';
import { Upload } from 'tdesign-react';
import type { UploadFile } from 'tdesign-react';
import { uploadFile, type UploadResult } from '../../api/modules/base';
import { useApiMessage } from '../../hooks/useApiMessage';

export interface CaImageUploadProps {
  // 中文注释：兼容后端直接返回头像 URL（string）与表单绑定值（UploadFile[]）
  value?: UploadFile[] | string;
  onChange?: (files: UploadFile[]) => void;
  disabled?: boolean;
  // 中文注释：允许业务侧注入上传实现（便于后续扩展到不同目录/不同鉴权）
  uploader?: (file: File) => Promise<UploadResult>;
}

export default function CaImageUpload({ value, onChange, disabled, uploader }: CaImageUploadProps) {
  const message = useApiMessage();
  const [uploading, setUploading] = useState(false);

  // 中文注释：仅开发环境调试用，避免无意间刷屏/污染生产日志
  // 开启方式：localStorage.setItem('zoneAdminUploadDebug', '1')
  const isUploadDebugEnabled = () => import.meta.env.DEV && localStorage.getItem('zoneAdminUploadDebug') === '1';

  // 中文注释：后端可能返回相对路径，这里统一补全为可访问的绝对地址（仅使用文件域名 VITE_FILE_URL）
  const baseUrl = String(import.meta.env.VITE_FILE_URL || '');
  const toAbsoluteUrl = useCallback((url?: string) => {
    const resolved = String(url ?? '');
    if (!resolved) return '';
    if (/^https?:\/\//i.test(resolved)) return resolved;
    if (!baseUrl) return resolved;
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = resolved.startsWith('/') ? resolved : `/${resolved}`;
    return `${normalizedBase}${normalizedPath}`;
  }, [baseUrl]);

  const files = useMemo<UploadFile[]>(() => {
    if (Array.isArray(value)) {
      return value
        .filter(Boolean)
        .map((item) => ({ ...item, url: toAbsoluteUrl(item.url || item.response?.url) } as UploadFile));
    }
    const url = String(value ?? '');
    if (!url) return [];
    return [{ name: 'avatar', url: toAbsoluteUrl(url), status: 'success' } as UploadFile];
  }, [toAbsoluteUrl, value]);

  if (isUploadDebugEnabled()) {
    console.log('[CaImageUpload][debug]', { value, files });
  }

  const doUpload = async (file: File) => {
    if (uploading) return;
    setUploading(true);
    try {
      const res = await (uploader ? uploader(file) : uploadFile(file));
      if (res?.url) {
        const absoluteUrl = toAbsoluteUrl(res.url);
        const nextValue: UploadFile[] = [
          {
            name: res.filename || 'avatar',
            url: absoluteUrl,
            status: 'success',
            response: { url: absoluteUrl },
          } as UploadFile,
        ];
        onChange?.(nextValue);
        message.success('上传成功');
        return res;
      } else {
        message.error(null, '上传失败');
        return undefined;
      }
    } catch (error) {
      message.error(error, '上传失败');
      return undefined;
    } finally {
      setUploading(false);
    }
  };

  return (
    <Upload
      theme="image"
      accept="image/*"
      // 中文注释：交给 Upload 自己处理“点击触发选择文件 + 上传流程”，我们只接管实际上传请求
      autoUpload
      multiple={false}
      disabled={disabled || uploading}
      abridgeName={[6, 6]}
      allowUploadDuplicateFile
      files={files}
      tips="请选择单张图片文件上传"
      showImageFileName={false}
      onRemove={() => {
        // 中文注释：受控模式下需要手动同步删除结果
        onChange?.([]);
      }}
      requestMethod={async (nextFiles: UploadFile | UploadFile[]) => {
        const current = Array.isArray(nextFiles) ? nextFiles[0]?.raw : nextFiles?.raw;
        if (!(current instanceof File)) {
          return { status: 'fail', error: '未选择文件', response: {} };
        }
        try {
          const res = await doUpload(current);
          // doUpload 内部已 toast，这里只负责给 Upload 回传 url 用于回显
          if (res?.url) {
            return { status: 'success', response: { url: toAbsoluteUrl(res.url) } };
          }
          return { status: 'fail', error: '上传失败', response: {} };
        } catch {
          return { status: 'fail', error: '上传失败', response: {} };
        }
      }}
    />
  );
}

