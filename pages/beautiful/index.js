// 例如：pages/random-image/index.js
Page({
  data: {
    // API池 (请在此处填入你的实际API地址)
    apiPool: [
      'https://v2.xxapi.cn/api/meinvpic',
      'https://v2.xxapi.cn/api/heisi',
      'https://v2.xxapi.cn/api/baisi',
      'https://v2.xxapi.cn/api/randomAcgPic',
      'https://v2.xxapi.cn/api/jk',
      'https://v2.xxapi.cn/api/yscos',
      'https://v2.xxapi.cn/api/wapmeinvpic',
    ],
    
    // 状态数据
    currentImageUrl: '',      // 当前显示的图片URL
    isLoading: false,         // 是否正在加载（请求或图片加载中）
    isError: false,           // 是否发生错误
    retryCount: 0,            // 当前重试次数
    maxRetryCount: 5,         // 最大重试次数
    
    // 冷却状态
    isCooling: false,         // 是否处于冷却中
    coolingTime: 3,           // 冷却时间(秒)
    coolingTimer: null,       // 冷却计时器
    
    // 统计
    displayCount: 0,          // 成功显示的图片数量
  },

  // 页面加载
  onLoad() {
    // 可以在这里初始化一些数据，或者加载第一张图片
    console.log('随机图片页面加载完成');
    this.onTapButton();
  },

  // 按钮点击事件
  onTapButton() {
    if (this.data.isLoading || this.data.isCooling) return;
    
    // 开始加载流程
    this.startLoadingImage();
    
    // 启动冷却计时器
    this.startCoolingTimer();
  },

  // 开始加载图片（核心方法）
  startLoadingImage() {
    this.setData({
      isLoading: true,
      isError: false,
      retryCount: 0,
      currentImageUrl: '' // 清空当前图片，显示Loading
    });
    
    // 开始请求流程
    this.fetchRandomImage(0);
  },

  // 递归获取图片（实现重试逻辑）
  async fetchRandomImage(retryAttempt) {
    if (retryAttempt >= this.data.maxRetryCount) {
      // 达到最大重试次数
      this.setData({
        isLoading: false,
        isError: true
      });
      wx.showToast({
        title: '尝试多次仍未找到图片',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    this.setData({ retryCount: retryAttempt + 1 });
    
    try {
      // 1. 从API池中随机选择一个
      const randomApi = this.getRandomApi();
      console.log(`尝试第${retryAttempt + 1}次，使用API:`, randomApi);
      
      // 2. 发送请求
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: randomApi,
          method: 'GET',
          success: resolve,
          fail: reject,
          timeout: 10000 // 10秒超时
        });
      });
      // 3. 处理响应
      if (res.statusCode === 200 && res.data.code === 200) {
        const imageUrl = res.data.data;
        if (imageUrl) {
          // 有效的图片URL，设置到data中（会触发image组件加载）
          this.setData({ currentImageUrl: imageUrl });
          // 注意：此时isLoading仍是true，等待图片加载完成
        } else {
          throw new Error('返回的图片URL无效');
        }
      } else {
        throw new Error(`API响应错误: ${res.data.msg || '未知错误'}`);
      }
      
    } catch (error) {
      console.error(`第${retryAttempt + 1}次请求失败:`, error);
      
      // 递归重试
      setTimeout(() => {
        this.fetchRandomImage(retryAttempt + 1);
      }, 500); // 失败后延迟500ms重试
    }
  },

  // 图片加载成功
  onImageLoad() {
    console.log('图片加载成功');
    this.setData({
      isLoading: false,
      isError: false,
      displayCount: this.data.displayCount + 1
    });
  },

  // 图片加载失败（image组件的binderror事件）
  onImageError() {
    console.warn('图片资源加载失败');
    
    if (this.data.retryCount < this.data.maxRetryCount) {
      // 图片加载失败也算一次重试
      const nextRetry = this.data.retryCount;
      setTimeout(() => {
        this.fetchRandomImage(nextRetry);
      }, 500);
    } else {
      this.setData({
        isLoading: false,
        isError: true
      });
    }
  },

  // 冷却计时器
  startCoolingTimer() {
    this.setData({
      isCooling: true,
      coolingTime: 3
    });
    
    const timer = setInterval(() => {
      let coolingTime = this.data.coolingTime - 1;
      
      if (coolingTime <= 0) {
        clearInterval(timer);
        this.setData({
          isCooling: false,
          coolingTimer: null
        });
      } else {
        this.setData({
          coolingTime: coolingTime
        });
      }
    }, 1000);
    
    this.setData({ coolingTimer: timer });
  },

  // 工具方法：从API池中随机选择一个
  getRandomApi() {
    const pool = this.data.apiPool;
    if (!pool || pool.length === 0) {
      throw new Error('API池为空');
    }
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  },
  // 页面卸载时清理
  onUnload() {
    if (this.data.coolingTimer) {
      clearInterval(this.data.coolingTimer);
    }
  }
});