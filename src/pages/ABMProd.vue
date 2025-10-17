<template>
  <!-- HEADER -->
  <div class="pt-header q-mt-md">
    <div class="q-mx-md">
      <div class="bg-white q-pa-md rounded-borders flex" style="border: solid 1px #e0e0e0">
        <q-btn class="q-mr-md q-px-lg" size="md" color="grey-7" outline :disable="loadingScreen"
          @click="open_dialog('create')"><q-icon name="construction" class="q-mr-sm" />
          <div class="q-pt-xs">Nuevo Producto</div>
        </q-btn>

        <q-btn class="q-mr-md q-px-lg" outline push color="grey-7" size="md">
          <q-popup-proxy>
            <q-banner class="q-my-md" style="max-width: 260px">
              <div v-if="$q.screen.gt.xs" class="col row">
                <!-- <q-toggle v-model="visibleColumns" val="nro" label="Calories" /> -->
                <!-- <q-toggle v-model="visibleColumns" val="descripcion" label="Fat" /> -->

                <q-toggle class="col-12" v-model="visibleColumns" val="importe_sin_iva" label="Importe sin IVA" />
                <q-toggle class="col-12" v-model="visibleColumns" val="iva_21" label="IVA 21%" />
                <q-toggle class="col-12" v-model="visibleColumns" val="iva_10" label="IVA10%" />
                <q-toggle class="col-12" v-model="visibleColumns" val="oferta_sin_iva" label="Oferta sin IVA" />
                <q-toggle class="col-12" v-model="visibleColumns" val="oferta_costo" label="Oferta costo" />
                <q-toggle class="col-12" v-model="visibleColumns" val="rentabilidad" label="Rentabilidad" />
                <q-toggle class="col-12" v-model="visibleColumns" val="costo_mas_bajo" label="Costo mas bajo" />
                <q-toggle class="col-12" v-model="visibleColumns" val="aumento" label="Aumento" />
                <q-toggle class="col-12" v-model="visibleColumns" val="ultimo_modif" label="Ultima modificacion" />



                <!-- <q-toggle v-model="visibleColumns" val="stock" label="Iron" /> -->
              </div>
              <q-select v-else v-model="visibleColumns" multiple borderless dense options-dense
                :display-value="$q.lang.table.columns" emit-value map-options :options="columns" option-value="name"
                style="min-width: 150px" />
            </q-banner>
          </q-popup-proxy>
          <q-icon name="filter_alt" class="q-mr-sm" />
          <div class="q-pt-xs">filtro columnas</div>
        </q-btn>

        <q-space />
        <q-input dense outlined debounce="300" v-model="filter" placeholder="Buscar" :disable="loadingScreen">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
  </div>

  <!-- TABLA -->
  <div class="q-pa-md" style="overflow-x: scroll">
    <q-table v-if="!loadingScreen" flat dense bordered title="ABM de Productos" :rows="filteredData" :columns="columns"
      row-key="id" :loading="loadingTable" virtual-scroll v-model:pagination="pagination" :rows-per-page-options="[0]"
      separator="cell" color="primary"
      class="no-shadow text-grey-7 my-sticky-header-last-column-table my-sticky-header-table"
      :style="`border: solid 1px #e0e0e0; height:${$q.screen.height - 190}px ;`" :visible-columns="visibleColumns">
      <!-- Modify -->
      <template v-slot:body-cell-modify="props">
        <q-td :props="props">
          <q-btn flat round color="primary" size="10px" icon="edit" @click="open_dialog('modify', props.row)" />
        </q-td>
      </template>

      <!-- Delete -->
      <template v-slot:body-cell-delete="props">
        <q-td :props="props">
          <q-btn flat round color="primary" size="10px" icon="delete" @click="open_dialog_delete(props.row)" />
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
            <q-badge v-if="props.row.stock" color="red-7" :label="props.row.stock ? props.row.stock : '-'" />
            <div v-else>-</div>
          </div>
        </q-td>
      </template>

      <!-- Stock Deposito -->
      <template v-slot:body-cell-depo="props">
        <q-td class="bg-grey-1" :props="props">
          <div>
            <q-badge v-if="props.row.depo" color="grey-7" :label="props.row.depo ? props.row.depo : '-'" />
            <div v-else>-</div>
          </div>
        </q-td>
      </template>

      <!-- Stock Galicia -->
      <template v-slot:body-cell-suc1="props">
        <q-td class="bg-grey-1" :props="props">
          <div>
            <q-badge v-if="props.row.suc1" color="grey-7" :label="props.row.suc1 ? props.row.suc1 : '-'" />
            <div v-else>-</div>
          </div>
        </q-td>
      </template>

      <!-- Stock Juan B. Justo -->
      <template v-slot:body-cell-suc2="props">
        <q-td class="bg-grey-1" :props="props">
          <div>
            <q-badge v-if="props.row.suc2" color="grey-7" :label="props.row.suc2 ? props.row.suc2 : '-'" />
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
            <q-badge v-if="props.row.iva_21 != 0" color="white" class="text-grey-7 text-weight-bold">
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

            <q-badge v-if="props.row.iva_10 != 0" color="white" class="text-grey-7 text-weight-bold">
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
              {{ parse_datetime(props.row.aumento, "date") }}
            </q-badge>
          </div>
        </q-td>
        <q-td v-else :props="props"> - </q-td>
      </template>

      <!-- Ultima Modificacion -->
      <template v-slot:body-cell-ultimo_modif="props">
        <q-td v-if="props.row.ultimo_modif" :props="props">

          <div>
            {{ parse_datetime(props.row.ultimo_modif, "date") }}&ensp;
            <q-badge color="grey-3 text-grey-7">
              {{ parse_datetime(props.row.ultimo_modif, "hours") }}
            </q-badge>
          </div>
        </q-td>
        <q-td v-else :props="props"> - </q-td>
      </template>

      <!-- Oferta -->
      <template v-slot:body-cell-oferta_costo="props">
        <q-td :props="props">
          <div>
            <q-badge v-if="props.row.oferta_costo != 0" color="white" class="text-red">
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
            <q-badge v-if="props.row.oferta_sin_iva != 0" color="white" class="text-red">
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
    <q-inner-loading v-else :showing="loadingScreen" class="bg-white" :style="`height:${$q.screen.height - 190
      }px; top:164px; right:16px; left:${$q.screen.width < 1007 ? 16 : 256
      }px;border: 1px solid rgb(224 224 224);border-radius:4px`">
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
        <q-btn class="text-grey-9" flat round dense icon="close" v-close-popup size="sm" />
      </q-card-section>

      <!-- body -->
      <q-card-section class="col q-pa-lg">
        <q-form @submit.prevent="
          dialogTitle == 'Nuevo Producto'
            ? create_product()
            : modify_product()
          " @reset="onReset" class="q-gutter-md">
          <!-- Nro -->
          <q-select outlined v-model="nro" use-chips use-input dense input-debounce="0" label="Proveedor" multiple
            :options="optionsSelectSuppliers" @filter="filterFnSuppliers">
            <template v-slot:selected-item="scope">
              <q-chip removable @remove="scope.removeAtIndex(scope.index)" :tabindex="scope.tabindex"
                text-color="grey-10" size="sm">
                {{ scope.opt.label }}
              </q-chip>
            </template>

            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">Sin resultados</q-item-section>
              </q-item>
            </template>
          </q-select>

          <div class="row">
            <!-- Descripcion -->
            <q-input outlined dense class="col" v-model="description" label="Descripcion"
              :rules="[(val) => !!val || '']" />


          </div>

          <div class="q-pa-md row" style="border: 1px solid rgb(206 206 206); border-radius: 4px">
            <!-- Aumento -->
            <q-input outlined dense readonly class="col custom-readonly-input-g" v-model="increases"
              label="Aumento">
              <template v-slot:append>
                <q-icon v-if="increases != null" name="close" @click.stop.prevent="increases = null"
                  class="cursor-pointer" />
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="increases" mask="DD-MM-YYYY">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <!-- Ultima Modificacion -->
            <!-- <q-input outlined dense readonly class="col custom-readonly-input-g" v-model="lastModification"
              label="Ultima Modificacion">
              <template v-slot:append>
                <q-icon v-if="lastModification != null" name="close" @click.stop.prevent="lastModification = null"
                  class="cursor-pointer" />
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="lastModification" mask="DD-MM-YYYY">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input> -->
          </div>

          <!-- Importes/Costos -->
          <div class="q-px-md q-pt-md" style="
              border: 1px solid rgb(206 206 206);
              border-radius: 4px;
              position: relative;
            ">
            <div style="
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                top: -9px;
                padding: 0 10px;
                font-size: 11px;
                color: #9b9b9b;
                background-color: white;
              ">
              IMPORTES / COSTOS / IVA
            </div>
            <div class="row q-mb-md">

              <!-- Importe sin IVA -->
              <q-input type="number" outlined step="any" stack-label prefix="$" class="col" v-model="amountWithoutIva"
                label="Importe sin IVA" />

              <q-separator inset class="self-center q-ma-none" style="width: 3%;" />

              <!-- IVA -->
              <q-select class="col q-mr-md" prefix="%" outlined stack-label v-model="iva" :options="optionsIva"
                label="IVA" :disable="!ivaEnabled" />

              <!-- Costo mas bajo -->
              <q-input outlined stack-label step="any" prefix="$" type="number" class="col" v-model="lowestCost"
                label="Costo mas bajo" />

            </div>

            <div class="row q-mb-md">
              <!-- Oferta Costo -->
              <q-input type="number" outlined step="any" stack-label prefix="$" class="col" v-model="offerCost"
                label="Oferta Costo"  />

              <div class="self-center q-mx-xs text-grey-7">×</div>

              <!-- Rentabilidad -->
              <q-input outlined step="any" type="number" stack-label class="col inputNumber" v-model="costEffectiveness"
                label="Rentabilidad"  />

              <div class="self-center q-mx-xs text-grey-7">=</div>

              <!-- Oferta sin IVA -->
              <q-input type="number" readonly outlined step="any" stack-label prefix="$" v-model="offerWithoutIva"
                class="col custom-readonly-input" label="Oferta sin IVA" />


            </div>
          </div>

          <!-- Stock Sucursales -->
          <div class="q-px-md q-pt-md" style="
              border: 1px solid rgb(206 206 206);
              border-radius: 4px;
              position: relative;
            ">
            <div style="
                position: absolute;
                left: 50%; /* Mover el elemento al 50% desde el borde izquierdo */
                transform: translateX(-50%);
                top: -9px;
                padding: 0 10px;
                font-size: 11px;
                color: #9b9b9b;
                background-color: white;
              ">
              STOCK SUCURSALES
            </div>
            <div class="row q-mb-md">
              <!-- Stock Deposito -->
              <q-input type="number" outlined step="any" stack-label dense class="col q-mr-md" v-model="depo"
                label="Stock - Deposito" fill-input min="0" @focus="clearIfZero('depo')"
                @blur="restoreIfEmpty('depo')" />

              <!-- Stock Galicia -->
              <q-input type="number" outlined step="any" stack-label dense v-model="suc1" class="col"
                label="Stock - Galicia" fill-input min="0" @focus="clearIfZero('suc1')"
                @blur="restoreIfEmpty('suc1')" />
            </div>

            <div class="row q-mb-md">
              <!-- Stock Juan B. Justo -->
              <q-input type="number" outlined step="any" stack-label dense class="col q-mr-md" v-model="suc2"
                label="Stock - Juan B. Justo" fill-input min="0" @focus="clearIfZero('suc2')"
                @blur="restoreIfEmpty('suc2')" />

              <!-- Stock Total -->
              <q-input outlined class="col custom-readonly-input" stack-label readonly type="number" dense
                v-model="stock" label="Stock - Total" />
            </div>
          </div>

          <!-- Buttons -->
          <div>
            <q-btn :label="dialogButton" type="submit" unelevated color="primary" />
            <q-btn label="Reset" type="reset" color="primary" flat @click="onReset" class="q-ml-sm" />
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
        <span style="font-size: 16px; font-weight: 500; margin-bottom: 3px">Eliminar producto</span>
        <div class="text-center" style="width: 250px; font-size: 12px">
          Está seguro que quiere eliminar el producto? Esa acción es
          irreversible
        </div>
      </q-card-section>

      <q-card-actions class="row q-pa-none">
        <q-btn class="col" flat label="Cancelar" color="primary" v-close-popup
          style="border-top: 1px solid rgb(196, 196, 196); border-radius: 0" />
        <q-btn flat class="col" label="Eliminar" style="
            margin-left: 0px;
            border-top: 1px solid rgb(196, 196, 196);
            border-left: 1px solid rgb(196, 196, 196);
            border-radius: 0;
          " color="red" @click="delete_product()" />
      </q-card-actions>
      <q-inner-loading :showing="dialogLoadingDelete" class="bg-white">
        <q-spinner-puff size="30px" color="red-5" />
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, onMounted, watch, computed } from "vue";
import { date, LocalStorage, SessionStorage } from "quasar";
import { customNotify, handleCustomError } from "src/helpers/errors";
import * as XLSX from "xlsx-js-style";
import { api } from "src/boot/axios";
import axios from "axios";
import { useQuasar } from "quasar";

export default defineComponent({
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

    // const optionsSelectSuppliers = ref(suppliers);
    const allSuppliers = ref([]);
    const optionsSelectSuppliers = ref([]);

    const optionsIva = [{ label: "10.5", value: 10.5 }, { label: "21", value: 21 }]
    const index = ref();
    const nro = ref();
    const description = ref();
    const amountWithoutIva = ref();
    const iva21 = ref();
    const iva10 = ref();
    const iva = ref({ label: "21", value: 21 })
    const offerWithoutIva = ref();
    const increases = ref();
    // const lastModification = ref();
    const offerCost = ref();
    const lowestCost = ref();
    const costEffectiveness = ref();
    const suc1 = ref(0);
    const suc2 = ref(0);
    const depo = ref(0);
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
        label: "Stock Total",
        field: "stock",
        align: "center",
        sortable: true,
      },
      {
        name: "depo",
        label: "Stock Deposito",
        field: "depo",
        align: "center",
        sortable: true,
      },
      {
        name: "suc1",
        label: "Stock Galicia",
        field: "suc1",
        align: "center",
        sortable: true,
      },
      {
        name: "suc2",
        label: "Stock Juan B. Justo",
        field: "suc2",
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
        name: "oferta_costo",
        label: "Oferta Costo",
        field: "oferta_costo",
        align: "center",
        sortable: true,
      },
      {
        name: "rentabilidad",
        label: "Rentabilidad",
        field: "rentabilidad",
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


      // {
      //   name: "lista_vieja",
      //   label: "Lista Vieja",
      //   field: "lista_vieja",
      //   align: "center",
      //   sortable: true,
      // },

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
    onMounted(async () => {
      visibleColumns.value = LocalStorage.getItem("prodColFilters");

      try {
        // Cargar proveedores
        await getSuppliers();

        // Cargar productos
        const response = await api.get("/api/product_detail");
        dataTable.value = response.data;
      } catch (error) {
        handleCustomError(error.message);
      } finally {
        loadingScreen.value = false;
      }
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
        // lastModification.value = null;
        offerCost.value = null;
        lowestCost.value = null;
        costEffectiveness.value = null;
        // stock.value = null;
        suc1.value = 0;
        suc2.value = 0;
        depo.value = 0;
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
        // lastModification.value = null;
        offerCost.value = null;
        lowestCost.value = null;
        costEffectiveness.value = null;
        // stock.value = null;
        suc1.value = 0;
        suc2.value = 0;
        depo.value = 0;
      }
    });

    watch(visibleColumns, (newValue, OldValue) => {
      LocalStorage.set("prodColFilters", visibleColumns.value);
    });

    watch([offerCost, costEffectiveness], ([costo, rent]) => {
      if (costo && rent) {
        offerWithoutIva.value = costo * rent;
      } else {
        offerWithoutIva.value = null;
      }
    });

    // COMPUTER
    const stock = computed(() => {
      return [suc1.value, suc2.value, depo.value]
        .map((value) => parseInt(value) || 0)
        .reduce((acc, value) => acc + value, 0);
    });

    const ivaEnabled = computed(() => {
      return Number(amountWithoutIva.value) > 0
    })

    const filter = ref("");


    const filteredData = computed(() => {
      if (!filter.value) return dataTable.value;
      const search = filter.value.toLowerCase();
      const startsWith = dataTable.value
        .filter(p => p.descripcion?.toLowerCase().startsWith(search))
        .sort((a, b) => a.descripcion.localeCompare(b.descripcion));
      const contains = dataTable.value
        .filter(p =>
          p.descripcion?.toLowerCase().includes(search) &&
          !p.descripcion?.toLowerCase().startsWith(search)
        )
        .sort((a, b) => a.descripcion.localeCompare(b.descripcion));
      return [...startsWith, ...contains];
    });


    // FUNCIONES

    const validateCost = (val) => {
      if ((!val || val <= 0) && costEffectiveness.value > 0) return false;
      return true;
    };

    const validateProfitability = (val) => {
      if ((!val || val <= 0) && offerCost.value > 0) return false;
      return true;
    };

    const getSuppliers = async () => {
      try {
        const response = await api.get("/api/provedor");
        allSuppliers.value = response.data.map((prov) => ({
          value: prov.id,
          label: `${prov.nombre} (${prov.id})`,
        }));
        optionsSelectSuppliers.value = allSuppliers.value;
      } catch (error) {
        handleCustomError(error.message);
      }
    };


    const clearIfZero = (inputName) => {
      if (inputName === "depo" && depo.value === 0) {
        depo.value = "";
      } else if (inputName === "suc1" && suc1.value === 0) {
        suc1.value = "";
      } else if (inputName === "suc2" && suc2.value === 0) {
        suc2.value = "";
      }
    };

    const restoreIfEmpty = (inputName) => {
      if (inputName === "depo" && depo.value === "") {
        depo.value = 0;
      } else if (inputName === "suc1" && suc1.value === "") {
        suc1.value = 0;
      } else if (inputName === "suc2" && suc2.value === "") {
        suc2.value = 0;
      }
    };

    const filterFnSuppliers = (val, update) => {
      update(() => {
        const needle = val.toLowerCase();
        if (needle === "") {
          optionsSelectSuppliers.value = allSuppliers.value;
        } else {
          optionsSelectSuppliers.value = allSuppliers.value.filter((v) =>
            v.label.toLowerCase().includes(needle)
          );
        }
      });
    };

    const convertDateFormat = (dateString) => {
      // Regex para "DD-MM-YYYY"
      const regexDMY = /^(\d{2})-(\d{2})-(\d{4})$/;
      // Regex para "YYYY-MM-DD HH:MM:SS"
      const regexYMDHMS = /^(\d{4})-(\d{2})-(\d{2}) \d{2}:\d{2}:\d{2}$/;

      if (regexDMY.test(dateString)) {
        const [_, day, month, year] = dateString.match(regexDMY);
        return `${year}-${month}-${day} 00:00:00`;
      } else if (regexYMDHMS.test(dateString)) {
        const [_, year, month, day] = dateString.match(regexYMDHMS);
        return `${year}-${month}-${day} 00:00:00`;
      } else {
        console.error("Fecha en formato inválido:", dateString);
        return null;
      }
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
        return result.toFixed(2);
      }
      return result.toFixed(0);
    };

    const parse_datetime = (dateString, type) => {
      if (type == "date") {
        return date.formatDate(dateString, "DD-MM-YYYY");
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
      // lastModification.value = null;
      offerCost.value = null;
      lowestCost.value = null;
      costEffectiveness.value = null;
      // stock.value = null;
      suc1.value = 0;
      suc2.value = 0;
      depo.value = 0;
    };

    // Convierte la fecha para qu e se vea de forma correcta en el input date
    const convertToDisplayFormat = (dateString) => {
      if (!dateString || !dateString.includes(" ")) {
        return null;
      }
      const [datePart] = dateString.split(" ");
      const [year, month, day] = datePart.split("-");
      if (!year || !month || !day) {
        return null;
      }
      return `${day}-${month}-${year}`;
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
          optionsSelectSuppliers.value.forEach((s) => {
            data.nro.split(" ").forEach((n) => {
              if (n == s.value) {
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
        increases.value = convertToDisplayFormat(data.aumento);
        // lastModification.value = convertToDisplayFormat(data.ultimo_modif);
        offerCost.value = data.oferta_costo;
        lowestCost.value = data.costo_mas_bajo;
        costEffectiveness.value = data.rentabilidad;
        // stock.value = data.stock;
        suc1.value = data.suc1;
        suc2.value = data.suc2;
        depo.value = data.depo;
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
      // IMPORTE SIN IVA
      amountWithoutIva.value = amountWithoutIva.value ? amountWithoutIva.value : 0;


      // OFERTA COSTO
      offerCost.value = offerCost.value ? offerCost.value : 0;

      lowestCost.value = lowestCost.value ? lowestCost.value : 0;
      costEffectiveness.value = costEffectiveness.value ? costEffectiveness.value : 0;

      // OFERTA SIN IVA
      offerWithoutIva.value = offerWithoutIva.value ? offerWithoutIva.value : 0;

      const data = {
        nro: nroList.join(" "),
        descripcion: description.value,
        importe_sin_iva: amountWithoutIva.value,
        iva_21: iva.value.value == 21 ? amountWithoutIva.value * 1.21 : 0,
        iva_10: iva.value.value == 10.5 ? amountWithoutIva.value * 1.105 : 0,
        oferta_sin_iva: offerWithoutIva.value,
        aumento: increases.value ? convertDateFormat(increases.value) : null,
        // ultimo_modif: lastModification.value
        //   ? convertDateFormat(lastModification.value)
        //   : null,
        oferta_costo: offerCost.value,
        costo_mas_bajo: lowestCost.value,
        rentabilidad: costEffectiveness.value,
        stock: stock.value ? parseInt(stock.value) : 0,
        suc1: suc1.value ? parseInt(suc1.value) : 0,
        suc2: suc2.value ? parseInt(suc2.value) : 0,
        depo: depo.value ? parseInt(depo.value) : 0,
      };


      dialogLoading.value = false;

      api.post("/api/product_detail", data).then((response) => {
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
        });
      });
    };

    // Modificar Producto
    const modify_product = () => {
      dialogLoading.value = true;
      const nroList = [];
      nro.value.forEach((n) => {
        nroList.push(n.value);
      });

      // IMPORTE SIN IVA
      amountWithoutIva.value = amountWithoutIva.value ? amountWithoutIva.value : 0;
      // OFERTA COSTO
      offerCost.value = offerCost.value ? offerCost.value : 0;
      lowestCost.value = lowestCost.value ? lowestCost.value : 0;
      costEffectiveness.value = costEffectiveness.value ? costEffectiveness.value : 0;

      // OFERTA SIN IVA
      offerWithoutIva.value = offerWithoutIva.value ? offerWithoutIva.value : 0;
      const data = {
        index: index.value,
        nro: nroList.join(" "),
        descripcion: description.value,
        importe_sin_iva: amountWithoutIva.value,
        iva_21: iva.value.value == 21 ? amountWithoutIva.value * 1.21 : 0,
        iva_10: iva.value.value == 10.5 ? amountWithoutIva.value * 1.105 : 0,
        oferta_sin_iva: offerWithoutIva.value,
        aumento: increases.value ? convertDateFormat(increases.value) : null,
        // ultimo_modif: lastModification.value
        //   ? convertDateFormat(lastModification.value)
        //   : null,
        oferta_costo: offerCost.value,
        costo_mas_bajo: lowestCost.value,
        rentabilidad: costEffectiveness.value,
        stock: stock.value ? parseInt(stock.value) : 0,
        suc1: suc1.value ? parseInt(suc1.value) : 0,
        suc2: suc2.value ? parseInt(suc2.value) : 0,
        depo: depo.value ? parseInt(depo.value) : 0,
      };

      api.put("/api/product_detail", data).then((response) => {
        api.get("/api/product_detail").then((response) => {
          dataTable.value = response.data;
          dialog.value = false;
          dialogLoading.value = false;
        });
      });
    };

    // Borrar Producto
    const delete_product = () => {
      // const objIndex = {
      //   index: index.value
      // };
      dialogLoadingDelete.value = true;
      api.delete(`/api/product_detail/${index.value}`).then((response) => {
        api.get("/api/product_detail").then((response) => {
          dataTable.value = response.data;
          dialogDelete.value = false;
          dialogLoadingDelete.value = false;
        });
      });
    };

    return {
      clearIfZero,
      restoreIfEmpty,
      pagination,
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
      filter,
      loadingScreen,
      loadingTable,
      nro,
      description,
      amountWithoutIva,
      iva21,
      iva10,
      ivaEnabled,
      offerWithoutIva,
      increases,
      // lastModification,
      offerCost,
      lowestCost,
      costEffectiveness,
      stock,
      suc1,
      suc2,
      depo,
      iva,
      columnFilter,
      open_dialog_delete,
      visibleColumns,
      formatNumber,
      filterFnSuppliers,
      optionsSelectSuppliers,
      optionsIva,
      dialogLoadingDelete,
      onReset,
      validateCost,
      validateProfitability,
      filteredData
    };
  },
});
</script>

<style lang="scss" scoped>
.q-dialog__inner--minimized {
  padding-top: 0px !important;
}

.q-dialog__inner--minimized {
  padding: 0px !important;
}

.q-field--with-bottom {
  padding-bottom: 0;
}
</style>

<style lang="sass" scoped>

.custom-readonly-input-g
  :deep(.q-field__control:before)
    border-width: 1px !important
    border-color: #bdbdbd !important
    border-style: solid !important


.custom-readonly-input
  :deep(.q-field__control:before)
    border-width: 1.5px !important
    border-color: #757575 !important
    border-style: solid !important
    background-color: #f7f7f7 !important
</style>

<style lang="sass">
.my-sticky-header-last-column-table
  height: 310px
  overflow: auto
  position: relative

  /* HEADER pegajoso */
  thead tr:first-child th
    position: sticky
    top: 0
    z-index: 3
    background: #ffffff

  /* Última columna (acciones) fija */
  th:last-child,
  td:last-child
    position: sticky
    right: 0
    z-index: 2
    background-color: #ffffff

  /* Anteúltima columna (acciones o iconos extra) fija */
  th:nth-last-child(2),
  td:nth-last-child(2)
    position: sticky
    right: 52px
    z-index: 2
    background-color: #ffffff

  /* Para asegurar que el scroll horizontal funcione */
  .q-table__middle
    overflow-x: auto !important
    overflow-y: visible !important

</style>
