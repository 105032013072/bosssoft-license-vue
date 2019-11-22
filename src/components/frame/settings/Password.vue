<template>
<div>
  <Breadcrumb>
    <BreadcrumbItem>密码重置</BreadcrumbItem>
  </Breadcrumb>
  <Divider />
  <br>
  <Row type="flex" justify="center">
    <Col offset="4" span="15">
      <Steps :current="current">
        <Step title="步骤1"></Step>
        <Step title="步骤2"></Step>
        <Step title="步骤3"></Step>
      </Steps>
    </Col>
  </Row>
  <br><br><br>
  <div v-if="current === 0">
    <Row type="flex" justify="center">
      <Col span="6">
        <label>请输入密码:</label>
        <br><br>
        <Input size="large" type="password" prefix="ios-lock" clearable v-model="postdata.userPassword" />
      </Col>
    </Row>
    <br>
    <Row type="flex" justify="center">
      <Col span="6">
        <label>请再次输入密码:</label>
        <br><br>
        <Input size="large" type="password" prefix="ios-lock" clearable v-model="postdata.passwordAgain" />
      </Col>
    </Row>
  </div>
  <div v-else-if="current === 1">
    <Row type="flex" justify="center">
      <Col span="6">
        <label>请输入工号:</label>
        <br><br>
        <Input size="large" clearable v-model="postdata.userId" />
      </Col>
    </Row>
  </div>
  <div v-else>
    <Row type="flex" justify="center">
      <Icon color="#32CD32" size="200" type="md-checkmark-circle-outline" />
    </Row>
  </div>
  <br><br><br>
  <Row v-if="current !== 2" type="flex" justify="center">
    <Col span="3">
      <Button :disabled="start" size="large" @click="back" type="primary" style="float:left">
        <Icon type="ios-arrow-back" />上一步
      </Button>
      <Button size="large" @click="next" type="primary" style="float:right">
        下一步<Icon type="ios-arrow-forward" />
      </Button>
    </Col>
  </Row>
  <Row v-else type="flex" justify="center">
    <Button size="large" @click="next" type="success" style="width:200px">
      完成
    </Button>
  </Row>
</div>
</template>
<script>
  export default {
    data () {
      return {
        current: 0,
        start: true,
        postdata: {
          userPassword: '',
          passwordAgain: '',
          userId: ''
        }
      }
    },
    methods: {
      back() {
        this.current -= 1
        if (this.current === 0) {
          this.start = true
        }
      },
      next () {
        if (this.current === 0) {
          this.checkInput()
        } else if (this.current === 1) {
          this.checkUserId()
        } else {
          this.current = 0
          this.start = true
        }
      },
      checkInput() {
        if (this.postdata.userPassword === '' || this.postdata.passwordAgain === '') {
          this.$Message.warning('密码输入为空')
        } else if (this.postdata.userPassword.length < 6) {
          this.$Message.warning('密码长度不能低于6位')
        } else if (this.postdata.userPassword !== this.postdata.passwordAgain) {
          this.$Message.warning('两次密码输入不一致')
        } else {
          this.current += 1
          this.start = false
        }
      },
      checkUserId() {
        if (this.postdata.userId !== '' + window.sessionStorage.getItem('userId')) {
          this.$Message.warning('工号验证失败')
        } else {
          this.commitModifyPassword()
        }
      },
      commitModifyPassword() {
        var that = this
        this.$axios.put('/api/user/password/modify', this.postdata)
        .then(function (response) {
          if (response.data.code === 200) {
            that.$Message.success(response.data.msg)
            that.current += 1
            that.start = false
            that.postdata.userPassword = ''
            that.postdata.passwordAgain = ''
            that.postdata.userId = ''
          } else {
            that.$Message.warning(response.data.msg)
          }
        })
        .catch(function () {
          that.$Message.error('网络异常')
        })
      }
    }
  }
</script>
