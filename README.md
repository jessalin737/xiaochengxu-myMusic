# 原生微信小程序开发之云音乐
### 整体项目设计实现的功能：
#### 1.音乐模块的开发
* 首页轮播图效果+歌单模块
* 点击歌单可以自动跳转到歌曲列表界面
* 点击歌曲可以进入到播放音乐的动态效果界面
* 点击播放音乐的界面可以跳转到歌词界面
##### 主要技术：
* 使用组件化开发的思想，定义了歌单组件，歌曲组件、进度条组件
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
* 使用axios请求接口数据  
```
app.router('musiclist',async(ctx,next)=>{
  const res=await axios.get(`${BASE_URL}/playlist/detail?id=${parseInt(event.playlistId)}&${ICODE}`);
  ctx.body=res.data;
 })
```

```
#### 注意：有多个云环境ID时加上这行代码，确保环境一致
```
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

```
##### 效果图：


#### 2.个人中心模块的开发
* 最近播放历史记录
* 生成小程序码


## 参考文档
- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
