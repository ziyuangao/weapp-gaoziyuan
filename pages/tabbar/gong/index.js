// pages/tabbar/gong/index.js
const utils = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    defaultList:[
      { path:'/pages/setting/index',title:'设置',subTitle:'菜单设置',icon:'../../assets/img/tabbar/setting.png'},
    ],
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getMenuList();
  },
  getMenuList(){
    const allRouterConfig = utils.allMenuList;
    // 读取 storage 中是否存在历史配置 如果存在 沿用历史
    const currentConfig =  wx.getStorageSync('routeConfig');
    if(currentConfig && currentConfig.length){
      const resultConfig = allRouterConfig.filter(item=>{
        return currentConfig.some(i=>i == item.id)
      })
      this.setData({
        list:[...resultConfig,...this.data.defaultList]
      })
    } else {
      this.setData({
        list:this.data.defaultList
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  onItemTap(e){
    const _this = this;
    const path = e.target.dataset.path || e.currentTarget.dataset.path || ''
    if(!path){
      return
    }
    wx.navigateTo({
      url:path,
      events:{
        // 监听配置页面发送的事件
        menuConfigUpdated: () => {
          _this.getMenuList();
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})