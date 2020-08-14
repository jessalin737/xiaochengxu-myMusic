// components/progress-bar/progress-bar.js
let  movableAreaWidth=0;
let  movableViewWidth=0;
const backgroundAudioManager=wx.getBackgroundAudioManager();
let curSecond=0;
/**
 * 拖动进度条和onTimeUpdate有冲突，会产生回退现象
 * 优化：拖动进度条和onTimeUpdate不能同时执行，只能取一个
 * 通过isMoving进行判断
*/
let isMoving=false;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showtime:{
      currentTime:'00:00',
      totalTime:'00:00'
    },
    movableDis: 0,
    progress: 0,
  },
  //组件的生命周期
  lifetimes:{
    ready(){
      if (this.properties.isSame && this.data.showtime.totalTime == '00:00') {
        this._setTime()
      }
      this._getmovableDis(),
      this._bindBGMEvent()
    },
   
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event){
      // console.log(event);
    if(event.detail.source=='touch'){
      this.data.movableDis=event.detail.x,
      this.data.progress= event.detail.x/(movableAreaWidth-movableViewWidth)*100,
      isMoving=true
    }  
    console.log('onChange',isMoving);
    },
    onTouchEnd(){
      const currentTimeFmt=this._dateFormat(Math.floor(backgroundAudioManager.currentTime));
      const duration=backgroundAudioManager.duration;
      // console.log(currentTimeFmt);
      this.setData({
        movableDis:this.data.movableDis,
        progress:this.data.progress,
        ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`,
      })
      //进度条控制音乐的播放进度
      backgroundAudioManager.seek(this.data.progress*duration/100);
      isMoving=false;
      console.log('onTouchEnd',isMoving);
    },
    _getmovableDis(){
      // 动态获取组件宽和高的数据，组件中必须用this,页面中可以用wx.
       const query=this.createSelectorQuery();
       query.select('.movable-area').boundingClientRect()
       query.select('.movable-view').boundingClientRect()
       query.exec((rect)=>{
        //  console.log(rect);
         //获取进度条和小圆点的宽度
         movableAreaWidth=rect[0].width;
         movableViewWidth=rect[1].width;
        //  console.log(movableAreaWidth,movableViewWidth);
       })
    },
    //注意：背景音乐对象的每个方法调用中必须调用一句代码
    _bindBGMEvent(){
      //正在播放
      backgroundAudioManager.onPlay(()=>{  
        console.log('onPlay');
        isMoving=false;
        this.triggerEvent('musicPlay');
      })
      //停止
      backgroundAudioManager.onStop(()=>{
        console.log('onStop');
      })
      //暂停
      backgroundAudioManager.onPause(()=>{
        console.log('onPause');
        this.triggerEvent('musicPause');
      })
      //拖动进度条，音频未加载的时候触发
      backgroundAudioManager.onWaiting(()=>{
        console.log('onWaiting');
      })
      // 监听背景音乐进入可以播放的状态
      backgroundAudioManager.onCanplay(()=>{
        console.log('onCanplay');
        //获取音乐的播放时间
         console.log(backgroundAudioManager.duration);
         if(typeof backgroundAudioManager.duration!=='undefined'){
             this._setTime();
         }else{
           //如果获取不到duration,设置定时器等待一秒后获得
           setTimeout(()=>{
             this._setTime();
           },1000)
         }
      })
      //监听小程序正在播放的进度
      backgroundAudioManager.onTimeUpdate(()=>{
          if(!isMoving){
            // console.log('onTimeUpdate');
            const currentTime=backgroundAudioManager.currentTime;
            const sec=currentTime.toString().split('.')[0];
            const duration=backgroundAudioManager.duration;
            if(sec!=curSecond){
              // console.log(currentTime);
              const currentTimeFmt=this._dateFormat(currentTime);
              this.setData({
                movableDis:(movableAreaWidth-movableViewWidth)*currentTime/duration,
                progress:currentTime/duration*100,
                ['showtime.currentTime']:`${currentTimeFmt.min}:${currentTimeFmt.sec}`
              })
              curSecond=sec; 
              this.triggerEvent('timeUpdate',{currentTime});
            }
          }
         
          
      })
      //监听音乐播放停止时
      backgroundAudioManager.onEnded(()=>{
        console.log('onEnded');
        this.triggerEvent('musicEnd');
      })
      //监听出现错误时
      backgroundAudioManager.onError((res)=>{
        console.log('onError');
        console.error(res.errMsg);
        console.error(res.errCode);
        wx.showToast({
          title: '错误'+res.errCode,
        })
      })
    },
    //设置总时长
    _setTime(){
      const duration=backgroundAudioManager.duration;
      const durationFmt=this._dateFormat(duration);
      this.setData({
        ['showtime.totalTime']:`${durationFmt.min}:${durationFmt.sec}`
      })
    },
    _dateFormat(sec){
      const min=Math.floor(sec/60);
      sec=Math.floor(sec%60);
      return {
       'min':this._parse0(min),
       'sec':this._parse0(sec)
      }
    },
    _parse0(sec){
      return sec<10? '0'+sec:sec;
    }
  }
})
