<template>
  <div>
    <Row>
      <div class="titleStyle">
        <Input search enter-button placeholder="根据产品线或用户信息查找" v-model="searchData"
         @on-change="searchHandle" @on-enter="searchHandle" @on-search="searchHandle" :style="{width: 'auto'}"/>
      </div>
      <div style="margin-top:1px">
        <Button type="info" @click="createLine" v-if="displayTour && displayPm">新增产品线</Button>
        <Button type="error" ref="deleteButton" :disabled="deleteButtonDisabled" @click="batchDelete" v-if="displayTour && displayPm">批量删除</Button>
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
    <Modal v-model="lineModifyModal" title="修改产品线">
      <CellGroup>
        <Cell title="Selected" selected >产品线ID: {{ lineModifyData.lineId }}</Cell>
      </CellGroup>
      <br><br>
      <label>名称:</label>
      <Input prefix="ios-contact" v-model="lineModifyData.lineName" style="width: 90%" />
      <br><br>
      <label>管理者:</label>
      <Select style="width:88%" v-model="lineModifyData.userId">
        <Option v-for="item in userData" :value="item.userId" :key="item.userId">工号：{{item.userId}} / 名字：{{ item.userName }}</Option>
      </Select>
      <div slot="footer">
        <Button type="text" size="large" @click="initCreateData">取消</Button>
        <Button type="primary" size="large" @click="commitLineModify">确认修改</Button>
      </div>
    </Modal>
    <Modal v-model="createLineModal" title="新增产品线" @on-cancel="closeAdd" @on-ok="commitLineAdd">
      <label>产品线ID:</label>
      <Input prefix="ios-contact" clearable v-model="createLineData.lineId" style="width: 85%" />
      <br><br>
      <label>名称:</label>
      <Input prefix="ios-contact" clearable v-model="createLineData.lineName" style="width: 90%" />
      <br><br>
      <label>管理者:</label>
      <Select style="width:88%" v-model="createLineData.userId">
        <Option v-for="item in userData" :value="item.userId" :key="item.userId">工号：{{item.userId}} / 名字：{{ item.userName }}</Option>
      </Select>
      <div slot="footer">
        <Button type="text" size="large" @click="closeAdd">取消</Button>
        <Button type="primary" size="large" @click="commitLineAdd">确认新增</Button>
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
export default {
  data() {
    return {
      lineModifyModal: false,
      createLineModal: false,
      deleteButtonDisabled: true,
      currentPageNo: 1,
      totalNumber: 10,
      searchData: '',
      display1: window.sessionStorage.getItem('display1') === 'true' ? 3 : 3,
      display2: window.sessionStorage.getItem('display2') === 'true' ? 2 : 3,
      display3: window.sessionStorage.getItem('display3') === 'true' ? 0 : 3,
      displayTour: false,
      displayPm: false,
      deleteData: [],
      productLineData: [],
      currentTableData: [],
      currentPageData: [],
      userData: [
        {
          userId: 1,
          userName: ''
        }
      ],
      lineModifyData: {
        lineId: '',
        lineName: '',
        userId: '',
        userName: ''
      },
      createLineData: {
        lineId: null,
        lineName: '',
        userId: '',
        userName: ''
      },
      columns_pre: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: '产品线ID',
            key: 'lineId'
          },
          {
            title: '产品线名称',
            key: 'lineName'
          },
          {
            title: '管理者工号',
            key: 'userId'
          },
          {
            title: '管理者姓名',
            key: 'userName'
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
              }, '产品线配置'),
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'default'
                  },
                  style: {
                    marginRight: '5px',
                    display: this.displayTour && this.displayPm ? 'inline-block' : 'none'
                  },
                  on: {
                    click: () => {
                      this.modifyLine(params.index)
                    }
                  }
                }, '修改'),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'default'
                  },
                  style: {
                    display: this.displayTour && this.displayPm ? 'inline-block' : 'none'
                  },
                  on: {
                    click: () => {
                      this.removeLine(params.index)
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
    if (window.sessionStorage.getItem('userRole') === 'pm') {
      this.columns_pre.splice(3, 1)
    }
    this.loadAllProductLines()
  },
  methods: {
    closeAdd() {
      this.createLineModal = false
      this.createLineData.lineId = null
    },
    loadAllUsers () {
        var that = this
        this.$axios.get('/api/users.do')
        .then(function (response) {
          that.userData = []
          for (let val of response.data.content) {
            if (val.role !== 'tourist') {
              var test = {
                userId: val.userId,
                userName: val.userName
              }
              that.userData.push(test)
            }
          }
        })
        .catch(function () {
          that.$Message.error('网络异常')
        })
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
    loadAllProductLines() {
      var that = this
        this.$axios.get('/api/productlines/' + window.sessionStorage.getItem('userId'))
        .then(function (response) {
          if (response.data.code === 200) {
            that.productLineData = response.data.content
            that.currentTableData = that.productLineData
            that.updateTable(1)
            that.loadAllUsers()
          }
        })
        .catch(function () {
          that.$Message.error('网络异常')
        })
    },
    searchHandle() {
      if (this.searchData !== '') {
        this.currentTableData = []
        for (let item of this.productLineData) {
          var s = '' + item.lineId
          var s2 = '' + item.userId
          if (item.lineName.includes(this.searchData) ||
          s.includes(this.searchData) ||
          item.userName.includes(this.searchData) ||
          s2.includes(this.searchData)) {
            this.currentTableData.push(item)
          }
        }
      } else {
        this.currentTableData = this.productLineData
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
    createLine () {
      this.createLineModal = true
    },
    initCreateData() {
      this.lineModifyModal = false
      this.createLineData.userId = ''
      this.createLineData.userName = ''
      this.createLineData.lineId = null
      this.createLineData.lineName = ''
    },
    commitLineAdd () {
      if (this.createLineData.userId === '' ||
        this.createLineData.lineId === '' ||
        this.createLineData.lineName === '') {
          this.$Message.warning('输入不能为空')
      } else {
        this.createLineData.userName = this.setUserNameByUserId(this.createLineData.userId)
        var that = this
        this.$axios.post('/api/productline/add.do', this.createLineData)
        .then(function (response) {
          if (response.data.code === 200) {
            that.createLineModal = false
            that.$Message.success(response.data.msg)
            that.initCreateData()
            that.productLineData = []
            that.loadAllProductLines()
          } else {
            that.$Message.warning(response.data.msg)
          }
        })
        .catch(function () {
          that.$Message.error('新增失败')
        })
      }
    },
    modifyLine(index) {
      this.lineModifyModal = true
      var modifyTest = this.currentPageData[index]
      this.lineModifyData.lineId = modifyTest.lineId
      this.lineModifyData.lineName = modifyTest.lineName
      this.lineModifyData.userId = modifyTest.userId
    },
    commitLineModify() {
      if (this.lineModifyData.lineName === '') {
        this.$Message.warning('产品线名称不能为空')
      } else {
        this.lineModifyData.userName = this.setUserNameByUserId(this.lineModifyData.userId)
        var that = this
        this.$axios.put('/api/productline/update.do', this.lineModifyData)
          .then(function (response) {
            if (response.data.code === 200) {
              that.lineModifyModal = false
              that.$Message.success(response.data.msg)
              that.productLineData = []
              that.loadAllProductLines()
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
    removeLine (index) {
      this.$Modal.confirm({
          title: '该产品线下所有产品套件也将一并删除，是否确认删除？',
          onOk: () => {
            this.commitLineRemove(index)
          }
        })
    },
    commitLineRemove (index) {
      var that = this
      this.$axios.delete('/api/productline/delete.do', {data: that.currentPageData[index].lineId})
        .then(function (response) {
          if (response.data.code === 200) {
            that.$Message.success(response.data.msg)
            var currentIndex = (that.currentPageNo - 1) * 10 + index
            that.productLineData.splice(currentIndex, 1)
            that.currentTableData = that.productLineData
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
        batchDeleteData.push(item.lineId)
      }
      var that = this
      this.$axios.delete('/api/productlines/delete.do', {data: batchDeleteData})
        .then(function (response) {
          if (response.data.code === 200) {
            that.$Message.success(response.data.msg)
            that.productLineData = []
            that.loadAllProductLines()
          } else {
            that.$Message.warning(response.data.msg)
          }
        })
        .catch(function () {
          that.$Message.error('删除失败')
      })
    },
    setUserNameByUserId (userId) {
      for (let item of this.userData) {
        if (item.userId === userId) {
          return item.userName
        }
      }
    },
    next (index) {
      var data = {
        moduleType: 'B',
        id: this.currentPageData[index].lineId,
        name: [this.currentPageData[index].lineName]
      }
      this.$emit('listenToChildEvent', data)
    }
  }
}
</script>
