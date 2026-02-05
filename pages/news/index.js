// pages/hot-board/index.js
Page({
  data: {
    // 平台分类数据（严格按照你提供的5大分组）
    platformGroups: [{
        name: '视频/社区',
        platforms: [{
            name: '哔哩哔哩',
            value: 'bilibili'
          },
          {
            name: 'A站',
            value: 'acfun'
          },
          {
            name: '微博',
            value: 'weibo'
          },
          {
            name: '知乎',
            value: 'zhihu'
          },
          {
            name: '知乎日报',
            value: 'zhihu-daily'
          },
          {
            name: '抖音',
            value: 'douyin'
          },
          {
            name: '快手',
            value: 'kuaishou'
          },
          {
            name: '豆瓣电影',
            value: 'douban-movie'
          },
          {
            name: '豆瓣小组',
            value: 'douban-group'
          },
          {
            name: '贴吧',
            value: 'tieba'
          },
          {
            name: '虎扑',
            value: 'hupu'
          },
          {
            name: 'NGA',
            value: 'ngabbs'
          }
        ]
      },
      {
        name: '新闻/资讯',
        platforms: [{
            name: '百度',
            value: 'baidu'
          },
          {
            name: '澎湃',
            value: 'thepaper'
          },
          {
            name: '今日头条',
            value: 'toutiao'
          },
          {
            name: '腾讯新闻',
            value: 'qq-news'
          },
          {
            name: '新浪',
            value: 'sina'
          },
          {
            name: '新浪新闻',
            value: 'sina-news'
          },
          {
            name: '网易新闻',
            value: 'netease-news'
          },
          {
            name: '虎嗅',
            value: 'huxiu'
          },
          {
            name: '爱范儿',
            value: 'ifanr'
          }
        ]
      },
      {
        name: '技术/IT',
        platforms: [{
            name: '少数派',
            value: 'sspai'
          },
          {
            name: 'IT之家',
            value: 'ithome'
          },
          {
            name: 'IT之家·喜加一',
            value: 'ithome-xijiayi'
          },
          {
            name: '掘金',
            value: 'juejin'
          },
          {
            name: '简书',
            value: 'jianshu'
          },
          {
            name: '果壳',
            value: 'guokr'
          },
          {
            name: '36氪',
            value: '36kr'
          },
          {
            name: '51CTO',
            value: '51cto'
          },
          {
            name: 'CSDN',
            value: 'csdn'
          },
          {
            name: 'NodeSeek',
            value: 'nodeseek'
          },
          {
            name: 'HelloGitHub',
            value: 'hellogithub'
          }
        ]
      },
      {
        name: '游戏',
        platforms: [{
            name: '英雄联盟',
            value: 'lol'
          },
          {
            name: '原神',
            value: 'genshin'
          },
          {
            name: '崩坏3',
            value: 'honkai'
          },
          {
            name: '星穹铁道',
            value: 'starrail'
          }
        ]
      },
      {
        name: '其他',
        platforms: [{
            name: '微信读书',
            value: 'weread'
          },
          {
            name: '天气预警',
            value: 'weatheralarm'
          },
          {
            name: '地震速报',
            value: 'earthquake'
          },
          {
            name: '历史上的今天',
            value: 'history'
          }
        ]
      }
    ],

    // Picker数据
    pickerRange: [
      [],
      []
    ], // 第一列：分类，第二列：平台
    pickerValue: [0, 0], // 当前选中的索引

    // 当前选择
    selectedCategory: '',
    selectedPlatform: '',
    selectedPlatformValue: '',

    // 热榜数据
    listData: [],
    updateTime: '',

    // 状态
    isLoading: false,
    showEmpty: false
  },

  // 页面加载
  onLoad() {
    this.initPickerData();
  },

  // 初始化Picker数据
  initPickerData() {
    // 第一列：分类名称
    const categoryNames = this.data.platformGroups.map(group => group.name);

    // 第二列：默认显示第一个分类下的平台
    const firstGroupPlatforms = this.data.platformGroups[0].platforms.map(p => p.name);

    this.setData({
      pickerRange: [categoryNames, firstGroupPlatforms],
      // 默认选中第一个分类的第一个平台（但不会触发请求，等待用户手动选择）
      selectedCategory: categoryNames[0],
      selectedPlatform: firstGroupPlatforms[0],
      selectedPlatformValue: this.data.platformGroups[0].platforms[0].value
    });
  },

  // Picker列变化（滑动某一列时）
  onPickerColumnChange(e) {
    const {
      column,
      value
    } = e.detail;
    const newPickerValue = [...this.data.pickerValue];
    newPickerValue[column] = value;

    // 如果滑动的是第一列（分类），需要更新第二列（平台）的数据
    if (column === 0) {
      const selectedGroup = this.data.platformGroups[value];
      const platformNames = selectedGroup.platforms.map(p => p.name);

      // 更新第二列数据，并重置第二列的选中索引为0
      newPickerValue[1] = 0;

      this.setData({
        pickerRange: [this.data.pickerRange[0], platformNames],
        pickerValue: newPickerValue,
        // 更新当前选中的平台信息
        selectedCategory: selectedGroup.name,
        selectedPlatform: platformNames[0],
        selectedPlatformValue: selectedGroup.platforms[0].value
      });
    } else {
      // 如果滑动的是第二列（平台），只更新当前选中的平台信息
      const categoryIndex = this.data.pickerValue[0];
      const platformIndex = value;
      const selectedGroup = this.data.platformGroups[categoryIndex];

      this.setData({
        pickerValue: newPickerValue,
        selectedPlatform: selectedGroup.platforms[platformIndex].name,
        selectedPlatformValue: selectedGroup.platforms[platformIndex].value
      });
    }
  },

  // Picker确定选择
  onPickerChange(e) {
    const value = e.detail.value;
    const categoryIndex = value[0];
    const platformIndex = value[1];

    const selectedGroup = this.data.platformGroups[categoryIndex];
    const selectedPlatformObj = selectedGroup.platforms[platformIndex];

    // 更新选中状态
    this.setData({
      pickerValue: value,
      selectedCategory: selectedGroup.name,
      selectedPlatform: selectedPlatformObj.name,
      selectedPlatformValue: selectedPlatformObj.value
    });

    // 加载热榜数据
    this.loadHotBoardData();
  },

  // 加载热榜数据
  async loadHotBoardData() {
    if (!this.data.selectedPlatformValue) return;

    this.setData({
      isLoading: true,
      showEmpty: false,
      listData: [],
      updateTime: ''
    });

    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `https://uapis.cn/api/v1/misc/hotboard?type=${this.data.selectedPlatformValue}`,
          method: 'GET',
          success: resolve,
          fail: reject,
          timeout: 10000
        });
      });

      console.log('热榜接口响应:', res.data);

      // 处理业务错误（如参数错误）
      if (res.data && res.data.code) {
        throw new Error(res.data.message || `接口错误: ${res.data.code}`);
      }

      // 处理成功响应
      if (res.data && res.data.list) {
        const listData = res.data.list;

        this.setData({
          listData: listData,
          updateTime: res.data.update_time || '',
          showEmpty: listData.length === 0,
          isLoading: false
        });
      } else {
        throw new Error('返回数据格式异常');
      }

    } catch (error) {
      console.error('加载热榜失败:', error);

      this.setData({
        isLoading: false,
        showEmpty: true,
        listData: []
      });

      wx.showToast({
        title: error.message || '加载失败，请重试',
        icon: 'none',
        duration: 3000
      });
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    if (this.data.selectedPlatformValue && !this.data.isLoading) {
      this.loadHotBoardData();
    } else {
      wx.stopPullDownRefresh();
    }
  },
  // 热榜条目点击事件
  onItemTap(e){
    const url = e.currentTarget.dataset.url;
    const index = e.currentTarget.dataset.index;
    const title = this.data.listData[index].title;
    
    if (!url) {
      wx.showToast({
        title: '该条目暂无链接',
        icon: 'none'
      });
      return;
    }
    
    // 调用复制功能
    wx.setClipboardData({
      data: url,
      success: () => {
        // 复制成功后的提示，可以引导用户去浏览器打开
        wx.showModal({
          title: '链接已复制',
          content: `“${title}”的链接已复制到剪贴板。\n请粘贴到手机浏览器中打开查看。`,
          confirmText: '知道了',
          showCancel: false,
          confirmColor: '#07c160'
        });
      },
      fail: (err) => {
        console.error('复制链接失败:', err);
        wx.showToast({
          title: '复制失败',
          icon: 'error'
        });
      }
    })
  }
});