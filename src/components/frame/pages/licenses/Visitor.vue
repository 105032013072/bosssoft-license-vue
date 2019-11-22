<template>
  <div>
    <div>
      <!--<Button type="primary" @click="addCurrentTourist">新增访客</Button>-->
      <!--<Button type="error" @click="deleteCurrentTourist">删除访客</Button>-->
      <!--<Select v-if="addOrDelete === 'delete'" v-model="deleteTourist" style="width:200px">-->
        <!--<Option v-for="item in authcTouristUsers" :value="item.userId" :key="item.userId">工号：{{item.userId}} / 姓名：{{item.userName}}</Option>-->
      <!--</Select>-->
    </div>
    <p v-if="authcTouristUsers.length === 0">暂不允许访客访问</p>
    <p v-if="authcTouristUsers.length !== 0">允许访问访客列表：</p>
    <Tag v-for="item in authcTouristUsers" :key="item.userId" type="dot" color="primary" closable @on-close="deleteCurrentTourist(item)"> 工号：{{item.userId}} / 姓名：{{item.userName}} </Tag>
    <Button icon="ios-add" type="dashed" @click="addCurrentTourist">添加访客</Button>
    <Modal v-model="addOrDelete" title="新增访客" @on-ok="commitAdd">
      <Select v-model="addTourist" style="width:200px">
        <Option v-for="item in otherTouristUsers" :value="item.userId" :key="item.userId">工号：{{item.userId}} / 姓名：{{item.userName}}</Option>
      </Select>
    </Modal>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        authcTouristUsers: [],
        allTouristUsers: [],
        otherTouristUsers: [],
        addTourist: '',
        deleteTourist: '',
        addOrDelete: false
      }
    },
    methods: {
      addCurrentTourist() {
        this.addOrDelete = true
      },
      commitAdd() {
        if (this.addTourist === '') {
          this.$Message.warning('需要选择一名游客才能添加')
        } else {
          var that = this
          var user = this.getUserByUserId(this.addTourist)
          var data = {
            userId: this.addTourist,
            licenseId: this.data.row.licenseId,
            userName: user.userName
          }
          this.$axios.post('/api/licensetourist/add', data)
            .then(function (response) {
              if (response.data.code === 200) {
                that.$Message.success(response.data.msg)
                that.otherTouristUsers.splice(that.authcTouristUsers.indexOf(user), 1)
                that.authcTouristUsers.push(user)
                that.addTourist = ''
              } else {
                that.$Message.error(response.data.msg)
              }
            })
            .catch(function () {
              that.$Message.error('添加失败')
            })
        }
      },
      deleteCurrentTourist(user) {
        var that = this
        var data = {
          userId: user.userId,
          licenseId: this.data.row.licenseId
        }
        this.$axios.delete('/api/licensetourist/delete/useridandlicenseid', {data: data})
          .then(function (response) {
            if (response.data.code === 200) {
              that.$Message.success(response.data.msg)
              that.authcTouristUsers.splice(that.authcTouristUsers.indexOf(user), 1)
              that.otherTouristUsers.push(user)
            } else {
              that.$Message.error(response.data.msg)
            }
          })
          .catch(function () {
            that.$Message.error('删除失败')
          })
      },
      loadTourist() {
        var that = this
        this.$axios.get('/api/licensetourist/tourists/' + this.data.row.licenseId)
          .then(function (response) {
            if (response.data.code === 200) {
              that.authcTouristUsers = response.data.content
              that.loadAllTouristUser()
            }
          })
          .catch(function () {
            that.$Message.error('获取失败')
          })
      },
      loadAllTouristUser() {
        var that = this
        this.$axios.get('/api/users/role/tourist')
          .then(function (response) {
            if (response.data.code === 200) {
              that.allTouristUsers = response.data.content
              that.loadOtherUser()
            }
          })
          .catch(function () {
            that.$Message.error('获取失败')
          })
      },
      loadOtherUser() {
        this.otherTouristUsers = []
        for (let item of this.allTouristUsers) {
          var isContain = false
          for (let item2 of this.authcTouristUsers) {
            if (item.userId === item2.userId) {
              isContain = true
              break
            }
          }
          if (!isContain) {
            this.otherTouristUsers.push(item)
          }
        }
      },
      getUserByUserId(userId) {
        for (let item of this.allTouristUsers) {
          if (item.userId === userId) {
            return item
          }
        }
        return null
      }
    },
    mounted: function () {
      this.loadTourist()
    },
    props: ['data'],
    name: 'Visitor'
  }
</script>

<style scoped>

</style>
