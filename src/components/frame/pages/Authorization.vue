<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem :key="item" v-for="item in BreadcrumbItemData"> {{ item }} </BreadcrumbItem>
    </Breadcrumb>
    <Divider/>
    <LicenseLineCard v-on:listenToChildEvent="modifyModule" v-if="module === 'C'"></LicenseLineCard>
    <LicenseSuit v-on:listenToChildEvent="modifyModule" v-bind:data="selectData" v-if="module === 'A'"></LicenseSuit>
    <LicenseProduct v-on:listenToChildEvent="modifyModule" v-bind:data="license" v-if="module === 'B'"></LicenseProduct>
  </div>
</template>
<script>
import LicenseSuit from './licenses/LicenseSuit'
import LicenseProduct from './licenses/LicenseProduct'
import LicenseLineCard from './licenses/LicenseLineCard'
import Visitor from './licenses/Visitor'

export default {
  data() {
    return {
      module: 'C',
      selectData: '',
      lineName: '',
      license: '',
      BreadcrumbItemData: ['授权管理']
    }
  },
  methods: {
    modifyModule (data) {
      this.module = data.moduleType
      this.selectData = {
        lineId: data.lineId !== '' ? data.lineId : '',
        lineName: data.lineName !== '' ? data.lineName : ''
      }
      this.license = data.license !== '' ? data.license : ''
      this.BreadcrumbItemData = []
      this.BreadcrumbItemData = data.name
    },
    loadProductLines() {
      var that = this
      this.$axios.get('/api/productlines/' + this.userId)
        .then(function (response) {
          if (response.data.code === 200) {
            that.productLineData = response.data.content
          }
        })
        .catch(function () {
          that.$Message.error('网络异常')
        })
    }
  },
  components: {
    LicenseSuit,
    LicenseProduct,
    LicenseLineCard
  }
}
</script>
