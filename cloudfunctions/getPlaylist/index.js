// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// const rp = require('request-promise');
const axios=require('axios');

const URL='https://apis.imooc.com/personalized?icode=A0CD56251BD9C237'
const playlistCollection = db.collection('playlist');

const MAX_LIMIT = 100;

// 云函数入口函数
exports.main = async(event, context) => {
  // const list = await playlistCollection.get();
  //突破云函数突破每次只能插入一百条数据
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

  // const playlist = await rp(URL).then((res) => {
  //   return JSON.parse(res).result;
  // })
  const {data}=await axios.get(URL);
  if(data.code>=1000){
    console.log(data.msg);
    return 0;
  }
  const playlist=data.result;
  console.log(playlist);
  

  const newData = [];
  for (let i = 0; i <playlist.length; i++) {
    let flag = true;
    for (let j = 0; j <list.data.length; j++) {
      if (playlist[i].id === list.data[j].id) {
        flag = false;
        break;
      }
    }
    if (flag) {
      newData.push(playlist[i])
    }
  }
  if(playlist.length>0){
    await playlistCollection.add({
      data: [...playlist]
    }).then((res) => {
      console.log('插入成功')
    }).catch((err) => {
      console.error('插入失败')
    })
  return newData.length;
 }
}