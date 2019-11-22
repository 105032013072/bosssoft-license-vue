// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App.vue'
import router from './router/router.js'
import iView from 'iview'
import './assets/iconfont/iconfont.css'
import 'iview/dist/styles/iview.css'
import axios from 'axios'
import 'babel-polyfill'
// axios.defaults.baseURL = 'http://localhost:8080'
axios.defaults.withCredentials = true
axios.defaults.timeout = 7000

Vue.prototype.$axios = axios
Vue.config.productionTip = false

Vue.use(iView)

// http response 服务器响应拦截器，拦截401错误，并重新跳入登录页重新获取token
axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 403:
          router.replace({
            path: '/',
            query: {redirect: router.currentRoute.fullPath} // 登录成功后跳入浏览的当前页面
        })
      }
    }
    return Promise.reject(error.response.data)
})

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  render: h => h(App)
})
