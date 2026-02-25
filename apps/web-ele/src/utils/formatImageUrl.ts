/**
 * 图片URL格式化工具函数
 * @param url 原始图片URL或路径
 * @returns 完整的图片URL
 */
export const formatImageUrl = (url: string | undefined): string => {
  if (!url) return '';

  // 替换为你的实际API基础URL
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`;
  }

  return `${API_BASE_URL}/${url}`;
};
