const util = require('../../utils/util.js')
Page({
  data: {
    showRefresh: false,
    isOpened: false,
    id: '',
    type: '',
    payload: '',
    disabled: false,
    logs:[]
  },

  onLoad() {
    // 初始化
    this.NFCAdapter = wx.getNFCAdapter();
    // 获取NDEF对象
    this.NFCTab = this.NFCAdapter.getNdef()
    this.startDiscovery()
  },

  bindTypeInput(e) {
    this.setData({
      type: e.detail.value
    })
  },
  bindPayloadInput(e) {
    this.setData({
      payload: e.detail.value
    })
  },

  //添加新元素 
  addlog (data) {
    var logs = this.data.logs;
    logs.unshift(data);
    this.setData({
      logs: logs
    })
  },

  clear(){
    this.setData({
      logs:[]
    })
  },

  // 写入数据
  writeNFC() {
    this.addlog({time:util.formatTime(new Date()),text:'准备写入数据...'})
    this.setData({
      disabled: true
    })

    //准备写入的数据
    const records = [{
      id: util.str2ab((new Date().getTime()).toString()),
      payload: util.str2ab(this.data.payload),
      type: util.str2ab(this.data.type),
      tnf: 2
    }];

    // 连接设备
    this.NFCconnect(records)
  },

  // 连接设备
  NFCconnect(records){
    this.NFCTab.connect({
      success: res => {
        this.addlog({time:util.formatTime(new Date()),text:'已连接设备'})
        // 执行写入
        this.writeNdefMessage(records)
      },
      fail: error => {
        this.addlog({time:util.formatTime(new Date()),error})
      },
      complete:()=>{

      }
    });
  },

  // 执行写入
  writeNdefMessage(records){
    this.addlog({time:util.formatTime(new Date()),text:'正在执行写入...'})
    this.NFCTab.writeNdefMessage({
      records: records,
      success: res => {
        this.addlog({time:util.formatTime(new Date()),text:'写入数据成功！'})
      },
      fail: error => {
        this.addlog({time:util.formatTime(new Date()),error})
      },
      complete:()=>{
        this.setData({
          disabled: false
        })
        // 断开连接
        this.NFCTab.close()
      }
    });
  },

  // 启动发现
  startDiscovery() {
    this.setData({showRefresh:false})
    this.addlog({time:util.formatTime(new Date()),text:'请将设备放入NFC识别区'})
    this.NFCAdapter.startDiscovery({
      success: res => {
        this.addlog({time:util.formatTime(new Date()),res})
        // 开始读取
        this.onDiscovered()
      },
      fail: error => {
        this.addlog({time:util.formatTime(new Date()),error})
        this.setData({
          showRefresh: true
        })
      }
    });
  },

  // 开始读取
  onDiscovered() {
    this.NFCAdapter.onDiscovered(res => {
      this.addlog({time:util.formatTime(new Date()),text:'开始读取数据...'})
      this.setData({
        disabled:false,
        isOpened: true,
        type: '',
        payload: '',
        id: ''
      })
      if (res.messages) {
        for (let i = 0; i < res.messages[0].records.length; i++) {
          var id = util.ab2str(res.messages[0].records[i].id)
          var type = util.ab2str(res.messages[0].records[i].type)
          var payload = util.ab2str(res.messages[0].records[i].payload)
          console.log('id', id)
          console.log('type', type)
          console.log('payload',payload)
          this.setData({
            id,
            type,
            payload
          })
          this.addlog({time:util.formatTime(new Date()),text:'读取数据成功！'})
          this.addlog({time:'',text:'====================='})
          this.addlog({time:'',text:'payload:'+payload})
          this.addlog({time:'',text:'type:'+type})
          this.addlog({time:'',text:'id:'+id})
          this.addlog({time:'',text:'====================='})
        }
      }else{
        this.addlog({time:util.formatTime(new Date()),text:'设备数据为空'})
      }

    });
  }
})