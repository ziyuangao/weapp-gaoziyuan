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
    showDailyNotice: false,   // 控制公告栏显示
    dailyNoticeText: '',      // 公告栏文字内容
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
    this.checkAndShowDailyNotice();
  },
  checkAndShowDailyNotice(){
    const STORAGE_KEY = 'daily_notice';
    const today = new Date().toDateString(); // 获取当天日期字符串，如"Sat May 27 2024"

    // 1. 检查本地存储
    const storedData = wx.getStorageSync(STORAGE_KEY);
    if (storedData && storedData.date === today) {
      // 今天已经显示过，不重复显示
      this.setData({ showDailyNotice: false });
      return;
    }
    // 2. 今天未显示过，调用接口
    wx.request({
      url: 'https://uapis.cn/api/v1/saying',
      method: 'GET',
      success: (res) => {
        console.log('名言接口响应:', res.data);
        // 处理成功响应
        if (res.data && res.data.text) {
          const noticeText = res.data.text;
          // 3. 存储到本地并更新界面
          wx.setStorageSync(STORAGE_KEY, {
            date: today,
            text: noticeText
          });
          this.setData({
            showDailyNotice: true,
            dailyNoticeText: noticeText
          });
          // 4. 10秒后自动隐藏（对应动画结束）
          setTimeout(() => {
            this.setData({ showDailyNotice: false });
          }, 8000);
        } else {
          // 接口返回了错误格式，静默失败，不展示
          console.warn('名言接口返回数据格式错误:', res.data);
          this.setData({ showDailyNotice: false });
        }
      },
      fail: (err) => {
        // 网络请求失败，静默失败，不展示
        console.error('名言接口请求失败:', err);
        this.setData({ showDailyNotice: false });
      }
    });
  }

})