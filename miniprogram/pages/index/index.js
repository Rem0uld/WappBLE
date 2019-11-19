var app = getApp();
Page({
  data: {
    isopen: false, //蓝牙适配器是否已打开
    devices: [],
    connected: false,
    connectName:'未连接',
  },

  startScan: function(e) {
    var that = this;
    if (that.data.isopen) {
      that.getBluetoothAdapterState();
    } else {
      that.openBluetoothAdapter();
    }

  },

  getBluetoothAdapterState: function() {
    var that = this;
    wx.getBluetoothAdapterState({
      success: e => {
        console.log("getBluetoothAdapterState", e);
        if (e.available) {
          that.startScanDevices();
        } else {
          wx.showModal({
            title: '错误',
            content: '蓝牙适配器不可用！',
          })
        }
      },
      fail: console.error
    })
  },
  openBluetoothAdapter: function() {
    var that = this;
    wx.openBluetoothAdapter({
      success: e => {
        that.setData({
          isopen: true,
        })
        console.log(e);
      },
      fail: e => {
        wx.showModal({
          title: '错误',
          content: '请打开手机蓝牙！',
        })
      }
    })
  },
  startScanDevices: function() {
    wx.showLoading({
      title: '搜索中',
    })
    var that = this;
    wx.startBluetoothDevicesDiscovery({
      success: e => {
        console.log("startScanDevices", e);
        wx.getBluetoothDevices({
          success: e => {
            console.log("getBluetoothDevices", e);
            that.setData({
              devices: e.devices,
            })
          },
          fail: e => {
            console.log("getBluetoothDevices", e);
          }
        })
      },
      fail: e => {
        console.log(e)
      },
      complete: e => {
        wx.hideLoading();
      }
    })
  },

  startConnect: function(e) {
    var that = this;
    console.log("点击连接", e)
    wx.showModal({
      title: '提示',
      content: '是否连接到' + e.currentTarget.dataset.name + '？',
      success: res => {
        if (res.confirm) {
          wx.createBLEConnection({
            timeout:2000,
            deviceId: e.currentTarget.dataset.id,
            success: res => {
              console.log("成功连接", res)
              that.setData({
                connected:true,
                connectName: e.currentTarget.dataset.name,
              })
              app.globalData.deviceId = e.currentTarget.dataset.id;
              wx.navigateTo({
                url: '../ctrl/ctrl',
              })
              wx.stopBluetoothDevicesDiscovery({
                success: e => {
                  console.log(e)
                },
                fail: console.error,

              })
            },
            fail: res => {
              wx.showToast({
                title: '连接失败',
                icon:'none',
              })
            }
          })
        } else if (res.cancel) {
          console.log("取消连接")
        }
      }
    })
  },
  stopConnect: function() {
    var that = this;
    if (that.data.connected) {
      wx.closeBLEConnection({
        deviceId: app.globalData.deviceId,
        success: e => {
          that.setData({
            connected:false,
            connectName:'未连接'
          })
          console.log(e)
        },
        fail: console.error
      })
    }else{
      wx.showToast({
        title: '没有已连接设备！',
        icon:'none',
      })
    }
  },


  onLoad: function(e) {
    var that = this;
    that.openBluetoothAdapter();
  },


})