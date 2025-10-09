import { defineStore } from 'pinia'
import { SessionStorage } from 'quasar'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: SessionStorage.getItem('user'),
    rol: Number(SessionStorage.getItem('rol')) || null,
    branch: SessionStorage.getItem('branch') || null,
  }),
  actions: {
    setUser(user, rol, branch = null) {
      this.user = user
      this.rol = Number(rol)
      this.branch = branch
      SessionStorage.set('user', user)
      SessionStorage.set('rol', this.rol)
      if(branch !== null) SessionStorage.set('branch', branch)
    },
    clearUser() {
      this.user = null
      this.rol = null
      this.branch = null
      SessionStorage.remove('user')
      SessionStorage.remove('rol')
      SessionStorage.remove('branch')
      SessionStorage.remove('id_user')
    }
  }
})
