import React from 'react'
import { Form, Input, Button, Row, Col, message, Comment, Badge, Modal } from 'antd'
import { web3, saveJsonOnIpfs, courseListContract, readJsonFromIpfs } from '../config'
const FormItem = Form.Item
// 问答
class Qa extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      questions: [],
      title: '',
      content: '',
      account: '',
      ansIndex: 0,
      showModal: false,
      answer: ''
    }
    this.init()
  }
  async init() {
    // 获取当前账号
    let [account] = await web3.eth.getAccounts()
    const qas = await courseListContract.methods.getQa().call()
    console.log(qas)
    let ret = []
    for (let i = 0; i < qas.length; i += 2) {
      ret.push(readJsonFromIpfs(qas[i], qas[i + 1]))
    }
    const questions = await Promise.all(ret)
    console.log(questions)
    this.setState({
      account,
      questions
    })
  }
  showInfoModal(i) {
    this.setState({
      ansIndex: i,
      showModal: true
    })
  }
  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  // 提交
  handleSubmit = async (e) => {
    e.preventDefault()

    // 1. 拼接数据
    const obj = {
      title: this.state.title,
      content: this.state.content,
      answers: []
    }
    const hide = message.loading('提问中', 0)
    // 2. json存储ipfs
    const hash = await saveJsonOnIpfs(obj)
    // 3. ipfs哈希上链
    const hash1 = hash.slice(0, 23)
    const hash2 = hash.slice(23)

    await courseListContract.methods.createQa(
      web3.utils.asciiToHex(hash1),
      web3.utils.asciiToHex(hash2)
    ).send({
      from: this.state.account,
      gas: '5000000'
    })
    this.setState({
      title: '',
      content: ''
    })
    hide()
  }
  handleAnsChange = (e) => {
    this.setState({
      answer: e.target.value
    })
  }
  handleOk = async (e) => {
    // 获取到是哪一个问题
    const item = this.state.questions[this.state.ansIndex]
    item.answers.push({
      text: this.state.answer
    })
    // 保存
    const hash = await saveJsonOnIpfs(item)
    // 存储hash因为有限制所以分开传hash
    const hash1 = web3.utils.asciiToHex(hash.slice(0, 23))
    const hash2 = web3.utils.asciiToHex(hash.slice(23))
    await courseListContract.methods.updateQa(this.state.ansIndex, hash1, hash2)
      .send({
        from: this.state.account,
        gas: '5000000'
      })
    this.init()
    this.setState({
      showModal: false,
      answer: ''

    })
  }
  handleCancel = (e) => {
    this.setState({
      showModal: false,
      answer: ''
    })
  }
  render() {
    return <Row justify='center' type='flex'>
      <Col span={20}>
        {/* 问题列表 */}
        {
          this.state.questions.map((item, index) => {
            return <Comment
              key={item.title}
              actions={[<span onClick={() => this.showInfoModal(index)}>回复</span>]}
              author={item.title}
              content={item.content}
              // 图片
              avatar={<Badge count={index + 1} />}
            >
              {item.answers.map((ans) => {
                return <Comment
                  key={ans.text}
                  content={ans.text}
                >

                </Comment>
              })}

            </Comment>
          })
        }

        <Form onSubmit={this.handleSubmit} style={{ marginTop: "20px" }}>
          <FormItem label='标题'>
            <Input value={this.state.title} name='title' onChange={this.handleChange}></Input>
          </FormItem>
          <FormItem label='问题描述'>
            <Input.TextArea
              rows={6}
              value={this.state.content}
              name='content'
              onChange={this.handleChange}></Input.TextArea >
          </FormItem>
          <FormItem>
            <Button type='primary' htmlType='submit'>提问</Button>
          </FormItem>
        </Form>
        <Modal
          title="回复"
          visible={this.state.showModal}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Input value={this.state.answer} onChange={this.handleAnsChange}></Input>

        </Modal>

      </Col>

    </Row>
  }
}

export default Qa