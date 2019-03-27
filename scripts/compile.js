// 编译合约的文件

// 文件模块
const fs = require('fs')
const path = require('path')

const solc = require('solc')

// 我们的文件可能在各种环境下执行使用path来修正路径 当前文件夹路径
const contractPath = path.resolve(__dirname, '../contracts/Imooc.sol')

// 获取合约文件内容 同步的
const source = fs.readFileSync(contractPath, 'utf-8')
// 编译
const ret = solc.compile(source)
// console.log(ret)

if (Array.isArray(ret.errors) && ret.errors.length > 0) {
  // 出错了
  console.log(ret.errors[0])
} else {
  // 多个合约会有多个key
  Object.keys(ret.contracts).forEach(name => {
    // 把冒号截掉
    const contractName = name.slice(1)
    const filePath = path.resolve(__dirname, `../src/compiled/${contractName}.json`)
    // 同步的获取文件
    fs.writeFileSync(filePath, JSON.stringify(ret.contracts[name]))
    console.log(`${filePath} bingo`)
  })
}

// arr = [{name:'react',content:'xx',{name:'vue',content:'xx'}]
