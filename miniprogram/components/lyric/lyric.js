// components/lyric/lyric.js
let lyricHeight=0;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    lyricShow:{
      type:Boolean,
      value:false
    },
    lyric:String
  },
  observers:{
    lyric(lrc){
      // console.log(lrc);
      if(lrc=='暂无歌词'){
         this.setData({
           lrcList:[
             {
               lrc,
               time:0
             }
           ],
           nowLyricIndex:-1
         })
      }else{
        this._parseLyric(lrc);
      }
     
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lrcList:[],
    nowLyricIndex:0,  //当前选中歌词的索引
    scrollTop:0, //滚动条滚动的高度
    
  },
  lifetimes:{
    ready(){
      //获取当前手机型号下的屏幕宽度
      wx.getSystemInfo({
        success(res){
          //先计算出1rpx，再计算出歌词的高度
          lyricHeight=res.screenWidth/750*64
        }
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime){
      // console.log(currentTime);//获取到播放时间
      let lrcList=this.data.lrcList;
      if(lrcList.length==0){
        return;
      }
      if(currentTime>lrcList[lrcList.length-1].time){
        if(this.data.nowLyricIndex!=-1){
          this.setData({
             nowLyricIndex:-1,
             scrollTop:lyricHeight*lrcList.length
          })
        }
      }
      for(let i=0;i<lrcList.length;i++){
        if(currentTime<lrcList[i].time){
          this.setData({
             nowLyricIndex:i-1,
             scrollTop:lyricHeight*(i-1) 
          })
          break
        }
      }
      
    },
    _parseLyric(sLyric){
      let _lrcList=[];
      let line=sLyric.split('\n');
      // console.log(line);
      line.forEach((elem)=>{
        //获取时间
         let time=elem.match(/\[(\d{2,3}):(\d{2})(?:\.(\d{2,3}))?]/g);
        //  console.log(time);
        if(time!=null){
          let lrc=elem.split(time)[1];
          let timeReg=time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/);
          // console.log(timeReg);
          //将时间转化为秒
          let timeToSeconds=parseInt(timeReg[1])*60+parseInt(timeReg[2])+parseInt(timeReg[3])/1000;

          _lrcList.push({
            lrc,
            time:timeToSeconds
          })
        }
      })
      this.setData({
        lrcList:_lrcList,
        
      })
    }
  }
})
