// pages/bmi/index.js
Page({
  data: {
    // 输入数据
    height: '',
    weight: '',
    
    // 错误提示
    heightError: '',
    weightError: '',
    
    // 加载状态
    isLoading: false,
    
    // 结果数据
    showResult: false,
    bmiResult: '',
    healthAdvice: '',
    
    // 网络错误提示
    showNetworkError: false
  },

  // 身高输入
  onHeightInput(e) {
    this.setData({ 
      height: e.detail.value,
      // 输入变化时隐藏结果
      showResult: false,
      // 清空当前字段的错误提示
      heightError: '' 
    });
  },

  // 体重输入
  onWeightInput(e) {
    this.setData({ 
      weight: e.detail.value,
      // 输入变化时隐藏结果
      showResult: false,
      // 清空当前字段的错误提示
      weightError: '' 
    });
  },

  // 输入验证函数
  validateInput() {
    const { height, weight } = this.data;
    let isValid = true;
    let heightError = '';
    let weightError = '';

    // 验证身高
    if (!height) {
      heightError = '请输入身高';
      isValid = false;
    } else if (isNaN(height)) {
      heightError = '请输入有效的数字';
      isValid = false;
    } else if (parseFloat(height) <= 0) {
      heightError = '请输入正数';
      isValid = false;
    } else if (parseFloat(height) <= 30 || parseFloat(height) >= 230) {
      heightError = '身高需在30-230cm之间';
      isValid = false;
    }

    // 验证体重
    if (!weight) {
      weightError = '请输入体重';
      isValid = false;
    } else if (isNaN(weight)) {
      weightError = '请输入有效的数字';
      isValid = false;
    } else if (parseFloat(weight) <= 0) {
      weightError = '请输入正数';
      isValid = false;
    } else if (parseFloat(weight) <= 10 || parseFloat(weight) >= 200) {
      weightError = '体重需在10-200kg之间';
      isValid = false;
    }

    this.setData({ heightError, weightError });
    return isValid;
  },

  // 计算按钮点击事件
  async onCalculate() {
    // 1. 验证输入
    if (!this.validateInput()) {
      return;
    }

    // 2. 显示加载状态
    this.setData({ 
      isLoading: true,
      showNetworkError: false 
    });

    try {
      // 3. 调用API
      const { height, weight } = this.data;
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: 'https://v2.xxapi.cn/api/bmi',
          method: 'GET',
          data: {
            height: parseFloat(height),
            weight: parseFloat(weight)
          },
          success: resolve,
          fail: reject
        });
      });

      // 4. 处理API响应
      if (res.statusCode === 200 && res.data.code === 200) {
        this.setData({
          bmiResult: parseFloat(res.data.data.bmi).toFixed(2),
          healthAdvice: res.data.data.msg,
          showResult: true,
          isLoading: false
        });
      } else {
        // API返回业务错误
        this.showNetworkError();
      }
    } catch (error) {
      // 网络或请求错误
      console.error('API请求失败:', error);
      this.showNetworkError();
    }
  },

  // 显示网络错误
  showNetworkError() {
    this.setData({ 
      isLoading: false,
      showNetworkError: true 
    });

    // 3秒后自动隐藏错误提示
    setTimeout(() => {
      this.setData({ showNetworkError: false });
    }, 3000);
  },

  // 页面加载
  onLoad() {
    // 可以在这里添加一些初始化逻辑
    console.log('BMI计算页面加载完成');
  }
});