// pages/playboy/index.js
Page({
  data: {
    // 视频数据
    videoUrl: '',
    showSwipeGuide:true,
    // 加载状态
    isLoading: false,

    // 错误状态
    showErrorRetry: false,

    // 冷却状态
    lastRequestTime: 0,
    coolingTime: 3,
    showCoolingToast: false,
    coolingTimer: null,

    // 手势识别
    touchStartY: 0,
    touchStartTime: 0,

    // 当前请求的标记（用于防止重试过时的请求）
    currentRequestId: 0
  },

  // 页面加载
  onLoad() {
    // 首次加载视频
    this.fetchVideo();
    // 3秒后隐藏上滑指引
    setTimeout(() => {
      this.setData({ showSwipeGuide: false });
    }, 3000);
  },

  // 触摸开始
  onTouchStart(e) {
    // 记录起始位置和时间
    this.setData({
      touchStartY: e.touches[0].clientY,
      touchStartTime: Date.now()
    });
  },

  // 触摸结束（判断上滑）
  onTouchEnd(e) {
    const endY = e.changedTouches[0].clientY;
    const endTime = Date.now();
    const startY = this.data.touchStartY;
    const startTime = this.data.touchStartTime;

    // 防御性检查：确保有起始数据
    if (!startY || !startTime) return;

    const distance = startY - endY; // 上滑为正
    const duration = endTime - startTime;

    // 调试日志：打印滑动信息
    console.log(`滑动检测: 距离=${distance}px, 时长=${duration}ms`);

    // 判定为有效上滑：距离>60rpx且时间<500ms
    // 关键：将像素距离转换为rpx
    const systemInfo = wx.getSystemInfoSync();
    const windowWidth = systemInfo.windowWidth;
    const distanceRpx = distance * (750 / windowWidth);

    if (distanceRpx > 60 && duration < 500) {
      console.log('检测到有效上滑，切换视频');
      this.fetchVideo();
    } else {
      console.log('滑动不满足条件，忽略');
    }

    // 重置起始数据，避免重复误判
    this.setData({
      touchStartY: 0,
      touchStartTime: 0
    });
  },

  fetchVideo() {
    // 1. 冷却检查
    const now = Date.now();
    if (now - this.data.lastRequestTime < 3000) {
      this.showCoolingToast();
      return;
    }

    // 2. 生成当前请求ID
    const requestId = Date.now();
    this.setData({
      currentRequestId: requestId
    });

    // 3. 更新状态
    this.setData({
      isLoading: true,
      showErrorRetry: false,
      videoUrl: '' // 清空当前视频，显示加载状态
    });

    // 4. 发起请求（正确的小程序API调用方式）
    wx.request({
      url: 'https://v2.xxapi.cn/api/meinv',
      method: 'GET',
      header: {
        'Authorization': 'a7fb901638f1a683'
      },
      timeout: 10000,
      success: (res) => {
        console.log('接口请求成功:', res);

        // 检查请求是否已过时
        if (this.data.currentRequestId !== requestId) {
          console.log('请求已过时，忽略结果');
          return;
        }

        // 处理响应数据
        if (res.statusCode === 200 && res.data.code === 200) {
          const videoUrl = res.data.data;

          if (videoUrl && this.isValidVideoUrl(videoUrl)) {
            this.setData({
              videoUrl: videoUrl,
              lastRequestTime: now
            });

            // 启动冷却计时器
            this.startCoolingTimer();

            // 延迟隐藏loading，避免闪烁
            setTimeout(() => {
              if (this.data.currentRequestId === requestId) {
                this.setData({
                  isLoading: false
                });
              }
            }, 500);

          } else {
            this.handleRequestError(new Error('返回的视频URL无效'), requestId);
          }
        } else {
          this.handleRequestError(
            new Error(res.data.msg || `接口错误，状态码：${res.statusCode}`),
            requestId
          );
        }
      },
      fail: (error) => {
        console.error('请求失败:', error);
        this.handleRequestError(error, requestId);
      }
    });
  },

  // 新增：统一处理请求错误
  handleRequestError(error, requestId) {
    // 检查请求是否已过时
    if (this.data.currentRequestId !== requestId) return;

    console.error('获取视频失败:', error);
    this.setData({
      showErrorRetry: true,
      isLoading: false
    });
  },

  // 视频播放错误（视频加载失败）
  onVideoError(e) {
    console.warn('视频播放错误:', e.detail.errMsg);
    // 这里不处理，由video组件自身显示错误状态
  },

  // 视频播放结束
  onVideoEnded() {
    console.log('视频播放结束');
    // 可以在这里添加播放结束后的逻辑，如自动播放下一个
  },

  // 重试按钮点击
  onRetryTap() {
    this.setData({
      showErrorRetry: false
    });
    this.fetchVideo();
  },

  // 显示冷却提示
  showCoolingToast() {
    const coolingTime = Math.ceil((3000 - (Date.now() - this.data.lastRequestTime)) / 1000);

    this.setData({
      showCoolingToast: true,
      coolingTime: coolingTime
    });

    // 2秒后隐藏提示
    setTimeout(() => {
      this.setData({
        showCoolingToast: false
      });
    }, 2000);
  },

  // 启动冷却计时器
  startCoolingTimer() {
    if (this.data.coolingTimer) {
      clearInterval(this.data.coolingTimer);
    }

    this.setData({
      coolingTime: 3,
      coolingTimer: setInterval(() => {
        let coolingTime = this.data.coolingTime - 1;

        if (coolingTime <= 0) {
          clearInterval(this.data.coolingTimer);
          this.setData({
            coolingTimer: null
          });
        } else {
          this.setData({
            coolingTime: coolingTime
          });
        }
      }, 1000)
    });
  },

  // 验证视频URL
  isValidVideoUrl(url) {
    return url && (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('//')
    );
  },

  // 页面卸载清理
  onUnload() {
    if (this.data.coolingTimer) {
      clearInterval(this.data.coolingTimer);
    }
  }
});