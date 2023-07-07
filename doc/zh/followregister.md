# Follow 使用说明

使用Relation Protocol部署好的FollowRegister合约，可以实现为用户创建Follow合约。Follow合约可以进行关注与取消关注。FollowRegister与Follow合约均实现了Contract Standard定义的合约接口。

## 构建Contract对象

FollowRegister和FollowWithSign的合约地址、abi文件,以及Follow合约的abi文件可以查询[Relation Protocol资源列表](./resource.md)获得，Follow合约的地址需要通过FollowRegister查到，每个地址拥有自己的Follow合约。
通过ethers构建FollowRegisterContract对象：

```javascript
import { ethers, providers } from 'ethers'

const getFollowRegisterContractInstance = () => {
    // FollowRegister合约地址
    const contractAddress = '0xab8Dde275F3d2508c578C5bbDf43E81964BF18A4'
    const provider = new providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, followRegisterAbi, signer)
    return contract
}

const getFollowWithSignContractInstance = () => {
    const contractAddress = '0xAC0f863b66173E69b1C57Fec5e31c01c7C6959B7'
    const provider = new providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, followWithSignAbi, signer)
    return contract
}
```

## 调用合约方法

### FollowRegister

1. 部署Follow合约


```javascript
const followRegisterContract = getFollowRegisterContractInstance()
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
await (
    await followRegisterContract.deployFollowContract(accounts[0])
).wait()
```

2. 查询用户的Follow合约，并构建Contract对象

用户部署过Follow合约后，可以通过地址查询到Follow合约的地址

```javascript
const addr = '0x000...';
const followRegisterContract = getFollowRegisterContractInstance()
const followContractAddress = await followRegisterContract.ownedFollowContract(addr);

const getFollowContractInstance = (followContractAddress) => {
    const provider = new providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(followContractAddress, followAbi, signer)
    return contract
}
```

### Follow

1. 关注

用户关注某个地址，需要调用对方的Follow合约

```javascript
const addr = '0x000...';
const followRegisterContract = getFollowRegisterContractInstance()
const followContractAddress = await followRegisterContract.ownedFollowContract(addr);
const followContract = getFollowContractInstance(followContractAddress)

await (
    await followContract.follow()
).wait()
```


2. 取消关注


```javascript
const addr = '0x000...';
const followRegisterContract = getFollowRegisterContractInstance()
const followContractAddress = await followRegisterContract.ownedFollowContract(addr);
const followContract = getFollowContractInstance(followContractAddress)

await (
    await followContract.unfollow()
).wait()
```


3. 用户的粉丝列表

遍历用户Follow合约的token owner，即可得到他的粉丝列表

```javascript
const addr = '0x000...';
const followRegisterContract = getFollowRegisterContractInstance()
const followContractAddress = await followRegisterContract.ownedFollowContract(addr);
const followContract = getFollowContractInstance(followContractAddress)

const numOfFollower = await followContract.totalSupply();
var followerList = [];
for(var i = 0; i < numOfFollower;i++){
    const tokenId = await followContract.tokenByIndex(i);
    const follower = await followContract.ownerOf(tokenId);
    followerList.push(follower);
}
```

4. 关注（代支付Gas费）

用户对数据进行签名，打包成上链参数。任意地址可携带此上链参数发起交易，Gas费由发起交易的地址支付。

```javascript
import { Bytes } from '@ethersproject/bytes'

const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

const followRegisterContract = getFollowRegisterContractInstance()
const followContractAddress = await followRegisterContract.ownedFollowContract(accounts[0]);
const followContract = getFollowContractInstance(followContractAddress)
const followWithsignContract = getFollowWithSignContractInstance(followContractAddress)

const name = await followWithsignContract.name();
const nonce = await followWithsignContract.nonces(accounts[0]);
const deadline = Date.parse(new Date()) / 1000 + 100;
const sign = await getSign(await buildFollowParams(name, followWithsignContract.toLowerCase(),followContractAddress.toLowerCase(), parseInt(nonce), deadline), accounts[0]);
//该参数为调用followWithSign方法的入参
var param = 
    {"sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline}, 
        "target": followContractAddress,
        "addr": accounts[0]
    }
//实际场景中，这个方法由实际支付Gas的账户来调用
await followWithsignContract.connect(accounts[1]).followWithSign(param);


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
async function buildFollowParams(name, contractAddress, followContractAddress, nonce, deadline) {
    return {
        domain: {
            chainId: await getChainId(),
            name: name,
            verifyingContract: contractAddress,
            version: '1',
        },

        // Defining the message signing data content.
        message: {
            target: followContractAddress,
            nonce: nonce,
            deadline: deadline,
        },
        // Refers to the keys of the *types* object below.
        primaryType: 'FollowWithSign',
        types: {
            EIP712Domain: [
                {name: 'name', type: 'string'},
                {name: 'version', type: 'string'},
                {name: 'chainId', type: 'uint256'},
                {name: 'verifyingContract', type: 'address'},
            ],
            FollowWithSign: [
                {name: 'target', type: 'address'},
                {name: 'nonce', type: 'uint256'},
                {name: 'deadline', type: 'uint256'},
            ],
        },
    };
}
```

5. 取消关注（代支付Gas费）

用户对数据进行签名，打包成上链参数。任意地址可携带此上链参数发起交易，Gas费由发起交易的地址支付。


```javascript
import { Bytes } from '@ethersproject/bytes'

const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

const followRegisterContract = getFollowRegisterContractInstance()
const followContractAddress = await followRegisterContract.ownedFollowContract(accounts[0]);
const followContract = getFollowContractInstance(followContractAddress)
const followWithSignContract = getFollowWithSignContractInstance(followContractAddress)

const name = await followWithSignContract.name();
const nonce = await followWithSignContract.nonces(accounts[0]);
const deadline = Date.parse(new Date()) / 1000 + 100;
const sign = await getSign(await buildUnFollowParams(name, followWithSignContract.address.toLowerCase(), followContractAddress.toLowerCase(),parseInt(nonce), deadline), accounts[0]);
//该参数为调用followWithSign方法的入参
var param = 
    {"sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
    "target": followContractAddress,
    "addr": accounts[0]
    }
//实际场景中，这个方法由实际支付Gas的账户来调用
await followWithSignContract.connect(accounts[1]).unfollowWithSign(param);


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

async function buildUnFollowParams(name, contractAddress, followContractAddress,nonce, deadline) {
    return {
        domain: {
            chainId: await getChainId(),
            name: name,
            verifyingContract: contractAddress,
            version: '1',
        },

        // Defining the message signing data content.
        message: {
            target: followContractAddress,
            nonce: nonce,
            deadline: deadline,
        },
        // Refers to the keys of the *types* object below.
        primaryType: 'UnFollowWithSign',
        types: {
            EIP712Domain: [
                {name: 'name', type: 'string'},
                {name: 'version', type: 'string'},
                {name: 'chainId', type: 'uint256'},
                {name: 'verifyingContract', type: 'address'},
            ],
            UnFollowWithSign: [
                {name: 'target', type: 'address'},
                {name: 'nonce', type: 'uint256'},
                {name: 'deadline', type: 'uint256'},
            ],
        },
    };
}
```