import { defineStore } from 'pinia'
import { SessionStorage } from 'quasar'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: SessionStorage.getItem('user'),
    rol: Number(SessionStorage.getItem('rol')) || null
  }),
  actions: {
    setUser(user, rol) {
      this.user = user
      this.rol = Number(rol)
      SessionStorage.set('user', user)
      SessionStorage.set('rol', this.rol)
    },
    clearUser() {
      this.user = null
      this.rol = null
      SessionStorage.remove('user')
      SessionStorage.remove('rol')
      SessionStorage.remove('id_user')
    }
  }
})
