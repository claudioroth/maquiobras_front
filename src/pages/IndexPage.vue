<template>
  <!-- HEADER -->
  <div class="pt-header q-mt-md">
    <div class="q-pa-md shadow-3 q-px-md q-mx-md">
      <div class="bg-light flex">
        <q-btn
          class="q-mr-md"
          size="md"
          outline
          @click="open_dialog('create')"
          ><q-icon name="add_chart" class="q-mr-sm" /> Nuevo Retiro
        </q-btn>
        <q-btn outline color="dark" icon="picture_as_pdf"/>
        <q-btn outline color="dark" icon="post_add"/>
        </div>
      </div>
  </div>

  <!-- TABLA -->
  <div class="q-pa-md">
    <q-table
      title="Planilla de Control"
      :rows="controles"
      :columns="columns"
      row-key="id"
      :filter="filter"
      :separator="separator"
      color="primary"
    >
      <template v-slot:top-right>
        <q-input dense debounce="300" v-model="filter" placeholder="Buscar">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
          :style="props.selected ? 'transform: scale(0.95);' : ''"
        >
          <q-card bordered flat :class="props.selected ? ($q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2') : ''">
            <q-card-section>
              <q-checkbox dense v-model="props.selected" :label="props.row.name" />
            </q-card-section>
            <q-separator />
            <q-list dense>
              <q-item v-for="col in props.cols.filter(col => col.name !== 'desc')" :key="col.name">
                <q-item-section>
                  <q-item-label>{{ col.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption>{{ col.value }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </template>

    </q-table>
  </div>
</template>


<!-- <template>

  <div class="pt-header q-mt-md">
    <div class="q-pa-md shadow-3 q-px-md q-mx-md">
      <div class="bg-light flex">
        <q-btn
          class="q-mr-md"
          size="md"
          outline
          @click="open_dialog('create')"
          ><q-icon name="person_add_alt" class="q-mr-sm" /> Nuevo Retiro
        </q-btn>
        </div>
      </div>


    <div class="q-pa-md">
      <q-table
        title="Planilla de Control"
        :rows="controles"
        :columns="columns"
        row-key="id"
      />
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
    </div>
  </div>

</template> -->

<script>
import { defineComponent, ref } from 'vue';
import { date, SessionStorage } from 'quasar';
import { useQuasar } from 'quasar';
import { customNotify, handleCustomError } from 'src/helpers/errors';
import * as XLSX from 'xlsx-js-style';
import { api } from 'src/boot/axios';
import axios from 'axios';
// import * as ExcelJS from 'exceljs';
//import XLSX from 'xlsx';



export default defineComponent({
  name: 'IndexPage',

  setup () {

    const controles = ref([]);
    let fileName = "archivo"

    const columns = [
      //{ name: 'id', required: true, label: 'id', align: 'left', field: row => row.name,format: val => `${val}`,sortable: true},
      { name: 'id', label: 'id', align: 'left', field: 'id', sortable: true },
      { name: 'retiro', align: 'center', label: 'retiro-cantidad', field: 'retiro', sortable: true },
      { name: 'nombre', label: 'nombre', field: 'nombre', align: 'left'},
      { name: 'producto', label: 'producto', field: 'producto', align: 'left'},
      { name: 'fecha', label: 'fecha', field: 'fecha', align: 'left', sortable: true }
    ]



    // const convertUtfDate = (dataDate) => {
    //   const objectDateTime = {
    //     date: date.formatDate(new Date(`${dataDate} UTC`), "YYYY/MM/DD"),
    //     time: date.formatDate(new Date(`${dataDate} UTC`), "HH:mm"),
    //   };
    //   return objectDateTime;
    // };

    api.get("/api/control")
        .then((response) => {
          console.log(response.data);
          controles.value = response.data;

          // if (controles.value.length > 0) {
          //   controles.value.forEach((a) => {
          //     a.fecha = convertUtfDate(a.created_at)
          // });
          // }
          function exportExcel (controles) {
            let data = XLSX.utils.json_to_sheet(controles)
            const workbook = XLSX.utils.book_new()
            const filename = 'devschile-admins'
            XLSX.utils.book_append_sheet(workbook, data, filename)
            XLSX.writeFile(workbook, `${filename}.xlsx`)
          }
          //exportExcel(response.data);

        }).catch((error) => {
          handleCustomError(error.message);
          console.log(error);
        });


    return {
        columns,
        controles,
        filter: ref(''),
        selected: ref([]),
        separator: ref('vertical'),
      }

  },
  methods: {
    async searchData() {
      console.log("entre")
      await api.get("/api/control")
        .then((response) => {
          console.log(response.data);
          controles.value = response.data;

          // if (controles.value.length > 0) {
          //   controles.value.forEach((a) => {
          //     a.fecha = convertUtfDate(a.created_at)
          // });
          // }

          //Generate XLSX
          //this.generateXLSX(response.data, response.status);
          this.loading_report = false;
        }).catch((error) => {
          this.loading_report = false;
          handleCustomError(error.message);
          console.log(error);
        });

    },

    open_dialog(action, data) {
      this.dialog = true;
      if (action == "create") {
        this.title = "Nuevo";
        this.name_button = "Crear";
      } else if (action == "modify") {
        let selected_institutions = [];

        data.institutions.forEach((i) => {
          this.list_institutions.forEach((institution) => {
            if (i == institution.value) {
              selected_institutions.push({
                label: institution.label,
                value: institution.value,
              });
            }
          });
        });

        this.form_id = data.id_user;
        this.form_fullname = data.name;
        this.form_qlid = data.user_name;
        this.form_profile = {
          label: this.translations[data.profile],
          value: data.profile,
        };
        this.form_institutions = selected_institutions;

        this.name_button = "Guardar";
        this.title = "Modificar";
      }
    },


  },
  // onMounted () {
  //   this.searchData();
  // },


})
</script>

<style lang="scss" scoped>
.card-background {
  height: 180px;
  background-color: #D1E0D7 !important;
  margin: 0px 45px 0px 45px;
  padding: 0px;
}
.header-option{
  background-color: #004E42;
  text-align: center;
  color: white;
  padding-block: 15px;
  font-size: 16px;
  font-family: Sora;
}
.header-option-item{
  background-color: #D1E0D7;
  // text-align: center;
  color: white;
  padding-top: 5px;
  padding-bottom: -5px;
  padding-inline: 30px;
  font-size: 12px;
}
.header-option-item2{
  background-color: #D1E0D7;
  // text-align: center;
  color: white;
  padding-inline: 30px;
  font-size: 12px;
}
.radio-style{
  height: 70%;
  justify-content: center;
  align-items: start;
  font-family: Sora;
}
.card-move{
  justify-content: center;
  align-items: center;
}
.enter-filter{
  margin-bottom: 10px;
  font-weight: 500;
  margin-top: 10px;
  font-family: Sora;
}
.item-font{
  color: black;
  font-weight: 500;
  font-family: Sora;
}
.card-section1{
  height: 480px;
  width: 430px;
  border-radius: 5px;
}
.card-section2{
  border-radius: 5px;
  border-color: #D1E0D7;
  width: 100%;
  height: 94%;
  border-style: solid;
  border-width: 7px;
  margin: 10px 35px;
  min-height: 670px;
}
.title-section1{
  font-weight: 450;
  justify-content: center;
  margin-bottom: 10px;
}
.sora-alert{
  justify-content: end;
  color: red;
  font-style: italic;
  font-family: Sora;
  font-size: 11px;
}
</style>
