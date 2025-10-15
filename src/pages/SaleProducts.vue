<template>
  <!-- HEADER -->
  <div class="pt-header q-mt-md">
    <div class="q-mx-md">
      <div class="bg-white q-pa-md rounded-borders flex" style="border: solid 1px #e0e0e0">
        <q-btn class="q-mr-md q-px-lg" size="md" color="grey-7" outline :disable="loadingScreen"
          @click="open_dialog('create')"><q-icon name="shopping_cart" class="q-mr-sm" />
          <div class="q-pt-xs">Nueva Venta</div>
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
    <q-table v-if="!loadingScreen" flat :loading="loadingTable" bordered dense title="Ventas" :rows="sales"
      :columns="columns" row-key="index" :filter="filter" separator="cell" virtual-scroll
      v-model:pagination="pagination" :rows-per-page-options="[0]" color="primary" no-hover
      class="no-shadow text-grey-7 my-sticky-header-table"
      :style="`border: solid 1px #e0e0e0; height:${$q.screen.height - 190}px ;`">
      <!-- <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template> -->

      <template v-slot:body-cell-ventas="props">
        <q-td :props="props">
          <div>
            <q-btn label="productos" color="primary" dense outline class="q-px-md q-py-xs" icon="handyman" size="sm"
              @click="openProductsPopup[props.row.index]" />
            <q-popup-proxy v-model="showPopup[props.row.index]" transition-show="scale" transition-hide="scale"
              class="no-shadow q-pa-none q-mt-md" style="border: 1px solid #ebebeb; margin-top: 10px !important">
              <q-card class="bg-grey-2 q-pa-none">
                <q-card-section>
                  <q-table dense class="text-grey-8 text-sm bg-grey-2 custom-font-size my-sticky-header-table-a"
                    table-style="font-size:8px" :rows="JSON.parse(props.row.ventas)" :columns="salesColumns"
                    row-key="index" hide-bottom flat separator="cell" bordered :rows-per-page-options="[0]" />
                </q-card-section>
              </q-card>
            </q-popup-proxy>
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
  <q-dialog v-model="dialog" full-height position="right">
    <q-card class="column full-height" style="min-width: 800px">
      <!-- header -->
      <q-card-section class="bg-grey-3">
        <div class="text-grey-8">Nueva Venta (<b>{{ parceBranch2[branch] }} </b>) </div>
      </q-card-section>

      <!-- body -->
      <q-card-section class="col q-pa-lg">
        <q-form @submit="newSale" @keydown.enter.prevent @reset="onReset" class="q-gutter-md">
          <!-- Productos -->
          <div class="q-py-md" :style="`
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
              :style="`height: calc(54vh - 100px); overflow-y: auto`" v-model:pagination="pagination">
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
                  {{ props.row.producto }}
                </q-td>
              </template>

              <template v-slot:body-cell-cantidad="props">
                <q-td no-hover :props="props" style="min-width: 60px; width: 60px; max-width: 60px">
                  <q-badge color="grey-9" text-color="white" style="font-size: 10px" :label="props.row.cantidad" />
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

                    <!-- <q-input v-model.number="props.row.cantidad" type="number" dense outlined input-class="text-center"
                      class="mini-number" style="width: 70px; font-size: 12px;" :min="1"
                      @change="validateQuantity(props.row)" /> -->

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

          <!-- createNumberList -->

          <div>
            <q-btn label="Completar Venta" type="submit" unelevated color="primary" />
            <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
          </div>
        </q-form>
      </q-card-section>

      <q-inner-loading :showing="dialogLoading" class="bg-white" style="z-index: 100">
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
  setup() {
    // VARIABLES
    const $q = useQuasar();
    const loadingScreen = ref(true);
    const loadingTable = ref(false);
    const dialog = ref(false);
    const dialogLoading = ref(true);
    const sales = ref([]);
    const products = ref([]);
    const cart = ref([]);
    const usersObject = ref({});
    const completeAlert = ref(false);
    const id_user = SessionStorage.getItem("id_user");
    const branch = SessionStorage.getItem("branch");
    const rol = SessionStorage.getItem("rol");
    const pagination = ref({
      rowsPerPage: 0,
    });

    const showPopup = ref(Array(products.length).fill(false));

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
        field: "producto",
        align: "left",
      },
      {
        name: "cantidad",
        label: "Stock",
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

    const parceBranch1 = { suc1: "ventas1", suc2: "ventas2", depo: "ventas3" };
    const parceBranch2 = {
      suc1: "Sucursal Galicia",
      suc2: "Sucursal Juan B. Justo",
      depo: "Deposito",
    };

    // MOUNTED
    onMounted(() => {
      // Carga de Tabla
      api
        .get(rol == 3 || rol == 2 ? `/api/${parceBranch1[branch]}` : "/api/ventas")
        .then((response) => {
          // Ordenar por fecha descendente (más reciente primero)
          sales.value = response.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

          // Agregar propiedades adicionales
          sales.value.forEach((sale, index) => {
            sale.showPopup = false;
            sale.index = index + 1;
          });

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
    });


    // WATCH
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
        .get(rol == 3 || rol == 2 ? `/api/${parceBranch1[branch]}` : "/api/ventas")
        .then((response) => {
          sales.value = response.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

          sales.value.forEach((sale, index) => {
            sale.showPopup = false;
            sale.index = index + 1;
          });

          loadingTable.value = false;
          loadingScreen.value = false;
        })
        .catch((error) => {
          handleCustomError(error.message);
        });
    };


    const parse_datetime = (dateString, type) => {
      if (type == "date") {
        return date.formatDate(dateString, "DD-MM-YYYY");
      } else {
        return date.formatDate(dateString, "HH:mm");
      }
    };

    const openProductsPopup = (index) => {
      showPopup.value[index] = true;
      console.log(showPopup.value);
    };

    // Abrir Dialog
    const open_dialog = (action, data) => {
      dialog.value = true;
      products.value = [];
      cart.value = [];

      api.get(`/api/controlmix/${branch}`).then((response) => {
        response.data.forEach((p) => {
          products.value.push({
            id_prod: p.index,
            producto: p.descripcion,
            cantidad: p[branch],
          });
        });

        dialogLoading.value = false;
      });
    };

    // Agrega al carrito un producto
    const addToCart = (p) => {
      const product = products.value.find(
        (product) => product.id_prod === p.id_prod
      );

      if (product && product.cantidad > 0) {
        // Descontamos del stock visible arriba
        product.cantidad--;

        // Buscamos si ya está en el carrito
        const cartProduct = cart.value.find(
          (item) => item.id_prod === p.id_prod
        );

        if (cartProduct) {
          cartProduct.cantidad++;
        } else {
          cart.value.push({
            id_prod: product.id_prod,
            producto: product.producto,
            cantidad: 1,                     // cantidad inicial siempre número
            stock_inicial: p.cantidad + 1    // guardamos el stock inicial real
          });
        }
      }
    };

    // Saca el producto del carrito
    const removeFromCart = (p) => {
      const cartProductIndex = cart.value.findIndex(
        (item) => item.id_prod === p.id_prod
      );
      if (cartProductIndex !== -1) {
        const productInInventory = products.value.find(
          (product) => product.id_prod === p.id_prod
        );
        if (productInInventory) {
          productInInventory.cantidad += cart.value[cartProductIndex].cantidad;
        }
        cart.value.splice(cartProductIndex, 1);
      }
    };

    products.value.forEach(p => {
      p.stock_inicial = p.cantidad ?? 0;
      p.cantidad = p.cantidad ?? 0; // asegura que sea número
    });

    // Función para obtener clase según cantidad (para marcar en rojo si excede stock)
    const getInputClass = (item) => {
      const product = products.value.find(p => p.id_prod === item.id_prod);
      if (!product) return '';
      return item.cantidad > product.stock_inicial ? 'bg-red-2 text-red-9' : '';
    };

    const validateQuantity = (item) => {
      item.cantidad = Number(item.cantidad) || 0;

      if (item.cantidad < 0) item.cantidad = 0;
      if (item.cantidad > item.stock_inicial) item.cantidad = item.stock_inicial;

      const product = products.value.find(p => p.id_prod === item.id_prod);
      if (product) {
        product.cantidad = item.stock_inicial - item.cantidad;
      }
    };

    // incrementa la cantidad del producto dentro del carrito
    const increaseQuantity = (item) => {
      const product = products.value.find(p => p.id_prod === item.id_prod);
      if (!product) return;

      item.cantidad = Number(item.cantidad) || 0;
      product.cantidad = Number(product.cantidad) || 0;

      if (product.cantidad > 0) {
        item.cantidad++;
        product.cantidad--;
      }
    };

    // Reduce la cantidad del producto dentro del carrito
    const decreaseQuantity = (item) => {
      const product = products.value.find(p => p.id_prod === item.id_prod);
      if (!product) return;

      item.cantidad = Number(item.cantidad) || 1;
      product.cantidad = Number(product.cantidad) || 0;

      // Evita bajar a menos de 1
      if (item.cantidad > 1) {
        item.cantidad--;
        product.cantidad++;
      }
    };


    const onReset = () => {
      products.value = [];
      cart.value = [];

      api.get(`/api/controlmix/${branch}`).then((response) => {
        response.data.forEach((p) => {
          products.value.push({
            id_prod: p.index,
            producto: p.descripcion,
            cantidad: p[branch],
          });
        });
      });
    };

    // Retirar Herramienta
    const newSale = () => {
      if (cart.value.length) {
        dialogLoading.value = true;

        // Crear el objeto FormData
        const formData = new FormData();

        // Convertir el objeto en JSON y agregarlo al FormData
        const data = {
          id_user: id_user,
          id_sucursal: parceBranch2[branch],
          ventas: cart.value,
        };

        // Enviar el JSON como string
        formData.append("data", JSON.stringify(data));

        // Realizar la solicitud usando Axios
        api
          .post(`/api/${parceBranch1[branch]}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((response) => {
            // loadingTable.value = true;
            get_data(); // Esto recargaría los datos, descomentar si lo necesitas
            $q.notify({
              icon: "done",
              message: "Venta completada",
              position: "bottom",
              timeout: 2000,
            });

            dialog.value = false;
            dialogLoading.value = false;
          })
          .catch((error) => {
            console.error("Error al enviar los datos:", error);
            dialogLoading.value = false;
          });
      } else {
        completeAlert.value = true;
      }
    };
    return {
      completeAlert,
      columns,
      salesColumns,
      productsColumn,
      cartColumn,
      loadingScreen,
      loadingTable,
      sales,
      products,
      cart,
      branch,
      filter: ref(""),
      productFilter: ref(""),
      dialog,
      dialogLoading,
      onReset,
      open_dialog,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      validateQuantity,
      getInputClass,
      newSale,
      pagination,
      openProductsPopup,
      showPopup,
      parse_datetime,
      rol,
      parceBranch1,
      parceBranch2
    };
  },
});
</script>

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
