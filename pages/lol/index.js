// pages/lol/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lolData: {},//全部的LOL接口数据
    keyword:'',//搜索关键词
    resultArr:[],//页面用来展示的数组 过滤后的信息
    currentType: "", //当前选择的数据类型 字符串值为 rolesConfig 的key
    rolesConfig: [
      { key: "mage", value: "法师" },
      { key: "support", value: "辅助" },
      { key: "fighter", value: "战士" },
      { key: "tank", value: "坦克" },
      { key: "marksman", value: "射手" },
      { key: "assassin", value: "刺客" },
    ],//全部数据中 lolData.hero 中每一项 roles对应的中文
    loading: true,  // 增加加载状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getLOLData()
  },
  /**
   * 获取全部LOL数据信息
   */
  getLOLData() {
    const _this = this;
    wx.request({
      url: "https://game.gtimg.cn/images/lol/act/img/js/heroList/hero_list.js",
      success(res) {
        const lolData = res.data;
        // const roles = _this.getAllRoles(lolData);
        _this.setData({
          lolData,
          resultArr:lolData.hero,
          loading: false
        })
      },
      fail(err) {
        _this.setData({
          loading: false
        });
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      }
    })
  },
  /**
   * 获取所有英雄的roles合集（去重）
   * @param {Object} loldata - 英雄数据对象
   * @returns {Array} 去重后的roles数组
   */
  getAllRoles(loldata) {
    if (!loldata || !loldata.hero || !Array.isArray(loldata.hero)) {
      return [];
    }

    const rolesSet = new Set();

    loldata.hero.forEach(hero => {
      if (hero.roles && Array.isArray(hero.roles)) {
        hero.roles.forEach(role => {
          if (typeof role === 'string' && role.trim()) {
            rolesSet.add(role.trim());
          }
        });
      }
    });

    return Array.from(rolesSet);
  },
  /**
   * 
   * @param {event} e 点击事件 获取内部 type 值
   * 二次点击 恢复初始值
   */
  quickLinkTap(e) {
    const currentType = e.target.dataset.type || e.currentTarget.dataset.type || "";
    if (currentType == this.data.currentType) {
      this.setData({
        currentType: ""
      })
    } else {
      this.setData({
        currentType
      })
    }
    this.handleSearch();
  },
  handleGetResult(e){
    const keyword = e.detail.value || "";
    this.setData({
      keyword:keyword
    })
    this.handleSearch();
  },
  handleSearch(){
    const keyword = this.data.keyword;
    const type = this.data.currentType;
    const heroList = this.data.lolData?.hero || [];  // 安全访问
    
    let result = [];
    
    if(!keyword && !type){
      result = heroList;
    } else {
      result = heroList.filter(item=>{
        // 只存在类型时
        if(!keyword && type){
          return item.roles?.includes(type) || false;
        }
        
        // 处理关键词搜索
        let keywordMatch = false;
        if(keyword){
          const keywords = item.keywords || "";
          const keywordArr = keywords.toString().split(',');
          // 不区分大小写搜索
          keywordMatch = keywordArr.some(i => 
            i.toLowerCase().includes(keyword.toLowerCase())
          );
        }
        
        // 只存在关键词时
        if(keyword && !type){
          return keywordMatch;
        }
        
        // 同时存在关键词和类型
        if(keyword && type){
          return (item.roles?.includes(type) || false) && keywordMatch;
        }
        
        return false;
      })
    }
    
    this.setData({
      resultArr:result
    })
  },
  getDetail(e){
    const id = e.target.dataset.id || e.currentTarget.dataset.id || "";
    console.log(id)
    if(id){
      wx.navigateTo({
        url:`/pages/lolDetail/index?id=${id}`
      })
    } else {
      wx.showToast({
        title:"未查询到英雄信息，请确认该英雄是否存在",
        icon:"error",
      }) 
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

})