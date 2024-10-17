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
          ><q-icon name="construction" class="q-mr-sm" /> Nueva Venta
        </q-btn>

        {{ branch }}

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
          <!-- Productos -->
          <q-table
            dense
            separator="cell"
            class="text-grey-8 custom-font-size"
            :rows="products"
            :columns="productsColumn"
            row-key="name"
            hide-bottom
            flat
            bordered
            :filter="productFilter"
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
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>

            <template v-slot:body-cell-button="props">
              <q-td no-hover :props="props">
                <q-btn
                  flat
                  round
                  size="sm"
                  color="primary"
                  icon="o_shopping_cart"
                  @click="addToCart(props.row)"
                />
              </q-td>
            </template>
          </q-table>

          <!-- Carrito -->
          <q-table
            dense
            class="text-grey-8 custom-font-size"
            :rows="cart"
            :columns="productsColumn"
            row-key="name"
            hide-bottom
            flat
            bordered
          >
            <template v-slot:body-cell-suc1="props">
              <q-td no-hover :props="props">
                <q-icon
                  :key="size"
                  size="xs"
                  name="arrow_drop_up"
                  @click="increaseQuantity(props.row)"
                />
                {{ props.row.suc1 }}
                <q-icon
                  :key="size"
                  size="xs"
                  name="arrow_drop_down"
                  @click="decreaseQuantity(props.row)"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-button="props">
              <q-td no-hover :props="props">
                <q-btn
                  flat
                  round
                  size="sm"
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
    const products = ref([]);

    const cart = ref([]);

    const selectUsers = ref([]);
    const selectTools = ref([]);
    const selectAmount = ref();

    const optionsSelectTools = ref(selectTools.value);
    const useAdmin = SessionStorage.getItem("is_admin");
    const branch = SessionStorage.getItem("branch");
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

    const productsColumn = [
      {
        name: "descripcion",
        label: "Producto",
        field: "descripcion",
        align: "center",
      },
      {
        name: branch,
        label: "Cantidad",
        field: branch,
        align: "center",
      },
      {
        name: "button",
        label: "",
        field: "button",
        align: "center",
      },
    ];

    // MOUNTED
    onMounted(() => {
      // Carga de Tabla
      api
        .get("/api/ventas1")
        .then((response) => {
          sales.value = response.data;
          loadingScreen.value = false;
        })
        .catch((error) => {
          handleCustomError(error.message);
        });
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
      tool.value = null;
      amount.value = null;
      selectTools.value = [];

      // Carga select Usuarios
      api.get(`/api/controlmix/${branch}`).then((response) => {
        console.log(response.data);
        products.value = response.data;
        dialogLoading.value = false;
      });
    };

    // Agrega al carrito un producto
    const addToCart = (p) => {
      const product = products.value.find(
        (product) => product.index === p.index
      );
      if (product && product.suc1 > 0) {
        product.suc1--;
        console.log(
          `Cantidad de producto con ID ${p.index} es ahora: ${product.suc1}`
        );
        const cartProduct = cart.value.find((item) => item.index === p.index);
        if (cartProduct) {
          cartProduct.suc1++;
        } else {
          cart.value.push({
            index: product.index,
            descripcion: product.descripcion,
            suc1: 1,
          });
        }
      } else {
        console.log("No se puede descontar más, cantidad es 0");
      }
    };

    // Saca el producto del carrito
    const removeFromCart = (p) => {
      const cartProductIndex = cart.value.findIndex(
        (item) => item.index === p.index
      );
      if (cartProductIndex !== -1) {
        const productInInventory = products.value.find(
          (product) => product.index === p.index
        );
        if (productInInventory) {
          productInInventory.suc1 += cart.value[cartProductIndex].suc1;
          console.log(
            `Cantidad de producto con ID ${p.index} en inventario es ahora: ${productInInventory.suc1}`
          );
        }
        cart.value.splice(cartProductIndex, 1);
        console.log(`Producto con ID ${p.index} eliminado del carrito`);
      }
    };

    // incrementa la cantidad del producto dentro del carrito
    const increaseQuantity = (item) => {
      const product = products.value.find((p) => p.index === item.index);
      if (product && product.suc1 > 0) {
        product.suc1--;
        item.suc1++;
      } else {
        console.log("No hay suficiente stock para aumentar");
      }
    };

        // Reduce la cantidad del producto dentro del carrito
    const decreaseQuantity = (item) => {
      const product = products.value.find((p) => p.index === item.index);
      if (item.suc1 > 1) {
        item.suc1--;
        product.suc1++;
      } else {
        console.log("No se puede reducir más la cantidad en el carrito");
      }
    };

    const onReset = () => {
      user.value = null;
      tool.value = null;
      amount.value = null;
      branch.value = null;
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
      productsColumn,
      loadingScreen,
      loadingTable,
      sales,
      products,
      cart,
      user,
      tool,
      amount,
      branch,
      filter: ref(""),
      productFilter: ref(""),
      dialog,
      dialogLoading,
      showPopup,
      selectUsers,
      optionsSelectTools,
      filterFnTools,
      onReset,
      create_withdrawal,
      open_dialog,
      createNumberList,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      pagination,
      useAdmin,
      selectAmount,
    };
  },
});
</script>

<style lang="scss" scoped>
.q-dialog__inner--minimized {
  padding-top: 0px !important;
}
</style>
