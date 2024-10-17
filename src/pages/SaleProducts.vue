<template>
  <!-- HEADER -->
  <div class="pt-header q-mt-md">
    <div class="q-mx-md">
      <div
        class="bg-white q-pa-md rounded-borders flex"
        style="border: solid 1px #e0e0e0"
      >
        <q-btn
          v-if="useAdmin"
          class="q-mr-md q-px-lg"
          size="md"
          color="grey-7"
          outline
          :disable="loadingScreen"
          @click="open_dialog('create')"
          ><q-icon name="construction" class="q-mr-sm" /> Nuevo Retiro
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
      dense
      title="Ventas"
      :rows="sales"
      :columns="columns"
      row-key="id"
      :filter="filter"
      separator="cell"
      virtual-scroll
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
      color="primary"
      no-hover
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

      <template v-slot:body-cell-id_user="props">
        <q-td no-hover :props="props">
            {{ props.row.id_user }}
        </q-td>
      </template>

      <template v-slot:body-cell-id_sucursal="props">
        <q-td no-hover :props="props">
            {{ props.row.id_sucursal }}
        </q-td>
      </template>

      <template v-slot:body-cell-ventas="props">
        <q-td no-hover :props="props">
          <div>
            <q-btn
              label="productos"
              color="primary"
              dense
              outline
              style="padding-top: 6px"
              class="q-px-sm"
              icon="shopping_cart"
              size="sm"
              @mouseover="showPopup = true"

            />

            <q-popup-proxy
              v-model="showPopup"
              transition-show="scale"
              transition-hide="scale"
              class="no-shadow q-pa-none q-mt-md"
              style="border: 1px solid #ebebeb; margin-top: 10px!important;"
            >
              <q-card class="bg-grey-2 q-pa-none">
                <q-card-section>
                  <q-table
                    dense
                    class="text-grey-8 text-sm bg-grey-2 custom-font-size"
                    table-style="font-size:8px"
                    :rows="JSON.parse(props.row.ventas)"
                    :columns="salesColumns"
                    row-key="id_prod"
                    hide-bottom
                    flat
                    separator="cell"
                    bordered
                  />
                </q-card-section>
              </q-card>
            </q-popup-proxy>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-fecha="props">
        <q-td no-hover :props="props">
          <q-badge color="red-7">
            {{ props.row.fecha }}
          </q-badge>
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
        <div class="text-grey-8">Nuevo Retiro</div>
      </q-card-section>

      <!-- body -->
      <q-card-section class="col q-pa-lg">
        <q-form
          @submit="create_withdrawal"
          @reset="onReset"
          class="q-gutter-md"
        >
          <!-- Usuario -->
          <q-select
            outlined
            v-model="user"
            use-input
            input-debounce="0"
            label="Usuario"
            :options="optionsSelectUsers"
            @filter="filterFnUsers"
            :rules="[(val) => !!val || 'Seleccione un usuario']"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Sucursal -->
          <q-select
            outlined
            v-model="branch"
            input-debounce="0"
            label="Sucursal"
            :options="selectBranch"
            :rules="[(val) => !!val || 'Seleccione una sucursal']"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Destino -->
          <q-select
            outlined
            v-model="destination"
            input-debounce="0"
            label="Destino"
            :disable="!branch"
            :options="selectDestination"
            :rules="[(val) => !!val || 'Seleccione un destino']"
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
            :disable="branch ? false : true"
            input-debounce="0"
            label="Herramienta"
            :options="optionsSelectTools"
            @filter="filterFnTools"
            :hint="tool ? `Hay ${tool.amount} en stock` : null"
            :rules="[(val) => !!val || 'Seleccione una herramienta']"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Cantidad -->
          <q-select
            outlined
            v-model="amount"
            :disable="tool ? (tool.amount == 0 ? true : false) : true"
            input-debounce="0"
            label="Cantidad"
            :options="tool ? createNumberList(tool.amount) : null"
            :rules="[(val) => !!val || 'Seleccione una cantidad']"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- createNumberList -->

          <div>
            <q-btn
              label="Completar Retiro"
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
    const showPopup = ref(false);
    const sales = ref([]);
    const user = ref(null);
    const tool = ref(null);
    const amount = ref(null);
    const branch = ref(null);
    const destination = ref(null);
    const selectUsers = ref([]);
    const selectTools = ref([]);
    const selectAmount = ref();
    const selectBranch = ["Deposito", "Local Galicia", "Local Juan B Justo"];
    const optionsSelectUsers = ref(selectUsers.value);
    const optionsSelectTools = ref(selectTools.value);
    const useAdmin = SessionStorage.getItem("is_admin");
    const pagination = ref({
      rowsPerPage: 0,
    });

    let fileName = "archivo";
    const salesColumns = [
      {
        name: "cantidad",
        label: "Cantidad",
        field: "cantidad",
        align: "center",
      },
      {
        name: "producto",
        label: "Productos",
        field: "producto",
        align: "center",
      },
    ];

    const columns = [
      { name: "id_user", label: "Usuario", field: "id_user", align: "center" },
      {
        name: "id_sucursal",
        align: "center",
        label: "Sucursal",
        field: "id_sucursal",
        sortable: true,
      },
      {
        name: "ventas",
        align: "center",
        label: "Ventas",
        field: "ventas",
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
        .get("/api/ventas1")
        .then((response) => {
          sales.value = response.data;
          console.log(sales.value);
          loadingScreen.value = false;
        })
        .catch((error) => {
          handleCustomError(error.message);
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

    // Carga el selector de herramientas segun el local
    watch(branch, (newValue, OldValue) => {
      selectTools.value = [];
      tool.value = null;
      let selectSuc = null;
      switch (newValue) {
        case "Local Galicia":
          selectSuc = "suc1";
          break;
        case "Local Juan B Justo":
          selectSuc = "suc2";
          break;
        case "Deposito":
          selectSuc = "depo";
          break;
        default:
          selectSuc = null;
      }
      if (selectSuc) {
        api.get(`/api/controlmix/${selectSuc}`).then((response) => {
          response.data.forEach((d) => {
            const obj = {
              suc1: d.suc1,
              suc2: d.suc2,
              depo: d.depo,
            };

            selectTools.value.push({
              label: `(${d.nro != null ? d.nro : "-"})  ${d.descripcion}`,
              value: d.index,
              amount: obj[selectSuc],
            });
          });
        });
      }
    });

    // COMPUTER
    const selectDestination = computed(() => {
      return branch.value
        ? selectBranch.filter((item) => item !== branch.value)
        : [];
    });

    // FUNCIONES
    // Crea una lista segun el numero en el stock
    const createNumberList = (until) => {
      const list = [];
      for (let i = 1; i <= until; i++) {
        list.push(i);
      }
      return list;
    };

    // Refresca la tabla principal
    const get_data = () => {
      api
        .get("/api/control")
        .then((response) => {
          sales.value = response.data;
          loadingTable.value = false;
        })
        .catch((error) => {
          handleCustomError(error.message);
        });
    };

    // Abrir Dialog
    const open_dialog = (action, data) => {
      dialog.value = true;
      user.value = null;
      tool.value = null;
      amount.value = null;
      branch.value = null;
      destination.value = null;
      selectUsers.value = [];
      selectTools.value = [];

      // Carga select Usuarios
      api.get("/api/controlmix").then((response) => {
        response.data.user.forEach((d) => {
          selectUsers.value.push({ label: d.user, value: d.id });
        });
        dialogLoading.value = false;
      });
    };

    const onReset = () => {
      user.value = null;
      tool.value = null;
      amount.value = null;
      branch.value = null;
      destination.value = null;
    };

    // Retirar Herramienta
    const create_withdrawal = () => {
      dialogLoading.value = true;

      const data = {
        retiro: amount.value,
        id_user: user.value.value,
        id_prod: tool.value.value,
        descripcion: tool.value.label,
        local: branch.value,
        destino: destination.value,
      };

      api.post("/api/control", data).then((response) => {
        loadingTable.value = true;
        get_data();
        $q.notify({
          icon: "done",
          message: "Retiro completado",
          position: "bottom",
          timeout: 2000,
        });

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
      });
    };

    return {
      columns,
      salesColumns,
      loadingScreen,
      loadingTable,
      sales,
      user,
      tool,
      amount,
      branch,
      destination,
      filter: ref(""),
      dialog,
      dialogLoading,
      showPopup,
      selectUsers,
      optionsSelectUsers,
      optionsSelectTools,
      filterFnUsers,
      filterFnTools,
      onReset,
      create_withdrawal,
      open_dialog,
      createNumberList,
      pagination,
      useAdmin,
      selectBranch,
      selectAmount,
      selectDestination,
    };
  },
});
</script>

<style lang="scss" scoped>
.q-dialog__inner--minimized {
  padding-top: 0px !important;
}

</style>
