// pages/white-noise/index.js
const innerAudioContext = wx.createInnerAudioContext();

Page({
  data: {
    // 声音数据
    soundList: [
      { id: 1, name: '柴火', desc: '温暖的噼啪声', file: '/pages/sleep/audio/1.mp3' },
      { id: 2, name: '夏夜', desc: '蝉鸣与微风', file: '/pages/sleep/audio/2.mp3' },
      { id: 3, name: '小雨', desc: '淅淅沥沥的雨声', file: '/pages/sleep/audio/3.mp3' }
    ],
    currentIndex: 0,        // 当前卡片索引
    currentSound: null,     // 当前声音对象
    currentSoundName: '',   // 当前声音名称（用于显示）
    
    // 播放状态
    isPlaying: false,
    
    // 定时选项
    timerOptions: ['5分钟', '10分钟', '20分钟', '30分钟'],
    timerValues: [5, 10, 20, 30], // 分钟为单位
    selectedTimerIndex: -1,  // -1表示未选择
    selectedTimerMinutes: 0,
    
    // 定时器状态
    isTimerActive: false,
    timerEndTime: 0,        // 结束时间戳（毫秒）
    timerRemainText: '',    // 剩余时间文字
    timerIntervalId: null,  // 定时器ID
    
    // UI 文字
    timerDisplayText: '定时关闭'
  },

  onLoad() {
    // 初始化第一个声音
    this.setData({
      currentSound: this.data.soundList[0],
      currentSoundName: this.data.soundList[0].name
    });
    
    // 配置音频
    this.initAudio();
  },

  // 初始化音频
  initAudio() {
    innerAudioContext.autoplay = false;
    innerAudioContext.loop = true;  // 单曲循环
    innerAudioContext.playbackRate = 0.75;//设置为0.75倍播放速度
    innerAudioContext.onError((res) => {
      console.error('音频播放错误:', res);
      wx.showToast({
        title: '音频播放失败',
        icon: 'none'
      });
      this.setData({ isPlaying: false });
    });
    
    innerAudioContext.onEnded(() => {
      // loop为true，不需要额外处理
      console.log('音频播放结束，自动循环');
    });
  },

  // Swiper 切换
  onSwiperChange(e) {
    const index = e.detail.current;
    const sound = this.data.soundList[index];
    
    // 停止当前播放
    this.stopPlayback();
    
    this.setData({
      currentIndex: index,
      currentSound: sound,
      currentSoundName: sound.name,
      isPlaying: false
    });
  },

  // 播放/暂停切换
  onPlayToggle() {
    if (!this.data.currentSound) return;
    
    if (this.data.isPlaying) {
      // 暂停
      innerAudioContext.pause();
      this.setData({ isPlaying: false });
    } else {
      // 播放
      this.playCurrentSound();
    }
  },

  // 播放当前声音
  playCurrentSound() {
    const sound = this.data.currentSound;
    if (!sound) return;
    
    // 设置音频源（本地文件）
    innerAudioContext.src = `${sound.file}`;
    
    innerAudioContext.play();
    this.setData({ isPlaying: true });
  },

  // 停止播放（用于切换卡片或退出）
  stopPlayback() {
    innerAudioContext.stop();
    this.setData({ isPlaying: false });
  },

  // 定时选择变化
  onTimerChange(e) {
    const index = parseInt(e.detail.value);
    const minutes = this.data.timerValues[index];
    
    this.setData({
      selectedTimerIndex: index,
      selectedTimerMinutes: minutes,
      timerDisplayText: `${minutes}分钟`
    });
  },

  // 确认/取消定时
  onTimerConfirm() {
    if (this.data.isTimerActive) {
      // 取消定时
      this.clearTimer();
      wx.showToast({
        title: '定时已取消',
        icon: 'success',
        duration: 1500
      });
    } else {
      // 确认定时
      if (this.data.selectedTimerIndex === -1) {
        wx.showToast({
          title: '请先选择时长',
          icon: 'none'
        });
        return;
      }
      
      this.startTimer();
      wx.showToast({
        title: '⏰ 定时已设置',
        icon: 'success',
        duration: 1500
      });
    }
  },

  // 启动定时器
  startTimer() {
    const minutes = this.data.selectedTimerMinutes;
    const now = Date.now();
    const endTime = now + minutes * 60 * 1000;
    
    // 清除可能存在的旧定时器
    this.clearTimer(false); // 不更新UI
    
    // 开始新定时器
    const intervalId = setInterval(() => {
      this.updateTimerRemain();
    }, 1000);
    
    this.setData({
      isTimerActive: true,
      timerEndTime: endTime,
      timerIntervalId: intervalId,
      timerDisplayText: `${minutes}分钟`
    });
    
    // 立即更新一次剩余时间
    this.updateTimerRemain();
  },

  // 更新剩余时间显示
  updateTimerRemain() {
    const now = Date.now();
    const remainMs = this.data.timerEndTime - now;
    
    if (remainMs <= 0) {
      // 定时结束
      this.onTimerComplete();
      return;
    }
    
    const remainMinutes = Math.floor(remainMs / 60000);
    const remainSeconds = Math.floor((remainMs % 60000) / 1000);
    
    let remainText = '';
    if (remainMinutes > 0) {
      remainText = `${remainMinutes}分${remainSeconds}秒`;
    } else {
      remainText = `${remainSeconds}秒`;
    }
    
    this.setData({
      timerRemainText: remainText
    });
  },

  // 定时完成
  onTimerComplete() {
    // 停止播放
    this.stopPlayback();
    // 清除定时器
    this.clearTimer();
    
    wx.showToast({
      title: '定时结束，晚安',
      icon: 'success',
      duration: 2000
    });
  },

  // 清除定时器
  clearTimer(updateUI = true) {
    if (this.data.timerIntervalId) {
      clearInterval(this.data.timerIntervalId);
    }
    
    if (updateUI) {
      this.setData({
        isTimerActive: false,
        timerEndTime: 0,
        timerIntervalId: null,
        timerRemainText: '',
        selectedTimerIndex: -1,
        timerDisplayText: '定时关闭'
      });
    } else {
      this.setData({
        isTimerActive: false,
        timerEndTime: 0,
        timerIntervalId: null,
        timerRemainText: ''
      });
    }
  },

  // 页面隐藏（切后台）
  onHide() {
    this.cleanup();
  },

  // 页面卸载
  onUnload() {
    this.cleanup();
  },

  // 统一清理方法
  cleanup() {
    // 停止播放
    this.stopPlayback();
    // 清除定时器
    this.clearTimer(true);
    // 销毁音频实例
    innerAudioContext.destroy();
  }
});