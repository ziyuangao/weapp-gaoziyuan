// pages/oil-price/index.js
Page({
  data: {
    // 省份选择器数据
    provinceList: [],
    provinceIndex: -1,
    
    // 原始数据（所有省份）
    allProvinceData: [],
    
    // 格式化后的当前省份数据（供WXML直接使用）
    currentDisplayData: null,
    
    // 加载状态
    isLoading: true,
    
    // 空状态/错误状态
    showEmpty: false,
    emptyText: '',
    showRetry: false,
    
    // 轻提示
    showToast: false,
    toastMessage: ''
  },

  // 页面加载
  onLoad() {
    this.loadOilData();
  },

  // 加载油价数据
  async loadOilData() {
    this.setData({ isLoading: true, showEmpty: false });
    
    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: 'https://v2.xxapi.cn/api/oilPrice',
          method: 'GET',
          success: resolve,
          fail: reject
        });
      });

      // 处理响应数据
      if (res.statusCode === 200 && res.data.code === 200) {
        const provinceData = res.data.data || [];
        
        if (provinceData.length === 0) {
          // 数据为空
          this.setData({
            isLoading: false,
            showEmpty: true,
            emptyText: '暂无可用的油价数据',
            showRetry: true
          });
          return;
        }
        
        // 提取省份列表
        const provinceList = provinceData.map(item => item.regionName);
        
        this.setData({
          isLoading: false,
          allProvinceData: provinceData,
          provinceList: provinceList,
          provinceIndex: -1,
          currentDisplayData: null
        });
        
      } else {
        // 接口返回错误
        this.handleLoadError('数据加载失败，请重试');
      }
    } catch (error) {
      // 网络错误
      console.error('加载油价数据失败:', error);
      this.handleLoadError('网络异常，请检查网络连接');
    }
  },

  // 处理加载错误
  handleLoadError(message) {
    this.setData({
      isLoading: false,
      showEmpty: true,
      emptyText: message,
      showRetry: true
    });
  },

  // 省份选择变化 - 核心修改点
  onProvinceChange(e) {
    const index = e.detail.value;
    const rawData = this.data.allProvinceData[index];
    
    if (rawData) {
      // 格式化原始数据，生成可直接在WXML中使用的数据
      const displayData = this.formatProvinceData(rawData);
      
      this.setData({
        provinceIndex: index,
        currentDisplayData: displayData,
        showEmpty: false
      });
    }
  },

  // 格式化单个省份的所有数据
  formatProvinceData(rawData) {
    return {
      // 基础信息
      regionName: rawData.regionName || '--',
      date: rawData.date || '--',
      
      // 格式化后的油价列表
      oilItems: [
        {
          type: '92#汽油',
          price: this.formatPrice(rawData.n92),
          changeText: this.formatChangeText(rawData.n92Change),
          changeClass: this.getChangeClass(rawData.n92Change)
        },
        {
          type: '95#汽油',
          price: this.formatPrice(rawData.n95),
          changeText: this.formatChangeText(rawData.n95Change),
          changeClass: this.getChangeClass(rawData.n95Change)
        },
        {
          type: '98#汽油',
          price: this.formatPrice(rawData.n98),
          changeText: this.formatChangeText(rawData.n98Change),
          changeClass: this.getChangeClass(rawData.n98Change)
        },
        {
          type: '0#柴油',
          price: this.formatPrice(rawData.n0),
          changeText: this.formatChangeText(rawData.n0Change),
          changeClass: this.getChangeClass(rawData.n0Change)
        },
        {
          type: '89#汽油',
          price: this.formatPrice(rawData.n89),
          changeText: this.formatChangeText(rawData.n89Change),
          changeClass: this.getChangeClass(rawData.n89Change)
        }
      ]
    };
  },

  // 格式化价格（保留两位小数）
  formatPrice(price) {
    if (price === null || price === undefined) return '--';
    return parseFloat(price).toFixed(2) + ' 元/升';
  },

  // 格式化涨跌文本（返回已经包含箭头的字符串）
  formatChangeText(change) {
    if (change === null || change === undefined || change === 0) return '--';
    
    const num = parseFloat(change);
    const absNum = Math.abs(num);
    const arrow = num > 0 ? '↑' : '↓';
    
    return `${arrow}${absNum.toFixed(2)}`;
  },

  // 获取涨跌样式类名（返回CSS类名字符串）
  getChangeClass(change) {
    if (change === null || change === undefined || change === 0) {
      return 'change-neutral';
    }
    return parseFloat(change) > 0 ? 'change-up' : 'change-down';
  },

  // 重新加载
  onRetry() {
    this.loadOilData();
  },

  // 显示轻提示
  showToast(message) {
    this.setData({
      showToast: true,
      toastMessage: message
    });
    
    setTimeout(() => {
      this.setData({ showToast: false });
    }, 2500);
  }
});