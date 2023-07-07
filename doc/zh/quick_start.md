# 快速开始

我们使用Relation Protocol 的 NameService合约作为示例，演示如何快速接入

1. 环境搭建

To complete this tutorial successfully, you must have [Node.js](https://nodejs.org/en/) and [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) installed on your machine.


创建项目，这里使用 [vite](https://vitejs.dev/guide/) 的`react`模板.

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
```
安装[ethers.js](https://github.com/ethers-io/ethers.js)，用于与合约交互

```bash
npm install ethers@5
```


2. 引入 abi

在src目录下创建一个abi.json文件，内容可访问[Relation Protocol资源列表](./resource.md)获得。

并在App.jsx引入
```javascript
import abi from './abi.json'
```

3. 合约调用

引入ethers，并创建getContractInstance方法获取contract实例以便后续调用合约的方法，需要注意的是本示例中使用的合约是部署在mumbai网络的，请确保metamask切换到mumbai网络
```javascript
import { ethers, providers } from 'ethers'

// 要注册的名称
const registerName = 'test-' + Date.now()

const getContractInstance = () => {
  // 合约地址
  const contractAddress = '0x6A22794A1e2aBdEC057a6dc24A6BFB53F9518016'
  const provider = new providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddress, abi, signer)
  return contract
}
```
然后编写注册方法以及查询方法，
```javascript
const getOwnerOfName = async () => {
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
  const contract = getContractInstance()

  const res = await contract.ownerOfName(registerName + '.rel')
  setName(res)
}

const register = async () => {
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
  const contract = getContractInstance()
  const res = await (
    await contract.register(accounts[0], registerName, false)
  ).wait()

  getOwnerOfName()
}
```
完整App.jsx代码如下
```javascript
import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import abi from './abi.json'
import { ethers, providers } from 'ethers'

// 要注册的名称
const registerName = 'test-' + Date.now()

const getContractInstance = () => {
  // 合约地址
  const contractAddress = '0x0D195ab46a9C9C4f97666A76AADb35d93965Cac8'
  const provider = new providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddress, abi, signer)
  return contract
}

function App() {
  const [name, setName] = useState('')

  const getOwnerOfName = async () => {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    const contract = getContractInstance()

    const res = await contract.ownerOfName(registerName + '.rel')
    setName(res)
  }

  const register = async () => {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    const contract = getContractInstance()
    const res = await (
      await contract.register(accounts[0], registerName, false)
    ).wait()

    getOwnerOfName()
  }

  useEffect(() => {
    getOwnerOfName()
  }, [])

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Name Service</h1>
      <div className="card">
        <button onClick={register}>Register</button>
      </div>
      <p className="read-the-docs">
        Owner of {registerName}: {name}
      </p>
    </div>
  )
}

export default App
```

4. 运行项目

```bash
npm run dev
```

然后在浏览器中打开[http://localhost:5173/](http://localhost:5173/)即可体验