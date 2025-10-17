<template>
  <!-- HEADER -->
  <div class="pt-header q-mt-md">
    <div class="q-mx-md">
      <div class="bg-white q-pa-md rounded-borders flex" style="border: solid 1px #e0e0e0">
        <q-btn v-if="userBranch" class="q-mr-md q-px-lg" size="md" color="grey-7" outline :disable="loadingScreen"
          @click="open_dialog('create')"><q-icon name="local_shipping" class="q-mr-sm" />
          <div class="q-pt-xs">Nuevo Ingreso</div>
        </q-btn>

        <q-space />
        <q-input dense outlined :disable="loadingScreen" debounce="300" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
  </div>

  <!-- TABLA -->
  <div class="q-pa-md">
    <q-table v-if="!loadingScreen" flat :loading="loadingTable" dense bordered title="Ingreso de Stock" :rows="income"
      :columns="columns" row-key="id" :filter="filter" separator="cell" virtual-scroll v-model:pagination="pagination"
      :rows-per-page-options="[0]" color="primary" class="no-shadow text-grey-7 my-sticky-header-table"
      :style="`border: solid 1px #e0e0e0; height:${$q.screen.height - 190}px ;`">
      <!-- <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template> -->

      <template v-slot:body-cell-producto="props">
        <q-td :props="props">
          <div>
            <!-- {{ props.row  }} -->
            <q-btn label="productos" color="primary" dense outline class="q-px-md q-py-xs" icon="handyman" size="sm"
              @click="openProductsPopup[props.row.index]" />
            <q-popup-proxy v-model="showPopup[props.row.id]" transition-show="scale" transition-hide="scale"
              class="no-shadow q-pa-none q-mt-md" style="border: 1px solid #ebebeb; margin-top: 10px !important">
              <q-card class="bg-grey-2 q-pa-none">
                <q-card-section>

                  <q-table dense class="text-grey-8 text-sm bg-grey-2 custom-font-size my-sticky-header-table-a"
                    table-style="font-size:8px" :rows="JSON.parse(props.row.productos)" :columns="salesColumns"
                    row-key="index" hide-bottom flat separator="cell" bordered :rows-per-page-options="[0]" />
                </q-card-section>
              </q-card>
            </q-popup-proxy>
          </div>
        </q-td>
      </template>


      <template v-slot:body-cell-cantidad="props">
        <q-td :props="props">
          <div>
            <q-badge color="grey-7">
              {{ props.row.cantidad }}
            </q-badge>
          </div>
        </q-td>
      </template>


      <template v-slot:body-cell-remito="props">
        <q-td :props="props">
          <div>
            {{ props.row.remito ? props.row.remito : "-" }}
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
    <q-inner-loading v-else :showing="loadingScreen" class="bg-white" :style="`height:${$q.screen.height - 190
      }px; top:164px; right:16px; left:${$q.screen.width < 1007 ? 16 : 256
      }px;border: 1px solid rgb(224 224 224);border-radius:4px`">
      <q-spinner-puff size="50px" color="red-5" />
    </q-inner-loading>
  </div>

  <!-- DIALOG -->
  <q-dialog v-model="dialog" persistent full-height position="right">
    <q-card class="column full-height" style="min-width: 800px">

      <!-- header -->
      <q-card-section class="bg-grey-3 row">
        <div class="text-grey-8">Nuevo Ingreso ({{ branchObject[userBranch] }})</div>
        <q-space />
        <q-btn class="text-grey-9" flat round dense icon="close" v-close-popup size="sm" />
      </q-card-section>

      <!-- body -->
      <q-card-section class="col q-pa-lg">
        <q-form ref="formRef" @submit.prevent="onSubmit" @keydown.enter.prevent @reset="onReset" class="q-gutter-md">


          <div class="row">
            <!-- Semi Administrador -->
            <q-select outlined v-model="semiAdmin" use-input class="col-5 q-mr-md" dense input-debounce="0"
              label="Responsable" :options="optionsSelectSemiAdmin" @filter="filterFnSemiAdmin"
              :rules="[(val) => !!val || '']">
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> No results </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- Remito -->
            <q-input outlined class="col" v-model="remito" placeholder="Ej: 0001 - 00000001" dense label="Remito"
              mask="#### - ########" unmasked-value :rules="[
                val => !!val || '',
                val => val.length === 12 || ''
              ]" />
          </div>

          <!-- Productos -->
          <div class="q-py-md q-mt-xs" :style="`
              border: 1px solid rgb(206 206 206);
              border-radius: 4px;
              position: relative;
              background-color: white;
            `">
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
              PRODUCTOS
            </div>
            <q-table dense class="text-grey-8 custom-font-size my-sticky-header-table" :rows="products"
              :columns="productsColumn" row-key="id_prod" hide-bottom flat :filter="productFilter"
              :style="`height: calc(54vh - 170px); overflow-y: auto`" v-model:pagination="pagination">

              <template v-slot:top>
                <!-- calc(50vh - 100px) -->
                <!-- max-height:${$q.screen.height - 570} -->
                <q-input borderless outlined dense class="col-12" debounce="300" v-model="productFilter"
                  placeholder="Search" style="font-size: 12px; height: 10px; margin-bottom: 30px">
                  <template v-slot:append>
                    <q-icon name="search" style="font-size: 16px" />
                  </template>
                </q-input>
              </template>

              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-italic">
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body-cell-producto="props">
                <q-td no-hover :props="props" style="min-width: 600px; width: 600px; max-width: 600px">
                  {{ props.row.label }}
                </q-td>
              </template>

              <template v-slot:body-cell-button="props">
                <q-td no-hover :props="props" style="min-width: 50px; width: 50px; max-width: 50px">
                  <q-btn flat round size="xs" color="primary" icon="o_add_shopping_cart"
                    @click="addToCart(props.row)" />
                </q-td>
              </template>
            </q-table>
          </div>

          <!-- Carrito -->
          <div class="q-py-md q-mt-lg" :style="`
              border: 1px solid ${completeAlert ? '#c62828' : '#cecece'};
              border-radius: 4px;
              position: relative;
            `">
            <div :style="`
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                top: -9px;
                padding: 0 10px;
                font-size: 11px;
                color: ${completeAlert ? '#c62828' : '#cecece'};
                background-color: white;
              `">
              CARRITO
            </div>
            <q-table v-if="cart.length" dense
              class="text-grey-8 custom-font-size custom-font-size my-sticky-header-table" :rows="cart"
              :columns="cartColumn" row-key="id_prod" hide-bottom flat
              :style="`height: calc(40vh - 100px); overflow-y: auto`" v-model:pagination="pagination">


              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-italic">
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <!-- Columna: Producto -->
              <template v-slot:body-cell-producto="props">
                <q-td :props="props" class="text-left" style="width: 75%;">
                  <div class="q-pa-xs ellipsis">
                    {{ props.row.producto }}
                  </div>
                </q-td>
              </template>

              <!-- Columna: Cantidad -->
              <template v-slot:body-cell-cantidad="props">
                <q-td :props="props" class="text-center" style="width: 19%;">
                  <div class="flex flex-center q-gutter-sm">
                    <q-icon size="xs" name="arrow_left" class="cursor-pointer" @click="decreaseQuantity(props.row)" />

                    <q-input v-model.number="props.row.cantidad" type="number" dense outlined input-class="text-center"
                      class="mini-number" style="width: 70px; font-size: 12px;" min="1" @blur="() => {
                        if (props.row.cantidad < 1) props.row.cantidad = 1
                        validateQuantity(props.row)
                      }" @keyup.enter="() => {
                        if (props.row.cantidad < 1) props.row.cantidad = 1
                        validateQuantity(props.row)
                      }" />


                    <q-icon size="xs" name="arrow_right" class="cursor-pointer" @click="increaseQuantity(props.row)" />
                  </div>
                </q-td>
              </template>

              <!-- Columna: Eliminar -->
              <template v-slot:body-cell-button="props">
                <q-td :props="props" class="text-center" style="width: 7%;">
                  <q-btn flat round dense icon="delete" size="8px" class="cursor-pointer"
                    @click="removeFromCart(props.row)" />
                </q-td>
              </template>
            </q-table>


            <div v-else :style="`height: calc(40vh - 100px); overflow-y: auto`" :class="`content-center text-center ${completeAlert ? 'text-red-9' : 'text-grey-6'
              }`">
              <q-icon size="lg" name="add_shopping_cart" class="q-mb-sm" />
              <div>
                {{
                  completeAlert
                    ? "Ingrese al menos 1 producto"
                    : "Carrito vacio"
                }}
              </div>
            </div>
          </div>

          <div>
            <q-btn label="Completar Ingreso" type="submit" unelevated color="primary" />
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
          </div>
        </q-form>
      </q-card-section>

      <q-inner-loading :showing="dialogLoading" class="bg-white" style="z-index: 10;">
        <q-spinner-puff size="50px" color="red-5" />
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, onMounted, watch, computed } from "vue";
import { date, SessionStorage } from "quasar";
import { customNotify, handleCustomError } from "src/helpers/errors";
import { api } from "src/boot/axios";
import { useQuasar } from "quasar";

export default defineComponent({

  setup() {
    // VARIABLES
    const $q = useQuasar();
    const loadingScreen = ref(true);
    const loadingTable = ref(false);
    const dialog = ref(false);
    const dialogLoading = ref(true);
    const income = ref([]);
    const semiAdmin = ref(null);
    const remito = ref(null);
    const usersObject = ref({})
    const branchObject = { "suc1": "Sucursal Galicia", "suc2": "Sucursal Juan B. Justo", "depo": "Deposito" }
    const selectSemiAdmin = ref([]);
    const optionsSelectSemiAdmin = ref(selectSemiAdmin.value);
    // const useAdmin = SessionStorage.getItem("is_admin");
    const idUser = SessionStorage.getItem("id_user");
    const userBranch = SessionStorage.getItem("branch");
    const formRef = ref(null);
    const cart = ref([]);
    const products = ref([]);
    const completeAlert = ref(false);
    const rol = SessionStorage.getItem("rol");

    const pagination = ref({
      rowsPerPage: 0,
    });


    const columns = [
      { name: "id_user", label: "Usuario", field: "id_user", align: "center", format: (val) => usersObject.value[val] },
      {
        name: "id_sucursal",
        align: "center",
        label: "Sucursal",
        field: "id_sucursal",
        format: (val) => branchObject[val],
        sortable: true,
      },
      // {
      //   name: "cantidad",
      //   align: "center",
      //   label: "Cantidad",
      //   field: "cantidad",
      //   sortable: true,
      // },
      {
        name: "producto",
        label: "Productos",
        field: "producto",
        align: "center",
        classes: 'text-sm'
      },
      {
        name: "semi_admin",
        label: "Semi Administrador",
        field: "semi_admin",
        align: "center",
        sortable: true,
        format: (val) => usersObject.value[val]
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

    const cartColumn = [
      {
        name: "producto",
        label: "Producto",
        field: "producto",
        align: "left",
      },
      {
        name: "cantidad",
        label: "Cantidad",
        field: "cantidad",
        align: "center",
      },
      {
        name: "button",
        label: "",
        field: "button",
        align: "center",
      },
    ];

    const productsColumn = [
      {
        name: "producto",
        label: "Producto",
        field: "label",
        align: "left",
      },
      {
        name: "button",
        label: "",
        field: "button",
        align: "center",
      },
    ];

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

    // MOUNTED
    onMounted(() => {
      // Carga de Tabla
      api
        // .get(`/api/ingreso${userBranch ? `/${userBranch}` : "s"}`)
        .get(rol == 1 ? "/api/ingresos" : `/api/ingreso/${userBranch}`)
        .then((response) => {
          income.value = response.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          loadingScreen.value = false;
        })
        .catch((error) => {
          handleCustomError(error.message);
        });

      // usuarios
      api.get("/api/users").then((response) => {
        response.data.forEach((u) => {
          usersObject.value[u.id] = u.user
        });
      });
    })

    // WATCH
    watch(dialog, (newValue) => {
      if (!newValue) {
        dialogLoading.value = true;
        document.activeElement.blur(); // Quitar foco del input actual
      }
    });


    watch(completeAlert, (newValue, oldValue) => {
      if (newValue === true) {
        setTimeout(() => {
          completeAlert.value = false; // Cambia la variable a false después de 3 segundos
        }, 1500);
      }
    });

    // FUNCIONES

    // Refresca la tabla principal
    const get_data = () => {
      api
        .get(rol == 1 ? "/api/ingresos" : `/api/ingreso/${userBranch}`)
        .then((response) => {
          income.value = response.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          loadingScreen.value = false;
          loadingTable.value = false;
        })
        .catch((error) => {
          handleCustomError(error.message);
        });
    };

    const validateRemito = (val) => {
      if (!val) return true;
      return val.length === 12;
    }

    const onSubmit = async () => {
      const valid = await formRef.value.validate()

      if (!valid) return

      if (cart.value.length === 0) {
        completeAlert.value = true
        return
      }
      newEntry()
    }

    // Abrir Dialog
    const open_dialog = (action, data) => {
      dialog.value = true;

      // Resetear campos
      semiAdmin.value = null;
      remito.value = null;
      cart.value = [];
      products.value = [];

      selectSemiAdmin.value = [];

      // Cargar select semi administradores
      api.get("/api/semiadmin").then((response) => {
        response.data.forEach((sm) => {
          selectSemiAdmin.value.push({ label: sm.user, value: sm.id });
        });

        api.get(`/api/allproducts`).then((response) => {
          response.data.productos.forEach((t) => {
            products.value.push({ label: t.descripcion, value: t.index });
          });

          dialogLoading.value = false;
        });
      });
    };


    const showPopup = ref(Array(products.length).fill(false));

    const openProductsPopup = (index) => {
      showPopup.value[index] = true;
    };


    // --- FUNCIONES DEL CARRITO ---

    // Agregar producto al carrito
    const addToCart = (product) => {
      const existing = cart.value.find((item) => item.id_prod === product.value);

      if (existing) {
        existing.cantidad++;
      } else {
        cart.value.push({
          id_prod: product.value,
          producto: product.label,
          cantidad: 1,
        });
      }
    };

    // Aumentar cantidad
    const increaseQuantity = (item) => {
      item.cantidad++;
    };

    // Disminuir cantidad
    const decreaseQuantity = (item) => {
      if (item.cantidad > 1) {
        item.cantidad--;
      } else {
        item.cantidad = 1;
      }
    };

    // Eliminar producto del carrito
    const removeFromCart = (item) => {
      const index = cart.value.indexOf(item);
      if (index > -1) {
        cart.value.splice(index, 1);
      }
    };

    // Validar cantidad
    const validateQuantity = (item) => {
      if (item.cantidad < 1) item.cantidad = 1;
    };

    const onReset = () => {
      // Limpiar campos del formulario
      semiAdmin.value = null;
      remito.value = null;
      cart.value = [];

      // Resetear validaciones si usás <q-form ref="formRef">
      if (formRef?.value) {
        formRef.value.resetValidation();
      }
    };

    const parseRemito = (input) => {
      const part1 = input.slice(0, 4);
      const part2 = input.slice(4);
      return `${part1}-${part2}`;
    }

    const parse_datetime = (dateString, type) => {
      if (type == "date") {
        return date.formatDate(dateString, "DD-MM-YYYY");
      } else {
        return date.formatDate(dateString, "HH:mm");
      }
    }

    // Ingreso de productos
    const newEntry = () => {
      if (cart.value.length === 0) {
        completeAlert.value = true;
        return;
      }
      const formData = new FormData();
      const entries = {
        id_user: idUser,
        id_sucursal: userBranch,
        semi_admin: semiAdmin.value?.value || null,
        remito: remito.value ? parseRemito(remito.value) : null,
        productos: cart.value
      };

      formData.append("data", JSON.stringify(entries));

      api.post("/api/ingresos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
        .then(() => {
          get_data();
          $q.notify({
            icon: "done",
            message: "Ingreso completado",
            position: "bottom",
            timeout: 2000,
          });
          dialog.value = false;
          cart.value = [];
        })
        .catch((error) => {
          handleCustomError(error.message);
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


    return {
      completeAlert,
      columns,
      loadingScreen,
      loadingTable,
      income,
      semiAdmin,
      remito,
      openProductsPopup,
      showPopup,
      branchObject,
      filter: ref(""),
      dialog,
      cart,
      cartColumn,
      productFilter: ref(""),
      productsColumn,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      validateQuantity,
      salesColumns,
      products,
      dialogLoading,
      selectSemiAdmin,
      optionsSelectSemiAdmin,
      filterFnSemiAdmin,
      onReset,
      newEntry,
      open_dialog,
      pagination,
      userBranch,
      validateRemito,
      parse_datetime,
      usersObject,
      onSubmit,
      formRef
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
.custom-text-size
  font-size: 14px!important  /* Ajusta el tamaño del texto */
</style>


<style lang="scss" scoped>
.q-dialog__inner--minimized {
  padding-top: 0px !important;
}

.q-field--dense .q-field__control,
.q-field--dense .q-field__marginal {
  height: 30px !important;
}

.cart-table .q-table__middle {
  overflow-y: auto;
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
