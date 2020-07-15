# 原生微信小程序开发之云音乐
### 整体项目设计实现的功能：
#### 1.音乐模块的开发
* 首页轮播图效果+歌单模块
* 点击歌单可以自动跳转到歌曲界面
* 点击歌曲可以进入到播放音乐的动态效果界面
##### 主要技术：
* 使用组件化开发的思想，定义了歌单组件，歌曲组件和进度条组件
* 使用tcb-router管理项目路由跳转部分,优化云函数的请求
```
const TcbRouter=require('tcb-router');
// 云函数入口函数
exports.main = async (event, context) => {
 const app=new TcbRouter({event});
 app.router("playlist",async(ctx,next)=>{  
 //app.router的名字和$url的名字相对应
   ctx.body=await cloud.database().collection('playlist')
   .skip(event.start)
   .limit(event.count)
   .orderBy('createTime',"desc")
   .get()
   .then((res)=>{
     return res;
   })
 }) 
 
  wx.cloud.callFunction({
      name:"music",
      data:{
        start:this.data.playlist.length,
        count:MAX_LIMIT,
        $url:'playlist'  //和app.router中定义的名字相对应
      }
    }).then((res)=>{
      this.setData({
       playlist:this.data.playlist.concat(res.result.data) //将获取成功的数据更新页面中data定义的数据
      })
```
* 突破微信小程序只能读取100条的数据
```
//分段异步获取数据
const countResult = await playlistCollection.count();
  const total = countResult.total;
  const batchTimes = Math.ceil(total / MAX_LIMIT);
  const tasks = [];
  for (let i = 0; i < batchTimes; i++) {
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get();
    tasks.push(promise);
  }
   //list代表数据库中的数据
  let list = {
    data: []
  }
  //最后将分页后的数据拼接起来
  if (tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }
```
* 使用request-promise请求接口数据  
```
const rp = require('request-promise'); 
const URL = 'http://musicapi.xiecheng.live/personalized';
  const playlist = await rp(URL).then((res) => {
    return JSON.parse(res).result;  //将获取到的字符串转化为对象，并取出对象下的result
  })
```
##### 效果图：
![image](https://github.com/jessalin737/xiaochengxu-Smart-classroom/blob/master/classroom-1.png)
![image](https://github.com/jessalin737/xiaochengxu-myMusic/blob/master/微信图片_20200714152125.png)
![image](https://github.com/jessalin737/xiaochengxu-myMusic/blob/master/微信图片_20200714152132.png)
![image](https://github.com/jessalin737/xiaochengxu-myMusic/blob/master/微信图片_20200714152137.png)
#### 2.博客模块的开发（开发中）
#### 3.个人中心模块的开发（开发中）


## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

