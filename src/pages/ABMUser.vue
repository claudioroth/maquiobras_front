<template>
  <!-- HEADER -->
  <div class="pt-header q-mt-md">
    <div class="q-mx-md">
      <div
        class="bg-white q-pa-md rounded-borders flex"
        style="border: solid 1px #e0e0e0"
      >
        <q-btn
          class="q-mr-md q-px-lg"
          size="md"
          color="grey-7"
          outline
          :disable="loadingScreen"
          @click="open_dialog('create')"
          ><q-icon name="o_person_add" class="q-mr-sm" /> Nuevo Usuario
        </q-btn>
        <!-- <q-btn outline color="grey-7" icon="picture_as_pdf"/>
        <q-btn outline color="grey-7" icon="post_add"/> -->

        <q-space />
        <q-input
          dense
          outlined
          debounce="300"
          v-model="filter"
          :disable="loadingScreen"
          placeholder="Buscar"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
  </div>

  <!-- TABLA -->
  <div class="q-pa-md">
    <q-table
      flat
      v-if="!loadingScreen"
      bordered
      title="ABM Usuarios"
      :rows="controles"
      :columns="columns"
      :loading="loadingTable"
      row-key="id"
      :filter="filter"
      virtual-scroll
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
      color="primary"
      class="no-shadow text-grey-7"
      :style="`border: solid 1px #e0e0e0; height:${$q.screen.height - 190}px ;`"
    >
      <!-- <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template> -->
      <!-- Username -->
      <template v-slot:body-cell-user="props">
        <q-td
          :props="props"
          :class="props.row.is_active == 0 ? 'bg-grey-2' : ''"
        >
          <div :class="props.row.is_active == 0 ? 'text-grey-5' : ''">
            {{ props.row.user }}
          </div>
        </q-td>
      </template>

      <!-- Es admin -->
      <template v-slot:body-cell-is_admin="props">
        <q-td
          :props="props"
          :class="props.row.is_active == 0 ? 'bg-grey-2' : ''"
        >
          <div>
            <q-icon
              :name="props.row.is_admin == '1' ? 'done' : 'minimize'"
              :class="
                props.row.is_active == 0
                  ? 'text-grey-5'
                  : props.row.is_admin == '1'
                  ? 'text-red-5'
                  : 'text-grey-8'
              "
              size="2em"
            />
          </div>
        </q-td>
      </template>

      <!-- fecha -->
      <template v-slot:body-cell-fecha="props">
        <q-td
          :props="props"
          :class="props.row.is_active == 0 ? 'bg-grey-2' : ''"
        >
          <!-- <div :class="props.row.is_active == 0 ? 'text-grey-5' : ''">
            {{ parse_datetime(props.row.fecha, "date") }}
          </div> -->
          <div>
            <q-badge :color="props.row.is_active == 0 ? 'grey-4 text-grey-5' : 'grey-3 text-grey-7'">
              {{ props.row.fecha }}
            </q-badge>
          </div>
        </q-td>
      </template>

      <!-- Acciones -->
      <template v-slot:body-cell-actions="props">
        <q-td
          :props="props"
          :class="props.row.is_active == 0 ? 'bg-grey-2' : ''"
        >
          <div>
            <q-btn
              outline
              class="q-mr-sm"
              :disable="props.row.is_active == 0"
              @click="open_dialog('Modify', props.row)"
              :color="props.row.is_active == 0 ? 'grey-5' : 'grey-7'"
              icon="edit"
            />
            <q-btn
              outline
              @click="
                props.row.is_active == 0
                  ? activateUser(props.row)
                  : deactivateUser(props.row)
              "
              color="grey-7"

              :icon="props.row.is_active == 0 ? 'person_add' : 'person_remove'"
            />
          </div>
        </q-td>
      </template>
    </q-table>

      <!-- LOADING SCREEN -->
      <q-inner-loading
      v-else
      :showing="loadingScreen"
      class="bg-white"
      :style="`height:${
        $q.screen.height - 190
      }px; top:164px; right:16px; left:${
        $q.screen.width < 1007 ? 16 : 256
      }px;border: 1px solid rgb(224 224 224);border-radius:4px`"
    >
      <q-spinner-puff size="50px" color="red-5" />
    </q-inner-loading>
  </div>

  <!-- DIALOG -->
  <q-dialog v-model="dialog" full-height position="right">
    <q-card class="column full-height" style="width: 500px">
      <!-- header -->
      <q-card-section class="bg-grey-3">
        <div class="text-grey-8">{{ dialogTitle }}</div>
      </q-card-section>

      <!-- body -->
      <q-card-section class="col q-pa-lg">
        <q-form @submit="dialogTitle == 'Nuevo Usuario' ? createUser() : modifyUser()" @reset="onReset" class="q-gutter-md">
          <q-input
            outlined
            v-model="username"
            label="Usuario"
            :rules="[(val) => !!val || 'Ingrese un nombre de usuario']"
          />
          <q-input
            outlined
            v-model="password"
            label="Contraseña"
            :rules="[(val) => !!val || 'Ingrese una contraseña']"
          />

          <div
            class="row text-grey-8"
            style="
              border: 1px solid #c1c1c1;
              border-radius: 4px;
              padding: 8px 30px 8px 14px;
              margin-bottom: 35px;
            "
          >
            <div class="self-center">Usuario</div>
            <q-toggle v-model="is_admin" color="red" label="Administrador" />
          </div>

          <div>
            <q-btn
              :label="
                dialogTitle == 'Nuevo Usuario'
                  ? 'Crear Usuario'
                  : 'Modificar Usuario'
              "
              type="submit"
              unelevated
              color="primary"
            />
            <q-btn
              label="Reset"
              type="reset"
              color="primary"
              flat
              class="q-ml-sm"
            />
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
import { defineComponent, ref, onMounted } from "vue";
import { date, SessionStorage } from "quasar";
import { customNotify, handleCustomError } from "src/helpers/errors";
import * as XLSX from "xlsx-js-style";
import { api } from "src/boot/axios";
import axios from "axios";
import { user } from "fontawesome";
import { useQuasar } from 'quasar'

export default defineComponent({
  name: "IndexPage",

  setup() {
    // VARIABLES
    const $q = useQuasar()
    const dialog = ref(false);
    const dialogLoading = ref(false);
    const dialogTitle = ref(null);
    const controles = ref([]);
    const loadingScreen = ref(true)
    const loadingTable = ref(false)
    const id = ref(null);
    const username = ref(null);
    const password = ref(null);
    const is_admin = ref(false);
    const is_active = ref(null);

    const pagination = ref({
      rowsPerPage: 0,
    });

    let fileName = "archivo";

    const columns = [
      { name: "user", label: "Usuario", field: "user", align: "center" },
      {
        name: "is_admin",
        align: "center",
        label: "Administrador",
        field: "is_admin",
        sortable: true,
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

    // MOUNTED
    onMounted(() => {
      // Carga de Tabla
      api
        .get("/api/users")
        .then((response) => {
          controles.value = response.data;
          loadingScreen.value = false
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
          loadingTable.value = false
        })
        .catch((error) => {
          handleCustomError(error.message);

        });
    };

    // Abrir Dialog
    const open_dialog = (action, data) => {
      dialog.value = true;
      if (action == "create") {
        dialogTitle.value = "Nuevo Usuario";
        username.value = null;
        password.value = null;
        is_admin.value = false;
      } else {
        dialogTitle.value = "Modificar Usuario";
        id.value = data.id;
        username.value = data.user;
        password.value = data.password;
        is_admin.value = data.is_admin == 1 ? true : false;
        is_active.value = data.is_active;
      }
    };

    // Crear Usuario
    const createUser = () => {
      dialogLoading.value = true;
      const data = {
        user: username.value,
        password: password.value,
        is_admin: is_admin.value == true ? 1 : 0,
      };
      api.post("/api/users", data).then((response) => {
        loadingTable.value = true

        getData();
        $q.notify({
          icon:"person",
          message: "El usuario se creo correctamente",
          position: "bottom",
          timeout: 2000
        })
        dialog.value = false;
        dialogLoading.value = false;
      });
    };

    const modifyUser = () => {
      dialogLoading.value = true;
      const data = {
        id: id.value,
        user: username.value,
        password: password.value,
        is_admin: is_admin.value == true ? 1 : 0,
        is_active: is_active.value,
      };
      api.put("/api/users", data).then((response) => {
        loadingTable.value = true
        getData();
        $q.notify({
          icon:"settings",
          message: "El usuario se ha modificado correctamente",
          position: "bottom",
          timeout: 2000
        })

        dialog.value = false;
        dialogLoading.value = false;
      });
    };

    const deactivateUser = (dataUser) => {
      const data = {
        id: dataUser.id,
        user: dataUser.user,
        password: dataUser.password,
        is_admin: dataUser.is_admin,
        is_active: 0,
      };


      api.put("/api/users", data).then((response) => {
        loadingTable.value = true
        getData();
        $q.notify({
          icon:"person_remove",
          message: "Usuario Desactivado",
          position: "bottom",
          timeout: 2000
        })
      });
    };

    const activateUser = (dataUser) => {
      const data = {
        id: dataUser.id,
        user: dataUser.user,
        password: dataUser.password,
        is_admin: dataUser.is_admin,
        is_active: 1,
      };
      api.put("/api/users", data).then((response) => {
        loadingTable.value = true
        getData();
        $q.notify({
          icon:"person_add",
          message: "Usuario Activado",
          position: "bottom",
          timeout: 2000
        })
      });
    };

    const onReset = () => {
      username.value = null
      password.value = null
      is_admin.value = false
    }

    return {
      loadingScreen,
      loadingTable,
      columns,
      controles,
      username,
      password,
      is_admin,
      filter: ref(""),
      dialog,
      dialogLoading,
      dialogTitle,
      createUser,
      modifyUser,
      open_dialog,
      deactivateUser,
      activateUser,
      onReset,
      pagination,
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
