// pages/player/player.js
let musiclist=[];
let nowPlayingIndex=0;
let app=getApp();
//调用小程序全局唯一的背景音频播放器
const backgroundAudioManager = wx.getBackgroundAudioManager()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    picUrl:'',
    isPlaying:false,
    lyricShow:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options);
    nowPlayingIndex=options.index;
    musiclist=wx.getStorageSync('musiclist');
    this._loadMusicDetail(options.musicId);
  },
  _loadMusicDetail(musicId){
    backgroundAudioManager.pause();
    let music=musiclist[nowPlayingIndex];
    // console.log(music);
    wx.setNavigationBarTitle({
      title: music.name,
    })
    this.setData({
      picUrl:music.al.picUrl
    })
    wx.cloud.callFunction({
      name:'music',
      data:{
        musicId:musicId,
        $url:'musicUrl'
      }
    }).then((res)=>{
      wx.showLoading({
        title: '正在加载中',
      })
      // console.log(res);
      console.log(JSON.parse(res.result));
      let result=JSON.parse(res.result);
      backgroundAudioManager.src=result.data[0].url;
      backgroundAudioManager.title=music.name;
      backgroundAudioManager.singer=music.ar[0].name;
      backgroundAudioManager.epname=music.al.name;
      backgroundAudioManager.coverImgUrl=music.al.picUrl;
      
      this.setData({
        isPlaying:true
      })
      wx.hideLoading();
      //播放完成后加载歌词
      wx.cloud.callFunction({
        name:'music',
        data:{
          musicId,
          $url:'lyric'
        }
      }).then((res)=>{
        console.log(res);
      })
    })
    this.saveHistory();
  },
  //中间暂停按钮的切换
  switchPlaying(){
   if(this.data.isPlaying){
     backgroundAudioManager.pause();
   }else{
     backgroundAudioManager.play();
   }
   this.setData({
     isPlaying:!this.data.isPlaying
   })
  },
  //上一首
  toPrev(){
     nowPlayingIndex--;
    if(nowPlayingIndex<0){
      nowPlayingIndex=musiclist.length()-1;
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id);
  },
  //下一首
  toNext(){
    nowPlayingIndex++;
    if(nowPlayingIndex>musiclist.length-1){
      nowPlayingIndex=0;
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id);
  },
  switchShow(){
    this.setData({
      lyricShow:!this.data. lyricShow
    })
  },
  //保存播放历史：判断当前正在播放的是否在本地已存储，则退出；否则存入本地
  saveHistory(){
    //获取当前正在播放的歌曲
    let music=musiclist[nowPlayingIndex];
    let openid=app.globalData.openid;
    console.log(openid);
    let history=wx.getStorageSync(openid);
    let isHave=false;
    for(let i=0,len=history.length;i<len;i++){
      if(history[i].id==music.id){
        isHave=true;
        break;
      }
    }
    if(!isHave){
      history.unshift(music);
     wx.setStorage({
       key:openid,
       data:history
     })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})