<template>
  <div>
    <Breadcrumb :style="{float: 'left'}">
      <BreadcrumbItem :key="item" v-for="item in BreadcrumbItemData"> {{ item }} </BreadcrumbItem>
    </Breadcrumb>
    <Cascader filterable change-on-select :data='data' @on-change="selectHandle" :style="{width: '400px',float: 'right'}"></Cascader>
    <br>
    <Divider/>
    <ProductLineManage v-on:listenToChildEvent="modifyModule" v-if="module === 'A'"></ProductLineManage>
    <ProductLine v-on:listenToChildEvent="modifyModule" v-bind:lineId="selectData" v-else-if="module === 'B'"></ProductLine>
    <ProductSuit v-on:listenToChildEvent="modifyModule" v-bind:suitData="selectData" v-else></ProductSuit>
  </div>
</template>
<script>
import ProductLineManage from './products/ProductLineManage'
import ProductLine from './products/ProductLine'
import ProductSuit from './products/ProductSuit'

export default {
  data() {
    return {
      allProductLine: [],
      allProductSuit: [],
      data: [],
      module: 'A',
      name: [],
      selectData: '',
      preUrl: '/api/productlines/',
      BreadcrumbItemData: ['产品管理']
    }
  },
  mounted: function() {
    this.loadAllData()
  },
  methods: {
    modifyModule: function (data) {
      this.module = data.moduleType
      this.selectData = data.id
      this.name = data.name
      this.modifyBread()
    },
    modifyBread() {
      this.BreadcrumbItemData = []
      this.BreadcrumbItemData.push('产品管理')
      this.BreadcrumbItemData = this.BreadcrumbItemData.concat(this.name)
    },
    loadAllData() {
      this.loadPrefixData()
    },
    loadPrefixData() {
      var that = this
      this.$axios.get(this.preUrl + window.sessionStorage.getItem('userId'))
      .then(function (response) {
        if (response.data.code === 200) {
          that.allProductLine = response.data.content
          that.loadAllProductSuit()
        }
      })
      .catch(function () {
        that.$Message.error('网络异常')
      })
    },
    loadAllProductSuit() {
      var lineIds = []
      for (let item of this.allProductLine) {
        lineIds.push(item.lineId)
      }
      var that = this
      this.$axios.post('/api/productsuits/principal', lineIds)
      .then(function (response) {
        if (response.data.code === 200) {
          that.allProductSuit = response.data.content
          that.updataData()
        }
      })
      .catch(function () {
        that.$Message.error('网络异常')
      })
    },
    selectHandle(data) {
      this.name = []
      if (data[1]) {
        this.module = 'C'
        this.selectData = data[1]
        for (let item1 of this.allProductLine) {
          if (data[0] === item1.lineId) {
            this.name.push(item1.lineName)
          }
        }
        for (let item2 of this.allProductSuit) {
          if (item2.suitId === data[1]) {
            var test2 = {
              suitId: item2.suitId,
              lineName: this.name[0]
            }
            this.selectData = test2
            this.name.push(item2.productFamily)
          }
        }
        this.modifyBread()
      } else if (data[0]) {
        this.module = 'B'
        this.selectData = data[0]
        for (let item1 of this.allProductLine) {
          if (data[0] === item1.lineId) {
            this.name.push(item1.lineName)
          }
        }
        this.modifyBread()
      } else {
        this.module = 'A'
        this.name = []
        this.modifyBread()
      }
    },
    updataData() {
      for (let item of this.allProductLine) {
        var test = {
          value: item.lineId,
          label: item.lineName,
          children: []
        }
        for (let item2 of this.allProductSuit) {
          if (item2.lineId === item.lineId) {
            var test2 = {
              value: item2.suitId,
              label: item2.productFamily
            }
            test.children.push(test2)
          }
        }
        this.data.push(test)
      }
      if (this.allProductLine.length === 1) {
        this.module = 'B'
        this.selectData = this.allProductLine[0].lineId
        this.BreadcrumbItemData.push(this.allProductLine[0].lineName)
      }
    }
  },
  components: {
    ProductLineManage,
    ProductLine,
    ProductSuit
  }
}
</script>
