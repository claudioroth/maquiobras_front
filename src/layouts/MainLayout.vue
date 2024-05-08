<template>
  <q-layout view="lhh lpR lFf" class="bg-grey-1">
    <q-header  class="bg-grey-1 text-grey-8 q-py-xs" height-hint="58">
      <q-toolbar>

        <q-btn
          flat
          dense
          round
          @click="toggleLeftDrawer"
          aria-label="Menu"
          icon="menu"
        />
        <!-- <q-toolbar-title class="flex">
          <div class="row items-center q-py-md">
            <q-img src="~assets/img/logo_white.png" style="width: 150px;" />

          </div>
        </q-toolbar-title> -->

          <!-- <div class="YL__toolbar-input-container row no-wrap">
            <q-input dense outlined square v-model="search" placeholder="Buscar" class="bg-white col" />
            <q-btn class="YL__toolbar-input-btn" color="grey-3" text-color="grey-8" icon="search" unelevated />
          </div>

          <div class="q-pa-md q-gutter-sm">
            <q-btn color="primary" label="Crear"/>
          </div> -->

        <q-space />

        <div class="q-mr-md sora-text">
          {{ nameUser }}
        </div>
        <q-btn flat round dense icon="logout" @click="logoutUsr" style="margin-left: 20px;"/>

      </q-toolbar>
    </q-header>

    <!--<q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>-->
    <q-drawer
        v-model="leftDrawerOpen"
        show-if-above
        bordered
        class="bg-black"
        :width="240"
      >
      <div class="row q-py-xl justify-center">
      <q-img src="~assets/img/logo_white.png" style="width: 150px;" />
      </div>
      <!-- <q-scroll-area class="fit"> -->
        <q-list class="text-white">
          <q-item v-for="link in links1" :key="link.text" v-ripple clickable @click=links1>
            <q-item-section avatar>
              <q-icon color="white" :name="link.icon" />
            </q-item-section>
            <router-link  style="text-decoration: none; color: inherit;align-content: center;" :to="link.toPage" replace>
              <q-item-section class="align-center">
                <q-item-label class="self-center text-grey-4">{{ link.text }}</q-item-label>
              </q-item-section>
            </router-link>
          </q-item>

          <q-separator class="q-my-md" />
      </q-list>
    <!-- </q-scroll-area> -->
    </q-drawer>



    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { LocalStorage, SessionStorage } from 'quasar';
import { fabYoutube } from '@quasar/extras/fontawesome-v6'

export default defineComponent({
  name: 'MainLayout',

  setup () {
    const nameUser = SessionStorage.getItem('user');
    const isAdmin = SessionStorage.getItem('is_admin');

    const leftDrawerOpen = ref(false)
    const search = ref('')

    console.log("nameUser: ", nameUser);
    console.log("isAdmin: ", isAdmin);

    function toggleLeftDrawer () {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    return {
      nameUser,
      isAdmin,
      fabYoutube,

      leftDrawerOpen,
      search,

      toggleLeftDrawer,

      links1: [
        { icon: 'home', text: 'Planilla de Control', toPage: 'IndexPage' },
        { icon: 'flag', text: 'ABM Productos', toPage: 'ABMProd' },
        { icon: 'settings', text: 'ABM Usuarios' , toPage: 'ABMUser'}
      ]
    }
  },
  methods: {
    logoutUsr(){
      SessionStorage.clear();
      LocalStorage.clear();
      this.$router.replace("/login")
    },

  }
})
</script>


<style lang="sass">
.YL

  &__toolbar-input-container
    min-width: 100px
    width: 55%

  &__toolbar-input-btn
    border-radius: 0
    border-style: solid
    border-width: 1px 1px 1px 0
    border-color: rgba(0,0,0,.24)
    max-width: 60px
    width: 100%

  &__drawer-footer-link
    color: inherit
    text-decoration: none
    font-weight: 500
    font-size: .75rem

    &:hover
      color: #000
</style>
