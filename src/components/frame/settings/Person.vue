<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem>个人信息</BreadcrumbItem>
    </Breadcrumb>
    <Divider />
    <br>
    <br>
    <br>
    <br>
    <Card :bordered="true" :dis-hover="true" :padding="40" style="width:600px;margin:auto">
      <div :style="{backgroundColor: bgcolor}" class="heatStyle"><span class="spanStyle">{{ (this.reg.test(userName.substring(0, 1))) ? this.userName.substring(0, 1).toUpperCase() : this.userName.substring(0, 1) }}</span></div>
      <div class="heatTitleStyle">
        <div>
          <p><b></b> {{ userName }}</p>
        </div>
      </div>
      <Divider />
      <div class="heatTitleStyle" style="font-size: 25px">
        <b><label>姓名：</label></b>
        <Input v-model="user.userName" @on-keydown.enter="commitModify" @on-blur="commitModify" v-bind:readonly="nameReadOnly" style="width: 280px" >
        </Input>
        <Button type="text" @click="activeInput" class="buttonEdit"><Icon type="md-create" /></Button>
        <br>
        <br>
        <b><label>角色：</label></b> <Input v-model="user.userRole" readonly style="width: 280px" />
      </div>
    </Card>
  </div>
</template>
<style>
.buttonEdit{
  padding: 0;
  font-size: 15px;
  border: none
}
.buttonEdit:visited{
  border: none
}
.buttonEdit:active{
  border: none
}
.heatStyle{
  width: 120px;
  height: 120px;
  border-radius: 60px;
  vertical-align: middle;
  display: table-cell;
  text-align: center;
  position: default;
}
.heatTitleStyle{
  padding-left: 30px;
  height: 100px;
  vertical-align: middle;
  display: table-cell;
  position: default;
  font-size: 60px;
}
.spanStyle{
  font-size: 60px
}
</style>

<script>
    export default {
        data () {
          return {
            user: {
              userId: window.sessionStorage.getItem('userId'),
              userName: window.sessionStorage.getItem('userName'),
              userRole: window.sessionStorage.getItem('userRole')
            },
            bgcolor: '#f56a00',
            userName: window.sessionStorage.getItem('userName'),
            reg: /^[A-Za-z]/,
            nameReadOnly: true,
            isChanged: false,
            ColorList: ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae']
          }
        },
        methods: {
          activeInput() {
            this.nameReadOnly = false
          },
          commitModify() {
            if (!this.nameReadOnly && this.isChanged) {
              this.$Modal.confirm({
                title: '确认修改？',
                onOk: () => {
                  this.commitName()
                },
                onCancel: () => {
                  this.user.userName = window.sessionStorage.getItem('userName')
                }
              })
            }
            this.nameReadOnly = true
          },
          commitName() {
            var that = this
            this.$axios.put('/api/user/name/modify', this.user)
            .then(function (response) {
              if (response.data.code === 200) {
                that.$Message.success(response.data.msg)
                window.sessionStorage.setItem('userName', that.user.userName)
                that.userName = JSON.parse(JSON.stringify(that.user.userName))
              } else {
                that.$Message.warning(response.data.msg)
              }
            })
            .catch(function () {
              that.$Message.error('网络异常')
            })
          },
          setBgColor() {
            var ran = parseInt(Math.random() * 3)
            this.bgcolor = this.ColorList[ran]
          }
        },
        computed: {
          newName() {
            return this.user.userName
          }
        },
        mounted: function() {
          this.setBgColor()
        },
        watch: {
          newName(curVal) {
            if (curVal !== this.userName) {
              this.isChanged = true
            } else {
              this.isChanged = false
            }
          }
        }
    }
</script>
