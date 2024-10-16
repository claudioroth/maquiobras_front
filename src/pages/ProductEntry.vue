<template>
  <!-- HEADER -->
  <div class="pt-header q-mt-md">
    <div class="q-mx-md">
      <div
        class="bg-white q-pa-md rounded-borders flex"
        style="border: solid 1px #e0e0e0"
      >
        <q-btn
          v-if="userBranch"
          class="q-mr-md q-px-lg"
          size="md"
          color="grey-7"
          outline
          :disable="loadingScreen"
          @click="open_dialog('create')"
          ><q-icon name="add_business" class="q-mr-sm" /> Nuevo Ingreso
        </q-btn>

        <!-- <q-btn-group v-if="useAdmin" push class="no-shadow">
          <q-btn
            :disable="loadingScreen"
            outline
            color="grey-7"
            push
            icon="o_picture_as_pdf"
          />
          <q-btn
            :disable="loadingScreen"
            outline
            color="grey-7"
            push
            icon="post_add"
          />
        </q-btn-group> -->
        <q-space />
        <q-input
          dense
          outlined
          :disable="loadingScreen"
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
      v-if="!loadingScreen"
      flat
      :loading="loadingTable"
      bordered
      title="Ingreso de Stock"
      :rows="income"
      :columns="columns"
      row-key="id"
      :filter="filter"
      separator="cell"
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

      <template v-slot:body-cell-cantidad="props">
        <q-td :props="props">
          <div>
            <q-badge color="grey-7">
              {{ props.row.cantidad }}
            </q-badge>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-fecha="props">
        <q-td :props="props">
          <div>
            <q-badge color="red-7">
              {{ props.row.fecha }}
            </q-badge>
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
        <div class="text-grey-8">Nuevo Ingreso</div>
      </q-card-section>

      <!-- body -->
      <q-card-section class="col q-pa-lg">
        <q-form @submit="newEntry" @reset="onReset" class="q-gutter-md">
          <!-- Semi Administrador -->
          <q-select
            outlined
            v-model="semiAdmin"
            use-input
            input-debounce="0"
            label="Responsable"
            :options="optionsSelectSemiAdmin"
            @filter="filterFnSemiAdmin"
            :rules="[(val) => !!val || 'Seleccione un responsable']"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Herramienta a Retirar -->
          <q-select
            outlined
            v-model="tool"
            use-input
            input-debounce="0"
            label="Herramienta"
            :options="optionsSelectTools"
            @filter="filterFnTools"
            :rules="[(val) => !!val || 'Seleccione una herramienta']"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Cantidad -->
          <q-input
            v-model.number="amount"
            type="number"
            label="Cantidad"
            outlined
            :rules="[(val) => !!val || 'Seleccione una cantidad']"
          />

          <!-- Remito -->
          <q-input
            outlined
            v-model="remito"
            label="Remito"
            mask="#### - ########"
            unmasked-value
            hint="ej = 0001-00000123"
            :rules="[
              (val) => !!val || 'El campo es obligatorio',
              (val) =>
                val.length === 12 || 'Debes completar el remito correctamente',
            ]"
          />

          <div>
            <q-btn
              label="Completar Ingreso"
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
import { defineComponent, ref, onMounted, watch, computed } from "vue";
import { date, SessionStorage } from "quasar";
import { customNotify, handleCustomError } from "src/helpers/errors";
import * as XLSX from "xlsx-js-style";
import { api } from "src/boot/axios";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "IndexPage",

  setup() {
    // VARIABLES
    const $q = useQuasar();
    const loadingScreen = ref(true);
    const loadingTable = ref(false);
    const dialog = ref(false);
    const dialogLoading = ref(true);
    const income = ref([]);
    const user = ref(null);
    const tool = ref(null);
    const amount = ref(null);
    const branch = ref(null);
    const semiAdmin = ref(null);
    const remito = ref(null);
    const semiAdminObject = ref({});
    const usersObject = ref({});
    const branchObject = {
      suc1: "Sucursal Galicia",
      suc2: "Sucursal Juan B. Justo",
      depo: "Deposito",
    };
    const selectSemiAdmin = ref([]);
    const selectTools = ref([]);
    const selectAmount = ref();
    const optionsSelectSemiAdmin = ref(selectSemiAdmin.value);
    const optionsSelectTools = ref(selectTools.value);
    // const useAdmin = SessionStorage.getItem("is_admin");
    const idUser = SessionStorage.getItem("id_user");
    const userBranch = SessionStorage.getItem("branch");
    const pagination = ref({
      rowsPerPage: 0,
    });

    let fileName = "archivo";

    const columns = [
      {
        name: "id_user",
        label: "Usuario",
        field: "id_user",
        align: "center",
        format: (val) => usersObject.value[val],
      },
      {
        name: "id_sucursal",
        align: "center",
        label: "Sucursal",
        field: "id_sucursal",
        format: (val) => branchObject[val],
        sortable: true,
      },
      {
        name: "cantidad",
        align: "center",
        label: "Cantidad",
        field: "cantidad",
        sortable: true,
      },
      {
        name: "producto",
        label: "Producto",
        field: "producto",
        align: "center",
      },
      {
        name: "semi_admin",
        label: "Semi Administrador",
        field: "semi_admin",
        align: "center",
        sortable: true,
        format: (val) => usersObject.value[val],
      },
      {
        name: "remito",
        label: "Remito",
        field: "remito",
        align: "center",
        sortable: true,
      },
      {
        name: "fecha",
        label: "Fecha",
        field: "fecha",
        align: "center",
        sortable: true,
      },
    ];

    // MOUNTED
    onMounted(() => {
      // Carga de Tabla
      api
        .get(`/api/ingreso${userBranch ? `/${userBranch}` : "s"}`)
        .then((response) => {
          income.value = response.data;
          loadingScreen.value = false;
        })
        .catch((error) => {
          handleCustomError(error.message);
        });

      // usuarios
      api.get("/api/users").then((response) => {
        response.data.forEach((u) => {
          usersObject.value[u.id] = u.user;
        });
      });

      // semi administradores
      api.get("/api/semiadmin").then((response) => {
        response.data.forEach((sm) => {
          semiAdminObject.value[sm.id] = sm.user;
        });
      });
    });
    // WATCH
    watch(dialog, (newValue, OldValue) => {
      if (newValue == false) {
        dialogLoading.value = true;
      }
    });

    watch(tool, (newValue, OldValue) => {
      amount.value = null;
    });

    // FUNCIONES

    // Refresca la tabla principal
    const get_data = () => {
      api
        .get(`/api/ingreso${userBranch ? `/${userBranch}` : "s"}`)
        .then((response) => {
          income.value = response.data;
          loadingScreen.value = false;
          loadingTable.value = false;
        })
        .catch((error) => {
          handleCustomError(error.message);
        });
    };

    // Abrir Dialog
    const open_dialog = (action, data) => {
      dialog.value = true;
      tool.value = null;
      semiAdmin.value = null;
      amount.value = null;
      remito.value = null;
      selectSemiAdmin.value = [];
      selectTools.value = [];

      // Carga select semi administradores
      api.get("/api/semiadmin").then((response) => {
        response.data.forEach((sm) => {
          selectSemiAdmin.value.push({ label: sm.user, value: sm.id });
        });

        api.get(`/api/controlmix/${userBranch}`).then((response) => {
          response.data.forEach((t) => {
            selectTools.value.push({ label: t.descripcion, value: t.index });
          });

          dialogLoading.value = false;
        });
      });
    };

    const onReset = () => {
      semiAdmin.value = null;
      tool.value = null;
      amount.value = null;
      branch.value = null;
      remito.value = null;
      // destination.value = null;
    };

    const parseRemito = (input) => {
      const part1 = input.slice(0, 4);
      const part2 = input.slice(4);
      return `${part1}-${part2}`;
    };

    // Ingreso de productos
    const newEntry = () => {
      // dialogLoading.value = true;

      const data = {
        id_user: idUser,
        id_sucursal: userBranch,
        cantidad: amount.value,
        id_prod: tool.value.value,
        producto: tool.value.label,
        semi_admin: semiAdmin.value.value,
        remito: parseRemito(remito.value),
      };

      api.post("/api/ingresos", data).then((response) => {
        loadingTable.value = true;
        get_data();
        $q.notify({
          icon: "done",
          message: "Ingreso completado",
          position: "bottom",
          timeout: 2000,
        });

        dialog.value = false;
        dialogLoading.value = false;
      });
    };

    // Filtro Select Usuarios
    const filterFnSemiAdmin = (val, update) => {
      update(() => {
        const needle = val.toLowerCase();
        optionsSelectSemiAdmin.value = selectSemiAdmin.value.filter((v) => {
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
      });
    };

    return {
      columns,
      loadingScreen,
      loadingTable,
      income,
      user,
      tool,
      amount,
      branch,
      semiAdmin,
      remito,
      semiAdminObject,
      branchObject,
      filter: ref(""),
      dialog,
      dialogLoading,
      selectSemiAdmin,
      optionsSelectSemiAdmin,
      optionsSelectTools,
      filterFnSemiAdmin,
      filterFnTools,
      onReset,
      newEntry,
      open_dialog,
      pagination,
      selectAmount,
      userBranch,
    };
  },
});
</script>

<style lang="scss" scoped>
.q-dialog__inner--minimized {
  padding-top: 0px !important;
}
</style>
