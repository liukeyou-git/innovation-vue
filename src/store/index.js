// src/store/index.js（或user.js）
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null  // 存储用户信息
  }),
  actions: {
    // 设置用户信息
    setUserInfo(info) {
      this.userInfo = info
      // 同步到localStorage，避免刷新丢失
      localStorage.setItem('userInfo', JSON.stringify(info))
    },
    // 退出登录
    logout() {
      this.userInfo = null
      localStorage.removeItem('userInfo')
    }
  }
})