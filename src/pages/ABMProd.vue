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
      separator="cell"
      color="primary"
      class="no-shadow text-grey-7 my-sticky-header-last-column-table my-sticky-header-table"
      :style="`border: solid 1px #e0e0e0; height:${$q.screen.height - 190}px ;`"
    >
      <!-- <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template> -->

      <!-- Venta IVA -->
      <template v-slot:body-cell-venta_iva="props">
        <q-td :props="props">
            {{ props.row.venta_iva ? props.row.venta_iva : "-"  }}
        </q-td>
      </template>

      <template v-slot:body-cell-cantidad="props">
        <q-td :props="props">
          <div>
            <q-badge
              v-if="props.row.cantidad"
              color="red-7"
              :label="props.row.cantidad ? props.row.cantidad : '-'"
            />
            <div v-else>-</div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-importe="props">
        <q-td :props="props">
          <div>$ {{ props.row.importe }}</div>
        </q-td>
      </template>

      <!-- Iva 21 -->
      <template v-slot:body-cell-iva_21="props">
        <q-td :props="props">
          <div>
            {{  props.row.prov1 ? "$" + parse_decimal(props.row.iva_21) : "-" }}
          </div>
        </q-td>
      </template>


      <!-- Iva 10 -->
      <template v-slot:body-cell-iva_10="props">
        <q-td :props="props">
          <div>
            {{  props.row.prov1 ? "$" + parse_decimal(props.row.iva_10) : "-" }}
          </div>
        </q-td>
      </template>

      <!-- Aumento -->
      <template v-slot:body-cell-aumento="props">
        <q-td v-if="props.row.aumento" :props="props">
          <div>{{ parse_datetime(props.row.aumento, "date") }}</div>
          <div>
            <q-badge color="red-7">
              {{ parse_datetime(props.row.aumento, "hours") }}
            </q-badge>
          </div>
        </q-td>
        <q-td v-else :props="props"> - </q-td>
      </template>

      <!-- Ultima Modificacion -->
      <template v-slot:body-cell-ultimo_modif="props">
        <q-td v-if="props.row.ultimo_modif" :props="props">
          <div>{{ parse_datetime(props.row.ultimo_modif, "date") }}</div>
          <div>
            <q-badge color="red-7">
              {{ parse_datetime(props.row.ultimo_modif, "hours") }}
            </q-badge>
          </div>
        </q-td>
        <q-td v-else :props="props"> - </q-td>
      </template>

      <!-- Oferta -->
      <template v-slot:body-cell-oferta="props">
        <q-td :props="props">
          <div>
             {{ props.row.oferta ? parse_decimal(props.row.oferta) : "-" }}
          </div>
        </q-td>
      </template>

      <!-- Proveedor1 -->
      <template v-slot:body-cell-prov1="props">
        <q-td :props="props">
          <div>
            {{ props.row.prov1 ? "$" + parse_decimal(props.row.prov1) : "-" }}
          </div>
        </q-td>
      </template>

      <!-- Proveedor2 -->
      <template v-slot:body-cell-prov2="props">
        <q-td :props="props">
          <div>
            {{ props.row.prov2 ? "$" + parse_decimal(props.row.prov2) : "-" }}
          </div>
        </q-td>
      </template>

           <!-- Proveedor3 -->
           <template v-slot:body-cell-prov3="props">
        <q-td :props="props">
          <div>
            {{ props.row.prov3 ? "$" + parse_decimal(props.row.prov3) : "-" }}
          </div>
        </q-td>
      </template>

      <!-- Costo Bajo -->
      <template v-slot:body-cell-costo_bajo="props">
        <q-td :props="props">
          <div>
            {{
              props.row.costo_bajo ? "$" + parse_decimal(props.row.costo_bajo) : "-"
            }}
          </div>
        </q-td>
      </template>

      <!-- Costo Bajo 1 -->
      <template v-slot:body-cell-costo_bajo1="props">
        <q-td :props="props">
          <div>
            {{
              props.row.costo_bajo1 ? "$" + parse_decimal(props.row.costo_bajo1) : "-"
            }}
          </div>
        </q-td>
      </template>

      <!-- Venta -->
      <template v-slot:body-cell-venta="props">
        <q-td :props="props">
          <div>
            {{ parse_decimal(props.row.venta) }}
          </div>
        </q-td>
      </template>

      <!-- Rentab -->
      <template v-slot:body-cell-rentab="props">
        <q-td :props="props">
          <div>
            <q-badge
              v-if="props.row.rentab"
              color="red-7"
              :label="props.row.rentab ? props.row.rentab : '-'"
            />
            <div v-else>-</div>
          </div>
        </q-td>
      </template>

      <!-- Venta IVA -->
      <template v-slot:body-cell-un_18="props">
        <q-td :props="props">
            {{ props.row.un_18 ? props.row.un_18 : "-"  }}
        </q-td>
      </template>

            <!-- Venta Oferta -->
      <template v-slot:body-cell-venta_oferta="props">
        <q-td :props="props">
          <div>
            {{ parse_decimal(props.row.venta_oferta) }}
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
    const loadingTable = ref(false);
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
        align: "left",
        sortable: true,
      },
      {
        name: "cantidad",
        label: "Cantidad",
        field: "cantidad",
        align: "center",
        sortable: true,
      },
      // {
      //   name: "lista_vieja",
      //   label: "Lista Vieja",
      //   field: "lista_vieja",
      //   align: "center",
      //   sortable: true,
      // },
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

    const parse_decimal = (value) => {
      console.log(value);
      var result = parseFloat(value);
      return result.toFixed(2);
    };

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
      parse_decimal,
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

<style lang="sass">
.my-sticky-header-last-column-table

  td:nth-child(11), td:nth-child(12), td:nth-child(13)
    /* bg color is important for td; just specify one */
    background-color: #f7f7f7

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
