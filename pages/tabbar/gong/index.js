// pages/tabbar/gong/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[
      { path:'/pages/lol/index',title:'英雄联盟查询',subTitle:'皮肤查询',icon:'../../../assets/img/tabbar/lol.png'},
      { path:'/pages/bmi/index',title:'身体指数计算',subTitle:'计算BMI值',icon:'../../../assets/img/tabbar/bmi.png'},
      { path:'/pages/gas/index',title:'今日油价',subTitle:'全国各省油价查询',icon:'../../../assets/img/tabbar/gas.png'},
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  onItemTap(e){
    const path = e.target.dataset.path || e.currentTarget.dataset.path || ''
    if(!path){
      return
    }
    wx.navigateTo({
      url:path
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