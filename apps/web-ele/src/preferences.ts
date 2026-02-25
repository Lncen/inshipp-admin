import { defineOverridesPreferences } from '@vben/preferences';

/**
 * @description 项目配置文件
 * 只需要覆盖项目中的一部分配置，不需要的配置不用覆盖，会自动使用默认配置
 * !!! 更改配置后请清空缓存，否则可能不生效
 */
export const overridesPreferences = defineOverridesPreferences({
  // overrides
  app: {
    name: import.meta.env.VITE_APP_TITLE,
    // 动态路由模式
    accessMode: 'backend',
    // 登录过期跳转 登录界面
    loginExpiredMode: 'modal',
    // 刷新令牌
    enableRefreshToken: true,
  },
});
