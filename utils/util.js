const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const allMenuList = [
  { id: 1, path: '/pages/setting/index', title: '设置', subTitle: '系统设置', icon: '../../assets/img/tabbar/setting.png', disabled: true },
  { id: 2, path: '/pages/lol/index', title: '英雄联盟查询', subTitle: '皮肤查询', icon: '../../assets/img/tabbar/lol.png', disabled: false },
  { id: 3, path: '/pages/bmi/index', title: '身体指数计算', subTitle: '计算BMI值', icon: '../../assets/img/tabbar/bmi.png', disabled: false },
  { id: 4, path: '/pages/gas/index', title: '今日油价', subTitle: '全国各省油价查询', icon: '../../assets/img/tabbar/gas.png', disabled: false },
  { id: 5, path: '/pages/dog/index', title: '舔狗日记', subTitle: '痛并快乐着', icon: '../../assets/img/tabbar/dog.png', disabled: false },
  { id: 6, path: '/pages/beautiful/index', title: '美女图片', subTitle: '只为心情愉悦', icon: '../../assets/img/tabbar/beautiful.png', disabled: false },
  { id: 7, path: '/pages/playboy/index', title: '花花公子', subTitle: '仅供测试', icon: '../../assets/img/tabbar/playboy.png', disabled: false },
  { id: 8, path: '/pages/book/index', title: '答案之书', subTitle: '简直不敢相信', icon: '../../assets/img/tabbar/book.png', disabled: false },
  { id: 9, path: '/pages/news/index', title: '每日热榜', subTitle: '每5分钟更新', icon: '../../assets/img/tabbar/news.png', disabled: false },
]

module.exports = {
  formatTime,
  allMenuList,
}
