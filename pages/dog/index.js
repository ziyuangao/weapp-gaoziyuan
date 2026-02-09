// pages/dog-diary/index.js
Page({
  data: {
    // 文案内容
    diaryText: '',
    textLength: 0,
    
    // 生成图片的临时路径
    generatedImagePath: '',
    
    // 加载状态
    isLoadingRandom: false,
    isGenerating: false,
    
    // Canvas动态高度（rpx）
    canvasHeight: 1000, // 初始值，会被动态更新
    
    // 图片信息
    imageInfo: null
  },

  // 页面加载
  onLoad() {
    // 预加载背景图信息
    this.loadImageInfo();
  },

  // 加载背景图信息
  loadImageInfo() {
    const that = this;
    wx.getImageInfo({
      src: '../../assets/img/dog/dog.jpg',
      success(res) {
        that.setData({
          imageInfo: {
            width: res.width,    // 487px
            height: res.height,  // 330px
            path: res.path
          }
        });
      },
      fail(err) {
        console.error('加载图片失败:', err);
        wx.showToast({
          title: '加载模板失败',
          icon: 'error'
        });
      }
    });
  },

  // 文本输入事件
  onTextInput(e) {
    const text = e.detail.value;
    this.setData({
      diaryText: text,
      textLength: text.length,
      generatedImagePath:"",
      canvasHeight:1000
    });
  },

  // 获取随机文案
  async onRandomText() {
    if (this.data.isLoadingRandom) return;
    
    this.setData({ 
      isLoadingRandom: true,
      generatedImagePath:"",
      canvasHeight:1000
    });
    
    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: 'https://v2.xxapi.cn/api/dog',
          method: 'GET',
          success: resolve,
          fail: reject
        });
      });
      
      if (res.statusCode === 200 && res.data.code === 200) {
        // 获取当前日期
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const dateStr = `${year}年${month}月${day}日`;
        
        // 拼接日期和接口返回文案
        const fullText = `今天是${dateStr}，${res.data.data}`;
        
        this.setData({
          diaryText: fullText,
          textLength: fullText.length
        });
        
      } else {
        throw new Error('接口返回错误');
      }
      
    } catch (error) {
      console.error('获取随机文案失败:', error);
      wx.showToast({
        title: '获取文案失败',
        icon: 'error',
        duration: 2000
      });
    } finally {
      this.setData({ isLoadingRandom: false });
    }
  },

  // 生成图片
  async onGenerateImage() {
    if (!this.data.diaryText || this.data.isGenerating) return;
    if (!this.data.imageInfo) {
      wx.showToast({
        title: '模板加载中，请稍后',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ isGenerating: true });
    try {
      // 1. 计算画布尺寸
      const canvasInfo = this.calculateCanvasSize();
      this.setData({ canvasHeight: canvasInfo.heightRpx });
      
      // 2. 等待Canvas渲染
      await this.sleep(50);
      
      // 3. 绘制Canvas
      const tempFilePath = await this.drawCanvas(canvasInfo);
      // 4. 更新图片路径
      this.setData({
        generatedImagePath: tempFilePath
      });
      
      wx.showToast({
        title: '生成成功',
        icon: 'success',
        duration: 1500
      });
      
    } catch (error) {
      console.error('生成图片失败:', error);
      wx.showToast({
        title: '生成失败',
        icon: 'error',
        duration: 2000
      });
    } finally {
      this.setData({ isGenerating: false });
    }
  },

  // 计算Canvas尺寸（核心算法）
  calculateCanvasSize() {
    const { imageInfo, diaryText } = this.data;
    
    // 常量定义（单位：rpx）
    const CANVAS_WIDTH_RPX = 660;
    const FONT_SIZE_RPX = 20;
    const LINE_HEIGHT_RATIO = 1.3;
    const PADDING_RPX = 20;
    
    // 1. 计算图片显示尺寸
    // 图片原始尺寸：487px × 330px
    // 在小程序中显示宽度：660rpx
    const imgScale = CANVAS_WIDTH_RPX / (imageInfo.width * 2); // rpx转px需×2
    const imgHeightRpx = imageInfo.height * 2 * imgScale; // 转换为rpx
    
    // 2. 计算文字区域尺寸
    const textAreaWidthRpx = CANVAS_WIDTH_RPX - 2 * PADDING_RPX; // 620rpx
    
    // 3. 将rpx转换为px（Canvas使用px单位）
    const rpx2px = (rpx) => rpx / 2;
    const fontSizePx = rpx2px(FONT_SIZE_RPX);
    const lineHeightPx = fontSizePx * LINE_HEIGHT_RATIO;
    const textAreaWidthPx = rpx2px(textAreaWidthRpx);
    
    // 4. 创建临时Canvas上下文测量文字
    const ctx = wx.createCanvasContext('dogCanvas');
    ctx.setFontSize(fontSizePx);
    
    // 5. 分割文字为多行（按字符分割）
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < diaryText.length; i++) {
      const char = diaryText[i];
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > textAreaWidthPx) {
        // 超宽，将当前行加入数组，从当前字符开始新行
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    
    // 添加最后一行
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // 6. 计算文字区域高度
    const lineCount = lines.length;
    const textAreaHeightPx = lineCount * lineHeightPx + 2 * rpx2px(PADDING_RPX);
    const textAreaHeightRpx = textAreaHeightPx * 2;
    
    // 7. 计算画布总高度
    const canvasHeightRpx = imgHeightRpx + textAreaHeightRpx;
    
    return {
      widthRpx: CANVAS_WIDTH_RPX,
      heightRpx: canvasHeightRpx,
      imgHeightRpx: imgHeightRpx,
      lines: lines,
      fontSizePx: fontSizePx,
      lineHeightPx: lineHeightPx,
      paddingPx: rpx2px(PADDING_RPX),
      textAreaWidthPx: textAreaWidthPx
    };
  },

  // 绘制Canvas
  drawCanvas(canvasInfo) {
    return new Promise((resolve, reject) => {
      const {
        widthRpx,
        heightRpx,
        imgHeightRpx,
        lines,
        fontSizePx,
        lineHeightPx,
        paddingPx,
        textAreaWidthPx
      } = canvasInfo;
      
      // 将rpx转换为px
      const rpx2px = (rpx) => rpx / 2;
      const canvasWidthPx = rpx2px(widthRpx);
      const canvasHeightPx = rpx2px(heightRpx);
      const imgHeightPx = rpx2px(imgHeightRpx);
      
      // === 核心变更：使用新版Canvas 2D API ===
      // 1. 创建选择器并获取节点
      const query = wx.createSelectorQuery();
      query.select('#dogCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res[0]) {
            reject(new Error('未找到Canvas节点'));
            return;
          }
          
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          
          // 2. 设置Canvas实际渲染尺寸（重要！）
          const dpr = wx.getSystemInfoSync().pixelRatio;
          canvas.width = canvasWidthPx * dpr;
          canvas.height = canvasHeightPx * dpr;
          ctx.scale(dpr, dpr);
          
          // 3. 绘制白色背景（新API）
          ctx.fillStyle = '#ffffff'; // 替换 setFillStyle
          ctx.fillRect(0, 0, canvasWidthPx, canvasHeightPx); // 直接调用
          
          // 4. 绘制图片（新API）
          if (this.data.imageInfo) {
            // 注意：drawImage是异步的，需要确保图片已加载
            const image = canvas.createImage();
            image.src = "https://gaoziyuan.oss-cn-beijing.aliyuncs.com/u148/dog-1.jpg";
            image.onload = () => {
              ctx.drawImage(
                image, // 替换 drawImage 参数格式
                0, 0,
                canvasWidthPx, imgHeightPx
              );
              this.drawText(ctx); // 继续绘制文字
            };
            image.onerror = () => {
              reject(new Error('背景图片加载失败'));
            };
          } else {
            this.drawText(ctx);
          }
          
          // 5. 绘制文字的方法
          const that = this;
          this.drawText = function(ctx) {
            ctx.font = `${fontSizePx}px sans-serif`; // 替换 setFontSize
            ctx.fillStyle = '#000000'; // 替换 setFillStyle
            ctx.textBaseline = 'top'; // 替换 setTextBaseline
            
            // 文字起始位置
            const textStartX = paddingPx;
            const textStartY = imgHeightPx + paddingPx;
            
            // 逐行绘制文字
            lines.forEach((line, index) => {
              const y = textStartY + (index * lineHeightPx);
              ctx.fillText(line, textStartX, y);
            });
            
            // 6. 生成图片（注意：Canvas 2D无需手动调用draw）
            wx.canvasToTempFilePath({
              canvas: canvas, // 这里传入canvas节点
              quality: 0.8,
              fileType: 'png',
              success: (res) => {
                resolve(res.tempFilePath);
              },
              fail: (err) => {
                reject(new Error('Canvas转图片失败: ' + JSON.stringify(err)));
              }
            });
          };
        });
    });
  },

  // 辅助函数：延时
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // 页面卸载时清理
  onUnload() {
    // 清理生成的临时图片
    if (this.data.generatedImagePath) {
      wx.removeSavedFile({
        filePath: this.data.generatedImagePath,
        fail: () => {}
      });
    }
  }
});