// pages/nasa-apod/index.js
const utils = require('../../utils/util.js');
Page({
  data: {
    // 图片数据
    imageData: {
      title: '',
      date: '',
      explanation: '',
      copyright: '',
      url: '',
      showChinese: false,          // 当前是否显示中文
      translatedText: '',          // 翻译后的中文文本
      isTranslating: false,        // 是否正在翻译
      hasTranslated: false         // 是否已经翻译过（避免重复请求）
    },
    
    // 加载状态
    isLoading: false,      // 接口请求状态
    isImageLoading: true   // 图片加载状态
  },

  // 页面加载
  onLoad() {
    this.fetchImage();
  },

  // 获取图片数据
  fetchImage() {
    if (this.data.isLoading) return;
    
    this.setData({
      isLoading: true,
      isImageLoading: true,
      // 清空旧数据，显示加载状态
      imageData: {
        title: '',
        date: '',
        explanation: '',
        copyright: '',
        url: '',
      },
      showChinese: false,
      translatedText: '',
      isTranslating: false,
      hasTranslated: false,
      isLoading: false
    });
    
    wx.request({
      url: 'https://api.nasa.gov/planetary/apod',
      method: 'GET',
      data: {
        api_key: utils.NASA_KEY,
        count:1,
      },
      success: (res) => {
        console.log('NASA API 响应:', res.data);
        
        if (res.statusCode === 200 && res.data) {
          const resData = res.data[0];
          // 处理成功响应
          this.setData({
            imageData: {
              title: resData.title || '无标题',
              date: resData.date || '',
              explanation: resData.explanation || '',
              copyright: resData.copyright || '',
              url: resData.url || ''
            },
            showChinese: false,
            translatedText: '',
            isTranslating: false,
            hasTranslated: false,
            isLoading: false
          });
          // 注意：isImageLoading 状态由 bindload 事件控制
        } else {
          this.handleError('返回数据格式异常');
        }
      },
      fail: (error) => {
        console.error('请求失败:', error);
        this.handleError('网络请求失败，请重试');
      }
    });
  },

  // 图片加载成功
  onImageLoad() {
    console.log('图片加载完成');
    this.setData({ isImageLoading: false });
  },

  // 图片加载失败
  onImageError(e) {
    console.warn('图片加载失败:', e.detail.errMsg);
    this.setData({ isImageLoading: false });
    wx.showToast({
      title: '图片加载失败',
      icon: 'error',
      duration: 2000
    });
  },

  // 统一错误处理
  handleError(message) {
    this.setData({
      isLoading: false,
      isImageLoading: false
    });
    
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 3000
    });
  },
  onToggleTranslate() {
    // 如果当前显示英文，点击后要切换到中文
    if (!this.data.showChinese) {
      this.showChineseTranslation();
    } else {
      // 当前显示中文，点击切换回英文
      this.setData({
        showChinese: false
      });
    }
  },
  
  // 新增方法：显示中文翻译（核心）
  showChineseTranslation() {
    // 情况1：已经翻译过，直接显示
    if (this.data.hasTranslated) {
      this.setData({
        showChinese: true
      });
      return;
    }
  
    // 情况2：正在翻译中，不重复触发
    if (this.data.isTranslating) return;
  
    // 情况3：首次翻译，发起请求
    this.setData({
      isTranslating: true,
      showChinese: true  // 先切换到中文视图，显示“翻译中...”
    });
  
    wx.request({
      url: 'https://uapis.cn/api/v1/translate/text?to_lang=zh-CHS',
      method: 'POST',
      data: {
        text: this.data.imageData.explanation
      },
      success: (res) => {
        console.log('翻译接口响应:', res.data);
        if (res.data && res.data.text) {
          this.setData({
            translatedText: res.data.translate,
            hasTranslated: true,
            isTranslating: false
          });
        } else {
          this.handleTranslateFail('翻译结果解析失败');
        }
      },
      fail: (err) => {
        console.error('翻译请求失败:', err);
        this.handleTranslateFail('翻译请求失败');
      }
    });
  },
  
  // 新增方法：处理翻译失败
  handleTranslateFail(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
    // 翻译失败，切换回英文显示
    this.setData({
      showChinese: false,
      isTranslating: false
    });
  },
});