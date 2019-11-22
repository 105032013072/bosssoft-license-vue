<template>
  <div>
    <a :key="item.lineId" v-for="item in productLineData" @click="callback(item)">
      <Card class="cardStyle" >
        <div style="text-align:center">
          <img src="../../../../assets/imgs/logocopy.png">
          <h3>{{item.lineName}}</h3>
        </div>
      </Card>
    </a>
  </div>
</template>

<script>
    export default {
      name: 'LicenseLineCard',
      data() {
        return {
          userId: window.sessionStorage.getItem('userId'),
          productLineData: []
        }
      },
      mounted() {
        this.loadProductLines()
      },
      methods: {
        loadProductLines() {
          var that = this
          this.$axios.get('/api/productlines/' + this.userId)
            .then(function (response) {
              if (response.data.code === 200) {
                that.productLineData = response.data.content
              }
            })
            .catch(function () {
              that.$Message.error('网络异常')
            })
        },
        callback(data) {
          var datas = {
            lineId: data.lineId,
            lineName: data.lineName,
            moduleType: 'A',
            name: ['授权管理', data.lineName]
          }
          this.$emit('listenToChildEvent', datas)
        }
      }
    }
</script>

<style scoped>
.cardStyle {
  width:300px;
  display: inline-block;
  margin: 5px;
}
.cardStyle:hover{
  cursor:pointer;
}
.cardStyle:active {
  box-shadow: #2d8cf0;
}
</style>
