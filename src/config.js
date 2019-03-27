
// 工具文件


import ipfsApi from 'ipfs-api'

import {notification,message} from 'antd'
import Web3 from 'web3';

// 合约
import CourseList from '../src/compiled/CourseList.json'
import Course from '../src/compiled/Course.json'
import address from './address'

// 设置 域名，端口 ， 配置
let ipfs = ipfsApi("ipfs.infura.io","5001",{"protocol":"https"})

// ipfs上面的资源都可以在这里获取
// 在后面拼接资源的hash值就好了
// let ipfsPrefix = "https://ipfs.infura.io:5001/ipfs/"
let ipfsPrefix = "https://ipfs.infura.io:5001/api/v0/cat?arg="

let web3
// 小狐狸是否被激活
if(window.web3){
  web3 = new Web3(window.web3.currentProvider)
}else{
  notification.error({
    message:'没有检测到以太坊插件',
    description:'庆安装metaMask或者激活'
  })
  // alert('请安装或者激活metamask')
}

// 生成实例地址
let courseListContract = new web3.eth.Contract(JSON.parse(CourseList.interface),address)
// 获取合约数据
let getCourseContract = (addr) => new web3.eth.Contract(JSON.parse(Course.interface),addr)

// 存储图片
function saveImageToIpfs(file){
  const hide = message.loading('上传中')
  return new Promise(function(resolve, reject){
    // 浏览器文件对象
    let reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = async ()=>{
      const buffer = Buffer.from(reader.result)
      const res = await ipfs.add(buffer)
      console.log(res)
      hide()
      resolve(res[0].hash)
    }
  })
}

// 存储问题信心
function saveJsonOnIpfs(json){
  return new Promise(async(reslove,reject)=>{
    const buffer = Buffer.from(JSON.stringify(json))
    const ret = await ipfs.add(buffer)
    console.log(ret)
    reslove(ret[0].hash)
  })
}

// 拼接到一起hash值
function readJsonFromIpfs(hash1,hash2){

  return new Promise(async(reslove,reject)=>{
    const hash = web3.utils.hexToAscii(hash1)+web3.utils.hexToAscii(hash2)
    // 取值
    const ret = await ipfs.cat(hash)
    // 转换
    const res = new TextDecoder('utf-8').decode(ret)
    reslove(JSON.parse(res))
  })
}
export {
  ipfs,
  ipfsPrefix,
  saveImageToIpfs,
  web3,
  courseListContract, 
  getCourseContract,
  saveJsonOnIpfs,
  readJsonFromIpfs 
}