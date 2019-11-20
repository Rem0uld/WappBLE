var app = getApp();
var utils = require("../../utils/util.js");
Page({
  data: {
    text: "",
    name: "",
    motorState: "",
    curtainState: "",


    serviceId: "",
    writeCharacteristicId: "",
    readCharacteristicId: "",
    characteristicsId: "",
  },

  onLoad: function(options) {
    var that = this;
    console.log(app.globalData.deviceName)
    that.setData({
      name: app.globalData.deviceName,
    })
    wx.getBLEDeviceServices({
      deviceId: app.globalData.deviceId,
      success: e => {
        console.log("获取服务UUID成功", e)
        that.setData({
          serviceId: e.services[0].uuid,
        })
        wx.getBLEDeviceCharacteristics({
          deviceId: app.globalData.deviceId,
          serviceId: e.services[0].uuid,
          success: res => {
            console.log("获取特征值成功", res)
            for (let i = 0; i < res.characteristics.length; i++) {
              if (res.characteristics[i].properties.write) {
                that.setData({
                  writeCharacteristicId: res.characteristics[i].uuid
                })
                console.log("write特征值",res.characteristics[i].uuid)
              }
              if (res.characteristics[i].properties.read) {
                that.setData({
                  readCharacteristicId: res.characteristics[i].uuid
                })
                console.log("read特征值",res.characteristics[i].uuid)
              }
              if (res.characteristics[i].properties.notify) {
                that.setData({
                  characteristicId: res.characteristics[i].uuid
                })
                console.log("notify特征值",res.characteristics[i].uuid)
                that.onBLEnotify();
              }
            }
            
          },
          fail: res => {
            console.log("获取特征值失败", res)
          }
        })
      },
      fail: e => {
        console.error
      }
    })
  },
  onBLEnotify: function() {
    var that = this;
    wx.notifyBLECharacteristicValueChange({
      deviceId: app.globalData.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.characteristicId,
      state: true,
      success: e => {
        that.onBLEnotifyChange();
        console.log("开启notify成功", e);
        
      },
    })

  },
  onBLEnotifyChange: function() {
    var that = this;
    wx.onBLECharacteristicValueChange(function(res) {
      console.log("监听",res.value)
      var resValue = utils.ab2hext(res.value); //16进制字符串
      var resValueStr = utils.hexToString(resValue);
      that.setData({
        text: resValueStr,
      })
    })
  },

  openCurtain: function() {
    var that = this;
    that.bleWriteData("@");

  },

  closeCurtain: function() {
    var that = this;
    that.bleWriteData("?");
  },
  //返回蓝牙是否正处于链接状态
  onBLEConnectionStateChange: function (onFailCallback) {
    wx.onBLEConnectionStateChange(function (res) {
      // 该方法回调中可以用于处理连接意外断开等异常情况
      console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`);
      return res.connected;
    });
  },
  bleWriteData: function(buffer) {
    var that = this;
    let order = utils.stringToBytes(buffer);
    wx.writeBLECharacteristicValue({
      deviceId: app.globalData.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.writeCharacteristicId,
      value: order,
      success: e => {
        console.log("成功写入", e)
      },
      fail: e => {
        console.log("写入失败", e)
      },
    })


  },
  onReady: function() {

  },


  onShow: function() {

  },

  onHide: function() {

  },


  onUnload: function() {

  },


  onPullDownRefresh: function() {

  },


  onReachBottom: function() {

  },


  onShareAppMessage: function() {

  }
})