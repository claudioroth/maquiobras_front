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
      separator="cell"
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

      <!-- Rol -->
      <template v-slot:body-cell-rol="props">
        <q-td
          :props="props"
          :class="props.row.is_active == 0 ? 'bg-grey-2' : ''"
        >
          <q-badge
            :color="
              props.row.is_active == 0
                ? 'grey-5 text-grey-3'
                : 'grey-8 text-white'
            "
          >
            {{ rolName(props.row.rol) }}
          </q-badge>
        </q-td>
      </template>

      <!-- Sucursal -->
      <template v-slot:body-cell-sucursal="props">
        <q-td
          :props="props"
          :class="props.row.is_active == 0 ? 'bg-grey-2' : ''"
        >
          <div :class="props.row.is_active == 0 ? 'text-grey-5' : ''">
            {{ props.row.sucursal ? branchObject[props.row.sucursal] : "-"}}
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
            <div>{{ parse_datetime(props.row.fecha, "date") }}</div>
            <q-badge
              :color="
                props.row.is_active == 0
                  ? 'grey-4 text-grey-5'
                  : 'grey-3 text-grey-7'
              "
            >
            {{ parse_datetime(props.row.fecha, "hours") }}
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
        <q-form
          @submit="dialogTitle == 'Nuevo Usuario' ? createUser() : modifyUser()"
          @reset="onReset"
          class="q-gutter-md"
        >
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
            <q-option-group
              v-model="rol"
              :options="rolOption"
              color="primary"
              inline
            />
          </div>

          <q-select
            v-if="rol == 3"
            outlined
            v-model="branch"
            input-debounce="0"
            label="Sucursal"
            :options="branchOption"
            :rules="[(val) => !!val || 'Seleccione una sucursal']"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>

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
import { useQuasar } from "quasar";

export default defineComponent({
  name: "IndexPage",

  setup() {
    // VARIABLES
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
    const branch = ref(null);
    const is_active = ref(null);
    const branchObject = {"suc1":"Sucursal Galicia","suc2":"Sucursal Juan B. Justo", "depo":"Deposito"}
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

        if (rol.value == 3) {
          branch.value = branchOption.value.find(
            (option) => option.value == data.sucursal
          );
        }
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
        sucursal: rol.value == 3 ? branch.value.value : null,
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

    const modifyUser = () => {
      dialogLoading.value = true;
      const data = {
        id: id.value,
        user: username.value,
        password: password.value,
        rol: rol.value,
        sucursal: rol.value == 3 ? branch.value.value : null,
        is_active: is_active.value,
      };



      api.put("/api/users", data).then((response) => {
        loadingTable.value = true;
        getData();
        $q.notify({
          icon: "settings",
          message: "El usuario se ha modificado correctamente",
          position: "bottom",
          timeout: 2000,
        });

        dialog.value = false;
        dialogLoading.value = false;
      });
    };

    const deactivateUser = (dataUser) => {
      const data = {
        id: dataUser.id,
        user: dataUser.user,
        password: dataUser.password,
        rol: dataUser.rol,
        sucursal: dataUser.rol == 3 ? dataUser.sucursal : null,
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

    const activateUser = (dataUser) => {
      const data = {
        id: dataUser.id,
        user: dataUser.user,
        password: dataUser.password,
        rol: dataUser.rol,
        sucursal: dataUser.rol == 3 ? dataUser.sucursal : null,
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
      open_dialog,
      deactivateUser,
      activateUser,
      onReset,
      pagination,
      branchOption,
      branchObject,
      rolOption,
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
