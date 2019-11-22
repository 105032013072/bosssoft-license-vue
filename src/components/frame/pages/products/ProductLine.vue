<template>
  <div>
    <Row>
      <div style="margin-top:1px;float:left;margin-right:3px">
        <Button type="info" @click="back"><Icon type="ios-arrow-back"></Icon>返回</Button>
      </div>
      <div class="titleStyle">
        <Input search enter-button placeholder="根据产品套件信息查找" v-model="searchData"
         @on-change="searchHandle" @on-enter="searchHandle" @on-search="searchHandle" :style="{width: 'auto'}"/>
      </div>
      <div style="margin-top:1px">
        <Button type="info" @click="create">新增产品套件</Button>
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
    <Modal v-model="modifyModal" title="修改产品套件">
      <CellGroup>
        <Cell title="Selected" selected >产品套件ID: {{ postData.suitId }}</Cell>
      </CellGroup>
      <br><br>
      <label>名称:</label>
      <Input prefix="ios-contact" v-model="postData.productFamily" style="width: 90%" />
      <div slot="footer">
        <Button type="text" size="large" @click="initPostData">取消</Button>
        <Button type="primary" size="large" @click="commitModify">确认修改</Button>
      </div>
    </Modal>
    <Modal v-model="createModal" title="新增产品套件">
      <CellGroup>
        <Cell title="Selected" selected >产品套件ID : 由系统自动生成</Cell>
      </CellGroup>
      <br><br>
      <label>名称:</label>
      <Input prefix="ios-contact" clearable v-model="postData.productFamily" style="width: 90%" />
      <div slot="footer">
        <Button type="text" size="large" @click="initPostData">取消</Button>
        <Button type="primary" size="large" @click="commitAdd">确认新增</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
export default {
  data() {
    return {
      productLine: {
        lineId: 1,
        lineName: '',
        userId: '',
        userName: ''
      },
      postData: {
        suitId: null,
        productFamily: '',
        lineId: 1
      },
      productSuits: [],
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
          title: '产品套件ID',
          key: 'suitId'
        },
        {
          title: '名称',
          key: 'productFamily'
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
                    this.next(params.index)
                  }
                }
              }, '产品配置'),
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
    this.loadProductLine()
  },
  methods: {
    loadProductLine() {
      var that = this
      this.$axios.get('/api/productline/' + this.lineId)
      .then(function (response) {
        if (response.data.code === 200) {
          that.productLine = response.data.content
          that.loadCurrentProductSuit()
        }
      })
      .catch(function () {
        that.$Message.error('网络异常')
      })
    },
    searchHandle() {
      if (this.searchData !== '') {
        this.currentTableData = []
        for (let item of this.productSuits) {
          var s = '' + item.suitId
          if (item.productFamily.includes(this.searchData) ||
          s.includes(this.searchData)) {
            this.currentTableData.push(item)
          }
        }
      } else {
        this.currentTableData = this.productSuits
      }
      this.updateTable(1)
    },
    loadCurrentProductSuit() {
      var that = this
      this.$axios.get('/api/productsuits/' + this.lineId)
      .then(function (response) {
        if (response.data.code === 200) {
          that.productSuits = response.data.content
          that.currentTableData = that.productSuits
          that.updateTable(that.currentPageNo)
        }
      })
      .catch(function () {
        that.$Message.error('网络异常')
      })
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
      if (this.postData.suitId === '' ||
      this.postData.productFamily === '') {
        this.$Message.warning('输入不能为空')
      } else {
        this.addRequest()
      }
    },
    initPostData() {
      this.modifyModal = false
      this.createModal = false
      this.postData.suitId = null
      this.postData.productFamily = ''
    },
    addRequest() {
      this.postData.lineId = this.productLine.lineId
      var that = this
      this.$axios.post('/api/productsuit/add.do', this.postData)
        .then(function (response) {
          if (response.data.code === 200) {
            that.initPostData()
            that.$Message.success(response.data.msg)
            that.productSuits = []
            that.loadCurrentProductSuit()
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
      this.postData.suitId = modifyTest.suitId
      this.postData.productFamily = modifyTest.productFamily
    },
    commitModify() {
      if (this.postData.productFamily === '') {
        this.$Message.warning('产品套件名称不能为空')
      } else {
        this.postData.lineId = this.productLine.lineId
        var that = this
        this.$axios.put('/api/productsuit/update.do', this.postData)
          .then(function (response) {
            if (response.data.code === 200) {
              that.modifyModal = false
              that.$Message.success(response.data.msg)
              that.productSuits = []
              that.loadCurrentProductSuit()
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
          title: '该产品套件下所有产品也将一并删除，是否确认删除？',
          onOk: () => {
            this.commitRemove(index)
          }
        })
    },
    commitRemove (index) {
      var that = this
      this.$axios.delete('/api/productsuit/delete.do', {data: that.currentPageData[index].suitId})
        .then(function (response) {
          if (response.data.code === 200) {
            that.$Message.success(response.data.msg)
            var currentIndex = (that.currentPageNo - 1) * 10 + index
            that.productSuits.splice(currentIndex, 1)
            that.currentTableData = that.productSuits
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
        batchDeleteData.push(item.suitId)
      }
      var that = this
      this.$axios.delete('/api/productsuits/delete.do', {data: batchDeleteData})
        .then(function (response) {
          if (response.data.code === 200) {
            that.$Message.success(response.data.msg)
            that.productSuits = []
            that.loadCurrentProductSuit()
          } else {
            that.$Message.warning(response.data.msg)
          }
        })
        .catch(function () {
          that.$Message.error('删除失败')
      })
    },
    next (index) {
      var modifyTest = this.currentPageData[index]
      var data = {
        id: {
          suitId: modifyTest.suitId,
          lineName: this.productLine.lineName
        },
        moduleType: 'C',
        name: [this.productLine.lineName, modifyTest.productFamily]
      }
      this.$emit('listenToChildEvent', data)
    },
    back() {
      var data = {
        id: '',
        moduleType: 'A',
        name: []
      }
      this.$emit('listenToChildEvent', data)
    }
  },
  watch: {
    lineId() {
      this.loadProductLine()
    }
  },
  props: ['lineId']
}
</script>
