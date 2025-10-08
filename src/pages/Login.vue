<template>
  <q-layout>
    <q-page-container>
      <div class="column scroll justify-center items-center window-width background"
        style="height: 100vh; min-height: 600px">
        <transition appear @before-enter="animForm" @enter="animatForm">
          <q-card class="shadow-20" style="height: 470px; width: 780px; border-radius: 5px">
            <q-card-section horizontal style="height: 100%">
              <q-card-section class="col-6 bg-grey-7 flex-center flex">
                <transition appear @before-enter="animLogoEnter" @enter="animLogo">
                  <q-img src="../assets/img/logo_white.png" width="250px" />
                </transition>
              </q-card-section>

              <q-separator vertical />

              <q-card-section class="col-6">
                <q-card-section align="center" style="top: 50px">
                  <div class="text-h5 sora-text" style="font-weight: 500"></div>
                </q-card-section>
                <q-form @submit="onSubmit">
                  <q-card-section style="top: 42px" align="center">
                    <q-input outlined v-model="userForm.user" label="User" class="btn-login sora-text" rounded
                      :rules="[(val) => !!val || '']">
                      <template v-slot:prepend>
                        <q-icon name="person" color="grey-14" />
                      </template>
                    </q-input>

                    <q-input type="password" outlined v-model="userForm.password" label="Password" rounded
                      class="btn-login sora-text" style="margin-top: 25px" :rules="[(val) => !!val || '']">
                      <template v-slot:prepend>
                        <q-icon name="lock" color="grey-14" />
                      </template>
                    </q-input>
                  </q-card-section>

                  <q-card-section align="center" style="top: 50px">
                    <q-btn color="red-7" class="sora-text" type="submit" no-caps icon-right="login"
                      :loading="loading_access" rounded style="height: 56px; width: 249px" text-color="white">
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
import { LocalStorage, SessionStorage, useQuasar } from "quasar";
import { defineComponent, ref } from "vue";
import gsap from "gsap";
import { customNotify, handleCustomError } from "../helpers/errors";
import { api } from "src/boot/axios";
import { useAuthStore } from "src/stores/useAuthStore";

export default defineComponent({
  name: "Login",

  setup() {
    const $q = useQuasar();

    const loading_access = ref(false);
    const userForm = ref({
      user: "",
      password: "",
    });

    // Animaciones (las dejo igual)
    const animForm = (el) => {
      el.style.opacity = 0;
      el.style.transform = "translateY(300px)";
    };
    const animLogoEnter = (el) => {
      el.style.opacity = 0;
    };
    const animLogo = (el, done) => {
      gsap.to(el, {
        duration: 3.6,
        opacity: 1,
        delay: 1.3,
        onComplete: done,
      });
    };
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

    return {
      animForm,
      animatForm,
      animLogo,
      animLogoEnter,
      userForm,
      loading_access,
      $q,
    };
  },

  methods: {
    async onSubmit() {
      this.loading_access = true;
      const auth = useAuthStore(); // <-- importante: obtenemos el store aquí

      try {
        const { data } = await api.post("/login", {
          user: this.userForm.user,
          password: this.userForm.password,
        });

        // DEBUG (si falla, ver en consola qué viene)
        // console.log('login response', data);

        const { id, user, rol, sucursal } = data;

        // Actualizamos el store (setUser guarda también en SessionStorage según tu store)
        auth.setUser(user, rol);

        // Guardar id y branch si corresponde
        if (id) SessionStorage.set("id_user", id);
        if (Number(rol) === 3 && sucursal) {
          SessionStorage.set("branch", sucursal);
        }

        // Filtros por defecto
        if (!LocalStorage.getItem("prodColFilters")) {
          LocalStorage.set("prodColFilters", [
            "modify",
            "delete",
            "nro",
            "descripcion",
            "iva_10",
            "stock",
            "depo",
            "suc1",
            "suc2",
            "iva_21",
            "importe_sin_iva",
          ]);
        }

        // Redirección por rol (aseguramos Number)
        switch (Number(rol)) {
          case 1: // Admin
            this.$router.replace("/ABMProd");
            break;
          case 2: // Semi Admin
          case 3: // User
            this.$router.replace("/StockBranch");
            break;
          default:
            this.$router.replace("/");
        }
      } catch (error) {
        console.error("Login error:", error);
        if (error?.response?.status === 404) {
          customNotify("Nombre de usuario o contraseña incorrectos");
        } else {
          handleCustomError(error.message || error);
        }
      } finally {
        this.loading_access = false; // <-- asegurar que se desactive el loading
      }
    },
  },
});
</script>

<style lang="scss">
.background {
  //background-image: url("../assets/img/NCRAtleos_TeamsBkg_8.png");
  background-color: #f4f4f4;
}

.background-logo {
  //background-color: #D1E0D7;
  background-color: #000000;
}

.btn-login {
  width: 253px;
  height: 70px;
}

#q-app>div>div>div>div>div>div:nth-child(3)>form>div:nth-child(2)>button>span.q-btn__content.text-center.col.items-center.q-anchor--skip.justify-center.row>i {
  padding-left: 7px;
}
</style>
