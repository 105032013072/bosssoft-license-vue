<template>
  <div>
    <Row>
      <div style="margin-top:1px;float:left;margin-right:3px">
        <Button type="info" @click="back"><Icon type="ios-arrow-back"></Icon>返回</Button>
      </div>
      <div class="titleStyle">
        <Input search enter-button placeholder="根据产品组件信息查找" v-model="searchData"
         @on-change="searchHandle" @on-enter="searchHandle" @on-search="searchHandle" :style="{width: 'auto'}"/>
      </div>
      <div style="margin-top:1px">
        <Button type="info" @click="create">新增产品组件</Button>
        <Button type="error" ref="deleteButton" :disabled="deleteButtonDisabled" @click="batchDelete">批量删除</Button>
      </div>
    </Row>
    <Content :style="{padding: '20px 0'}">
      <Table border ref="selection" :columns="columns_pre" :data="currentPageData" @on-selection-change="selectChangeHandle"></Table>
      <div style="margin: 10px;overflow: hidden">
        <div style="float: right;">
            <Page :total="totalNumber" :current="currentPageNo" @on-change="changePage"></Page>
        </div>
    </div>
    </Content>
    <Modal v-model="modifyModal" title="修改产品组件">
      <CellGroup>
        <Cell title="Selected" selected >产品组件ID: {{ postData.productId }}</Cell>
      </CellGroup>
      <br><br>
      <label>名称:</label>
      <Input prefix="ios-contact" v-model="postData.productName" style="width: 90%" />
      <div slot="footer">
        <Button type="text" size="large" @click="initPostData">取消</Button>
        <Button type="primary" size="large" @click="commitModify">确认修改</Button>
      </div>
    </Modal>
    <Modal v-model="createModal" title="新增产品组件">
      <label>产品组件ID:</label>
      <Input clearable v-model="postData.productId" style="width: 80%" />
      <br><br>
      <label>名称:</label>
      <Input prefix="ios-contact" clearable v-model="postData.productName" style="width: 90%" />
      <div slot="footer">
        <Button type="text" size="large" @click="closeAddCreate">取消</Button>
        <Button type="primary" size="large" @click="commitAdd">确认修改</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
export default {
  data() {
    return {
      addUrl: '/api/product/add.do',
      deleteUrl: '/api/product/delete.do',
      modifyUrl: '/api/product/update.do',
      selectUrl: '/api/product/',
      selectAllUrl: '/api/products.do',
      deleteBatchUrl: '/api/products/delete.do',
      preUrl: '/api/productsuit/',
      dataUrl: '/api/products/',
      showData: [],
      postData: {
        productId: '',
        productName: '',
        suitId: 1
      },
      prefixData: '',
      lineName: '',
      suitId: '',
      modifyModal: false,
      createModal: false,
      deleteButtonDisabled: true,
      currentPageNo: 1,
      totalNumber: 10,
      searchData: '',
      deleteData: [],
      currentTableData: [],
      currentPageData: [],
      columns_pre: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '产品组件ID',
          key: 'productId'
        },
        {
          title: '名称',
          key: 'productName'
        },
        {
          title: '操作',
          key: 'operation',
          width: 300,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'default'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.modify(params.index)
                  }
                }
              }, '修改'),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'default'
                },
                on: {
                  click: () => {
                    this.remove(params.index)
                  }
                }
              }, '删除')
            ])
          }
        }
      ]
    }
  },
  mounted: function() {
    this.loadPrefixData()
  },
  methods: {
    back() {
      var data = {
        id: this.prefixData.lineId,
        moduleType: 'B',
        name: [this.lineName]
      }
      this.$emit('listenToChildEvent', data)
    },
    loadPrefixData() {
      this.suitId = this.suitData.suitId
      this.lineName = this.suitData.lineName
      var that = this
      this.$axios.get(this.preUrl + this.suitId)
      .then(function (response) {
        if (response.data.code === 200) {
          that.prefixData = response.data.content
          that.loadShowData()
        }
      })
      .catch(function () {
        that.$Message.error('网络异常')
      })
    },
    loadShowData() {
      var that = this
      this.$axios.get(this.dataUrl + this.suitId)
      .then(function (response) {
        if (response.data.code === 200) {
          that.showData = response.data.content
          that.currentTableData = that.showData
          that.updateTable(that.currentPageNo)
        }
      })
      .catch(function () {
        that.$Message.error('网络异常')
      })
    },
    searchHandle() {
      if (this.searchData !== '') {
        this.currentTableData = []
        for (let item of this.showData) {
          if (item.productName.includes(this.searchData) ||
          item.productId.includes(this.searchData)) {
            this.currentTableData.push(item)
          }
        }
      } else {
        this.currentTableData = this.showData
      }
      this.updateTable(1)
    },
    changePage (page) {
      this.currentPageData = this.mockTableData(page)
      this.currentPageNo = page
    },
    mockTableData (page) {
      this.deleteButtonDisabled = true
      let data = []
      for (let i = (page - 1) * 10; i < this.totalNumber && i < page * 10; i++) {
        data.push(this.currentTableData[i])
      }
      return data
    },
    selectChangeHandle (payload) {
      if (payload.length === 0) {
        this.deleteButtonDisabled = true
      } else {
        this.deleteData = payload
        this.deleteButtonDisabled = false
      }
    },
    updateTable (index) {
      this.totalNumber = this.currentTableData.length
      this.currentPageData = []
      if (this.totalNumber > 0) {
        var currentIndex = (index - 1) * 10
        if (currentIndex >= this.currentTableData.length) {
          currentIndex = currentIndex - 10
          this.currentPageNo = (index - 1 > 0) ? index - 1 : 1
        }
        for (let i = currentIndex; i < (this.currentTableData.length < (currentIndex + 10) ? this.currentTableData.length : currentIndex + 10); i++) {
          this.currentPageData.push(this.currentTableData[i])
        }
      }
      if (this.currentPageData.length === 0) {
        this.deleteButtonDisabled = true
      }
    },
    create () {
      this.createModal = true
    },
    commitAdd () {
      if (this.postData.productId === '' ||
      this.postData.productName === '') {
        this.$Message.warning('产品ID与名称不能为空')
      } else {
        this.addRequest()
      }
    },
    initPostData() {
      this.modifyModal = false
      this.postData.productId = ''
      this.postData.productName = ''
    },
    closeAddCreate() {
      this.createModal = false
    },
    addRequest() {
      this.postData.suitId = this.prefixData.suitId
      var that = this
      this.$axios.post(this.addUrl, this.postData)
        .then(function (response) {
          if (response.data.code === 200) {
            that.createModal = false
            that.initPostData()
            that.$Message.success(response.data.msg)
            that.productSuits = []
            that.loadShowData()
          } else {
            that.$Message.warning(response.data.msg)
          }
        })
        .catch(function () {
          that.$Message.error('新增失败')
        })
    },
    modify(index) {
      this.modifyModal = true
      var modifyTest = this.currentPageData[index]
      this.postData.productId = modifyTest.productId
      this.postData.productName = modifyTest.productName
    },
    commitModify() {
      if (this.postData.productName === '') {
        this.$Message.warning('产品名称不能为空')
      } else {
        this.postData.suitId = this.prefixData.suitId
        var that = this
        this.$axios.put(this.modifyUrl, this.postData)
          .then(function (response) {
            if (response.data.code === 200) {
              that.modifyModal = false
              that.$Message.success(response.data.msg)
              that.showData = []
              that.loadShowData()
              that.updateTable(that.currentPageNo)
            } else {
              that.$Message.warning(response.data.msg)
            }
          })
          .catch(function () {
            that.$Message.error('更新失败')
          })
      }
    },
    remove (index) {
      this.$Modal.confirm({
          title: '确认删除？',
          onOk: () => {
            this.commitRemove(index)
          }
        })
    },
    commitRemove (index) {
      var that = this
      this.$axios.delete(this.deleteUrl, {data: that.currentPageData[index].productId})
        .then(function (response) {
          if (response.data.code === 200) {
            that.$Message.success(response.data.msg)
            var currentIndex = (that.currentPageNo - 1) * 10 + index
            that.showData.splice(currentIndex, 1)
            that.currentTableData = that.showData
            that.updateTable(that.currentPageNo)
          } else {
            that.$Message.warning(response.data.msg)
          }
        })
        .catch(function () {
          that.$Message.error('删除失败')
        })
    },
    batchDelete () {
      this.$Modal.confirm({
        title: '确认删除？',
        onOk: () => {
          this.commitBatchRemove()
        }
      })
    },
    commitBatchRemove () {
      var batchDeleteData = []
      for (let item of this.deleteData) {
        batchDeleteData.push(item.productId)
      }
      var that = this
      this.$axios.delete(this.deleteBatchUrl, {data: batchDeleteData})
        .then(function (response) {
          if (response.data.code === 200) {
            that.$Message.success(response.data.msg)
            that.showData = []
            that.loadShowData()
          } else {
            that.$Message.warning(response.data.msg)
          }
        })
        .catch(function () {
          that.$Message.error('删除失败')
      })
    }
  },
  watch: {
    suitData() {
      this.loadPrefixData()
    }
  },
  props: ['suitData']
}
</script>
