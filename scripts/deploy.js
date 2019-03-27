// 部署合约到ropsten测试网络
const fs = require('fs')
const path = require('path')
const Web3 = require('web3')
const HDWalletProvider = require('truffle-hdwallet-provider')

const contractPath = path.resolve(__dirname, '../src/compiled/CourseList.json')
// interface用来部署 bytecode合约数据
const {interface, bytecode} = require(contractPath)

// 以太坊测试网络提供器
// 以太坊小狐狸一定要留下一个账号，账号多了的话有可能获取不对
const provider = new HDWalletProvider(
  "involve room ticket save opinion digital judge assume act saddle error anger",
  // 这个网站获取 https://infura.io/dashboard
  "https://ropsten.infura.io/v3/f2c3f746c0d6405cbed453dcfadb1001"
)
const web3 = new Web3(provider);

(async()=>{
  console.log('自执行')
  const accounts = await web3.eth.getAccounts()
  console.log('合约部署的账号：', accounts)
  // await
  console.time('合约部署消耗时间')
  // 用来部署 // 部署成功会看到消耗
  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode})
    .send({
      from:accounts[0],
      gas:'5000000'
    })
  console.timeEnd('合约部署消耗时间')
  console.log(result.options)
  // 拿到地址数据
  const contractAddress = result.options.address
  console.log('合约部署成功', contractAddress)
  // 合约部署细节就可以在公网看到了
  console.log('合约查看地址', `https://ropsten.etherscan.io/address/${contractAddress}`)
  
  // 写入文件等待公网调用 同步写文件自动生成这个文件
  const addressFile = path.resolve(__dirname,'../src/address.js')
  fs.writeFileSync(addressFile, "export default "+JSON.stringify(contractAddress))
  console.log("地址写入成功",addressFile)
})()

