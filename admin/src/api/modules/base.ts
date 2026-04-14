import { post } from '../http';

export interface UploadResult {
  filename: string;
  url: string;
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return post<UploadResult, FormData>('/base/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
