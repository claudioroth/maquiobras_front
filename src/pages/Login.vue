<template>
  <q-layout>
    <q-page-container>
      <div class="column scroll justify-center items-center window-width background"
          style="height: 100vh; min-height: 600px"
      >
      <transition appear @before-enter="animForm" @enter="animatForm">
        <q-card class="shadow-20" style="height: 470px; width: 780px; border-radius: 5px">
          <q-card-section horizontal style="height: 100%;">
            <q-card-section class="col-6 bg-grey-7 flex-center flex">
                <transition appear @before-enter="animLogoEnter" @enter="animLogo">
                  <q-img src="../assets/img/logo_white.png" width="250px"/>
                </transition>
              </q-card-section>

            <q-separator vertical />

            <q-card-section class="col-6">
              <q-card-section align="center" style="top: 50px">
                <div class="text-h5 sora-text" style="font-weight: 500;"></div>
              </q-card-section>
              <q-form @submit="onSubmit">
                <q-card-section style="top: 42px" align="center">
                  <q-input
                    outlined
                    v-model="userForm.user"
                    label="User"
                    class="btn-login sora-text"
                    rounded
                    :rules="[(val) => !!val || '']"
                    >

                    <template v-slot:prepend>
                      <q-icon name="person" color="grey-14" />
                    </template>
                  </q-input>

                  <q-input
                    type="password"
                    outlined
                    v-model="userForm.password"
                    label="Password"
                    rounded
                    class="btn-login sora-text"
                    style="margin-top: 25px"
                    :rules="[(val) => !!val || '']"
                    >

                    <template v-slot:prepend>
                      <q-icon name="lock" color="grey-14" />
                    </template>
                  </q-input>
                </q-card-section>

                <q-card-section align="center" style="top: 50px">
                  <q-btn
                    color="red-7"
                    class="sora-text"
                    type="submit"
                    no-caps
                    icon-right="login"
                    :loading="loading_access"
                    rounded
                    style="height: 56px; width: 249px;"
                    text-color="white"
                    >
                    ACCESO
                  </q-btn>
                </q-card-section>
              </q-form>
            </q-card-section>
          </q-card-section>
        </q-card>
      </transition>

      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import { SessionStorage, useQuasar } from "quasar";
import { defineComponent, ref } from "vue";
import gsap from "gsap";
import { customNotify, handleCustomError } from "../helpers/errors";
// import { api, axios } from "src/boot/axios";
import axios from "axios";
import { api } from "src/boot/axios";

export default defineComponent({
  name: "Login",

  setup() {
    const $q = useQuasar();

    let loading_access = ref(false);
    const userForm = ref({
      user: "",
      password: "",
    });

    //TODO: Animación
    const animForm = (el) => {
      el.style.opacity = 0;
      el.style.transform = "translateY(300px)";
    };
    const animLogoEnter = (el) => {
      el.style.opacity = 0;
      // gsap.set(el, {
      //   opacity: 0,
      //   delay: 1.2
      // })
    };
    const animLogo = (el, done) => {
      gsap.to(el, {
        duration: 3.6,
        opacity: 1,
        delay: 1.3,
        onComplete: done,
      });
    }
    const animatForm = (el, done) => {
      gsap.to(el, {
        duration: 1.5,
        opacity: 1,
        y: 0,
        delay: 0.2,
        ease: "power3.inOut",
        stagger: 0.1,
        onComplete: done,
      });
    };

    return{
      animForm,
      animatForm,
      animLogo,
      animLogoEnter,
      userForm,
      loading_access
    };

  },

  methods: {
    async onSubmit() {
        this.loading_access = true;

        await api.post("/login", {user: this.userForm.user, password: this.userForm.password}).then((response) => {

          SessionStorage.set('user', response.data.user);
          SessionStorage.set('password', response.data.password);
          SessionStorage.set('is_admin', response.data.is_admin);
          this.$router.replace("/");
          this.loading_access = true;
        }).catch((error) => {

          this.loading_access = false;
          if (error.message == 'Request failed with status code 404') {
            customNotify('Incorrect username or password');
          } else {
            handleCustomError(error.message);
          }
        this.loading_access = false;
        });


    },
  },
})
</script>

<style lang="scss">
.background{
  //background-image: url("../assets/img/NCRAtleos_TeamsBkg_8.png");
background-color: #f4f4f4;
}
.background-logo{
  //background-color: #D1E0D7;
  background-color: #000000;
}
.btn-login{
  width: 253px;
  height: 70px;
}

#q-app > div > div > div > div > div > div:nth-child(3) > form > div:nth-child(2) > button > span.q-btn__content.text-center.col.items-center.q-anchor--skip.justify-center.row > i{
  padding-left: 7px;
}
</style>
