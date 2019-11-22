<template>
    <div id="loginDiv">
      <Row type="flex" align="middle" justify="center">
        <Col style="top:60px" offset="7" span="8"><span class="fontStyle">博思软件产品授权管理系统</span></Col>
      </Row>
      <br><br>
      <Row type="flex" align="middle" justify="center">
        <Col offset="10" span="8">
          <Card class="card_style">
              <p slot="title">登录</p>
              <div style="text-align:center">
                <Form ref="formInline" :model="formInline" :rules="ruleInline" inline>
                    <FormItem prop="user">
                      <Input type="text" placeholder="工号" v-model="formInline.user"
                          clearable style="width: 200px">
                          <Icon type="ios-contact" slot="prefix" />
                      </Input>
                    </FormItem>
                    <FormItem prop="password">
                        <Input type="password" clearable v-model="formInline.password" placeholder="密码" style="width:200px">
                            <Icon type="ios-lock" slot="prefix" />
                        </Input>
                    </FormItem>
                    <Radio v-model="single" style="width:200px;text-align:left;margin-bottom:10px">记住我</Radio>
                    <FormItem>
                        <Button type="primary" style="width:200px" @click="handleSubmit('formInline')">登录</Button>
                        <p style="width:200px;text-align:right;"><a>忘记密码</a></p>
                    </FormItem>
                </Form>
              </div>
          </Card>
        </Col>
      </Row>
    </div>
</template>
<style>
    p{
      padding: 0;
      margin: 0;
      color:#3399ff;
    }
    h1{
      font-size: 48px;
      color: #FFF;
    }
    body{
      background: url('../assets/imgs/background.png') fixed center center;
      background-size: cover;
    }
    .card_style{
      width: 320px;
      top: 100px;
    }
    .fontStyle{
      font-size: 45px;
      color: #FFF;
    }
</style>

<script>
import qs from 'qs'
export default {
  name: 'Index',
  data () {
    return {
      single: false,
      formInline: {
        user: '',
        password: ''
      },
      ruleInline: {
        user: [
          { required: true, message: '请填写工号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请填写密码', trigger: 'blur' },
          { type: 'string', min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleSubmit () {
      const that = this
      let postData = qs.stringify({
        username: this.formInline.user,
        password: this.formInline.password
      })
      this.$axios.post('/auth/login.do', postData)
        .then(function (response) {
          if (response.data.code === 200) {
            that.$Message.success(response.data.msg)
            var user = response.data.content
            window.sessionStorage.setItem('userId', user.userId)
            window.sessionStorage.setItem('userName', user.userName)
            window.sessionStorage.setItem('userRole', user.role)
            window.sessionStorage.setItem('display1', user.role === 'admin' ? 'true' : 'false')
            window.sessionStorage.setItem('display2', user.role === 'pm' ? 'true' : 'false')
            window.sessionStorage.setItem('display3', user.role === 'tourist' ? 'true' : 'false')
            window.location.href = '/license-manage/home/management/authorization'
          } else {
            that.$Message.warning(response.data.msg)
          }
        })
        .catch(function () {
          that.$Message.error('登录失败')
        })
    }
  }
}
</script>
