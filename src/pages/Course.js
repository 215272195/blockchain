import React from 'react'
import {ipfsPrefix,courseListContract,web3,getCourseContract} from '../config'
import { Row,Col, Badge ,Button, Switch} from 'antd'
import {Link} from 'react-router-dom'

class Course extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      // 具体渲染的数据
      detailList:[],
      addressList:[],
      account:'',
      isCeo:false,
      showAll:true
    }
    this.init()
  }
  async init(){
    // 合约内容
    const [account] = await web3.eth.getAccounts()
    // 通过小狐狸的账户来判断是不是ceo，哪个账户创建的哪个就是ceo
    const isCeo = await courseListContract.methods.isCeo().call({
      from:account
    })
    console.log('是不是ceo',isCeo)

    // 合约地址
    const addressList = await courseListContract.methods.getCourse().call({
      from:account
    })

    // 部署完新的数据，课程
    // 所有的请求变成一个数组
    const detailList = await Promise.all(
      addressList.map(address=>{
        return getCourseContract(address).methods.getDetail().call({
          from:account
        })
      })
    )
    this.setState({
      detailList,
      addressList,
      account,
      isCeo
    })
  }
  onChangeSwitch=(v)=>{
    this.setState({
      showAll:v
    })
  }
  async remove(i){
    // 任何修改操作都要使用send
    await courseListContract.methods.removeCourse(i)
              .send({
                from:this.state.account,
                gas:"5000000"
              })
    this.init()
  }
  render(){

    return <Row style={{marginTop:"30px"}} gutter={16}>
    <Col span={20}>
    <Switch onChange={this.onChangeSwitch} checkedChildren="全部" unCheckedChildren="已上线" defaultChecked></Switch>
    </Col>
      {this.state.detailList.map((detail,i)=>{
        // 合约详情的地址
        const address = this.state.addressList[i]
        // , , 目标，众筹价格， 上线后购买的价格， 图片， 老师要上传的视屏， 总共购买的人数， 是不是上线了， 是不是ceo的角色
        let [name, content, target, fundingPrice, price, img, video, count, isOnline, role] = Object.values(detail)
        if(!this.state.showAll && !isOnline){
          return null
        }
        // 显示数值改变成正常的
        target = web3.utils.fromWei(target)
        fundingPrice = web3.utils.fromWei(fundingPrice)
        price = web3.utils.fromWei(price)

        // 判断用户是否有上线
        let buyPrice = isOnline? price: fundingPrice
        return (
          <Col key={img} span={6}>
            <div className="content">
              <p>
                <span>{name}</span>
                <span>
                  {isOnline
                    ? <Badge count="已上线" style={{backgroundColor:"#52c41a"}}></Badge>
                    : <Badge count="众筹中"></Badge>
                    }
                </span>
              </p>
              {/* <a href=""></a> */}
              {/*图片前缀加上hash值*/}
              <img className="item" style={{display: 'inline-block'}} src={`${ipfsPrefix}${img}`} alt=""/>

              <div className="center">
                <p>
                  {`目标${target}ETH,已有${count}人支持`}
                </p>
                <p>
                  {
                    isOnline ? <Badge count={`上线价${price}ETH`} style={{backgroundColor:"#52c41a"}}></Badge>
                            : <Badge count={`众筹价${fundingPrice}ETH`}></Badge>
                  }
                </p>
                <Button type='primary' block style={{marginBottom:"10px"}}>
                    <Link to={`/detail/${address}`}>
                      查看详情
                    </Link>
                </Button>
                {
                  this.state.isCeo ? <Button onClick={()=>this.remove(i)} type='primary' block>删除</Button> : null
                }
              </div>
            </div>
          </Col>
        )})}
    </Row>
  }
}

export default Course