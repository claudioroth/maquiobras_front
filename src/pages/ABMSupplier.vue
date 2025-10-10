<template>
  <!-- HEADER -->
  <div class="pt-header q-mt-md">
    <div class="q-mx-md">
      <div class="bg-white q-pa-md rounded-borders flex" style="border: solid 1px #e0e0e0">

        <q-btn v-if="userRol == 1" class="q-mr-md q-px-lg justify-center" size="md" color="grey-7" outline
          :disable="loadingScreen" @click="open_dialog('create')"><q-icon name="o_groups" class="q-mr-sm" />
          <div class="q-pt-xs">Nuevo Proveedor</div>
        </q-btn>

        <q-space />
        <q-input dense outlined debounce="300" v-model="filter" :disable="loadingScreen" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
  </div>

  <!-- TABLA -->
  <div class="q-pa-md">
    <q-table flat separator="cell" v-if="!loadingScreen" bordered dense title="ABM Proveedores" :rows="suppliers"
      :columns="columns" :loading="loadingTable" row-key="id" :filter="filter" virtual-scroll
      v-model:pagination="pagination" :rows-per-page-options="[0]" color="primary"
      class="no-shadow text-grey-7 my-sticky-header-table"
      :style="`border: solid 1px #e0e0e0; height:${$q.screen.height - 190}px ;`">


      <!-- Nombre Proveedor -->
      <template v-slot:body-cell-nombre="props">
        <q-td :props="props">
          {{ props.row.nombre }}
        </q-td>
      </template>

      <!-- fecha -->
      <template v-slot:body-cell-fecha="props">
        <q-td :props="props">
          <div>
            <div>{{ parse_datetime(props.row.fecha, "date") }}</div>
            <q-badge color="grey-3 text-grey-7">
              {{ parse_datetime(props.row.fecha, "hours") }}
            </q-badge>
          </div>
        </q-td>
      </template>

      <!-- Acciones -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <div>
            <q-btn outline class="q-mr-sm" @click="open_dialog('Modify', props.row)" color="grey-7" icon="edit" />
          </div>
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
  <q-dialog v-model="dialog" full-height position="right">
    <q-card class="column full-height" style="width: 500px">
      <!-- header -->
      <q-card-section class="bg-grey-3">
        <div class="text-grey-8">{{ dialogTitle }}</div>
      </q-card-section>

      <!-- body -->
      <q-card-section class="col q-pa-lg">
        <q-form @submit="dialogTitle == 'Nuevo Proveedor' ? createSupplier() : modifySupplier()" @reset="onReset"
          class="q-gutter-md">
          <q-input outlined v-model="supplierId" label="N° de Proveedor" :disable="dialogTitle == 'Modificar Proveedor'"
            :rules="[validateUniqueSupplierId]" />
          <q-input outlined v-model="supplierName" label="Nombre del Proveedor"
            :rules="[(val) => !!val || 'Ingrese un nombre al proveedor']" />

          <div>
            <q-btn :label="dialogTitle == 'Nuevo Proveedor'
              ? 'Crear Proveedor'
              : 'Modificar Proveedor'
              " type="submit" unelevated color="primary" />
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
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
import { handleCustomError } from "src/helpers/errors";
import { api } from "src/boot/axios";
import { useQuasar } from "quasar";

export default defineComponent({

  setup() {
    // VARIABLES
    const $q = useQuasar();
    const dialog = ref(false);
    const dialogLoading = ref(false);
    const dialogTitle = ref(null);
    const suppliers = ref([]);
    const loadingScreen = ref(true);
    const loadingTable = ref(false);

    const supplierId = ref()
    const supplierName = ref()

    const pagination = ref({
      rowsPerPage: 0,
    });

    const userRol = SessionStorage.getItem("rol");

    const columns = [
      { name: "prov_id", label: "N° de Proveedor", field: "prov_id", align: "center" },
      {
        name: "nombre",
        align: "center",
        label: "Nombre",
        field: "nombre",
        sortable: true,
      },
      {
        name: "fecha",
        label: "Fercha de Modificacion",
        field: "fecha",
        align: "center",
      },
    ];

    if (userRol == 1) {
      columns.push({
        name: "actions",
        label: "Acciones",
        field: "Actions",
        align: "center",
      });
    }



    // MOUNTED
    onMounted(() => {
      // Carga de Tabla
      api
        .get("/api/provedor")
        .then((response) => {
          suppliers.value = response.data;
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
        .get("/api/provedor")
        .then((response) => {
          suppliers.value = response.data;
          loadingTable.value = false;
        })
        .catch((error) => {
          handleCustomError(error.message);
        });
    };

    // Valida si el N de Proveedor ya existe en la tabla
    const validateUniqueSupplierId = (val) => {
      if (!val) return "Ingrese un N° de proveedor";
      const exists = suppliers.value.some(
        (supplier) => supplier.prov_id == val
      );
      if (exists && dialogTitle.value === "Nuevo Proveedor") {
        return "Ese N° de proveedor ya existe";
      }
      return true;
    };


    // Abrir Dialog
    const open_dialog = (action, data) => {
      dialog.value = true;
      dialogTitle.value = "Nuevo Proveedor";
      supplierId.value = null;
      supplierName.value = null;
      if (action == "Modify") {
        dialogTitle.value = "Modificar Proveedor";
        supplierId.value = data.prov_id;
        supplierName.value = data.nombre;
      }
    };

    // Crear Usuario
    const createSupplier = () => {
      const exists = suppliers.value.some(
        (supplier) => supplier.prov_id == supplierId.value
      );
      if (exists) {
        $q.notify({
          color: "negative",
          icon: "warning",
          message: "Ese N° de proveedor ya existe",
        });
        return;
      }
      dialogLoading.value = true;
      const data = {
        prov_id: supplierId.value,
        nombre: supplierName.value,
      };
      api.post("/api/provedor", data).then((response) => {
        loadingTable.value = true;
        getData();
        $q.notify({
          icon: "person",
          message: "El proveedor se creó correctamente",
          position: "bottom",
          timeout: 2000,
        });
        dialog.value = false;
        dialogLoading.value = false;
      });
    };


    const modifySupplier = () => {
      // Validación de permisos: solo el rol 1 puede modificar proveedores
      if (userRol !== 1) {
        $q.notify({
          color: "negative",
          icon: "warning",
          message: "No tienes permisos para modificar proveedores",
          position: "bottom",
          timeout: 2000,
        });
        return;
      }
      dialogLoading.value = true;

      const data = {
        prov_id: supplierId.value,
        nombre: supplierName.value,
      };

      api
        .put("/api/provedor", data)
        .then(() => {
          loadingTable.value = true;
          getData();
          $q.notify({
            icon: "settings",
            message: "El proveedor se ha modificado correctamente",
            position: "bottom",
            timeout: 2000,
          });
          dialog.value = false;
        })
        .catch((error) => {
          handleCustomError(error.message);
        })
        .finally(() => {
          dialogLoading.value = false;
        });
    };


    const onReset = () => {
      if (dialogTitle.value == 'Nuevo Proveedor') { supplierId.value = null };
      supplierName.value = null;
    };

    return {
      loadingScreen,
      loadingTable,
      columns,
      suppliers,
      filter: ref(""),
      dialog,
      dialogLoading,
      dialogTitle,
      createSupplier,
      modifySupplier,
      open_dialog,
      validateUniqueSupplierId,
      supplierId,
      supplierName,
      onReset,
      getData,
      pagination,
      userRol
    };
  },
  methods: {

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

<style lang="sass">
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

.my-sticky-header-table-a
  /* height or max-height is important */
  max-height: 310px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #f5f5f5

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
.q-dialog__inner--minimized
    padding: 0px

/* --- INPUT NUMÉRICO COMPACTO PARA Q-INPUT --- */
.mini-number
  /* aplica sobre el componente <q-input class="mini-number"> */
  .q-field
    /* quitar el alto mínimo heredado */
    min-height: 0 !important
    height: 28px !important         /* ajustar a lo que necesites */

  .q-field__control
    min-height: 0 !important
    height: 24px !important
    padding-top: 0 !important
    padding-bottom: 0 !important
    display: flex
    align-items: center

  /* target al input nativo dentro de q-input */
  input.q-field__native,
  input[type="number"]
    height: 24px !important         /* alto del input interno */
    min-height: 0 !important
    line-height: 20px !important
    padding: 0 8px !important
    font-size: 13px
    box-sizing: border-box
    -moz-appearance: textfield !important
    appearance: textfield !important

  /* eliminar los spinners (Chrome / Edge / Safari / WebKit) */
  input.q-field__native::-webkit-outer-spin-button,
  input.q-field__native::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button
    -webkit-appearance: none
    margin: 0

  /* firefox: que no muestre las flechitas ni comportamiento numérico */
  input[type="number"]
    -moz-appearance: textfield

/* ------------- Opcional: versión más compacta ------------- */
.mini-number--xs
  .q-field, .q-field__control
    height: 24px !important
  input.q-field__native
    height: 18px !important
    padding: 0 6px !important
    font-size: 12px !important

/* Si tu <style> es scoped, podes necesitar usar ::v-deep */
::v-deep .mini-number
  .q-field__control
    /* ejemplo: forzar alineación cuando está scoped */
    align-items: center


</style>

<style lang="sass" scoped>
::v-deep(.q-table__progress)
  transform: translateY(-19.5px) !important
</style>
