<template>
  <!-- HEADER -->
  <div class="pt-header q-mt-md">
    <div class="q-mx-md">
      <div
        class="bg-white q-pa-md rounded-borders flex"
        style="border: solid 1px #e0e0e0"
      >
        <q-space />
        <q-input
          dense
          outlined
          debounce="300"
          v-model="filter"
          placeholder="Buscar"
          :disable="loadingScreen"
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
      bordered
      title="ABM de Productos"
      :rows="dataTable"
      :columns="columns"
      row-key="id"
      :loading="loadingTable"
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
    const loadingScreen = ref(true);
    const loadingTable = ref(false)
    const dataTable = ref([]);
    const columns = [
      {
        name: "nro",
        align: "center",
        label: "Nro",
        field: "nro",
        sortable: true,
      },
      {
        name: "venta_iva",
        label: "Venta Iva",
        field: "venta_iva",
        align: "center",
      },
      {
        name: "descripcion",
        label: "Descripcion",
        field: "descripcion",
        align: "center",
        sortable: true,
      },
      {
        name: "lista_vieja",
        label: "Lista Vieja",
        field: "lista_vieja",
        align: "center",
        sortable: true,
      },
      {
        name: "importe",
        label: "Importe",
        field: "importe",
        align: "center",
        sortable: true,
      },
      {
        name: "iva_21",
        label: "IVA 21",
        field: "iva_21",
        align: "center",
        sortable: true,
      },
      {
        name: "iva_10",
        label: "IVA 10",
        field: "iva_10",
        align: "center",
        sortable: true,
      },
      {
        name: "oferta_sin_iva",
        label: "Oferta sin IVA",
        field: "oferta_sin_iva",
        align: "center",
        sortable: true,
      },
      {
        name: "aumento",
        label: "Aumento",
        field: "aumento",
        align: "center",
        sortable: true,
      },
      {
        name: "ultimo_modif",
        label: "Ultima Modificacion",
        field: "ultimo_modif",
        align: "center",
        sortable: true,
      },
      {
        name: "prov1",
        label: "Prov1",
        field: "prov1",
        align: "center",
        sortable: true,
      },
      {
        name: "prov2",
        label: "Prov2",
        field: "prov2",
        align: "center",
        sortable: true,
      },
      {
        name: "prov3",
        label: "Prov3",
        field: "prov3",
        align: "center",
        sortable: true,
      },
      {
        name: "oferta",
        label: "Oferta",
        field: "oferta",
        align: "center",
        sortable: true,
      },
      {
        name: "costo_bajo",
        label: "Costo Bajo",
        field: "costo_bajo",
        align: "center",
        sortable: true,
      },
      {
        name: "costo_bajo1",
        label: "Costo Bajo 1",
        field: "costo_bajo1",
        align: "center",
        sortable: true,
      },
      {
        name: "rentab",
        label: "Rentab",
        field: "rentab",
        align: "center",
        sortable: true,
      },
      {
        name: "venta",
        label: "Venta",
        field: "venta",
        align: "center",
        sortable: true,
      },
      {
        name: "un_18",
        label: "Un 18",
        field: "un_18",
        align: "center",
        sortable: true,
      },
      {
        name: "venta_oferta",
        label: "Venta Oferta",
        field: "venta_oferta",
        align: "center",
        sortable: true,
      },
    ];
    const pagination = ref({
      rowsPerPage: 0,
    });

    // MOUNTED
    onMounted(() => {
      // Carga de Tabla
      api
        .get("/api/product_detail")
        .then((response) => {
          dataTable.value = response.data;
          loadingScreen.value = false;
          function exportExcel(dataTable) {
            let data = XLSX.utils.json_to_sheet(dataTable);
            const workbook = XLSX.utils.book_new();
            const filename = "devschile-admins";
            XLSX.utils.book_append_sheet(workbook, data, filename);
            XLSX.writeFile(workbook, `${filename}.xlsx`);
          }
          //exportExcel(response.data);
        })
        .catch((error) => {
          handleCustomError(error.message);
        });
    });

    const parse_datetime = (dateString, type) => {
      if (type == "date") {
        return date.formatDate(dateString, "DD-MM-YYYY");
      } else {
        return date.formatDate(dateString, "HH:mm");
      }
    };

    return {
      columns,
      dataTable,
      parse_datetime,
      filter: ref(""),
      loadingScreen,
    };
  },
});
</script>

<style lang="scss" scoped>
.q-dialog__inner--minimized {
  padding-top: 0px !important;
}
</style>
