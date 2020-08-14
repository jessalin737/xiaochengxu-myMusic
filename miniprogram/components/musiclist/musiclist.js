// components/musiclist/musiclist.js
const app=getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist:Array
  },
  
  /**
   * 组件的初始数据
   */
  data: {
   playingId:-1
  },
  //在组件的页面周期为显示时调用当全局的musicId
  pageLifetimes:{
    show(){
      this.setData({
        playingId:parseInt(app.getPlayMusicId())
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event){
      const musicid=event.currentTarget.dataset.musicid;
      const index=event.currentTarget.dataset.index;
      this.setData({
        playingId:event.currentTarget.dataset.musicid
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicId=${musicid}&index=${index}`,
      })
    }
  }
})
