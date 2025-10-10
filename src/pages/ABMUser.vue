<template>
  <!-- HEADER -->
  <div class="pt-header q-mt-md">
    <div class="q-mx-md">
      <div class="bg-white q-pa-md rounded-borders flex" style="border: solid 1px #e0e0e0">

        <q-btn v-if="userRol == 1" class="q-mr-md q-px-lg" size="md" color="grey-7" outline :disable="loadingScreen"
          @click="open_dialog('create')"><q-icon name="o_person_add" class="q-mr-sm" /><div class="q-pt-xs">Nuevo Usuario</div>
        </q-btn>
        <!-- <q-btn outline color="grey-7" icon="picture_as_pdf"/>
        <q-btn outline color="grey-7" icon="post_add"/> -->

        <q-space />
        <q-input dense outlined debounce="300" v-model="filter" :disable="loadingScreen" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
  </div>

  <!-- TABLA -->
  <div class="q-pa-md">
    <q-table flat separator="cell" v-if="!loadingScreen" bordered dense title="ABM Usuarios" :rows="controles"
      :columns="columns.filter(col => col.name !== 'actions' || userRol === 1)" :loading="loadingTable" row-key="id"
      :filter="filter" virtual-scroll v-model:pagination="pagination" :rows-per-page-options="[0]" color="primary"
      no-hover class="no-shadow text-grey-7 my-sticky-header-table"
      :style="`border: solid 1px #e0e0e0; height:${$q.screen.height - 190}px ;`">
      <!-- Username -->
      <template v-slot:body-cell-user="props">
        <q-td :props="props" :class="props.row.is_active == 0 ? 'bg-grey-2' : ''">
          <div :class="props.row.is_active == 0 ? 'text-grey-5' : ''">
            {{ props.row.user }}
          </div>
        </q-td>
      </template>

      <!-- Rol -->
      <template v-slot:body-cell-rol="props">
        <q-td :props="props" :class="props.row.is_active == 0 ? 'bg-grey-2' : ''">
          <q-badge :color="props.row.is_active == 0
            ? 'grey-5 text-grey-3'
            : 'grey-8 text-white'
            ">
            {{ rolName(props.row.rol) }}
          </q-badge>
        </q-td>
      </template>

      <!-- Sucursal -->
      <template v-slot:body-cell-sucursal="props">
        <q-td :props="props" :class="props.row.is_active == 0 ? 'bg-grey-2' : ''">
          <div :class="props.row.is_active == 0 ? 'text-grey-5' : ''">
            {{ props.row.sucursal ? branchObject[props.row.sucursal] : "-" }}
          </div>
        </q-td>
      </template>

      <!-- fecha -->
      <template v-slot:body-cell-fecha="props">
        <q-td :props="props" :class="props.row.is_active == 0 ? 'bg-grey-2' : ''">
          <!-- <div :class="props.row.is_active == 0 ? 'text-grey-5' : ''">
            {{ parse_datetime(props.row.fecha, "date") }}
          </div> -->
          <div>
            <div>{{ parse_datetime(props.row.fecha, "date") }}</div>
            <q-badge :color="props.row.is_active == 0
              ? 'grey-4 text-grey-5'
              : 'grey-3 text-grey-7'
              ">
              {{ parse_datetime(props.row.fecha, "hours") }}
            </q-badge>
          </div>
        </q-td>
      </template>

      <!-- Acciones -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" :class="props.row.is_active == 0 ? 'bg-grey-2' : ''">
          <div>
            <q-btn outline class="q-mr-sm" :disable="props.row.is_active == 0" @click="open_dialog('Modify', props.row)"
              :color="props.row.is_active == 0 ? 'grey-5' : 'grey-7'" icon="edit" />
            <q-btn outline @click="
              props.row.is_active == 0
                ? activateUser(props.row)
                : deactivateUser(props.row)
              " color="grey-7" :icon="props.row.is_active == 0 ? 'person_add' : 'person_remove'"
              :disable="props.row.id === userId">
              <q-tooltip v-if="props.row.id === userId">
                No se puede desactivar tu propio usuario mientras estás logueado
              </q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- LOADING SCREEN -->
    <q-inner-loading v-else :showing="loadingScreen" class="bg-white" :style="`height:${$q.screen.height - 190
      }px; top:164px; right:16px; left:${$q.screen.width < 1007 ? 16 : 256
      }px;border: 1px solid rgb(224 224 224);border-radius:4px`">
      <q-spinner-puff size="50px" color="red-5" />
    </q-inner-loading>
  </div>

  <!-- DIALOG CONFIRMACION CAMBIO DE ROL -->
  <q-dialog v-model="confirmDialog" persistent transition-show="scale" transition-hide="scale">
    <q-card flat bordered class="bg-white text-grey-8 q-pa-none"
      style="width: 500px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
      <!-- Encabezado -->
      <q-card-section class="flex items-center bg-grey-3 justify-left q-px-lg">
        <div style="font-size: 17px;">Confirmación de cambio de rol</div>
        <!-- <q-space></q-space>
        <q-icon name="error" color="grey-9" size="24px" class="self-center" /> -->
      </q-card-section>

      <!-- Cuerpo -->
      <q-separator />
      <q-card-section class="q-py-md q-px-lg text-grey-8">
        Está a punto de modificar su propio rol de usuario.<br />
        Al confirmar, su sesión actual se cerrará automáticamente y deberá volver a iniciar sesión con el nuevo rol
        asignado.
        <br /><br />
        <span class="text-weight-medium">¿Desea continuar?</span>
      </q-card-section>

      <!-- Acciones -->
      <q-separator />
      <q-card-actions align="right" class="q-px-md" style="padding-top: 8px; padding-bottom: 8px;">
        <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
        <q-btn unelevated label="Confirmar" color="grey-8" @click="confirmChangeRole" />
      </q-card-actions>
    </q-card>
  </q-dialog>



  <!-- DIALOG -->
  <q-dialog v-model="dialog" full-height position="right">
    <q-card class="column full-height" style="width: 500px">
      <!-- header -->
      <q-card-section class="bg-grey-3">
        <div class="text-grey-8">{{ dialogTitle }}</div>
      </q-card-section>

      <!-- body -->
      <q-card-section class="col q-pa-lg">
        <q-form @submit="dialogTitle == 'Nuevo Usuario' ? createUser() : modifyUser()" @reset="onReset"
          class="q-gutter-md">
          <q-input outlined v-model="username" label="Usuario"
            :rules="[(val) => !!val || 'Ingrese un nombre de usuario']" />
          <q-input outlined v-model="password" label="Contraseña"
            :rules="[(val) => !!val || 'Ingrese una contraseña']" />

          <div class="row text-grey-8" style="
              border: 1px solid #c1c1c1;
              border-radius: 4px;
              padding: 8px 30px 8px 14px;
              margin-bottom: 35px;
            ">
            <q-option-group v-model="rol" :options="rolOption" color="primary" inline />
          </div>

          <!-- <q-select
            v-if="rol == 3"
            outlined
            v-model="branch"
            input-debounce="0"
            label="Sucursal"
            :options="branchOption"
            :rules="[(val) => !!val || 'Seleccione una sucursal']"
          > -->

          <q-select outlined v-model="branch" input-debounce="0" label="Sucursal" :options="branchOption"
            :rules="[(val) => !!val || 'Seleccione una sucursal']">
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>

          <div>
            <q-btn :label="dialogTitle == 'Nuevo Usuario'
              ? 'Crear Usuario'
              : 'Modificar Usuario'
              " type="submit" unelevated color="primary" />
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
          </div>
        </q-form>
      </q-card-section>

      <q-inner-loading :showing="dialogLoading" class="bg-white">
        <q-spinner-puff size="50px" color="red-5" />
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script>
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/useAuthStore'
import { defineComponent, ref, onMounted } from "vue";
import { date, SessionStorage, LocalStorage } from "quasar";
import { customNotify, handleCustomError } from "src/helpers/errors";
import * as XLSX from "xlsx-js-style";
import { api } from "src/boot/axios";
import axios from "axios";
import { user } from "fontawesome";
import { useQuasar } from "quasar";

export default defineComponent({

  setup() {
    // VARIABLES
    const auth = useAuthStore()
    const $q = useQuasar();
    const dialog = ref(false);
    const dialogLoading = ref(false);
    const dialogTitle = ref(null);
    const controles = ref([]);
    const loadingScreen = ref(true);
    const loadingTable = ref(false);
    const id = ref(null);
    const username = ref(null);
    const password = ref(null);
    const rol = ref("3");
    const router = useRouter()
    const confirmDialog = ref(false)
    let pendingData = null


    const branch = ref(null);
    const is_active = ref(null);
    const branchObject = { "suc1": "Sucursal Galicia", "suc2": "Sucursal Juan B. Justo", "depo": "Deposito" }
    const rolOption = ref([
      {
        label: "Usuario",
        value: 3,
      },
      {
        label: "Semi Administrador",
        value: 2,
      },
      {
        label: "Administrador",
        value: 1,
      },
    ]);
    const pagination = ref({
      rowsPerPage: 0,
    });

    const userRol = ref(Number(SessionStorage.getItem("rol")));
    const userId = ref(Number(SessionStorage.getItem('id_user')));



    let fileName = "archivo";

    const branchOption = ref([
      { label: "Sucursal Galicia", value: "suc1" },
      { label: "Sucursal Juan B Justo", value: "suc2" },
      { label: "Deposito", value: "depo" },
    ]);

    const columns = [
      { name: "user", label: "Usuario", field: "user", align: "center" },
      {
        name: "rol",
        align: "center",
        label: "Rol",
        field: "rol",
        sortable: true,
      },
      {
        name: "sucursal",
        label: "Sucursal",
        field: "sucursal",
        align: "center",
        format: (val) => branchObject[val],
      },
      {
        name: "fecha",
        label: "Fercha de Modificacion",
        field: "fecha",
        align: "center",
      },
      {
        name: "actions",
        label: "Acciones",
        field: "Actions",
        align: "center",
      },

    ];

    // if (userRol.value == 1) {
    //   columns.push({
    //     name: "actions",
    //     label: "Acciones",
    //     field: "Actions",
    //     align: "center",
    //   });
    // }



    // MOUNTED
    onMounted(() => {
      // Carga de Tabla
      api
        .get("/api/users")
        .then((response) => {
          controles.value = response.data;
          loadingScreen.value = false;
        })
        .catch((error) => {
          handleCustomError(error.message);
        });
    });

    // FUNCIONES
    // Refresca la tabla principal
    const getData = () => {
      api
        .get("/api/users")
        .then((response) => {
          controles.value = response.data;
          loadingTable.value = false;
        })
        .catch((error) => {
          handleCustomError(error.message);
        });
    };

    const rolName = (id) => {
      return rolOption.value.find((option) => option.value == id).label;
    };

    const branchName = (id) => {
      // console.log(id)
      return id
      // ? branchOption.value.find((option) => option.value == id).label
      // : "-";
    };

    // Abrir Dialog
    const open_dialog = (action, data) => {
      dialog.value = true;
      dialogTitle.value = "Nuevo Usuario";
      username.value = null;
      password.value = null;
      rol.value = 3;
      branch.value = null;
      if (action == "Modify") {
        dialogTitle.value = "Modificar Usuario";
        id.value = data.id;
        username.value = data.user;
        password.value = data.password;
        rol.value = data.rol;
        branch.value = branchOption.value.find(
          (option) => option.value == data.sucursal
        );




        // if (rol.value == 3) {
        //   branch.value = branchOption.value.find(
        //     (option) => option.value == data.sucursal
        //   );
        // }
        is_active.value = data.is_active;
      }
    };

    // Crear Usuario
    const createUser = () => {
      dialogLoading.value = true;
      const data = {
        user: username.value,
        password: password.value,
        rol: rol.value,
        sucursal: branch.value.value
        // sucursal: rol.value == 3 ? branch.value.value : null,
      };
      api.post("/api/users", data).then((response) => {
        loadingTable.value = true;
        getData();
        $q.notify({
          icon: "person",
          message: "El usuario se creo correctamente",
          position: "bottom",
          timeout: 2000,
        });
        dialog.value = false;
        dialogLoading.value = false;
      });
    };

    // Modificar Usuario
    const modifyUser = async () => {
      const data = {
        id: id.value,
        user: username.value,
        password: password.value,
        rol: rol.value,
        sucursal: branch.value && branch.value.value ? branch.value.value : (branch.value || null),
        is_active: is_active.value,
      };

      // Si el usuario logueado es el mismo y pasa de rol 1 a otro → pedir confirmación
      if (userId.value === id.value && userRol.value === 1 && Number(rol.value) !== 1) {
        pendingData = data; // guardamos la petición hasta confirmación
        confirmDialog.value = true; // abrimos diálogo formal
        return; // detenemos el flujo normal
      }

      // Flujo normal si NO es cambio del propio admin
      dialogLoading.value = true;
      try {
        await api.put("/api/users", data);
        loadingTable.value = true;
        getData();

        // Actualizamos el propio usuario en auth store y SessionStorage
        if (auth.user && userId.value === id.value) {
          auth.setUser(
            username.value,
            Number(rol.value),
            branch.value && branch.value.value ? branch.value.value : (branch.value || null)
          );
          userRol.value = Number(rol.value);
          SessionStorage.set("rol", Number(rol.value));
          SessionStorage.set(
            "branch",
            branch.value && branch.value.value ? branch.value.value : (branch.value || null)
          );
        }

        $q.notify({
          icon: "settings",
          message: "El usuario se ha modificado correctamente",
          position: "bottom",
          timeout: 2000,
        });

        dialog.value = false;
      } catch (error) {
        handleCustomError(error.message || error);
      } finally {
        dialogLoading.value = false;
      }
    };

    const confirmChangeRole = async () => {
      confirmDialog.value = false;
      dialogLoading.value = true;

      try {
        // aplicamos el cambio al backend
        await api.put("/api/users", pendingData);

        // Actualizamos auth store y SessionStorage antes de cerrar sesión
        if (auth.user && userId.value === pendingData.id) {
          auth.setUser(
            pendingData.user,
            Number(pendingData.rol),
            pendingData.sucursal || null
          );
          userRol.value = Number(pendingData.rol);
          SessionStorage.set("rol", Number(pendingData.rol));
          SessionStorage.set("branch", pendingData.sucursal || null);
        }

        // notificamos
        $q.notify({
          icon: "logout",
          message: "Su rol fue modificado. Procediendo al cierre de sesión para aplicar los cambios.",
          position: "bottom",
          timeout: 2000,
        });

        // limpiamos store y session
        auth.clearUser(); // tu método del Pinia store
        SessionStorage.remove('token'); // opcional, eliminar si usás token
        SessionStorage.remove('id_user'); // tu clearUser ya lo hace, pero por las dudas

        // redirigimos al login (replace para no permitir volver con back)
        router.replace('/login');

      } catch (error) {
        handleCustomError(error.message || error);
      } finally {
        dialogLoading.value = false;
        pendingData = null;
        dialog.value = false;
      }
    };




    // Desactivar Usuario
    const deactivateUser = (dataUser) => {
      const data = {
        id: dataUser.id,
        user: dataUser.user,
        password: dataUser.password,
        rol: dataUser.rol,
        sucursal: dataUser.sucursal,
        // sucursal: dataUser.rol == 3 ? dataUser.sucursal : null,
        is_active: 0,
      };
      api.put("/api/users", data).then((response) => {
        loadingTable.value = true;
        getData();
        $q.notify({
          icon: "person_remove",
          message: "Usuario Desactivado",
          position: "bottom",
          timeout: 2000,
        });
      });
    };

    // Activar Usuario
    const activateUser = (dataUser) => {
      const data = {
        id: dataUser.id,
        user: dataUser.user,
        password: dataUser.password,
        rol: dataUser.rol,
        sucursal: dataUser.sucursal,
        // sucursal: dataUser.rol == 3 ? dataUser.sucursal : null,
        is_active: 1,
      };
      api.put("/api/users", data).then((response) => {
        loadingTable.value = true;
        getData();
        $q.notify({
          icon: "person_add",
          message: "Usuario Activado",
          position: "bottom",
          timeout: 2000,
        });
      });
    };

    const onReset = () => {
      username.value = null;
      password.value = null;
      rol.value = 3;
      branch.value = null;
    };

    return {
      loadingScreen,
      loadingTable,
      columns,
      controles,
      auth,
      username,
      password,
      rol,
      branch,
      rolName,
      branchName,
      filter: ref(""),
      dialog,
      dialogLoading,
      dialogTitle,
      createUser,
      modifyUser,
      confirmChangeRole,
      confirmDialog,
      open_dialog,
      deactivateUser,
      activateUser,
      onReset,
      pagination,
      branchOption,
      branchObject,
      rolOption,
      userRol,
      userId
    };
  },
  methods: {
    async searchData() {
      await api
        .get("/api/control")
        .then((response) => {
          controles.value = response.data;
          this.loading_report = false;
        })
        .catch((error) => {
          this.loading_report = false;
          handleCustomError(error.message);
        });
    },

    parse_datetime(dateString, type) {
      if (type == "date") {
        return date.formatDate(dateString, "DD-MM-YYYY");
      } else {
        return date.formatDate(dateString, "HH:mm");
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.q-dialog__inner--minimized {
  padding-top: 0px !important;
}
</style>

<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  height: 310px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: white

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>

<style lang="sass" scoped>
::v-deep(.q-table__progress)
  transform: translateY(-19px) !important
</style>
