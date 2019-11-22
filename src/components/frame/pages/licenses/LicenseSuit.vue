<template>
  <div>
    <Row>
      <div style="float: left;">
        <div style="margin-top:1px;float:left;margin-right:3px">
          <Button type="info" @click="back"><Icon type="ios-arrow-back"></Icon>返回</Button>
        </div>
        <div class="titleStyle" style="float:left;">
          <Input search enter-button placeholder="根据授权信息查找" v-model="searchData"
                 @on-change="searchHandle" @on-enter="searchHandle" @on-search="searchHandle" :style="{width: 'auto'}"/>
        </div>
        <div style="margin-top:1px;float:left;">
          <Button type="info" v-if="displayTour || displayPm" @click="create">新增授权</Button>
          <Button type="error" ref="deleteButton" v-if="displayTour || displayPm" :disabled="deleteButtonDisabled" @click="batchDelete">批量删除</Button>
        </div>
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
    <Modal v-model="createModal" title="新增授权" >
      <label>客户:</label>
      <Input placeholder="请输入客户名称" clearable v-model="addData.customerName" style="width: 90%" />
      <br><br>
      <label>产品套件:</label>
      <Select style="width:85%" v-model="addData.suitId">
        <Option v-for="item in suitData" :value="item.suitId" :key="item.suitId"> {{ item.productFamily }}</Option>
      </Select>
      <br><br>
      <label>版本:</label>
      <Select style="width:90%" v-model="addData.edition">
        <Option v-for="item in edition" :value="item.edition" :key="item.edition">{{ item.label }}</Option>
      </Select>
      <br><br>
      <label>版本号:</label>
      <Input clearable v-model="addData.suitRelease" style="width: 88%" />
      <div slot="footer">
        <Button type="text" size="large" @click="closeAddLicense">取消</Button>
        <Button type="primary" size="large" @click="commitAdd">确认修改</Button>
      </div>
    </Modal>
  </div>
</template>
<style>
.titleStyle{
  width: auto;
  float: left;
  margin-right: 3px;
}
</style>

<script>
import Visitor from './Visitor.vue'

export default {
  components: {
    Visitor
  },
  data() {
    return {
      addUrl: '/api/licensesuit/add.do',
      deleteUrl: '/api/licensesuit/delete.do',
      modifyUrl: '/api/licensesuit/update.do',
      selectUrl: '/api/licensesuit/',
      selectAllUrl: '/api/licensesuits.do',
      deleteBatchUrl: '/api/licensesuits/delete.do',
      preUrl: '/api/productlines/',
      dataUrl: '/api/licensesuits/',
      suitUrl: '/api/productsuits/principal',
      userId: window.sessionStorage.getItem('userId'),
      userRole: window.sessionStorage.getItem('userRole'),
      tourists: [],
      deleteTourists: [],
      deleteTouristLicense: '',
      deleteTouristData: '',
      showData: [],
      postData: [],
      suitData: [],
      addData: {
        customerName: '',
        suitId: '',
        suitRelease: '',
        edition: ''
      },
      addTouristData: {
        userId: '',
        userName: '',
        licenseId: ''
      },
      edition: [
        {
          edition: 'PE',
          label: 'PE(专业版)'
        },
        {
          edition: 'DE',
          label: 'DE(试用版)'
        }
      ],
      suitPostData: {
        suitId: ''
      },
      lineIds: [],
      lineId: '',
      prefixData: '',
      modifyModal: false,
      createModal: false,
      deleteButtonDisabled: true,
      currentPageNo: 1,
      totalNumber: 10,
      searchData: '',
      deleteData: [],
      currentTableData: [],
      currentPageData: [],
      display1: window.sessionStorage.getItem('display1') === 'true' ? 3 : 3,
      display2: window.sessionStorage.getItem('display2') === 'true' ? 2 : 3,
      display3: window.sessionStorage.getItem('display3') === 'true' ? 0 : 3,
      displayTour: false,
      displayPm: false,
      touristPrefixData: [],
      columns_pre: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          type: 'expand',
          title: '查看访客',
          width: 100,
          render: (h, params) => {
            return h(Visitor, {
              props: {
                data: params
              }
            })
          }
        },
        {
          title: '产品套件',
          key: 'suitName'
        },
        {
          title: '版本',
          key: 'edition'
        },
        {
          title: '版本号',
          key: 'suitRelease'
        },
        {
          title: '客户',
          key: 'customerName'
        },
        {
          title: '创建时间',
          key: 'createDate'
        },
        {
          title: '操作',
          key: 'operation',
          width: 240,
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
              }, '查看详情'),
              h('Button', {
                props: {
                  type: 'error',
                  size: 'default'
                },
                style: {
                  display: this.displayTour || this.displayPm ? 'inline-block' : 'none',
                  marginRight: '5px'
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
    this.initDisplay()
    this.loadPrefixData()
  },
  methods: {
    back() {
      var data = {
        lineId: this.data.lineId,
        lineName: this.data.lineName,
        moduleType: 'C',
        name: ['授权管理']
      }
      this.$emit('listenToChildEvent', data)
    },
    loadTouristData() {
      var that = this
      this.$axios.get('/api/licensetourist/userId/' + this.userId + '/' + this.data.lineId)
        .then(function (response) {
          if (response.data.code === 200) {
            that.touristPrefixData = response.data.content
            that.loadTouristSuit()
          }
        })
        .catch(function () {
          that.$Message.error('获取失败')
        })
    },
    loadTouristSuit() {
      var licenses = []
      for (let item of this.touristPrefixData) {
        licenses.push(item.licenseId)
      }
      var that = this
      this.$axios.post('/api/licensesuits/licenseIds', licenses)
        .then(function (response) {
          if (response.data.code === 200) {
            for (let item of response.data.content) {
              var test = {
                suitName: item.suitName,
                suitId: item.licenseSuit.suitId,
                suitRelease: item.licenseSuit.suitRelease,
                licenseId: item.licenseSuit.licenseId,
                lineName: item.lineName,
                edition: item.licenseSuit.edition,
                customerName: item.licenseSuit.customerName,
                createDateStamp: item.licenseSuit.createDate,
                createDate: item.createDate
              }
              that.showData.push(test)
            }
            that.loadUserTouristData()
            that.currentTableData = that.showData
            that.updateTable(that.currentPageNo)
          }
        })
        .catch(function () {
          that.$Message.error('获取失败')
        })
    },
    loadPrefixData() {
      this.columns_pre.splice(1, 1)
      if (this.userRole === 'tourist') {
        this.loadTouristData()
      } else {
        this.loadSuitData()
      }
    },
    initDisplay() {
      var display4 = this.display1 & this.display2 & this.display3
      if (display4 === 3) {
        this.displayTour = true
        this.displayPm = true
      } else if (display4 === 2) {
        this.displayPm = false
        this.displayTour = true
      } else {
        this.displayPm = false
        this.displayTour = false
      }
    },
    loadShowData() {
      this.lineIds.push(this.data.lineId)
      var that = this
      this.$axios.post(this.dataUrl, this.lineIds)
      .then(function (response) {
        if (response.data.code === 200) {
          for (let item of response.data.content) {
            var test = {
              lineId: that.data.lineId,
              suitName: item.suitName,
              suitId: item.licenseSuit.suitId,
              suitRelease: item.licenseSuit.suitRelease,
              licenseId: item.licenseSuit.licenseId,
              lineName: item.lineName,
              edition: item.licenseSuit.edition,
              customerName: item.licenseSuit.customerName,
              createDateStamp: item.licenseSuit.createDate,
              createDate: item.createDate
            }
            that.showData.push(test)
          }
          that.loadUserTouristData()
          that.currentTableData = that.showData
          that.updateTable(that.currentPageNo)
        }
      })
      .catch(function () {
        that.$Message.error('网络异常')
      })
    },
    loadUserTouristData() {
      var that = this
      this.$axios.get('/api/users/role/tourist')
        .then(function (response) {
          if (response.data.code === 200) {
            that.tourists = response.data.content
          }
        })
        .catch(function () {
          that.$Message.error('网络异常')
        })
    },
    loadSuitData() {
      var that = this
      this.$axios.get('/api/productsuits/' + this.data.lineId)
      .then(function (response) {
        if (response.data.code === 200) {
          for (let item of response.data.content) {
            var test = {
              suitId: item.suitId,
              productFamily: item.productFamily,
              lineId: item.lineId,
              lineName: that.data.lineName
            }
            that.suitData.push(test)
          }
          that.loadShowData()
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
          if (item.suitName.includes(this.searchData) ||
          item.suitRelease.includes(this.searchData) ||
          item.edition.includes(this.searchData) ||
          item.customerName.includes(this.searchData) ||
          item.createDate.includes(this.searchData)) {
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
    initAddData() {
      this.addData.customerName = ''
      this.addData.suitId = ''
      this.addData.suitRelease = ''
      this.addData.edition = ''
    },
    closeAddLicense() {
      this.createModal = false
    },
    commitAdd () {
      if (this.addData.customerName === '' ||
        this.addData.suitId === '' ||
        this.addData.suitRelease === '' ||
        this.addData.edition === '') {
        this.$Message.warning('输入不能为空')
      } else {
        var that = this
        this.$axios.post(this.addUrl, this.addData)
        .then(function (response) {
          if (response.data.code === 200) {
            that.createModal = false
            that.$Message.success(response.data.msg)
            that.showData = []
            that.initAddData()
            that.loadShowData()
          } else {
            that.$Message.warning(response.data.msg)
          }
        })
        .catch(function () {
          that.$Message.error('新增失败')
        })
      }
    },
    next(index) {
      var modifyTest = this.currentPageData[index]
      modifyTest.lineId = this.data.lineId
      var data = {
        license: modifyTest,
        moduleType: 'B',
        name: ['授权管理', modifyTest.lineName, modifyTest.suitName, modifyTest.customerName]
      }
      this.$emit('listenToChildEvent', data)
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
      this.$axios.delete(this.deleteUrl, {data: that.currentPageData[index].licenseId})
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
        batchDeleteData.push(item.licenseId)
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
    lineId() {
      this.loadPrefixData()
    }
  },
  props: ['data']
}
</script>
