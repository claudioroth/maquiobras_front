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

        <q-btn class="q-mr-md q-px-lg" outline push color="grey-7" size="md">
          <q-popup-proxy>
            <q-banner class="q-my-md" style="max-width: 260px">
              <div v-if="$q.screen.gt.xs" class="col row">
                <!-- <q-toggle v-model="visibleColumns" val="nro" label="Calories" /> -->
                <!-- <q-toggle v-model="visibleColumns" val="descripcion" label="Fat" /> -->
                <q-toggle
                  class="col-12"
                  v-model="visibleColumns"
                  val="importe_sin_iva"
                  label="Importe sin IVA"
                />
                <q-toggle
                  class="col-12"
                  v-model="visibleColumns"
                  val="iva_21"
                  label="IVA 21%"
                />
                <q-toggle
                  class="col-12"
                  v-model="visibleColumns"
                  val="iva_10"
                  label="IVA10%"
                />
                <q-toggle
                  class="col-12"
                  v-model="visibleColumns"
                  val="oferta_sin_iva"
                  label="Oferta sin IVA"
                />
                <q-toggle
                  class="col-12"
                  v-model="visibleColumns"
                  val="aumento"
                  label="Aumento"
                />
                <q-toggle
                  class="col-12"
                  v-model="visibleColumns"
                  val="ultimo_modif"
                  label="Ultima modificacion"
                />
                <q-toggle
                  class="col-12"
                  v-model="visibleColumns"
                  val="oferta_costo"
                  label="Oferta costo"
                />
                <q-toggle
                  class="col-12"
                  v-model="visibleColumns"
                  val="costo_mas_bajo"
                  label="Costo mas bajo"
                />
                <q-toggle
                  class="col-12"
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
            </q-banner>
          </q-popup-proxy>
          <q-icon name="filter_alt" class="q-mr-sm" /> filtro columnas
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

      <!-- Modify -->
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

      <!-- Delete -->
      <template v-slot:body-cell-delete="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            color="primary"
            size="10px"
            icon="delete"
            @click="open_dialog_delete(props.row)"
          />
        </q-td>
      </template>

      <!-- Descripcion -->
      <template v-slot:body-cell-descripcion="props">
        <q-td :props="props">
          <div style="font-size: 10px">
            {{ props.row.descripcion }}
          </div>
        </q-td>
      </template>

      <!-- stock -->
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
          <div v-if="props.row.importe_sin_iva != 0">
            {{ "$" + formatNumber(parse_decimal(props.row.importe_sin_iva)) }}
          </div>
          <div v-else>-</div>
        </q-td>
      </template>

      <!-- Iva 21 -->
      <template v-slot:body-cell-iva_21="props">
        <q-td :props="props">
          <div>
            <q-badge
              v-if="props.row.iva_21 != 0"
              color="white"
              class="text-grey-7 text-weight-bold"
            >
              {{ "$" + formatNumber(parse_decimal(props.row.iva_21)) }}
            </q-badge>
            <div v-else>
              {{ "-" }}
            </div>
          </div>
        </q-td>
      </template>

      <!-- Iva 10.5 -->
      <template v-slot:body-cell-iva_10="props">
        <q-td :props="props">
          <div>
            <!-- <q-badge color="white text-grey-7 text-weight-bold">
              {{
                props.row.iva_10 ? "$" + parse_decimal(props.row.iva_10) : "-"
              }}
            </q-badge> -->

            <q-badge
              v-if="props.row.iva_10 != 0"
              color="white"
              class="text-grey-7 text-weight-bold"
            >
              {{ "$" + formatNumber(parse_decimal(props.row.iva_10)) }}
            </q-badge>
            <div v-else>
              {{ "-" }}
            </div>
          </div>
        </q-td>
      </template>

      <!-- Aumento -->
      <template v-slot:body-cell-aumento="props">
        <q-td v-if="props.row.aumento" :props="props">
          <!-- <div>{{ parse_datetime(props.row.aumento, "date") }}</div> -->
          <div>
            <q-badge color="grey-3 text-grey-7">
              {{ props.row.aumento }}
            </q-badge>
          </div>
        </q-td>
        <q-td v-else :props="props"> - </q-td>
      </template>

      <!-- Ultima Modificacion -->
      <template v-slot:body-cell-ultimo_modif="props">
        <q-td v-if="props.row.ultimo_modif" :props="props">
          <!-- <div>{{ parse_datetime(props.row.ultimo_modif, "date") }}</div> -->
          <div>
            <q-badge color="grey-3 text-grey-7">
              {{ props.row.ultimo_modif }}
            </q-badge>
          </div>
        </q-td>
        <q-td v-else :props="props"> - </q-td>
      </template>

      <!-- Oferta -->
      <template v-slot:body-cell-oferta_costo="props">
        <q-td :props="props">
          <div>
            <q-badge
              v-if="props.row.oferta_costo != 0"
              color="white"
              class="text-red"
            >
              {{ "$" + formatNumber(parse_decimal(props.row.oferta_costo)) }}
            </q-badge>
            <div v-else>
              {{ "-" }}
            </div>
          </div>
        </q-td>
      </template>

      <!-- Costo Bajo -->
      <template v-slot:body-cell-costo_mas_bajo="props">
        <q-td :props="props">
          <div v-if="props.row.costo_mas_bajo != 0">
            {{ "$" + formatNumber(parse_decimal(props.row.costo_mas_bajo)) }}
          </div>
          <div v-else>-</div>
        </q-td>
      </template>

      <!-- Oferta sin IVA -->
      <template v-slot:body-cell-oferta_sin_iva="props">
        <q-td :props="props">
          <div>
            <q-badge
              v-if="props.row.oferta_sin_iva != 0"
              color="white"
              class="text-red"
            >
              {{ "$" + formatNumber(parse_decimal(props.row.oferta_sin_iva)) }}
            </q-badge>
            <div v-else>
              {{ "-" }}
            </div>
          </div>
        </q-td>
      </template>

      <!-- Rentabilidad -->
      <template v-slot:body-cell-rentabilidad="props">
        <q-td :props="props">
          <div v-if="props.row.rentabilidad != 0">
            {{ props.row.rentabilidad }}
          </div>
          <div v-else>-</div>
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
  <q-dialog v-model="dialog" persistent full-height position="right">
    <q-card class="column full-height" style="width: 600px">
      <!-- header -->
      <q-card-section class="bg-grey-3 row">
        <div class="text-grey-8">{{ dialogTitle }}</div>
        <q-space />
        <q-btn
          class="text-grey-9"
          flat
          round
          dense
          icon="close"
          v-close-popup
          size="sm"
        />
      </q-card-section>

      <!-- body -->
      <q-card-section class="col q-pa-lg">
        <q-form
          @submit="
            dialogTitle == 'Nuevo Producto'
              ? create_product()
              : modify_product()
          "
          @reset="onReset"
          class="q-gutter-md"
        >
          <!-- Nro -->
          <q-select
            outlined
            v-model="nro"
            use-chips
            use-input
            input-debounce="0"
            label="Nro"
            multiple
            :options="optionsSelectSuppliers"
            @filter="filterFnSuppliers"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Descripcion -->
          <q-input
            outlined
            v-model="description"
            label="Descripcion"
            :rules="[(val) => !!val || '']"
          />

          <div
            class="q-pa-md row"
            style="border: 1px solid rgb(206 206 206); border-radius: 4px"
          >
            <!-- Aumento -->
            <q-input
              outlined
              dense
              readonly
              class="col q-mr-md"
              v-model="increases"
              label="Aumento"
            >
              <template v-slot:append>
                <q-icon
                  v-if="increases != null"
                  name="close"
                  @click.stop.prevent="increases = null"
                  class="cursor-pointer"
                />
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="increases" mask="DD-MM-YYYY">
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
            </q-input>

            <!-- Ultima Modificacion -->
            <q-input
              outlined
              dense
              readonly
              class="col"
              v-model="lastModification"
              label="Ultima Modificacion"
            >
              <template v-slot:append>
                <q-icon
                  v-if="lastModification != null"
                  name="close"
                  @click.stop.prevent="lastModification = null"
                  class="cursor-pointer"
                />
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="lastModification" mask="DD-MM-YYYY">
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
            </q-input>
          </div>

          <div
            class="q-pa-md"
            style="border: 1px solid rgb(206 206 206); border-radius: 4px"
          >
            <div class="row q-mb-md">
              <!-- Importe sin IVA -->
              <q-input
                type="number"
                outlined
                step="any"
                stack-label
                prefix="$"
                class="col q-mr-md"
                v-model="amountWithoutIva"
                label="Importe sin IVA"
              />

              <!-- Oferta sin IVA -->
              <q-input
                type="number"
                outlined
                step="any"
                stack-label
                prefix="$"
                v-model="offerWithoutIva"
                class="col"
                label="Oferta sin IVA"
              />
            </div>

            <div class="row q-mb-md">
              <!-- Oferta Costo -->
              <q-input
                type="number"
                outlined
                step="any"
                stack-label
                prefix="$"
                class="col q-mr-md"
                v-model="offerCost"
                label="Oferta Costo"
              />

              <!-- Costo mas bajo -->
              <q-input
                outlined
                stack-label
                step="any"
                prefix="$"
                type="number"
                class="col"
                v-model="lowestCost"
                label="Costo mas bajo"
              />
            </div>

            <div class="row">
              <!-- Rentabilidad -->
              <q-input
                outlined
                step="any"
                type="number"
                class="col-4 q-mr-md"
                stack-label
                v-model="costEffectiveness"
                label="Rentabilidad"
              />

              <!-- Stock -->
              <q-input
                outlined
                class="col"
                stack-label
                type="number"
                v-model="stock"
                label="Cantidad"
              />
            </div>
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
              @click="onReset"
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

  <!-- DIALOG DELETE -->
  <q-dialog v-model="dialogDelete" persistent>
    <q-card style="width: 330px; border-radius: 10px">
      <q-card-section class="row justify-center text-grey-8">
        <span style="font-size: 16px;font-weight: 500; margin-bottom: 3px;">Eliminar producto</span>
        <div class="text-center" style="width: 250px; font-size: 12px;">
          Está seguro que quiere eliminar el producto? Esa acción es
          irreversible
        </div>
      </q-card-section>

      <q-card-actions class="row q-pa-none">
        <q-btn
          class="col"
          flat
          label="Cancelar"
          color="primary"
          v-close-popup
          style="border-top: 1px solid rgb(196, 196, 196); border-radius: 0;"
        />
        <q-btn
          flat
          class="col"
          label="Eliminar"
          style="
            margin-left: 0px;
            border-top: 1px solid rgb(196, 196, 196);
            border-left: 1px solid rgb(196, 196, 196);border-radius: 0;
          "
          color="red"
          @click="delete_product()"
        />
      </q-card-actions>
      <q-inner-loading :showing="dialogLoadingDelete" class="bg-white">
        <q-spinner-puff size="30px" color="red-5" />
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from "vue";
import { date, LocalStorage, SessionStorage } from "quasar";
import { customNotify, handleCustomError } from "src/helpers/errors";
import * as XLSX from "xlsx-js-style";
import { api } from "src/boot/axios";
import axios from "axios";
import { suppliers } from "src/helpers/suppliers";
import { useQuasar } from "quasar";

export default defineComponent({
  name: "IndexPage",

  setup() {
    // VARIABLES
    const $q = useQuasar();
    const loadingScreen = ref(true);
    const loadingTable = ref(false);
    const dataTable = ref([]);
    const dialog = ref(false);
    const dialogDelete = ref(false);
    const dialogLoadingDelete = ref(false);
    const dialogTitle = ref();
    const dialogButton = ref();
    const dialogLoading = ref(false);
    const columnFilter = ref(false);

    const selectSuppliers = ref([]);
    const optionsSelectSuppliers = ref(suppliers);

    const index = ref();
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
    const visibleColumns = ref([]);

    const columns = [
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
        label: "IVA 10.5",
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
      {
        name: "modify",
        align: "center",
        label: "",
        field: "modify",
        sortable: true,
      },
      {
        name: "delete",
        align: "center",
        label: "",
        field: "delete",
        sortable: true,
      },
    ];
    const pagination = ref({
      rowsPerPage: 0,
    });

    // MOUNTED
    onMounted(() => {
      // Trae las columnas filtradas guardadas en el Local Storage
      visibleColumns.value = LocalStorage.getItem("prodColFilters");

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

    // WATCH
    watch(dialog, (newValue, OldValue) => {
      if (newValue == false) {
        index.value = null;
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
        selectSuppliers.value = [];
      }
    });

    watch(dialogDelete, (newValue, OldValue) => {
      if (newValue == false) {
        index.value = null;
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

    watch(visibleColumns, (newValue, OldValue) => {
      LocalStorage.set("prodColFilters", visibleColumns.value);
    });

    // FUNCIONES

    const filterFnSuppliers = (val, update) => {
      update(() => {
        const needle = val.toLowerCase();
        optionsSelectSuppliers.value = suppliers.filter((v) => {
          return v.label.toLowerCase().indexOf(needle) > -1;
        });
      });
    };

    const convertDateFormat = (dateString) => {
      const [day, month, year] = dateString.split("-");
      return `${year}-${month}-${day}`;
    };

    const formatNumber = (number) => {
      return new Intl.NumberFormat("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number);
    };

    const parse_decimal = (value) => {
      var result = parseFloat(value);
      if (result % 1 !== 0) {
        // Check if there is a fractional part
        return result.toFixed(2);
      }
      return result.toFixed(0); // Return as integer if there is no fractional part
    };

    const parse_datetime = (dateString, type) => {
      if (type == "date") {
        return date.formatDate(dateString, "DD/MM/YYYY");
      } else {
        return date.formatDate(dateString, "HH:mm");
      }
    };

    const onReset = () => {
      nro.value = [];
      description.value = null;
      amountWithoutIva.value = null;
      offerWithoutIva.value = null;
      increases.value = null;
      lastModification.value = null;
      offerCost.value = null;
      lowestCost.value = null;
      costEffectiveness.value = null;
      stock.value = null;
    };

    // Abrir Dialog de borrar producto
    const open_dialog_delete = (props) => {
      index.value = props.index;
      dialogDelete.value = true;
    };

    // Abrir Dialog
    const open_dialog = (action, data) => {
      dialogTitle.value = "Nuevo Producto";
      dialogButton.value = "Crear Producto";
      dialog.value = true;
      // optionsSelectSuppliers.value = suppliers;

      if (action == "modify") {
        dialogTitle.value = "Modificar Producto";
        dialogButton.value = "Modificar Producto";
        dialog.value = true;

        selectSuppliers.value = [];

        if (data.nro) {
          suppliers.forEach((s) => {
            data.nro.split(" ").forEach((n) => {
              if (n == s.value) {
                console.log(s);
                selectSuppliers.value.push(s);
              }
            });
          });
        }

        // selectSuppliers.value = nroList

        index.value = data.index;
        nro.value = selectSuppliers.value;
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
      dialogLoading.value = true;
      const nroList = [];

      if (nro.value) {
        nro.value.forEach((n) => {
          nroList.push(n.value);
        });
      }

      amountWithoutIva.value = amountWithoutIva.value
        ? amountWithoutIva.value
        : 0;
      offerWithoutIva.value = offerWithoutIva.value ? offerWithoutIva.value : 0;
      offerCost.value = offerCost.value ? offerCost.value : 0;
      lowestCost.value = lowestCost.value ? lowestCost.value : 0;
      costEffectiveness.value = costEffectiveness.value
        ? costEffectiveness.value
        : 0;

      const data = {
        nro: nroList.join(" "),
        descripcion: description.value,
        importe_sin_iva: amountWithoutIva.value,
        iva_21: amountWithoutIva.value * 1.21,
        iva_10: amountWithoutIva.value * 1.105,
        oferta_sin_iva: offerWithoutIva.value,
        aumento: increases.value ? convertDateFormat(increases.value) : null,
        ultimo_modif: lastModification.value
          ? convertDateFormat(lastModification.value)
          : null,
        oferta_costo: offerCost.value,
        costo_mas_bajo: lowestCost.value,
        rentabilidad: costEffectiveness.value,
        stock: stock.value ? parseInt(stock.value) : 0,
      };

      console.log(data);

      api.post("/api/product_detail", data).then((response) => {
        // loadingScreen.value = true

        api.get("/api/product_detail").then((response) => {
          dataTable.value = response.data;
          dialog.value = false;

          $q.notify({
            icon: "done",
            message: "El producto se creo correctamente",
            position: "bottom",
            timeout: 2000,
          });
          dialogLoading.value = false;
          // loadingScreen.value = false
        });
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

    // Modificar Producto
    const modify_product = () => {
      dialogLoading.value = true;
      const nroList = [];
      nro.value.forEach((n) => {
        nroList.push(n.value);
      });

      amountWithoutIva.value = amountWithoutIva.value
        ? amountWithoutIva.value
        : 0;
      offerWithoutIva.value = offerWithoutIva.value ? offerWithoutIva.value : 0;
      offerCost.value = offerCost.value ? offerCost.value : 0;
      lowestCost.value = lowestCost.value ? lowestCost.value : 0;
      costEffectiveness.value = costEffectiveness.value
        ? costEffectiveness.value
        : 0;

      const data = {
        index: index.value,
        nro: nroList.join(" "),
        descripcion: description.value,
        importe_sin_iva: amountWithoutIva.value,
        iva_21: amountWithoutIva.value * 1.21,
        iva_10: amountWithoutIva.value * 1.105,
        oferta_sin_iva: offerWithoutIva.value,
        aumento: increases.value ? convertDateFormat(increases.value) : null,
        ultimo_modif: lastModification.value
          ? convertDateFormat(lastModification.value)
          : null,
        oferta_costo: offerCost.value,
        costo_mas_bajo: lowestCost.value,
        rentabilidad: costEffectiveness.value,
        stock: stock.value ? parseInt(stock.value) : 0,
      };

      api.put("/api/product_detail", data).then((response) => {
        console.log(response.data);

        api.get("/api/product_detail").then((response) => {
          dataTable.value = response.data;
          console.log(dataTable.value);
          dialog.value = false;
          dialogLoading.value = false;
        });
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

    // Borrar Producto
    const delete_product = () => {
      // const objIndex = {
      //   index: index.value
      // };
      dialogLoadingDelete.value = true
      api.delete(`/api/product_detail/${index.value}`).then((response) => {
        console.log(response.data);
        api.get("/api/product_detail").then((response) => {
          dataTable.value = response.data;
          dialogDelete.value = false;
          dialogLoadingDelete.value = false
        });
      });
    };

    return {
      columns,
      dialog,
      dialogTitle,
      dialogButton,
      dialogLoading,
      dialogDelete,
      open_dialog,
      create_product,
      modify_product,
      delete_product,
      dataTable,
      parse_datetime,
      parse_decimal,
      filter: ref(""),
      loadingScreen,
      loadingTable,
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
      open_dialog_delete,
      visibleColumns,
      formatNumber,
      filterFnSuppliers,
      optionsSelectSuppliers,
      dialogLoadingDelete,
      onReset,
    };
  },
});
</script>

<style lang="scss" scoped>
.q-dialog__inner--minimized {
  padding-top: 0px !important;
}

.q-field--with-bottom {
  padding-bottom: 0;
}
</style>

<!-- <style lang="sass">
.my-sticky-header-last-column-table
  /* height or max-height is important */
  height: 310px

  /* specifying max-width so the example can
    highlight the sticky column on any browser window */


  td:last-child
    /* bg color is important for td; just specify one */
    background-color: #ffffff

  tr th
    position: sticky
    /* higher than z-index for td below */
    z-index: 2
    /* bg color is important; just specify one */
    background: #ffffff

  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
    /* highest z-index */
    z-index: 3
  thead tr:first-child th
    top: 0
    z-index: 1
  tr:last-child th:last-child
    /* highest z-index */
    z-index: 3

  td:last-child
    z-index: 1

  td:last-child, th:last-child
    position: sticky
    right: 0

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style> -->

<style lang="sass">
.my-sticky-header-last-column-table
  /* height or max-height is important */
  height: 310px

  /* specifying max-width so the example can
    highlight the sticky column on any browser window */

  td:last-child,
  th:last-child
    /* bg color is important for td; just specify one */
    background-color: #ffffff
    position: sticky
    right: 0
    z-index: 2

  td:nth-last-child(2),
  th:nth-last-child(2)
    background-color: #ffffff
    position: sticky
    right: 52px /* ajustar este valor según el ancho de la última columna */
    z-index: 1

  tr th
    position: sticky
    /* higher than z-index for td below */
    z-index: 3
    /* bg color is important; just specify one */
    background: #ffffff

  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
    /* highest z-index */
    z-index: 4

  thead tr:first-child th
    top: 0
    z-index: 2

  tr:last-child th:last-child,
  tr:last-child th:nth-last-child(2)
    /* highest z-index */
    z-index: 4

  td:last-child,
  td:nth-last-child(2)
    z-index: 2

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>
