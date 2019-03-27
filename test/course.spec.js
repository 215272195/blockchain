// 测试文件
const path = require('path')
// 断言库
const assert = require('assert')
const Web3 = require('web3')
// 虚拟环境
const ganache = require('ganache-cli')
// js内数额太大是计算不了的借用这个库
const BigNumber = require('bignumber.js')
// 创建实例链接虚拟环境
const web3 = new Web3(ganache.provider())
// 引入合约的json
const CourseList = require(path.resolve(__dirname, '../src/compiled/CourseList.json'))
const Course = require(path.resolve(__dirname, '../src/compiled/Course.json'))

// 定义几个全局变量，所有测试都需要
let accounts
// 实例
let courseList
let course
// 描述
describe('测试课程的智能', () => {
  // 钩子 启动前会触发
  before(async () => {
    // 测试前的数据初始化
    accounts = await web3.eth.getAccounts()

    // 虚拟环境会提供10个账号
    // console.log(accounts)

    // 1. 虚拟部署一个合约
    courseList = await new web3.eth.Contract(JSON.parse(CourseList.interface))
      .deploy({ data: CourseList.bytecode })
      .send({
        // 最后一个是创建者
        from: accounts[9],
        gas: '5000000'
      })

  })
  it('合约部署成功', () => {
    assert.ok(courseList.options.address)
  })

  it('测试添加课程', async () => {
    const oldaddress = await courseList.methods.getCourse().call()
    assert.equal(oldaddress.length, 0)
    await courseList.methods.createCourse(
      '蜗牛的React课程',
      "React+redux+reactrouter4开发招聘app",
      // 8个以太坊
      web3.utils.toWei('8'),
      // 众筹价格
      web3.utils.toWei('2'),
      web3.utils.toWei('4'),
      "图片的hash"
    )
      .send({
        from: accounts[0],
        gas: '5000000'
      })
    const address = await courseList.methods.getCourse().call()
    assert.equal(address.length, 1)

  })
  it("添加课程的属性", async () => {
    const [address] = await courseList.methods.getCourse().call()
    // 添加的课程合约的地址 依次获取课程属性
    course = await new web3.eth.Contract(JSON.parse(Course.interface), address)
    const name = await course.methods.name().call()
    const content = await course.methods.content().call()
    const target = await course.methods.target().call()
    const fundingPrice = await course.methods.fundingPrice().call()
    const price = await course.methods.price().call()
    const img = await course.methods.img().call()
    const count = await course.methods.count().call()
    const isOnline = await course.methods.isOnline().call()
    // 输出内容
    assert.equal(name, '蜗牛的React课程')
    assert.equal(content, 'React+redux+reactrouter4开发招聘app')
    assert.equal(target, web3.utils.toWei('8'))
    assert.equal(fundingPrice, web3.utils.toWei('2'))
    assert.equal(price, web3.utils.toWei('4'))
    assert.equal(img, "图片的hash")
    assert.ok(!isOnline)
    assert.equal(count, 0)
  })
  it("只能ceo能删", async () => {
    await courseList.methods.createCourse(
      '蜗牛的Vue课程',
      'vue也是个好框架，简单好上手',
      web3.utils.toWei('8'),
      // 众筹价格
      web3.utils.toWei('2'),
      web3.utils.toWei('4'),
      "图片的hash1"

    )
      .send({
        from: accounts[0],
        gas: '5000000'
      })
    const address = await courseList.methods.getCourse().call()
    assert.equal(address.length, 2)

    // 1、 ceo才能删
    // 2. 索引正确
    try {
      await courseList.methods.removeCourse(1).send({
        from: accounts[1],
        gas: '5000000'
      })
      assert.ok(false)
    } catch (e) {
      assert.equal(e.name, 'RuntimeError')
    }
    try {
      await courseList.methods.removeCourse(2).send({
        from: accounts[9],
        gas: '5000000'
      })
      assert.ok(false)
    } catch (e) {
      assert.equal(e.name, 'RuntimeError')
    }
    await courseList.methods.removeCourse(0).send({
      from: accounts[9],
      gas: '5000000'
    })
    const address1 = await courseList.methods.getCourse().call()
    console.log(address1)
    assert.equal(address1.length, 1)

  })
  it('判断是不是ceo', async () => {
    const isCeo1 = await courseList.methods.isCeo().call({
      from: accounts[9]
    })
    const isCeo2 = await courseList.methods.isCeo().call({
      from: accounts[1]
    })
    assert.ok(isCeo1)
    assert.ok(!isCeo2)
  })

  // 2后面18个零是固定的
  it('金钱转换', () => {
    assert.equal(web3.utils.toWei('2'), '2000000000000000000')
  })
  it('课程购买', async () => {
    await course.methods.buy().send({
      from: accounts[2],
      value: web3.utils.toWei('2')
    })
    const value = await course.methods.users(accounts[2]).call()
    const count = await course.methods.count().call()
    assert.equal(value, web3.utils.toWei('2'))
    assert.equal(count, 1)

    // 用户role的判断
    const detail = await course.methods.getDetail().call({ from: accounts[0] })
    assert.equal(detail[9], 0)

    const detail2 = await course.methods.getDetail().call({ from: accounts[2] })
    assert.equal(detail2[9], 1)

    const detail3 = await course.methods.getDetail().call({ from: accounts[5] })
    assert.equal(detail3[9], 2)
  })
  it('还没上线，够买的课不入账', async () => {
    const oldBlance = new BigNumber(await web3.eth.getBalance(accounts[0]))
    await course.methods.buy().send({
      from: accounts[3],
      value: web3.utils.toWei('2')
    })
    const newBlance = new BigNumber(await web3.eth.getBalance(accounts[0]))
    const diff = newBlance.minus(oldBlance)
    assert.equal(diff, 0)
  })

  it('还没上线，不能上传视频', async () => {

    try {
      await course.methods.addVideo('video的hash')
        .send({
          from: accounts[0],
          gas: '5000000'
        })
      assert.ok(false)
    } catch (e) {
      assert.equal(e.name, 'RuntimeError')
    }
  })
  it('不能重复购买', async () => {
    try {
      await course.methods.buy().send({
        from: accounts[2],
        value: web3.utils.toWei('2')
      })
      assert.ok(false)

    } catch (e) {
      console.log(e.name)
      assert.equal(e.name, 'RuntimeError')

    }

  })
  it('课程必须是众筹价格', async () => {
    try {
      await course.methods.buy().send({
        from: accounts[4],
        value: web3.utils.toWei('3')
      })
      assert.ok(false)

    } catch (e) {
      assert.equal(e.name, 'RuntimeError')

    }

  })

  it('众筹上线后，钱到账', async () => {
    const oldBlance = new BigNumber(await web3.eth.getBalance(accounts[0]))

    // 8 众筹家是2  买4次就上线
    await course.methods.buy().send({
      from: accounts[4],
      value: web3.utils.toWei('2')
    })
    await course.methods.buy().send({
      from: accounts[5],
      value: web3.utils.toWei('2')
    })
    const count = await course.methods.count().call()
    const isOnline = await course.methods.isOnline().call()
    assert.equal(count, 4)
    assert.ok(isOnline)
    const newBlance = new BigNumber(await web3.eth.getBalance(accounts[0]))
    const diff = newBlance.minus(oldBlance)
    assert.equal(diff, web3.utils.toWei('8'))
  })
  it('课程必须是线上的价格', async () => {
    try {
      await course.methods.buy().send({
        from: accounts[6],
        value: web3.utils.toWei('2')
      })
      assert.ok(false)

    } catch (e) {
      assert.equal(e.name, 'RuntimeError')
    }

  })
  it('课程必须是线上的价格2', async () => {
    // try{
    await course.methods.buy().send({
      from: accounts[6],
      value: web3.utils.toWei('4')
    })
    const count = await course.methods.count().call()
    assert.equal(count, 5)

    // }catch(e){
    //   assert.equal(e.name,'RuntimeError')
    // }
  })
  it('上线之后购买 有分成收益', async () => {
    // try{
    // ceo的约
    const oldCeoBlance = new BigNumber(await web3.eth.getBalance(accounts[9]))
    // 课程创建者
    const oldOwnerBlance = new BigNumber(await web3.eth.getBalance(accounts[0]))

    await course.methods.buy().send({
      from: accounts[7],
      value: web3.utils.toWei('4')
    })
    const newCeoBlance = new BigNumber(await web3.eth.getBalance(accounts[9]))
    const newOwnerBlance = new BigNumber(await web3.eth.getBalance(accounts[0]))

    const diffCeo = newCeoBlance.minus(oldCeoBlance)
    const diffOwner = newOwnerBlance.minus(oldOwnerBlance)
    assert.equal(diffCeo, web3.utils.toWei('0.4'))
    assert.equal(diffOwner, web3.utils.toWei('3.6'))
    // }catch(e){
    //   assert.equal(e.name,'RuntimeError')
    // }
  })

  it('上线之后，可以上传视频', async () => {

    await course.methods.addVideo('video的hash')
      .send({
        from: accounts[0],
        gas: '5000000'
      })
    const video = await course.methods.video().call()
    assert.equal(video, 'video的hash')
  })
})