<template>
  <div>
    <Row>
      <Button type="info" size="default" @click="back"><Icon type="ios-arrow-back"></Icon>返回</Button>
      <label><b>产品套件 :</b></label>
      <Tag type="dot" color="primary">{{prefixData.suitName}}</Tag>
      <label><b>客户名称 :</b></label>
      <Tag type="dot" color="primary">{{prefixData.customerName}}</Tag>
      <label><b>版本 :</b></label>
      <Tag type="dot" color="primary">{{prefixData.edition}}</Tag>
      <label><b>版本号 :</b></label>
      <Tag type="dot" color="primary">{{prefixData.suitRelease}}</Tag>
      <div style="float: right">
        <Button @click="mailLicense" :disabled="exportButtonDisabled" type="primary">邮件发送License</Button>
        <Button @click="exportLicense" :disabled="exportButtonDisabled" type="warning">下载License</Button>
      </div>
    </Row>
    <Content :style="{padding: '20px 0'}">
      <Table border ref="selection" :columns="columns_pre" :data="currentPageData"
       @on-selection-change="selectChangeHandle" @on-select="selectChangeHandle"></Table>
      <div style="margin: 10px;overflow: hidden">
        <div style="float: right;">
          <Page :total="totalNumber" :current="currentPageNo" @on-change="changePage"></Page>
        </div>
    </div>
    </Content>
    <Modal v-model="detailModal" width="768" title="授权信息" >
      <CellGroup>
        <Cell title="Selected" selected >基本信息</Cell>
      </CellGroup>
      <Divider/>
      <Row :gutter="32" justify="center" type="flex">
        <Col span="4" style="text-align:right">
          <label><b><font style="font-size:20px;">产品名称:</font></b></label>
        </Col>
        <Col span="10">
          <CellGroup>
            <Cell selected >{{ detailData.productName }}</Cell>
          </CellGroup>
        </Col>
        <Col span="6">
          <Select v-model="detailData.isTrial">
            <Option v-for="item in edition" :value="item.edition" :key="item.edition">{{ item.label }}</Option>
          </Select>
        </Col>
      </Row>
      <Divider/>
      <CellGroup>
        <Cell title="Selected" selected >基本授权项</Cell>
      </CellGroup>
      <Divider/>
      <Row :gutter="16" justify="center" type="flex">
        <Col span="3" class="labelStyle">
          <label><b><font class="labelStyle">IP</font></b></label>
        </Col>
        <Col span="9">
          <Input v-model="detailData.ip" style="width: 80%" />
        </Col>
        <Col span="3" class="labelStyle">
          <label><b><font class="labelStyle">Mac</font></b></label>
        </Col>
        <Col span="9">
          <Input v-model="detailData.mac" style="width: 80%" />
        </Col>
      </Row>
      <br>
      <Row :gutter="16" justify="center" type="flex">
        <Col span="3" class="labelStyle">
          <label><b><font class="labelStyle">CPU</font></b></label>
        </Col>
        <Col span="9">
          <Input v-model="detailData.cpus" style="width: 80%" />
        </Col>
        <Col span="3" class="labelStyle">
          <label><b><font class="labelStyle">数据库</font></b></label>
        </Col>
        <Col span="9">
          <Select v-model="detailData.db"  style="width: 80%" >
            <Option v-for="item in database" :value="item" :key="item">{{ item }}</Option>
          </Select>
        </Col>
      </Row>
      <br>
      <Row :gutter="16" justify="center" type="flex">
        <Col span="3" class="labelStyle">
          <label><b><font class="labelStyle">操作系统</font></b></label>
        </Col>
        <Col span="9">
          <Select v-model="detailData.os"  style="width: 80%" >
            <Option v-for="item in system" :value="item" :key="item">{{ item }}</Option>
          </Select>
        </Col>
        <Col span="3" class="labelStyle">
          <label><b><font class="labelStyle">应用服务器</font></b></label>
        </Col>
        <Col span="9">
          <Select v-model="detailData.as"  style="width: 80%" >
            <Option v-for="item in server" :value="item" :key="item">{{ item }}</Option>
          </Select>
        </Col>
      </Row>
      <br>
      <Row :gutter="16" justify="start" type="flex">
        <Col span="3" class="labelStyle">
          <label><b><font class="labelStyle">工作流</font></b></label>
        </Col>
        <Col span="9">
          <Select v-model="detailData.workflow" style="width: 80%" >
            <Option v-for="item in allow" :value="item.allow" :key="item.allow">{{ item.label }}</Option>
          </Select>
        </Col>
        <Col v-if="detailData.isTrial === 'true'" span="3" class="labelStyle">
          <label><b><font class="labelStyle">过期时间</font></b></label>
        </Col>
        <Col v-if="detailData.isTrial === 'true'" span="9">
          <DatePicker v-model="detailData.expiration" type="date" placeholder="Select date" style="width: 80%" @on-change="detailData.expiration=$event"></DatePicker>
        </Col>
      </Row>
      <Divider/>
      <CellGroup>
        <Cell title="Selected" selected >业务授权项 &nbsp;&nbsp;
          <Button v-if="displayTour || displayPm" type="primary" icon="md-add" @click="addProperty"></Button>
        </Cell>
      </CellGroup>
      <Divider/>
      <div :style="'height:'+ (works.length * 50) / 2 + 'px'">
        <Work v-on:increment="incrementTotal" v-for="item in works" :key="item.name" v-bind:data="item"></Work>
      </div>
      <div slot="footer">
        <Button type="text" v-if="!(displayTour || displayPm)" size="large" @click="closeDeta">关闭</Button>
        <Button type="text" v-if="displayTour || displayPm" size="large" @click="closeDeta">取消</Button>
        <Button type="primary" v-if="displayTour || displayPm" size="large" @click="saveLicense">保存</Button>
      </div>
    </Modal>
    <Modal v-model="addDes" title="新增">
      <label><b><font class="labelStyle">名称*：</font></b></label>
      <Input v-model="addPropertyData.name" style="width: 85%" />
      <br><br>
      <label><b><font class="labelStyle">描述*：</font></b></label>
      <Input v-model="addPropertyData.desc" style="width: 85%" />
      <br><br>
      <div slot="footer">
   	    <Button type="text" size="large" @click="closeAddDes">取消</Button>
   	    <Button type="primary" size="large" @click="confirmAddDes">确认新增</Button>
      </div>
    </Modal>
    <Modal v-model="mailModal" title="通过邮件发送License">
      <label><b><font class="labelStyle">收件人邮箱*：</font></b></label>
      <Input v-model="mailData.receiver" placeholder="请只填入一个正确的邮箱地址" type="email"  style="width: 80%" />
      <br><br>
      <label><b><font class="labelStyle">抄送人邮箱 ：</font></b></label>
      <Input v-model="mailData.carbonCopy" placeholder="请只填入一个正确的邮箱地址或者不填写" style="width: 80%" />
      <br><br>
      <div slot="footer">
        <Button type="text" size="large" @click="closeMailModal">取消</Button>
        <Button type="primary" size="large" @click="confirmMail">确认发送</Button>
      </div>
    </Modal>
  </div>
</template>
<style>
.labelStyle {
  text-align:right;
  padding:6px;
}
</style>

<script>
export default {
  data() {
    return {
      mailData: {
        receiver: '',
        carbonCopy: ''
      },
      display1: window.sessionStorage.getItem('display1') === 'true' ? 3 : 3,
      display2: window.sessionStorage.getItem('display2') === 'true' ? 2 : 3,
      display3: window.sessionStorage.getItem('display3') === 'true' ? 0 : 3,
      displayTour: false,
      displayPm: false,
      postProductIds: [],
      message: '',
      module: 'A',
      selectData: '',
      userId: '51832',
      prefixData: [],
      showData: [],
      currentTableData: [],
      currentPageData: [],
      currentPageNo: 1,
      currentIndex: 1,
      totalNumber: 10,
      searchData: '',
      productIds: [],
      exportButtonDisabled: true,
      exportData: [],
      detailModal: false,
      mailModal: false,
      addDes: false,
      addCommitSata: [],
      addPropertyData: {
        value: '',
        name: '',
        desc: '',
        iscustomized: '1'
      },
      detailData: {
        productName: '',
        licenseId: '',
        productId: '',
        isTrial: 'true',
        ip: '',
        mac: '',
        cpus: '',
        db: '',
        os: '',
        as: '',
        expiration: '',
        workflow: 'true'
      },
      edition: [
        {
          edition: 'false',
          label: 'PE(专业版)'
        },
        {
          edition: 'true',
          label: 'DE(试用版)'
        }
      ],
      works: [
        {
          value: '',
          name: 'region',
          desc: '区划',
          iscustomized: '1'
        }
      ],
      allow: [
        {
          allow: 'true',
          label: '允许'
        },
        {
          allow: 'false',
          label: '不允许'
        }
      ],
      database: [
        'ORACLE', 'DB2', 'SQLSERVER', 'MYSQL'
      ],
      server: [
        'tomcat', 'weblogic', 'jboss', 'websphere'
      ],
      system: [
        'windows', 'Linux'
      ],
      columns_pre: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '产品组件ID',
          key: 'productId'
        },
        {
          title: '名称',
          key: 'productName'
        },
        {
          title: '操作',
          key: 'operation',
          width: 300,
          align: 'left',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'info',
                  size: 'default'
                },
                style: {
                  marginRight: '20px',
                  marginLeft: '20px'
                },
                on: {
                  click: () => {
                    this.auth(params.index)
                  }
                }
              }, '查看授权详情'),
              h('Tag', {
                props: {
                  color: 'success',
                  size: 'large'
                },
                style: {
                  marginRight: '5px',
                  display: (this.showData[(this.currentPageNo - 1) * 10 + params.index]).isAuth ? 'inline-block' : 'none'
                }
              }, '已授权')
            ])
          }
        }
      ]
    }
  },
  mounted: function() {
    this.loadPrefixData()
  },
  methods: {
    mailLicense() {
      var result = this.setLicenseData()
      if (!result.ledge) {
        this.$Message.warning(result.testData.productName + '未授权，不能导出License文件')
      } else {
        this.mailModal = true
      }
    },
    closeMailModal() {
      this.mailModal = false
      this.mailData.receiver = ''
      this.mailData.carbonCopy = ''
    },
    confirmMail() {
      if (this.mailData.receiver === '') {
        this.$Message.warning('收件人邮箱不能为空')
      } else {
        if (!this.mailData.receiver.includes('@') || this.mailData.receiver.includes(' ')) {
          this.$Message.warning('收件人邮箱格式不对')
        } else if (this.mailData.carbonCopy !== '' && (!this.mailData.carbonCopy.includes('@') || this.mailData.carbonCopy.includes(' '))) {
          this.$Message.warning('抄送人邮箱格式不对')
        } else {
          this.mailCommit()
        }
      }
    },
    mailCommit() {
      var licenseId = this.prefixData.licenseId
      var productids = this.postProductIds
      var that = this
      var data = {
        receiver: [this.mailData.receiver],
        carbonCopy: [this.mailData.carbonCopy]
      }
      if (this.mailData.carbonCopy === '') {
        data.carbonCopy = []
      }
      this.$axios.post('/api/license/mail/' + licenseId + '/' + productids, data, {timeout: 30000})
        .then(function (response) {
          if (response.data.code === 200) {
            that.$Message.success(response.data.msg)
          } else {
            that.$Message.warning(response.data.msg)
          }
        })
        .catch(function () {
          that.$Message.error('发送失败')
        })
      this.mailModal = false
    },
    setLicenseData() {
      this.postProductIds = []
      var ledge = true
      var testData = ''
      for (let item of this.exportData) {
        if (!item.isAuth) {
          ledge = false
          testData = item
          break
        } else {
          this.postProductIds.push(item.productId)
        }
      }
      return {
        ledge: ledge,
        testData: testData
      }
    },
    exportLicense() {
      var result = this.setLicenseData()
      if (!result.ledge) {
        this.$Message.warning(result.testData.productName + '未授权，不能导出License文件')
      } else {
        this.exportCommit()
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
    exportCommit() {
      var licenseId = this.prefixData.licenseId
      var productids = this.postProductIds
      var that = this
      this.$axios.get('/api/license/export/' + licenseId + '/' + productids)
      .then(function (response) {
        var blob = new Blob([response.data])
        let url = window.URL.createObjectURL(blob)
        let link = document.createElement('a')
        link.style.display = 'none'
        link.href = url
        link.setAttribute('download', 'bosssoft-license.xml')
        document.body.appendChild(link)
        link.click()
      })
      .catch(function () {
        that.$Message.error('网络异常')
      })
    },
    loadSelected() {
      var initedSelectData = []
      var that = this
      this.$axios.get('/api/license/selected/latest/' + this.prefixData.licenseId)
      .then(function (response) {
        if (response.data.code === 200) {
          for (let item of response.data.content) {
            for (let item1 of that.showData) {
              if (item.prodctId === item1.productId) {
                item1._checked = true
                initedSelectData.push(item1)
              }
            }
          }
          that.currentTableData = that.showData
          that.updateTable(that.currentPageNo)
          that.exportData = initedSelectData
          if (that.exportData.length !== 0) {
            that.exportButtonDisabled = false
          }
        }
      })
      .catch(function () {
        that.$Message.error('网络异常')
      })
    },
    loadPrefixData() {
      this.initDisplay()
      this.prefixData = this.data
      var that = this
      this.$axios.get('/api/licenseproperty/licenseid/' + this.prefixData.licenseId)
      .then(function (response) {
        if (response.data.code === 200) {
          var isContain = false
          for (let item of response.data.content) {
            for (let litem of that.productIds) {
              if (litem === item.productId) {
                isContain = true
              }
            }
            if (!isContain) {
              that.productIds.push(item.productId)
            } else {
              isContain = false
            }
          }
          that.lodadData()
        }
      })
      .catch(function () {
        that.$Message.error('网络异常')
      })
    },
    lodadData() {
      var that = this
      this.$axios.get('/api/products/' + this.prefixData.suitId)
      .then(function (response) {
        if (response.data.code === 200) {
          for (let item of response.data.content) {
            var isAuthTest = false
            for (let litem of that.productIds) {
              if (item.productId === litem) {
                isAuthTest = true
                break
              }
            }
            var test = {
              productId: item.productId,
              productName: item.productName,
              isAuth: isAuthTest,
              _checked: false
            }
            that.showData.push(test)
          }
          that.currentTableData = that.showData
          that.loadSelected()
        }
      })
      .catch(function () {
        that.$Message.error('网络异常')
      })
    },
    addProperty() {
      this.addDes = true
      this.detailModal = false
    },
    closeAddDes() {
      this.addDes = false
      this.detailModal = true
    },
    closeDeta() {
      this.detailModal = false
    },
    confirmAddDes() {
      if (this.addPropertyData.name !== '' && this.addPropertyData.desc !== '') {
        var isContain1 = false
        var isContain2 = false
        for (let item of this.works) {
          if (item.name === this.addPropertyData.name) {
            isContain1 = true
          }
          if (item.desc === this.addPropertyData.desc) {
            isContain2 = true
          }
        }
        if (isContain1) {
          this.message = '已有名称为' + this.addPropertyData.name + '的属性,请修改名称'
        } else if (isContain2) {
          this.message = '已有描述为' + this.addPropertyData.desc + '的属性,请修改描述'
        } else {
          this.works.push(JSON.parse(JSON.stringify(this.addPropertyData)))
          this.addPropertyData.name = ''
          this.addPropertyData.desc = ''
          this.closeAddDes()
        }
      } else {
        this.$Message.warning('输入不能为空')
      }
    },
    saveLicense() {
      this.detailData.licenseId = this.prefixData.licenseId
      this.initData()
      this.commitSaveLicense()
      this.closeDeta()
      this.loadSelected()
    },
    commitSaveLicense() {
      var that = this
      this.$axios.post('/api/licenseproperty/add.do', this.addCommitSata)
        .then(function (response) {
          if (response.data.code === 200) {
            that.$Message.success(response.data.msg)
            that.showData[that.currentIndex].isAuth = 'true'
          } else {
            that.$Message.warning(response.data.msg)
          }
        })
        .catch(function () {
          that.$Message.error('保存失败')
        })
    },
    initData() {
      this.addCommitSata = []
      var i = 0
      var names = ['productName', 'licenseId', 'productId', '是否试用', 'ip', 'mac', 'cpu', '数据库', '操作系统', '应用服务器', '过期时间', '工作流']
      for (i in this.detailData) {
        var test = {
          value: (this.detailData[i] === '') ? 'unlimited' : this.detailData[i],
          name: i,
          desc: '',
          iscustomized: '0'
        }
        this.addCommitSata.push(test)
      }
      for (i = 0; i < names.length; i++) {
        this.addCommitSata[i].desc = names[i]
      }
      for (i = 0; i < this.works.length; i++) {
        this.works[i].value = (this.works[i].value === '') ? 'unlimited' : this.works[i].value
        this.addCommitSata.push(this.works[i])
      }
      this.works = []
      var test1 = {
        value: '',
        name: 'region',
        desc: '区划',
        iscustomized: '1'
      }
      this.works.push(test1)
    },
    auth(index) {
      this.currentIndex = (this.currentPageNo - 1) * 10 + index
      this.detailModal = true
      this.addDes = false
      var detailTest = this.currentPageData[index]
      this.detailData.productName = detailTest.productName
      this.detailData.productId = detailTest.productId
      if (this.showData[this.currentIndex].isAuth) {
        this.loadCurrentData()
      }
    },
    loadCurrentData() {
      var that = this
      this.$axios.get('/api/licenseproperty/' + this.prefixData.licenseId + '/' + this.detailData.productId)
      .then(function (response) {
        if (response.data.code === 200) {
          that.initCurrentData(response.data.content)
        }
      })
      .catch(function () {
        that.$Message.error('网络异常')
      })
    },
    initCurrentData(data) {
      this.works = []
      var i = 0
      for (let item of data) {
        if (item.name === 'region') {
          var test1 = {
            value: (item.value === 'unlimited') ? '' : item.value,
            name: item.name,
            desc: item.propertyDesc,
            iscustomized: item.iscustomized
          }
          this.works.push(test1)
        }
      }
      for (let item of data) {
        var test = {
          value: (item.value === 'unlimited') ? '' : item.value,
          name: item.name,
          desc: item.propertyDesc,
          iscustomized: item.iscustomized
        }
        if (test.iscustomized === '1' && test.name !== 'region') {
          this.works.push(test)
        } else {
          for (i in this.detailData) {
            if (i === item.name) {
              this.detailData[i] = (item.value === 'unlimited') ? '' : item.value
            }
          }
        }
      }
    },
    changePage (page) {
      this.currentPageData = this.mockTableData(page)
      this.currentPageNo = page
    },
    mockTableData (page) {
      this.exportButtonDisabled = true
      let data = []
      for (let i = (page - 1) * 10; i < this.totalNumber && i < page * 10; i++) {
        data.push(this.currentTableData[i])
      }
      return data
    },
    selectChangeHandle (payload) {
      this.exportData = []
      if (payload.length === 0) {
        this.exportButtonDisabled = true
      } else {
        this.exportData = payload
        this.exportButtonDisabled = false
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
    },
    back() {
      var data = {
        lineId: this.data.lineId,
        lineName: this.data.lineName,
        moduleType: 'A',
        name: ['授权管理', this.data.lineName]
      }
      this.$emit('listenToChildEvent', data)
    },
    incrementTotal: function (name) {
      var index = 0
      var i = 0
      for (i = 0; i < this.works.length; i++) {
        if (this.works[i].name === name) {
          index = i
          break
        }
      }
      this.works.splice(index, 1)
    }
  },
  watch: {
    'detailData.isTrial': {
      handler: function() {
        if (this.detailData.isTrial !== 'true') {
          this.detailData.expiration = ''
        }
      }
    }
  },
  components: {
    'Work': {
      template: '<div><Col span="3" style="text-align:right;padding:6px;margin-bottom:10px">' +
          '<label><b><font style="text-align:right;padding:6px">{{ data.desc }}</font></b></label>' +
        '</Col>' +
        '<Col  style="margin-bottom:10px" span="9">' +
          '<Input v-model="data.value" style="width: 80%" />' +
          '<Button v-if="data.name !== region" v-on:click="incrementHandler" icon="md-close" style="padding:5px" type="text"></Button>' +
        '</Col></div>',
      data: function () {
        return {
          region: 'region'
        }
      },
      methods: {
        incrementHandler: function() {
          this.$emit('increment', this.data.name)
        }
      },
      props: ['data']
    }
  },
  props: ['data']
}
</script>
