import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null')
  }),
  actions: {
    // 保存用户信息
    setUserInfo(user) {
      this.userInfo = user
      localStorage.setItem('userInfo', JSON.stringify(user))
    },
    // 退出登录
    logout() {
      this.userInfo = null
      localStorage.removeItem('userInfo')
    }
  }
})