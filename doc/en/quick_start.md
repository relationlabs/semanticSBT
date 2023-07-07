#  Quick Start

Using Relation Protocol's NameService contract as an example, we will demonstrate how to quickly access the contract.

1. Prepare the environment

To complete this tutorial successfully, you must have [Node.js](https://nodejs.org/en/) and [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) installed on your machine.


To create a project, we will use [vite](https://vitejs.dev/guide/) 's `react` template.

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
```
Install [ethers.js](https://github.com/ethers-io/ethers.js) to interact with the contract.

```bash
npm install ethers@5
```


2. Import the abi file

Create an abi.json file under the "src" directory, the content of which can be founded on [Relation Protocol's list of resources](./resource.md).

import the file in App.jsx
```javascript
import abi from './abi.json'
```

3. Call a contract

Import "ethers" and create a method "getContractInstance" to acquire a "contract" instance so that it can be used to call a contract. Note that the contract in this example is deployed on the mumbai network, so make sure that Metamask is switched to this network.
```javascript
import { ethers, providers } from 'ethers'

// The name to be registered
const registerName = 'test-' + Date.now()

const getContractInstance = () => {
  // The contract address
  const contractAddress = '0x6A22794A1e2aBdEC057a6dc24A6BFB53F9518016'
  const provider = new providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddress, abi, signer)
  return contract
}
```
Write methods for registration and querying.
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
The complete App.jsx is as follows:
```javascript
import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import abi from './abi.json'
import { ethers, providers } from 'ethers'

// The name to be registered
const registerName = 'test-' + Date.now()

const getContractInstance = () => {
  // The contract address
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

4. Run the project

```bash
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.
