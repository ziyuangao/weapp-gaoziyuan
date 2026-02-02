// pages/lolDetail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperIndex:0,//swiper的index
    id: "", //  当前英雄的id
    heroData: {},//整体数据
    skins: [],//皮肤数据
    rolesConfig: {
      "mage": "法师",
      "support": "辅助",
      "fighter": "战士",
      "tank": "坦克",
      "marksman": "射手",
      "assassin": "刺客",
    },//角色定位配置
    sortedSpells:[],//排序后的数组
    spellsKey:"",//查看的技能是哪个
    keyIndex:-1,//这个技能对应的下标
    fixedOrder:["passive", "q", "w", "e", "r"],//固定的技能顺序
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.setData({
        id: options.id
      })
      this.getDetail();
    }
  },
  getDetail() {
    const id = this.data.id;
    const _this = this;
    wx.request({
      url: `https://game.gtimg.cn/images/lol/act/img/js/hero/${id}.js`,
      success(res) {
        const skins = res.data.skins.filter(item => item.iconImg);
        const sortedSpells = _this.sortSkillsByFixedOrder(res.data.spells);
        _this.setData({
          heroData: res.data,
          skins,
          sortedSpells,
        })
        console.log(res.data)
      }
    })
  },
  /**
   * 根据固定顺序对技能数组进行排序
   * @param {Array} skills - 技能对象数组
   * @param {string} keyField - 排序依据的字段名，默认为 'spellKey'
   * @returns {Array} 排序后的新数组
   */
  sortSkillsByFixedOrder(skills, keyField = 'spellKey') {
    if (!Array.isArray(skills)) {
      return [];
    }

    // 定义固定顺序
    const fixedOrder = ["passive", "q", "w", "e", "r"];

    // 创建顺序映射表，提高查找效率
    const orderMap = new Map();
    fixedOrder.forEach((key, index) => {
      orderMap.set(key, index);
    });

    // 过滤并排序
    return skills
      .filter(skill => {
        // 确保技能存在且spellKey在固定顺序中
        return skill && skill[keyField] && orderMap.has(skill[keyField]);
      })
      .sort((a, b) => {
        const orderA = orderMap.get(a[keyField]);
        const orderB = orderMap.get(b[keyField]);
        return orderA - orderB;
      });
  },
  showDescription(e){
    const spellsKey = e.target.dataset.key || e.currentTarget.dataset.key || "";
    const keyIndex = this.data.fixedOrder.findIndex(i=>i == spellsKey);
    if(keyIndex >= 0){
      this.setData({
        spellsKey,keyIndex,
      })
    }
  },
  swiperIndexChange(e){
    const swiperIndex = e.detail.current;
    this.setData({
      swiperIndex
    })
  },
  filterNumber(num){
    console.log(num,'num')
    return parseInt(num)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

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