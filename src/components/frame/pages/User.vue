<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem>用户管理</BreadcrumbItem>
    </Breadcrumb>
    <Divider />
    <Row>
      <div class="titleStyle">
        <Input search enter-button v-model="searchData" placeholder="根据工号或姓名查找用户"
        @on-change="searchHandle" @on-enter="searchHandle" @on-search="searchHandle" :style="{width: 'auto'}"/>
      </div>
      <div style="margin-top:1px">
        <Button type="info" @click="createUser">新增用户</Button>
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
    <Modal v-model="modifyModal" title="修改用户">
      <CellGroup>
        <Cell title="Selected" selected >工号: {{ modifyData.userId }}</Cell>
      </CellGroup>
      <br><br>
      <label>姓名:</label>
      <Input prefix="ios-contact" v-model="modifyData.userName" style="width: 90%" />
      <br><br>
      <label>角色:</label>
      <Select style="width:90%" v-model="modifyData.userRole">
        <Option v-for="item in roleList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <br><br>
      <label>锁定状态:</label>
      <Select style="width:85%" v-model="modifyData.locked">
        <Option v-for="item in lockedList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <div slot="footer">
        <Button type="text" size="large" @click="closeModify">取消</Button>
        <Button type="primary" size="large" @click="commitModify">确认修改</Button>
      </div>
    </Modal>
    <Modal v-model="createModal" title="新增用户" >
      <label>工号:</label>
      <InputNumber prefix="ios-contact" clearable v-model="createData.userId" style="width: 90%" />
      <br><br>
      <label>姓名:</label>
      <Input prefix="ios-contact" clearable v-model="createData.userName" style="width: 90%" />
      <br><br>
      <label>密码:</label>
      <Input prefix="ios-lock-outline" clearable v-model="createData.userPassword" placeholder="密码长度至少为6位" style="width: 90%" />
      <br><br>
      <label>角色:</label>
      <Select style="width:90%" v-model="createData.userRole">
        <Option v-for="item in roleList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <br><br>
      <label>锁定状态:</label>
      <Select style="width:85%" v-model="createData.locked">
        <Option v-for="item in lockedList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
      <div slot="footer">
        <Button type="text" size="large" @click="closeAddUser">取消</Button>
        <Button type="primary" size="large" @click="commitAdd">确认新增</Button>
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
    data () {
      return {
        currentPageNo: 1,
        totalNumber: 10,
        deleteButtonDisabled: true,
        modifyData: {
          userId: '',
          userName: '',
          userRole: '',
          locked: ''
        },
        createData: {
          userId: null,
          userName: '',
          userPassword: '',
          userRole: 'pm',
          locked: 'false'
        },
        roleList: [
          // {
          //   label: '访客',
          //   value: 'tourist'
          // },
          {
            label: '产品经理',
            value: 'pm'
          },
          {
            label: '管理员',
            value: 'admin'
          }
        ],
        lockedList: [
          {
            label: '是',
            value: 'true'
          },
          {
            label: '否',
            value: 'false'
          }
        ],
        modifyModal: false,
        createModal: false,
        columns_pre: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: '工号',
            key: 'userId'
          },
          {
            title: '姓名',
            key: 'userName'
          },
          {
            title: '角色',
            key: 'role'
          },
          {
            title: '锁定状态',
            key: 'locked'
          },
          {
            title: '操作',
            key: 'operation',
            width: 200,
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
                      this.modifyUser(params.index)
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
        ],
        currentTableData: [],
        currentPageData: [],
        userData: [],
        deleteData: [],
        searchData: ''
      }
    },
    mounted: function() {
      this.loadAllUsers()
    },
    methods: {
      closeModify() {
        this.modifyModal = false
      },
      closeAddUser() {
        this.createModal = false
      },
      searchHandle() {
        if (this.searchData !== '') {
          this.currentTableData = []
          for (let item of this.userData) {
            var s = '' + item.userId
            if (item.userName.includes(this.searchData) ||
            s.includes(this.searchData) ||
            item.role.includes(this.searchData)) {
              this.currentTableData.push(item)
            }
          }
        } else {
          this.currentTableData = this.userData
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
          batchDeleteData.push(item.userId)
        }
        var that = this
        this.$axios.delete('/api/users/delete.do', {data: batchDeleteData})
          .then(function (response) {
            if (response.data.code === 200) {
              if (response.data.msg === '批量删除成功') {
                that.$Message.success(response.data.msg)
                that.userData = []
                that.loadAllUsers()
              } else {
                that.$Message.warning(response.data.msg)
              }
            } else {
              that.$Message.warning(response.data.msg)
            }
          })
          .catch(function () {
            that.$Message.error('更新失败')
        })
      },
      loadAllUsers () {
        var that = this
        this.$axios.get('/api/users.do')
        .then(function (response) {
          for (let val of response.data.content) {
            var test = {
              userId: val.userId,
              userName: val.userName,
              role: val.role === 'pm' ? '产品经理' : (val.role === 'tourist' ? '访客' : '管理员'),
              locked: val.locked === false ? '否' : '是'
            }
            that.userData.push(test)
          }
          that.currentTableData = that.userData
          that.updateTable(that.currentPageNo)
        })
        .catch(function () {
          that.$Message.error('网络异常')
        })
      },
      createUser() {
        this.createModal = true
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
        this.$axios.delete('/api/user/delete.do', {data: that.currentPageData[index].userId})
          .then(function (response) {
            if (response.data.code === 200) {
              if (response.data.msg === '删除成功') {
                that.$Message.success(response.data.msg)
                var currentUserIndex = (that.currentPageNo - 1) * 10 + index
                that.userData.splice(currentUserIndex, 1)
                that.currentTableData = that.userData
                that.updateTable(that.currentPageNo)
              } else {
                that.$Message.warning(response.data.msg)
              }
            } else {
              that.$Message.warning(response.data.msg)
            }
          })
          .catch(function () {
            that.$Message.error('删除失败')
          })
      },
      modifyUser (index) {
        this.modifyModal = true
        var modifyTest = this.currentPageData[index]
        this.modifyData.userId = modifyTest.userId
        this.modifyData.userName = modifyTest.userName
        this.modifyData.userRole = modifyTest.role === '产品经理' ? 'pm' : (modifyTest.role === '访客' ? 'tourist' : 'admin')
        this.modifyData.locked = modifyTest.locked === '是' ? 'true' : 'false'
      },
      commitModify () {
        if (this.modifyData.userName === '') {
          this.$Message.warning('姓名不能为空')
        } else {
          var that = this
          this.$axios.put('/api/user/update.do', this.modifyData)
            .then(function (response) {
              if (response.data.code === 200) {
                that.$Message.success(response.data.msg)
                that.modifyModal = false
                that.userData = []
                that.loadAllUsers()
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
      commitAdd () {
        if (this.createData.userId === null || this.createData.userName === '') {
          this.$Message.warning('工号和姓名不能为空')
        } else if (this.createData.userPassword.length < 6) {
          this.$Message.warning('密码长度至少6位')
        } else {
          var that = this
          this.$axios.post('/api/user/add.do', this.createData)
            .then(function (response) {
              if (response.data.code === 200) {
                that.createModal = false
                that.$Message.success(response.data.msg)
                that.initCreateData()
                that.userData = []
                that.loadAllUsers()
              } else {
                that.$Message.warning(response.data.msg)
              }
            })
            .catch(function () {
              that.$Message.error('新增失败')
          })
        }
      },
      initCreateData() {
        this.createData.userId = null
        this.createData.userName = ''
        this.createData.userPassword = ''
        this.createData.userRole = 'pm'
        this.createData.locked = 'false'
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
      }
    }
  }
</script>
