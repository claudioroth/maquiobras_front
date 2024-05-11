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
      bordered
      title="ABM Usuarios"
      :rows="controles"
      :columns="columns"
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

      <template v-slot:body-cell-retiro="props">
        <q-td :props="props">
          <div>
            <q-badge color="red-7" :label="props.row.retiro" />
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div>
            <q-btn outline class="q-mr-sm" dense color="grey-7" icon="edit" />
            <q-btn outline color="grey-7" dense icon="person_remove" />
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-fecha="props">
        <q-td :props="props">
          <div>{{ parse_datetime(props.row.fecha, "date") }}</div>
          <div>
            <q-badge color="red-7">
              {{ parse_datetime(props.row.fecha, "hours") }}
            </q-badge>
          </div>
        </q-td>
      </template>
    </q-table>
  </div>

  <!-- DIALOG -->
  <q-dialog v-model="dialog" full-height position="right">
    <q-card class="column full-height" style="width: 500px">
      <!-- header -->
      <q-card-section class="bg-grey-3">
        <div class="text-grey-8">Nuevo Retiro</div>
      </q-card-section>

      <!-- body -->
      <q-card-section class="col q-pa-lg">
        <q-form @submit="create_user" @reset="onReset" class="q-gutter-md">
          <q-input
            outlined
            v-model="text"
            label="Usuario"
            :rules="[(val) => !!val || 'Ingrese un nombre de usuario']"
          />
          <q-input
            outlined
            v-model="text"
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
            <q-toggle v-model="value" color="red" label="Administrador" />
          </div>

          <div>
            <q-btn
              label="Crear Usuario"
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

export default defineComponent({
  name: "IndexPage",

  setup() {
    // VARIABLES
    const dialog = ref(false);
    const dialogLoading = ref(false);
    const controles = ref([]);
    const user = ref(null);
    const tool = ref(null);
    const amount = ref(null);
    const selectUsers = ref([]);
    const selectTools = ref([]);
    const optionsSelectUsers = ref(selectUsers.value);
    const optionsSelectTools = ref(selectTools.value);
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
        label: "Fecha de Alta",
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
      get_data();

      // Carga los select
      api.get("/api/controlmix").then((response) => {
        response.data.user.forEach((d) => {
          selectUsers.value.push({ label: d.user, value: d.id });
        });
        response.data.productos.forEach((d) => {
          selectTools.value.push({
            label: `(${d.nro != null ? d.nro : "-"})  ${d.descripcion}`,
            value: d.index,
          });
        });
      });

      console.log(selectTools.value);
    });

    // FUNCIONES
    // Refresca la tabla principal
    const get_data = () => {
      api
        .get("/api/users")
        .then((response) => {
          controles.value = response.data;
        })
        .catch((error) => {
          handleCustomError(error.message);
          console.log(error);
        });
    };

    // Abrir Dialog
    const open_dialog = (action, data) => {
      dialog.value = true;
      user.value = null;
      tool.value = null;
      amount.value = null;
    };

    // Retirar Herramienta
    const create_user = () => {
      dialogLoading.value = true;
      const data = {
        retiro: amount.value,
        id_user: user.value.value,
        id_prod: tool.value.value,
      };

      api.post("/api/control", data).then((response) => {
        console.log(response.data);
        get_data();

        dialog.value = false;
        dialogLoading.value = false;
      });
    };

    // Filtro Select Usuarios
    const filterFnUsers = (val, update) => {
      update(() => {
        const needle = val.toLowerCase();
        optionsSelectUsers.value = selectUsers.value.filter((v) => {
          return v.label.toLowerCase().indexOf(needle) > -1;
        });
      });
    };

    // Filtro Select Herramientas
    const filterFnTools = (val, update) => {
      update(() => {
        const needle = val.toLowerCase();
        optionsSelectTools.value = selectTools.value.filter((v) => {
          return v.label.toLowerCase().indexOf(needle) > -1;
        });
        console.log(optionsSelectTools.value);
      });
    };

    return {
      columns,
      controles,
      user,
      tool,
      amount,
      filter: ref(""),
      dialog,
      dialogLoading,
      selectUsers,
      optionsSelectUsers,
      optionsSelectTools,
      filterFnUsers,
      filterFnTools,
      create_user,
      open_dialog,
      pagination,
    };
  },
  methods: {
    async searchData() {
      console.log("entre");
      await api
        .get("/api/control")
        .then((response) => {
          console.log(response.data);
          controles.value = response.data;
          this.loading_report = false;
        })
        .catch((error) => {
          this.loading_report = false;
          handleCustomError(error.message);
          console.log(error);
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
