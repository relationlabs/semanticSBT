# Dao 使用说明

我们使用Relation Protocol部署好的DaoRegister合约，可以为用户创建Dao合约。Dao合约可以实现对Dao成员的管理。DaoRegister与Dao合约均实现了Contract Standard定义的合约接口。

## 构建Contract对象

DaoRegister和DaoWithSign的合约地址、abi文件,以及Dao合约的abi文件可以查询[Relation Protocol资源列表](./resource.md)获得，Dao合约的地址需要通过DaoRegister查到。

- 构建DaoRegisterContract对象：

```javascript
import { ethers, providers } from 'ethers'

const getDaoRegisterContractInstance = () => {
  // DaoRegister合约地址
  const contractAddress = '0xAC0f863b66173E69b1C57Fec5e31c01c7C6959B7'
  const provider = new providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddress, daoRegisterAbi, signer)
  return contract
}

const getDaoWithSignContractInstance = () => {
    // DaoRegister合约地址
    const contractAddress = '0xAC0f863b66173E69b1C57Fec5e31c01c7C6959B7'
    const provider = new providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, daoWithSignAbi, signer)
    return contract
}
```


## 调用合约方法

### DaoRegister

1. 部署Dao合约


```javascript
const daoRegisterContract = getDaoRegisterContractInstance()
const daoName = 'my-first-dao';
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
await (
    await daoRegisterContract.deployDaoContract(accounts[0],daoName)
).wait()
```

2. 查询用户创建的dao列表

遍历用户在DaoRegister合约上持有的token，即可以得到用户创建的dao列表

```javascript
const addr = '0x000...';
const daoRegisterContract = getDaoRegisterContractInstance()

const balance = await daoRegisterContract.balanceOf(addr);
var daoContractAddress = [];
for(var i = 0; i < balance; i++){
    const tokenId = await daoRegisterContract.tokenOfOwnerByIndex(addr,i);
    const {daoOwner,contractAddress} = await daoRegisterContract.daoOf(tokenId);
    daoContractAddress.push(contractAddress);
}
```

- 构建DaoContract对象
```javascript

const getDaoContractInstance = (contractAddress) => {
  const provider = new providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddress, daoRegisterAbi, signer)
  return contract
}

```



### Dao


1. 查询Dao的管理员

```javascript
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const ownerAddress = await daoContract.ownerOfDao();
```


2. 设置DaoURI

Dao的管理员可以给Dao添加描述以及头像，将描述和头像存放在Arweave上，内容格式为：
```json
{
  "avatar": "${The avatar of DAO}",
  "description": "${The description of DAO}"
}
```
上传的交易哈希，作为DaoURI存储至合约里

```javascript
const daoURI = 'hX_Mne1...';
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
await (
    await daoContract.setDaoURI(daoURI)
).wait()
```


3. 查询DaoURI


```javascript
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const daoURI = daoContract.daoURI();

```

4. 修改Dao的名称

管理员可以给修改Dao的名称

```javascript
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const daoURI = daoContract.daoURI();
const daoName = 'new-name';
await (
    await daoContract.setName(daoName)
).wait()
```


5. 查询Dao的名称

```javascript
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const daoName = daoContract.name();
```

6. 管理员添加Dao成员

管理员可以将指定的地址加入到Dao中

```javascript
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const members = ['0x001...','0x002...','0x003...'...];
await (
    await daoContract.addMember(members)
).wait()
```


7. 设置开发加入

管理员可以将Dao设置为开放加入，即任何用户均可加入dao。

```javascript
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
await (
    await daoContract.setFreeJoin(true)
).wait()
```


7. 用户加入Dao

在管理员设置了开发加入后，用户可自行加入Dao

```javascript
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
await (
    await daoContract.join()
).wait()
```


8. 移除Dao成员

管理员可以移除Dao的成员，普通用户也可自行离开Dao

```javascript
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const addr = '0x001...';
await (
    await daoContract.remove(addr)
).wait()
```


9. 查询Dao成员列表

通过遍历Dao的所有token owner，可以得到完整的Dao成员列表

```javascript
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const memberCount = await daoContractAddress.totalSupply();
var memberList = [];
for(var i = 0; i < memberCount;i++){
    const tokenId = await daoContract.tokenByIndex(i);
    const member = await daoContract.ownerOf(tokenId);
    memberList.push(member);
}
```


10. 设置DaoURI（代付Gas费）

Dao的管理员可以给Dao添加描述以及头像，将描述和头像存放在Arweave上，内容格式为：
```json
{
  "avatar": "${The avatar of DAO}",
  "description": "${The description of DAO}"
}
```
管理员对上传后得到的交易哈希数据进行签名，构建上链参数。任意地址可携带此上链参数发起交易，Gas费由发起交易的地址支付。


```javascript
import { Bytes } from '@ethersproject/bytes'

const daoURI = 'hX_Mne1...';
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const daoWithSignContract = getDaoWithSignContractInstance(daoContractAddress)
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })


let name = await daoWithSignContract.name();
let nonce = await daoWithSignContract.nonces(accounts[0]);
//签名过期时间(单位：秒)。此处示例为当前时间100s之后签名失效
let deadline = Date.parse(new Date()) / 1000 + 100;
let sign = await getSign(await buildSetDaoURIParam(
        name,
        daoWithSignContract.address.toLowerCase(),
        daoContract.address.toLowerCase(),
        daoURI,
        parseInt(nonce),
        deadline),
    accounts[0]);
let param = {
    "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
    "target": daoContract.address,
    "addr": accounts[0],
    "daoURI": daoURI
}
//实际场景中，这个方法由实际支付Gas的账户来调用
await daoWithSignContract.connect(accounts[1]).setDaoURIWithSign(param);


async function getSign(msgParams, signerAddress) {
    const params = [signerAddress, msgParams];
    const trace = await hre.network.provider.send(
        "eth_signTypedData_v4", params);
    return Bytes.splitSignature(trace);
}

async function getChainId() {
    return await ethereum.request({
        method: 'eth_chainId',
    });
}
async function buildSetDaoURIParam(name, contractAddress,daoContractAddress, daoURI, nonce, deadline) {
    return {
        domain: {
            chainId: await getChainId(),
            name: name,
            verifyingContract: contractAddress,
            version: '1',
        },

        // Defining the message signing data content.
        message: {
            target: daoContractAddress,
            daoURI: daoURI,
            nonce: nonce,
            deadline: deadline,
        },
        // Refers to the keys of the *types* object below.
        primaryType: 'SetDaoURIWithSign',
        types: {
            EIP712Domain: [
                {name: 'name', type: 'string'},
                {name: 'version', type: 'string'},
                {name: 'chainId', type: 'uint256'},
                {name: 'verifyingContract', type: 'address'},
            ],
            SetDaoURIWithSign: [
                {name: 'target', type: 'address'},
                {name: 'daoURI', type: 'string'},
                {name: 'nonce', type: 'uint256'},
                {name: 'deadline', type: 'uint256'},
            ],
        },
    };
}

```

11. 管理员添加Dao成员（代付Gas费）

管理员可以将指定的地址加入到Dao中

```javascript
import { Bytes } from '@ethersproject/bytes'

const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const daoWithSignContract = getDaoWithSignContractInstance(daoContractAddress)
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

const members = ['0x001...','0x002...','0x003...'];
let name = await daoWithSignContract.name();
let nonce = await daoWithSignContract.nonces(accounts[0]);
//签名过期时间(单位：秒)。此处示例为当前时间100s之后签名失效
let deadline = Date.parse(new Date()) / 1000 + 100;
let sign = await getSign(await buildAddMemberParam(
        name,
        daoWithSignContract.address.toLowerCase(),
        daoContract.address.toLowerCase(),
        members,
        parseInt(nonce),
        deadline),
    accounts[0]);
let param = {
    "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
    "target": daoContract.address,
    "addr": accounts[0],
    "members": members
}
//实际场景中，这个方法由实际支付Gas的账户来调用
await expect(daoWithSignContract.connect(accounts[1]).addMemberWithSign(param));


async function getSign(msgParams, signerAddress) {
    const params = [signerAddress, msgParams];
    const trace = await hre.network.provider.send(
        "eth_signTypedData_v4", params);
    return Bytes.splitSignature(trace);
}

async function getChainId() {
    return await ethereum.request({
        method: 'eth_chainId',
    });
}

async function buildAddMemberParam(name, contractAddress, daoContractAddress,members, nonce, deadline) {
    return {
        domain: {
            chainId: await getChainId(),
            name: name,
            verifyingContract: contractAddress,
            version: '1',
        },

        // Defining the message signing data content.
        message: {
            target: daoContractAddress,
            members: members,
            nonce: nonce,
            deadline: deadline,
        },
        // Refers to the keys of the *types* object below.
        primaryType: 'AddMemberWithSign',
        types: {
            EIP712Domain: [
                {name: 'name', type: 'string'},
                {name: 'version', type: 'string'},
                {name: 'chainId', type: 'uint256'},
                {name: 'verifyingContract', type: 'address'},
            ],
            AddMemberWithSign: [
                {name: 'target', type: 'address'},
                {name: 'members', type: 'address[]'},
                {name: 'nonce', type: 'uint256'},
                {name: 'deadline', type: 'uint256'},
            ],
        },
    };
}
```


12. 设置开放加入（代付Gas费）

管理员可以将Dao设置为开放加入，即任何用户均可加入dao。

```javascript
import { Bytes } from '@ethersproject/bytes'

const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const daoWithSignContract = getDaoWithSignContractInstance(daoContractAddress)
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

const isFreeJoin = true;
let name = await daoWithSignContract.name();
let nonce = await daoWithSignContract.nonces(accounts[0]);
let deadline = Date.parse(new Date()) / 1000 + 100;
let sign = await getSign(await buildSetFreeJoinParam(
        name,
        daoWithSignContract.address.toLowerCase(),
        daoContract.address.toLowerCase(),
        isFreeJoin,
        parseInt(nonce),
        deadline),
    accounts[0]);
let param = {
    "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
    "target": daoContract.address,
    "addr": accounts[0],
    "isFreeJoin": isFreeJoin
}
//实际场景中，这个方法由实际支付Gas的账户来调用
await daoWithSignContract.connect(accounts[1]).setFreeJoinWithSign(param);


async function getSign(msgParams, signerAddress) {
    const params = [signerAddress, msgParams];
    const trace = await hre.network.provider.send(
        "eth_signTypedData_v4", params);
    return Bytes.splitSignature(trace);
}

async function getChainId() {
    return await ethereum.request({
        method: 'eth_chainId',
    });
}
async function buildSetFreeJoinParam(name, contractAddress, daoContractAddress,isFreeJoin, nonce, deadline) {
    return {
        domain: {
            chainId: await getChainId(),
            name: name,
            verifyingContract: contractAddress,
            version: '1',
        },

        // Defining the message signing data content.
        message: {
            target: daoContractAddress,
            isFreeJoin: isFreeJoin,
            nonce: nonce,
            deadline: deadline,
        },
        // Refers to the keys of the *types* object below.
        primaryType: 'SetFreeJoinWithSign',
        types: {
            EIP712Domain: [
                {name: 'name', type: 'string'},
                {name: 'version', type: 'string'},
                {name: 'chainId', type: 'uint256'},
                {name: 'verifyingContract', type: 'address'},
            ],
            SetFreeJoinWithSign: [
                {name: 'target', type: 'address'},
                {name: 'isFreeJoin', type: 'bool'},
                {name: 'nonce', type: 'uint256'},
                {name: 'deadline', type: 'uint256'},
            ],
        },
    };
}
```


13. 用户加入Dao（代付Gas费）

在管理员设置了开发加入后，用户可自行加入Dao

```javascript
import { Bytes } from '@ethersproject/bytes'

const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const daoWithSignContract = getDaoWithSignContractInstance(daoContractAddress)
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

let name = await daoWithSignContract.name();
let nonce = await daoWithSignContract.nonces(accounts[0]);
let deadline = Date.parse(new Date()) / 1000 + 100;
let sign = await getSign(await buildJoinParam(
        name,
        daoWithSignContract.address.toLowerCase(),
        daoContract.address.toLowerCase(),
        parseInt(nonce),
        deadline),
    accounts[0]);
let param = {
    "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
    "target": daoContract.address,
    "addr": accounts[0]
}
//实际场景中，这个方法由实际支付Gas的账户来调用
await expect(daoWithSignContract.connect(accounts[1]).joinWithSign(param))


async function getSign(msgParams, signerAddress) {
    const params = [signerAddress, msgParams];
    const trace = await hre.network.provider.send(
        "eth_signTypedData_v4", params);
    return Bytes.splitSignature(trace);
}

async function getChainId() {
    return await ethereum.request({
        method: 'eth_chainId',
    });
}
async function buildJoinParam(name, contractAddress, daoContractAddress,nonce, deadline) {
    return {
        domain: {
            chainId: await getChainId(),
            name: name,
            verifyingContract: contractAddress,
            version: '1',
        },

        // Defining the message signing data content.
        message: {
            target: daoContractAddress,
            nonce: nonce,
            deadline: deadline,
        },
        // Refers to the keys of the *types* object below.
        primaryType: 'JoinWithSign',
        types: {
            EIP712Domain: [
                {name: 'name', type: 'string'},
                {name: 'version', type: 'string'},
                {name: 'chainId', type: 'uint256'},
                {name: 'verifyingContract', type: 'address'},
            ],
            JoinWithSign: [
                {name: 'target', type: 'address'},
                {name: 'nonce', type: 'uint256'},
                {name: 'deadline', type: 'uint256'},
            ],
        },
    };
}
```


14. 移除Dao成员（代付Gas费）

管理员可以移除Dao的成员，普通用户也可自行离开Dao

```javascript
import { Bytes } from '@ethersproject/bytes'

const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const daoWithSignContract = getDaoWithSignContractInstance(daoContractAddress)
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

let name = await daoWithSignContract.name();
let nonce = await daoWithSignContract.nonces(accounts[0]);
let deadline = Date.parse(new Date()) / 1000 + 100;
let sign = await getSign(await buildRemoveParam(
        name,
        daoWithSignContract.address.toLowerCase(),
        daoContract.address.toLowerCase(),
        accounts[0].toLowerCase(),
        parseInt(nonce),
        deadline),
    accounts[0]);
let param = {
    "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
    "target": daoContract.address,
    "addr": accounts[0],
    "member": accounts[0]
}
//实际场景中，这个方法由实际支付Gas的账户来调用
await expect(daoWithSignContract.connect(accounts[1]).removeWithSign(param))


async function getSign(msgParams, signerAddress) {
    const params = [signerAddress, msgParams];
    const trace = await hre.network.provider.send(
        "eth_signTypedData_v4", params);
    return Bytes.splitSignature(trace);
}

async function getChainId() {
    return await ethereum.request({
        method: 'eth_chainId',
    });
}
async function buildRemoveParam(name, contractAddress, daoContractAddress,member, nonce, deadline) {
    return {
        domain: {
            chainId: await getChainId(),
            name: name,
            verifyingContract: contractAddress,
            version: '1',
        },

        // Defining the message signing data content.
        message: {
            target: daoContractAddress,
            member: member,
            nonce: nonce,
            deadline: deadline,
        },
        // Refers to the keys of the *types* object below.
        primaryType: 'RemoveWithSign',
        types: {
            EIP712Domain: [
                {name: 'name', type: 'string'},
                {name: 'version', type: 'string'},
                {name: 'chainId', type: 'uint256'},
                {name: 'verifyingContract', type: 'address'},
            ],
            RemoveWithSign: [
                {name: 'target', type: 'address'},
                {name: 'member', type: 'address'},
                {name: 'nonce', type: 'uint256'},
                {name: 'deadline', type: 'uint256'},
            ],
        },
    };
}
```