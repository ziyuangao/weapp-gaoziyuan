// pages/answer-book/index.js
Page({
  data: {
    // 输入相关
    question: '',
    questionLength: 0,
    
    // 展示相关
    currentQuestion: '',
    currentAnswer: '',
    showAnswer: false,
    
    // 状态
    isLoading: false
  },

  // 问题输入
  onQuestionInput(e) {
    const value = e.detail.value;
    this.setData({
      question: value,
      questionLength: value.length
    });
  },

  // 点击提问
  onAskQuestion() {
    const question = this.data.question.trim();
    
    // 1. 输入验证
    if (!question) {
      wx.showToast({
        title: '请先输入你的问题',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 2. 设置加载状态
    this.setData({ isLoading: true });
    
    // 3. 发起请求
    wx.request({
      url: `https://uapis.cn/api/v1/answerbook/ask?question=${encodeURIComponent(question)}`,
      method: 'GET',
      success: (res) => {
        console.log('接口响应:', res.data);
        
        // 处理成功响应
        if (res.data && res.data.answer) {
          this.setData({
            currentQuestion: res.data.question || question,
            currentAnswer: res.data.answer,
            showAnswer: true
          });
        } 
        // 处理错误响应（如返回 {code: 400, message: ...}）
        else if (res.data && res.data.code) {
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none',
            duration: 2000
          });
        }
        // 处理其他意外情况
        else {
          wx.showToast({
            title: '返回数据格式异常',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (error) => {
        console.error('请求失败:', error);
        wx.showToast({
          title: '网络请求失败，请重试',
          icon: 'none',
          duration: 2000
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 页面加载
  onLoad() {
    console.log('答案之书页面加载');
  }
});