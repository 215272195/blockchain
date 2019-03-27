
## 登录好以太坊就行
通过切换账号来确定是否是ceo

solc [https://github.com/ethereum/solc-js]

solc 编译.solw文件 生成一个json（后面部署 测试 等需要的数据）
  1. bytecode
     1. 部署合约用的数据
  2. interfafce 接口声明
     1. 测试使用

1. 每次compile清空文件 重新生成
2. 报错信息打印
3. 最好能监听，自动compile 
   1. 使用onchange模块

* npm run compile 执行编译文件来打印log
* npm run compile:w 执行这个来监听文件编译


1. 课程列表
   1. 每一个课程 是一个单独的合约 
   2. 使用CourseList来控制课程的合约，合约之间是可以相互控制的

测试 使用mocha
断言使用node自己的assert
本地部署环境 ganache-cli 测试的时候开虚拟环境测试

npm run  rebuild  先编译成合约再跑测试
rebuild:w  自动监听 走整个编译 测试流程

课程：
  owner 课程创建者
  name 课程名
  content 课程简介
  target 课程目标是募资多少  ETH
  fundingPrice 众筹价格
  price 上线价格
  img 课程头图
  video 视频
  count 多少人支持
  isOnline 是否上线
  users{
    用户1：1块钱，
    用户2 花了2块钱
  }
payable 可付款的


1. 如果收到的钱大于目标 上线了
2. 上线前的钱 ceo不分
3. 上线之后卖的钱 ceo分1成


wei finney szabo ether
以太坊单位
1 ether == 10^3 finney
1 ether == 10^6 szabo
1 ether == 10^18 wei


## 部署

密钥 
victory infant draw trophy prevent decline disorder monkey team skin real rabbit

主网
本地ganache 没有办法在公网访问

ropsten 和主网一样的逻辑，只不过币不值钱

2. 部署
3. infura.io 部署服务
   1. https://ropsten.infura.io/v3/eeff2f77d81e4b25b57507deb7a26b6b
4. 安装
  npm install web3@1.0.0-beta.34 truffle-hdwallet-provider@0.0.3 --save

https://ropsten.infura.io/v3/f2c3f746c0d6405cbed453dcfadb1001

1. 课程名
2. 详情  课程具体介绍
3. 架构图
4. 众筹的目标 10ETH
5. 众筹价格   1 ETH
6. 上线价格   2 ETH

npm run deploy 执行部署编译测试一套



余额

CEO： 7.9912   1成   0.08
讲师: 0.998 => 1.998  9成 0.72
购买者1 ：1  => 0.499
购买者2 ：1  => 0.499
购买者3 : 4  => 3.199




问题 回答

以太坊存储ipfs的hash  一个问题存一个
基本所有的数据  都以json的形式存储在ipfs之上

{
  title:'react咋样'
  content:'听说react还不错',
  answers:[

  ]
}


编译，测试代码写到，开始部署，然后前端