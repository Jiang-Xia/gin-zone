import { post } from '../http';

// 上传接口返回：文件名 + 可访问 URL
export interface UploadResult {
  filename: string;
  url: string;
}

// 基础服务：文件上传（multipart/form-data）
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return post<UploadResult, FormData>('/base/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
