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
          ><q-icon name="construction" class="q-mr-sm" /> Nuevo Producto
        </q-btn>

        <q-btn
          class="q-mr-md q-px-lg"
          size="md"
          color="grey-7"
          outline
          :disable="loadingScreen"
          @click="open_dialog_column_filters()"
          ><q-icon name="filter_alt" class="q-mr-sm" /> filtro columnas
        </q-btn>

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
      dense
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
      :visible-columns="visibleColumns"
    >
      <!-- <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template> -->

      <!-- Venta IVA -->
      <!-- <template v-slot:body-cell-venta_iva="props">
        <q-td :props="props">
            {{ props.row.venta_iva ? props.row.venta_iva : "-"  }}
        </q-td>
      </template> -->

      <template v-slot:body-cell-modify="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            color="primary"
            size="10px"
            icon="edit"
            @click="open_dialog('modify', props.row)"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-stock="props">
        <q-td :props="props">
          <div>
            <q-badge
              v-if="props.row.stock"
              color="red-7"
              :label="props.row.stock ? props.row.stock : '-'"
            />
            <div v-else>-</div>
          </div>
        </q-td>
      </template>

      <!-- Importe sin IVA -->
      <template v-slot:body-cell-importe_sin_iva="props">
        <q-td :props="props">
          <div>$ {{ props.row.importe_sin_iva }}</div>
        </q-td>
      </template>

      <!-- Iva 21 -->
      <template v-slot:body-cell-iva_21="props">
        <q-td :props="props">
          <div>
            {{ props.row.iva_21 ? "$" + parse_decimal(props.row.iva_21) : "-" }}
          </div>
        </q-td>
      </template>

      <!-- Iva 10 -->
      <template v-slot:body-cell-iva_10="props">
        <q-td :props="props">
          <div>
            {{ props.row.iva_10 ? "$" + parse_decimal(props.row.iva_10) : "-" }}
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
      <!-- <template v-slot:body-cell-oferta_costo="props">
        <q-td :props="props">
          <div>
             {{ props.row.oferta_costo ? parse_decimal(props.row.oferta_costo) : "-" }}
          </div>
        </q-td>
      </template> -->

      <!-- Proveedor1 -->
      <!-- <template v-slot:body-cell-prov1="props">
        <q-td :props="props">
          <div>
            {{ props.row.prov1 ? "$" + parse_decimal(props.row.prov1) : "-" }}
          </div>
        </q-td>
      </template> -->

      <!-- Proveedor2 -->
      <!-- <template v-slot:body-cell-prov2="props">
        <q-td :props="props">
          <div>
            {{ props.row.prov2 ? "$" + parse_decimal(props.row.prov2) : "-" }}
          </div>
        </q-td>
      </template> -->

      <!-- Proveedor3 -->
      <!-- <template v-slot:body-cell-prov3="props">
        <q-td :props="props">
          <div>
            {{ props.row.prov3 ? "$" + parse_decimal(props.row.prov3) : "-" }}
          </div>
        </q-td>
      </template> -->

      <!-- Costo Bajo -->
      <!-- <template v-slot:body-cell-costo_bajo="props">
        <q-td :props="props">
          <div>
            {{
              props.row.costo_bajo ? "$" + parse_decimal(props.row.costo_bajo) : "-"
            }}
          </div>
        </q-td>
      </template> -->

      <!-- Costo Bajo 1 -->
      <!-- <template v-slot:body-cell-costo_bajo1="props">
        <q-td :props="props">
          <div>
            {{
              props.row.costo_bajo1 ? "$" + parse_decimal(props.row.costo_bajo1) : "-"
            }}
          </div>
        </q-td>
      </template> -->

      <!-- Venta -->
      <!-- <template v-slot:body-cell-venta="props">
        <q-td :props="props">
          <div>
            {{ parse_decimal(props.row.venta) }}
          </div>
        </q-td>
      </template> -->

      <!-- Rentab -->
      <!-- <template v-slot:body-cell-rentab="props">
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
      </template> -->

      <!-- Venta IVA -->
      <!-- <template v-slot:body-cell-un_18="props">
        <q-td :props="props">
            {{ props.row.un_18 ? props.row.un_18 : "-"  }}
        </q-td>
      </template> -->

      <!-- Venta Oferta -->
      <!-- <template v-slot:body-cell-venta_oferta="props">
        <q-td :props="props">
          <div>
            {{ parse_decimal(props.row.venta_oferta) }}
          </div>
        </q-td>
      </template> -->
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

  <!-- DIALOG FILTER -->
  <q-dialog v-model="columnFilter">
    <q-card style="width: 300px" class="q-px-sm q-pb-md">
      <q-card-section>
        <div v-if="$q.screen.gt.xs" class="col">
          <!-- <q-toggle v-model="visibleColumns" val="nro" label="Calories" /> -->
          <!-- <q-toggle v-model="visibleColumns" val="descripcion" label="Fat" /> -->
          <q-toggle
            v-model="visibleColumns"
            val="importe_sin_iva"
            label="Importe sin IVA"
          />
          <q-toggle v-model="visibleColumns" val="iva_21" label="IVA 21%" />
          <q-toggle v-model="visibleColumns" val="iva_10" label="IVA10%" />
          <q-toggle
            v-model="visibleColumns"
            val="oferta_sin_iva"
            label="Oferta sin IVA"
          />
          <q-toggle v-model="visibleColumns" val="aumento" label="Aumento" />
          <q-toggle
            v-model="visibleColumns"
            val="ultimo_modif"
            label="Ultima modificacion"
          />
          <q-toggle
            v-model="visibleColumns"
            val="oferta_costo"
            label="Oferta costo"
          />
          <q-toggle
            v-model="visibleColumns"
            val="costo_mas_bajo"
            label="Costo mas bajo"
          />
          <q-toggle
            v-model="visibleColumns"
            val="rentabilidad"
            label="Rentabilidad"
          />
          <!-- <q-toggle v-model="visibleColumns" val="stock" label="Iron" /> -->
        </div>
        <q-select
          v-else
          v-model="visibleColumns"
          multiple
          borderless
          dense
          options-dense
          :display-value="$q.lang.table.columns"
          emit-value
          map-options
          :options="columns"
          option-value="name"
          style="min-width: 150px"
        />
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- DIALOG -->
  <q-dialog v-model="dialog" full-height position="right">
    <q-card class="column full-height" style="width: 600px">
      <!-- header -->
      <q-card-section class="bg-grey-3">
        <div class="text-grey-8">{{ dialogTitle }}</div>
      </q-card-section>

      <!-- body -->
      <q-card-section class="col q-pa-lg">
        <q-form @submit="dialogTitle == 'Nuevo Producto' ? create_product : modify_product" @reset="onReset" class="q-gutter-md">
          <!-- Nro -->
          <q-select
            outlined
            dense
            v-model="nro"
            use-input
            multiple
            input-debounce="0"
            label="Nro"
            :options="suppliers"
            :rules="[(val) => !!val || 'Seleccione un usuario']"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Descripcion -->
          <q-input
            dense
            outlined
            v-model="description"
            label="Descripcion"
            :rules="[(val) => !!val || 'Seleccione una herramienta']"
          />

          <div class="row"></div>

          <div class="row">
            <!-- Importe sin IVA -->
            <q-input
              dense
              outlined
              class="col q-mr-md"
              v-model="amountWithoutIva"
              label="Importe sin IVA"
            />

            <!-- Oferta sin IVA -->
            <q-input
              dense
              outlined
              v-model="offerWithoutIva"
              class="col q-mr-md"
              label="Oferta sin IVA"
            />

            <!-- Iva 21 -->
            <!-- <q-input
              dense
              outlined
              v-model="iva21"
              label="IVA 21"
              class="col q-mr-md"
            /> -->

            <!-- Iva 10 -->
            <!-- <q-input
              dense
              outlined
              v-model="iva10"
              label="IVA 10"
              class="col"
            /> -->
          </div>

          <div class="row">
            <!-- Aumento -->
            <q-input
              outlined
              dense
              clear-icon="close"
              clearable
              readonly
              class="col q-mr-md"
              v-model="increases"
              label="Aumento"
            >
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="increases" mask="YYYY-MM-DD HH:mm">
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>

              <template v-slot:append>
                <q-icon
                  v-if="increases"
                  name="cancel"
                  @click.stop.prevent="increases = null"
                  class="cursor-pointer"
                />

                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time
                      v-model="increases"
                      mask="YYYY-MM-DD HH:mm"
                      format24h
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <!-- Ultima Modificacion -->
            <q-input
              outlined
              dense
              class="col"
              clear-icon="close"
              clearable
              readonly
              v-model="lastModification"
              label="Ultima Modificacion"
            >
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="lastModification" mask="YYYY-MM-DD HH:mm">
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>

              <template v-slot:append>
                <q-icon
                  v-if="lastModification"
                  name="cancel"
                  @click.stop.prevent="lastModification = null"
                  class="cursor-pointer"
                />

                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time
                      v-model="lastModification"
                      mask="YYYY-MM-DD HH:mm"
                      format24h
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="row">
            <!-- Oferta Costo -->
            <q-input
              dense
              outlined
              class="col q-mr-md"
              v-model="offerCost"
              label="Oferta Costo"
            />

            <!-- Costo mas bajo -->
            <q-input
              outlined
              dense
              class="col"
              v-model="lowestCost"
              label="Costo mas bajo"
            />
          </div>

          <div class="row">
            <!-- Rentabilidad -->
            <q-input
              outlined
              class="col-4 q-mr-md"
              dense
              v-model="costEffectiveness"
              label="Rentabilidad"
            />

            <!-- Stock -->
            <q-input
              outlined
              class="col"
              dense
              type="number"
              v-model="stock"
              label="Cantidad"
            />
          </div>

          <div>
            <q-btn
              :label="dialogButton"
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
import { defineComponent, ref, onMounted, watch } from "vue";
import { date, SessionStorage } from "quasar";
import { customNotify, handleCustomError } from "src/helpers/errors";
import * as XLSX from "xlsx-js-style";
import { api } from "src/boot/axios";
import axios from "axios";
import { suppliers } from "src/helpers/suppliers";

export default defineComponent({
  name: "IndexPage",

  setup() {
    // VARIABLES
    const loadingScreen = ref(true);
    const loadingTable = ref(false);
    const dataTable = ref([]);
    const dialog = ref(false);
    const dialogTitle = ref();
    const dialogButton = ref();
    const columnFilter = ref(false);

    const nro = ref();
    const description = ref();
    const amountWithoutIva = ref();
    const iva21 = ref();
    const iva10 = ref();
    const offerWithoutIva = ref();
    const increases = ref();
    const lastModification = ref();
    const offerCost = ref();
    const lowestCost = ref();
    const costEffectiveness = ref();
    const stock = ref();

    const columns = [
      {
        name: "modify",
        align: "left",
        label: "",
        field: "modify",
        sortable: true,
      },
      {
        name: "nro",
        align: "center",
        label: "Nro",
        field: "nro",
        sortable: true,
      },
      {
        name: "descripcion",
        label: "Descripcion",
        field: "descripcion",
        align: "center",
        sortable: true,
      },
      {
        name: "stock",
        label: "Stock",
        field: "stock",
        align: "center",
        sortable: true,
      },
      {
        name: "importe_sin_iva",
        label: "Importe sin IVA",
        field: "importe_sin_iva",
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
        name: "oferta_costo",
        label: "Oferta Costo",
        field: "oferta_costo",
        align: "center",
        sortable: true,
      },
      {
        name: "costo_mas_bajo",
        label: "Costo mas Bajo",
        field: "costo_mas_bajo",
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
        name: "rentabilidad",
        label: "Rentabilidad",
        field: "rentabilidad",
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
          console.log(dataTable.value);
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

    // WATCH
    watch(dialog, (newValue, OldValue) => {
      if (newValue == false) {
        nro.value = null;
        description.value = null;
        amountWithoutIva.value = null;
        iva21.value = null;
        iva10.value = null;
        offerWithoutIva.value = null;
        increases.value = null;
        lastModification.value = null;
        offerCost.value = null;
        lowestCost.value = null;
        costEffectiveness.value = null;
        stock.value = null;
      }
    });

    // FUNCIONES
    const parse_decimal = (value) => {
      console.log(value);
      var result = parseFloat(value);
      if (result % 1 !== 0) {
        // Check if there is a fractional part
        return result.toFixed(2);
      }
      return result.toFixed(0); // Return as integer if there is no fractional part
    };

    const parse_datetime = (dateString, type) => {
      if (type == "date") {
        return date.formatDate(dateString, "DD-MM-YYYY");
      } else {
        return date.formatDate(dateString, "HH:mm");
      }
    };

    // Abrir Dialog Filters
    const open_dialog_column_filters = () => {
      columnFilter.value = true;
    };

    // Abrir Dialog
    const open_dialog = (action, data) => {
      dialogTitle.value = "Nuevo Producto";
      dialogButton.value = "Crear Producto";
      dialog.value = true;
      if (action == "modify") {
        dialogTitle.value = "Modificar Producto";
        dialogButton.value = "Modificar Producto";
        dialog.value = true;

        nro.value = null;
        description.value = data.descripcion;
        amountWithoutIva.value = data.importe_sin_iva;
        offerWithoutIva.value = data.oferta_sin_iva;
        increases.value = data.aumento;
        lastModification.value = data.ultimo_modif;
        offerCost.value = data.oferta_costo;
        lowestCost.value = data.costo_mas_bajo;
        costEffectiveness.value = data.rentabilidad;
        stock.value = data.stock;
      }
    };

    // Crear Producto
    const create_product = () => {
      // dialogLoading.value = true;
      const nroList = [];
      nro.value.forEach((n) => {
        nroList.push(n.value);
      });

      const data = {
        nro: nroList.join(" "),
        descripcion: description.value,
        importe_sin_iva: amountWithoutIva.value,
        iva_21: amountWithoutIva.value * 1.21,
        iva_10: amountWithoutIva.value * 1.105,
        oferta_sin_iva: offerWithoutIva.value,
        aumento: increases.value,
        ultimo_modif: lastModification.value,
        oferta_costo: offerCost.value,
        costo_mas_bajo: lowestCost.value,
        rentabilidad: costEffectiveness.value,
        stock: stock.value ? parseInt(stock.value) : 0,
      };


      api.post("/api/product_detail", data).then((response) => {
        console.log(response.data);
        // loadingTable.value = true;
        // get_data();
        // $q.notify({
        //   icon: "done",
        //   message: "Retiro completado",
        //   position: "bottom",
        //   timeout: 2000,
        // });

        // dialog.value = false;
        // dialogLoading.value = false;
      });
    };

    const modify_product = () => {
      console.log("modificacion")
    }

    return {
      columns,
      dialog,
      dialogTitle,
      dialogButton,
      open_dialog,
      create_product,
      modify_product,
      dataTable,
      parse_datetime,
      parse_decimal,
      filter: ref(""),
      loadingScreen,
      nro,
      description,
      amountWithoutIva,
      iva21,
      iva10,
      offerWithoutIva,
      increases,
      lastModification,
      offerCost,
      lowestCost,
      costEffectiveness,
      stock,
      suppliers,
      columnFilter,
      open_dialog_column_filters,
      visibleColumns: ref([
        "modify",
        "nro",
        "descripcion",
        "importe_sin_iva",
        "iva_21",
        "iva_10",
        "oferta_sin_iva",
        "aumento",
        "ultimo_modif",
        "oferta_costo",
        "costo_mas_bajo",
        "rentabilidad",
        "stock",
      ]),
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
