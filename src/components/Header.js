import React from 'react'
import { Menu, Layout } from 'antd'
import { Link, withRouter } from 'react-router-dom'
const Header = Layout.Header
class HeadComp extends React.Component{
  render(){

    return (
      <Header>
        <div className="logo">
          <img src="/imooc.png" alt=""/>
        </div>
        <Menu
          // 主题
          theme='dark'
          // 水平的
          mode='horizontal'
          // 默认选择 当前路由的路劲
          defaultSelectedKeys={[this.props.location.pathname]}
          style={{lineHeight:'64px'}}
        >
          <Menu.Item key="/">
            <Link to='/'>首页</Link>
          </Menu.Item>
          <Menu.Item key="/qa">
            <Link to='/qa'>问答</Link>
          </Menu.Item>
          <Menu.Item key="/create">
            <Link to='/create'>我要众筹</Link>
          </Menu.Item>
        </Menu>
      </Header>
    )
  }
}

export default withRouter(HeadComp)