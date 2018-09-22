/**
 * 将小程序的API封装成支持Promise的API
 * @params fn {Function} 小程序原始API，如wx.login
 */
const wxPromisify = fn => {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }

      obj.fail = function (res) {
        reject(res)
      }

      fn(obj)
    })
  }
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    low: {
      type: Number
    },
    heigh: {
      type: Number
    },
    step: {
      type: Number
    },
    minValue: {
      type: Number
    },
    maxValue: {
      type: Number
    },
    blockColor:{
      type: String
    },
    backgroundColor:{
      type: String
    },
    selectedColor:{
      type: String
    },
    range: {
      type: Array
    }
  },


  /**
   * 组件的初始数据
   */
  data: {
    low: 0,
    heigh: 7,
    min: 0,
    max: 10000,
    leftValue: 0,
    rightValue: '不限',
    totalLength: 0,
    bigLength: 0,
    ratio: 0.5,
    sliderLength: 70,
    containerLeft: 0, //标识整个组件，距离屏幕左边的距离
    hideOption: '', //初始状态为显示组件
    range: []
  },

  /**
   * 组件的方法列表
   */
  methods: {

    /**
    * 设置左边滑块的值
    */
    _propertyLeftValueChange: function () {

      let minValue = this.data.minValue / this.data.max * this.data.bigLength
      let min = this.data.min / this.data.max * this.data.bigLength
      this.setData({
        leftValue: minValue - min
      })
    },

    /**
     * 设置右边滑块的值
     */
    _propertyRightValueChange: function () {
      let right = this.data.maxValue / this.data.max * this.data.bigLength + this.data.sliderLength
      this.setData({
        rightValue: right
      })
    },
    /**
     * 左边滑块滑动
     */
    _minMove: function (e) {
      const totalLength = this.data.totalLength
      const eachLength = parseInt(totalLength / (this.data.max + 1))
      let pagex = e.changedTouches[0].pageX / this.data.ratio - this.data.containerLeft - this.data.sliderLength / 2
      if (pagex + this.data.sliderLength + eachLength >= this.data.rightValue) {
        pagex = this.data.rightValue - this.data.sliderLength - eachLength
      } else if (pagex <= 0) {
        pagex = 0
      }

      let lowValue = parseInt(pagex / this.data.bigLength * parseInt(this.data.max) + this.data.min)

      this.setData({
        leftValue: pagex,
        low: lowValue
      })

      var myEventDetail = { lowValue: lowValue }
      this.triggerEvent('lowValueChange', myEventDetail)
    },

    /**
     * 右边滑块滑动
     */
    _maxMove: function (e) {
      const totalLength = this.data.totalLength
      const eachLength = parseInt(totalLength / (this.data.max + 1))
      let pagex = e.changedTouches[0].pageX / this.data.ratio - this.data.containerLeft - this.data.sliderLength / 2
      if (pagex <= this.data.leftValue + this.data.sliderLength + eachLength) {
        pagex = this.data.leftValue + this.data.sliderLength + eachLength
      } else if (pagex >= this.data.totalLength) {
        pagex = this.data.totalLength
      }

      this.setData({
        rightValue: pagex
      })

      pagex = pagex - this.data.sliderLength
      let heighValue = parseInt(pagex / this.data.bigLength * this.data.max)

      this.setData({
        heigh: heighValue,
      })

      var myEventDetail = { heighValue: heighValue }
      this.triggerEvent('heighValueChange', myEventDetail)
    },

    /**
     * 隐藏组件
     */
    hide: function () {
      this.setData({
        hideOption: 'hide',
      })
    },
    /**
     * 显示组件
     */
    show: function () {
      this.setData({
        hideOption: '',
      })
    },
    /**
    * 重置
    */
    reset: function () {
      this.setData({
        rightValue: this.data.totalLength,
        leftValue: 0,
      })
    },

  },

  ready: function () {
    let that = this;
    const getSystemInfo = wxPromisify(wx.getSystemInfo)
    const queryContainer = wxPromisify(wx.createSelectorQuery().in(this).select(".container").boundingClientRect)
    wxPromisify(wx.getSystemInfo)()
      .then(res => {
        let ratio = res.windowWidth / 750
        that.setData({
          ratio: ratio,
        })
      })
      .then(() => {
        var query = wx.createSelectorQuery().in(this)
        query.select(".container").boundingClientRect(function (res) {
          that.setData({
            totalLength: res.width / that.data.ratio - that.data.sliderLength,
            bigLength: res.width / that.data.ratio - that.data.sliderLength * 2,
            rightValue: res.width / that.data.ratio - that.data.sliderLength,
            containerLeft: res.left / that.data.ratio
          })

        /**
         * 设置初始滑块位置
         */
        that._propertyLeftValueChange()
        that._propertyRightValueChange()
        }).exec()
      })
  }
})
