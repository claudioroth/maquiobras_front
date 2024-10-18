<template>
  <!-- HEADER -->
  <div class="pt-header q-mt-md">
    <div class="q-mx-md">
      <div
        class="bg-white q-pa-md rounded-borders flex"
        style="border: solid 1px #e0e0e0"
      >
        <q-btn
          v-if="rol == 3"
          class="q-mr-md q-px-lg"
          size="md"
          color="grey-7"
          outline
          :disable="loadingScreen"
          @click="open_dialog('create')"
          ><q-icon name="construction" class="q-mr-sm" /> Nueva Venta
        </q-btn>

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
      row-key="index"
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

      <template v-slot:body-cell-ventas="props">
        <q-td :props="props">
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
              @click="showPopup[props.row.id] = true"
            />

            <q-popup-proxy
              v-model="showPopup[props.row.id]"
              transition-show="scale"
              transition-hide="scale"
              class="no-shadow q-pa-none q-mt-md"
              style="border: 1px solid #ebebeb; margin-top: 10px !important"
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

  <!-- DIALOG -->
  <q-dialog v-model="dialog" full-height position="right">
    <q-card class="column full-height" style="width: 500px">
      <!-- header -->
      <q-card-section class="bg-grey-3">
        <div class="text-grey-8">Nueva Venta</div>
      </q-card-section>

      <!-- body -->
      <q-card-section class="col q-pa-lg">
        <q-form @submit="newSale" @reset="onReset" class="q-gutter-md">
          <!-- Productos -->
          <div
            class="q-py-md"
            style="
              border: 1px solid rgb(206 206 206);
              border-radius: 4px;
              position: relative;
            "
          >
            <div
              style="
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                top: -9px;
                padding: 0 10px;
                font-size: 11px;
                color: #9b9b9b;
                background-color: white;
              "
            >
              PRODUCTOS
            </div>
            <q-table
              dense
              class="text-grey-8 custom-font-size my-sticky-header-table"
              :rows="products"
              :columns="productsColumn"
              row-key="name"
              hide-bottom
              flat
              :filter="productFilter"
              style="height: 210px; overflow-y: auto"
              v-model:pagination="pagination"
            >
              <template v-slot:top>
                <q-input
                  borderless
                  outlined
                  dense
                  class="col-12"
                  debounce="300"
                  v-model="productFilter"
                  placeholder="Search"
                  style="font-size: 12px; height: 10px; margin-bottom: 30px"
                >
                  <template v-slot:append>
                    <q-icon name="search" style="font-size: 16px" />
                  </template>
                </q-input>
              </template>

              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    class="text-italic"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body-cell-cantidad="props">
                <q-td no-hover :props="props">
                  <q-badge
                    color="orange-9"
                    text-color="white"
                    style="font-size: 10px"
                    :label="props.row.cantidad"
                  />
                </q-td>
              </template>

              <template v-slot:body-cell-button="props">
                <q-td no-hover :props="props">
                  <q-btn
                    flat
                    round
                    size="xs"
                    color="primary"
                    icon="o_shopping_cart"
                    @click="addToCart(props.row)"
                  />
                </q-td>
              </template>
            </q-table>
          </div>

          <!-- Carrito -->
          <q-table
            dense
            class="text-grey-8 custom-font-size"
            :rows="cart"
            :columns="cartColumn"
            row-key="name"
            hide-bottom
            flat
            bordered
            style="height: 260px; overflow-y: auto"
            v-model:pagination="pagination"
          >
            <template v-slot:body-cell-cantidad="props">
              <q-td no-hover :props="props">
                <q-icon
                  size="xs"
                  name="arrow_drop_down"
                  @click="decreaseQuantity(props.row)"
                />
                <q-badge
                  outline
                  color="red-7"
                  text-color="white"
                  style="font-size: 10px"
                  :label="props.row.cantidad"
                />
                <q-icon
                  size="xs"
                  name="arrow_drop_up"
                  @click="increaseQuantity(props.row)"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-button="props">
              <q-td no-hover :props="props">
                <q-btn
                  flat
                  round
                  size="xs"
                  color="primary"
                  icon="o_delete"
                  @click="removeFromCart(props.row)"
                />
              </q-td>
            </template>
          </q-table>

          <!-- createNumberList -->

          <div>
            <q-btn
              label="Completar Venta"
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
    const sales = ref([]);
    const products = ref([]);
    const cart = ref([]);
    const usersObject = ref({});
    const id_user = SessionStorage.getItem("id_user");
    const branch = SessionStorage.getItem("branch");
    const rol = SessionStorage.getItem("rol");
    const pagination = ref({
      rowsPerPage: 0,
    });

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
        align: "center",
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
        align: "center",
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
        .get(rol == 3 ? `/api/${parceBranch1[branch]}` : "/api/ventas")
        .then((response) => {
          sales.value = response.data;
          sales.value.forEach((sale, index) => {
            sale.showPopup = false;
            sale.index = index + 1
          });

          console.log(sales.value)
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

    // FUNCIONES

    // Refresca la tabla principal
    const get_data = () => {
      api
        .get(`/api/${parceBranch1[branch]}`)
        .then((response) => {
          sales.value = response.data;
          sales.value.forEach((sale) => {
            sale.showPopup = false;
          });
          loadingScreen.value = false;
          loadingTable.value = false;
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

    // Abrir Dialog
    const open_dialog = (action, data) => {
      dialog.value = true;
      products.value = [];
      cart.value = [];

      api.get(`/api/controlmix/${branch}`).then((response) => {
        console.log(response.data);
        response.data.forEach((p) => {
          products.value.push({
            id_prod: p.index,
            producto: p.descripcion,
            cantidad: p[branch],
          });
        });

        console.log(products.value);
        dialogLoading.value = false;
      });
    };

    // Agrega al carrito un producto
    const addToCart = (p) => {
      const product = products.value.find(
        (product) => product.id_prod === p.id_prod
      );
      if (product && product.cantidad > 0) {
        product.cantidad--;
        const cartProduct = cart.value.find(
          (item) => item.id_prod === p.id_prod
        );
        if (cartProduct) {
          cartProduct.cantidad++;
        } else {
          cart.value.push({
            id_prod: product.id_prod,
            producto: product.producto,
            cantidad: 1,
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

    // incrementa la cantidad del producto dentro del carrito
    const increaseQuantity = (item) => {
      const product = products.value.find((p) => p.id_prod === item.id_prod);
      if (product && product.cantidad > 0) {
        product.cantidad--;
        item.cantidad++;
      }
    };

    // Reduce la cantidad del producto dentro del carrito
    const decreaseQuantity = (item) => {
      const product = products.value.find((p) => p.id_prod === item.id_prod);
      if (item.cantidad > 1) {
        item.cantidad--;
        product.cantidad++;
      }
    };

    const onReset = () => {
      products.value = [];
      cart.value = [];

      api.get(`/api/controlmix/${branch}`).then((response) => {
        console.log(response.data);
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
          loadingTable.value = true;
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
    };
    return {
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
      newSale,
      pagination,
      showPopup: Array(products.length).fill(false),
      parse_datetime,
      rol
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
