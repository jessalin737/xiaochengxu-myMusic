// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter=require('tcb-router');
// const rp=require('request-promise');
const axios=require('axios');

const BASE_URL = 'https://apis.imooc.com';
const ICODE='icode=A0CD56251BD9C237';

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})


// 云函数入口函数
exports.main = async (event, context) => {
 const app=new TcbRouter({event}); 
 app.router("playlist",async(ctx,next)=>{
   ctx.body=await cloud.database().collection('playlist')
   .skip(event.start)
   .limit(event.count)
   .orderBy('createTime',"desc")
   .get()
   .then((res)=>{
     return res;
   })
 }) 
 app.router('musiclist',async(ctx,next)=>{
  // ctx.body = await rp(BASE_URL + '/playlist/detail?id=' + parseInt(event.playlistId))
  //     .then((res) => {
  //       return JSON.parse(res)
  //     })
  const res=await axios.get(`${BASE_URL}/playlist/detail?id=${parseInt(event.playlistId)}&${ICODE}`);
  ctx.body=res.data;

 })
 //加载播放的歌词
 app.router('musicUrl',async(ctx,next)=>{
  // ctx.body= await rp(BASE_URL+ `/song/url?id=${event.musicId}`).then((res)=>{
  //    return res;
  //   })
 const res=await axios.get(`${BASE_URL}/song/url?id=${event.musicId}&${ICODE}`)  
  ctx.body=res.data;
 })

//  加载歌词
app.router('lyric', async(ctx, next) => {
  const res=await axios.get(`${BASE_URL}/lyric?id=${event.musicId}&${ICODE}`)
  ctx.body=res.data;
})
 return app.serve();
}