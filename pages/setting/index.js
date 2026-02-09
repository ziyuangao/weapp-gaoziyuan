// pages/menu-config/index.js
const utils = require('../../utils/util.js');
Page({
  data: {
    // 菜单列表数据（完整数据，包含checked状态）
    menuList: [],
    // 当前选中的菜单项数量
    selectedCount: 0,
    // 当前选中的id数组
    selectedIds: []
  },

  // 页面加载
  onLoad() {
    // 静态菜单数据
    const allRouterConfig = utils.allMenuList;

    // 初始化菜单数据（处理选中状态）
    this.initMenuData(allRouterConfig);
  },

  // 初始化菜单数据
  initMenuData(allConfig) {
    // 尝试从本地存储读取用户配置
    let savedIds = [];
    try {
      const savedConfig = wx.getStorageSync('routeConfig');
      if (savedConfig && Array.isArray(savedConfig)) {
        savedIds = savedConfig;
      }
    } catch (error) {
      console.warn('读取本地存储失败:', error);
    }

    // 处理每个菜单项的初始选中状态
    const menuList = allConfig.map(item => {
      // 如果有保存的配置，使用保存的配置
      if (savedIds.length > 0) {
        return {
          ...item,
          checked: savedIds.includes(item.id)
        };
      }

      // 如果没有保存的配置，除了禁用的都默认选中
      return {
        ...item,
        checked: !item.disabled // 不禁用的默认选中
      };
    });

    // 计算初始选中数量和id数组
    const initialSelectedIds = menuList
      .filter(item => item.checked)
      .map(item => item.id);

    this.setData({
      menuList,
      selectedCount: initialSelectedIds.length,
      selectedIds: initialSelectedIds
    });
  },

  // 菜单选择变化事件
  onMenuChange(e) {
    const selectedIds = e.detail.value.map(id => parseInt(id));

    // 更新菜单列表的选中状态
    const updatedMenuList = this.data.menuList.map(item => ({
      ...item,
      checked: selectedIds.includes(item.id)
    }));

    this.setData({
      menuList: updatedMenuList,
      selectedCount: selectedIds.length,
      selectedIds
    });
  },
  // 确认保存
  onConfirm() {
    // 1. 验证至少选择一项
    if (this.data.selectedCount === 0) {
      wx.showToast({
        title: '请至少选择一项',
        icon: 'none',
        duration: 2000
      });
      return;
    }
  
    try {
      // 2. 保存到本地存储
      wx.setStorageSync('routeConfig', this.data.selectedIds);
      
      // 3. 显示成功提示
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1300,
        success(){
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      });
      
      // 4. 获取页面栈并调用首页的更新方法
      const pages = getCurrentPages();
      if (pages.length >= 2) {
        const prevPage = pages[pages.length - 2]; // 上一页（首页）
        
        if (prevPage && typeof prevPage.getMenuList === 'function') {
          // 调用首页的更新方法
          prevPage.getMenuList();
        }
      }
      
      // 5. 可选：记录日志
      console.log('菜单配置已保存:', this.data.selectedIds);
    } catch (error) {
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'error',
        duration: 2000
      });
    }
  },
});