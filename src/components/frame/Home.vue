<template>
  <div class="layout" id="home">
    <Layout>
      <Header :style="{position: 'fixed', width: '100%',height:'60px',zIndex: '100'}">
        <Menu mode="horizontal" theme="dark" active-name="authorization">
          <div class="layout-logo">
            <a>授权管理系统</a>
          </div>
          <div id="menuItem">
            <MenuItem name="authorization" style="font-size:16px;">
              <router-link to="/license-manage/home/management/authorization" active-class="active">
                <div>
                  <b>
                    <i class="iconfont icon-shouquanguanli"/>
                  </b> 授权管理
                </div>
              </router-link>
            </MenuItem>
            <MenuItem name="product" v-if="displayTour || displayPm" style="font-size:16px">
              <router-link to="/license-manage/home/management/product" active-class="active">
                <div>
                  <b>
                    <i class="iconfont icon-chanpinguanli"/>
                  </b> 产品管理
                </div>
              </router-link>
            </MenuItem>
            <MenuItem name="user" v-if="displayTour && displayPm" style="font-size:16px">
              <router-link to="/license-manage/home/management/user" active-class="active">
                <div>
                  <b>
                    <i class="iconfont icon-yonghuguanli"/>
                  </b> 用户管理
                </div>
              </router-link>
            </MenuItem>
          </div>
          <div class="layout-nav">
            <MenuItem name="own" style="font-size:16px">
              <router-link to="/license-manage/home/settings/person" active-class="active">
                <div>
                  <b>
                    <i class="iconfont icon-gerenxinxi"/>
                  </b> {{ userName }}
                </div>
              </router-link>
            </MenuItem>
            <MenuItem name="password" style="font-size:16px">
              <router-link to="/license-manage/home/settings/password" active-class="active">
                <div>
                  <b>
                    <i class="iconfont icon-xiugaimima"/>
                  </b> 密码重置
                </div>
              </router-link>
            </MenuItem>
            <MenuItem name="logout" style="font-size:16px">
              <div v-on:click="quit">
                <b>
                  <i class="iconfont icon-dengchu"/>
                </b> 注销登录
              </div>
            </MenuItem>
          </div>
        </Menu>
      </Header>
      <Layout>
        <Layout :style="{padding: '0 20px 20px',marginTop:'90px', overflow:'auto'}">
          <Content ref="homePage"
            :style="{padding: '20px', background: '#fff', overflow: 'auto'}">
              <router-view></router-view>
          </Content>
          <Footer class="layout-footer-center">
            <div>
              <p style="float:left">@ Powered By Bosssoft</p>
              <p style="float:right">Copyright © 2001-2019   博思软件股份有限公司</p>
            </div>
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  </div>
</template>

<style scoped>
html,
body {
  overflow: hidden;
}

a {
  color: #c0c0c0;
}

a:hover {
  color: #fff;
}

.layout {
  background: #f5f7f9;
  position: relative;
  overflow: hidden;
  height: 100%;
}

.layout-logo {
  width: 200px;
  height: 30px;
  float: left;
  padding: 0;
  top: 15px;
  left: 0px;
  vertical-align: middle;
  color: #fff;
  font-size: 24px;
}

.layout-logo a {
  color: #fff;
}

.layout-nav {
  float: right;
  width: auto;
  margin: 0 auto;
  margin-right: 20px;
}

.active {
  color: #729ff3;
}

.active:hover {
  color: #5baaf0;
}

.default {
  color: #ffffff;
}
</style>

<script>
export default {
  data() {
    return {
      clientHeight: 600,
      userName: window.sessionStorage.getItem('userName'),
      display1: window.sessionStorage.getItem('display1') === 'true' ? 3 : 3,
      display2: window.sessionStorage.getItem('display2') === 'true' ? 2 : 3,
      display3: window.sessionStorage.getItem('display3') === 'true' ? 0 : 3,
      displayTour: false,
      displayPm: false
    }
  },
  methods: {
    quit() {
      window.sessionStorage.removeItem('userId')
      window.sessionStorage.removeItem('userName')
      window.sessionStorage.removeItem('userRole')
      window.sessionStorage.removeItem('display1')
      window.sessionStorage.removeItem('display2')
      window.location.href = '/'
      this.$axios.get('/auth/logout')
    },
    changeFixed(clientHeight) {
      // 动态修改样式
      this.$refs.homePage.$el.style.minHeight = clientHeight + 'px'
    },
    initHeight() {
      // 获取浏览器可视区域高度
      this.clientHeight = window.innerHeight - 180
      // console.log($(document).height());//浏览器可视区域对象宽度
      window.onresize = () => {
        // 当窗口或框架发生改变时触发
        this.clientHeight = window.innerHeight - 180
      }
      this.isAuthc()
    },
    isAuthc() {
      if (window.sessionStorage.getItem('userId') === null) {
        window.location.href = '/'
      }
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
    }
  },
  mounted() {
    this.initHeight()
  },
  watch: {
    // 如果 `clientHeight` 发生改变，这个函数就会运行
    clientHeight: function() {
      this.changeFixed(this.clientHeight)
    }
  },
  components: {name: 'Home'}
}
</script>
