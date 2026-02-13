// pages/phone-info/index.js
Page({
  data: {
    // 输入相关
    phoneNumber: '',        // 当前输入的手机号
    isBtnValid: false,     // 查询按钮是否可用
    isQuerying: false,     // 是否正在查询
    
    // 结果相关
    showResult: false,     // 是否显示结果卡片
    locationText: '',      // 归属地文本（省份 + 城市）
    carrierText: ''       // 运营商文本
  },

  // 手机号输入
  onPhoneInput(e) {
    const value = e.detail.value;
    
    // 实时校验手机号格式
    const isValid = this.validatePhone(value);
    
    // 更新数据
    this.setData({
      phoneNumber: value,
      isBtnValid: isValid,
      // 重要：只要用户修改输入框，立即隐藏上一次的查询结果
      showResult: false
    });
  },

  // 手机号格式校验
  validatePhone(phone) {
    if (!phone) return false;
    // 规则：11位数字，以1开头
    const reg = /^1\d{10}$/;
    return reg.test(phone);
  },

  // 点击查询
  onQuery() {
    // 二次校验（虽然按钮已控制，但防止特殊情况）
    if (!this.validatePhone(this.data.phoneNumber)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 开始查询
    this.setData({
      isQuerying: true,
      showResult: false  // 确保旧结果被清除
    });

    // 发起请求
    wx.request({
      url: `https://uapis.cn/api/v1/misc/phoneinfo`,
      method: 'GET',
      data: {
        phone: this.data.phoneNumber
      },
      timeout: 10000,
      success: (res) => {
        console.log('归属地接口响应:', res.data);
        
        // 处理业务错误（如参数错误）
        if (res.data && res.data.code) {
          wx.showToast({
            title: res.data.message || '查询失败',
            icon: 'none',
            duration: 3000
          });
          this.setData({
            isQuerying: false,
            showResult: false
          });
          return;
        }
        
        // 处理成功响应
        if (res.data && res.data.province && res.data.city && res.data.sp) {
          // 构建显示文本
          const location = `${res.data.province} · ${res.data.city}`;
          const carrier = this.formatCarrier(res.data.sp);
          
          this.setData({
            locationText: location,
            carrierText: carrier,
            showResult: true,
            isQuerying: false
          });
        } else {
          // 数据格式异常
          wx.showToast({
            title: '返回数据异常',
            icon: 'none',
            duration: 2000
          });
          this.setData({
            isQuerying: false,
            showResult: false
          });
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        wx.showToast({
          title: '网络请求失败，请重试',
          icon: 'none',
          duration: 2000
        });
        this.setData({
          isQuerying: false,
          showResult: false
        });
      }
    });
  },

  // 格式化运营商名称
  formatCarrier(sp) {
    if (!sp) return '未知';
    
    // 常见的运营商名称映射
    const map = {
      '移动': '中国移动',
      '联通': '中国联通',
      '电信': '中国电信',
      '广电': '中国广电'
    };
    
    return map[sp] || sp;
  },

  // 页面卸载时清理（可选）
  onUnload() {
    // 无需特别清理
  }
});