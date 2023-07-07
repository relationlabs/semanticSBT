# PrivacyContent 使用说明

我们使用Relation Protocol部署好的Relation PrivacyContent合约，可以实现用户身份数据的存储与查询。Relation PrivacyContent合约是对Contract
Standard里PrivacyContent的实现。

## 构建Contract对象

PrivacyContent和PrivacyContentWithSign的合约地址以及abi文件可以查询[Relation Protocol资源列表](./resource.md)获得，通过ethers构建Contract对象：

```javascript
import {ethers, providers} from 'ethers'

const getContractInstance = () => {
    // 合约地址
    const contractAddress = '0x1A4231bedA090c6903c4731518C616F8FAEc5dc7'
    const provider = new providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, privacyContentAbi, signer)
    return contract
}

const getPrivacyContentWithSignContractInstance = () => {
    // 合约地址
    const contractAddress = ''
    const provider = new providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, privacyContentWithSignAbi, signer)
    return contract
}
```

## 调用合约方法

### 用户自付gas费

1. 预生成token

用户需要预生成token,在调用post方法时传入预生成的tokenId。当用户调用post方法，会消耗掉预生成的token。

```javascript
const privacyContract = getContractInstance()
await (
    await privacyContract.prepareToken()
).wait()
```

2. 查询用户预生成的token

```javascript
const privacyContract = getContractInstance()
const accounts = await ethereum.request({method: 'eth_requestAccounts'})

const tokenId = await privacyContract.ownedPrepareToken(accounts[0]);
```

3. 发布内容

预生成token之后，才能发布内容。用户需要通过[Lit Protocol](https://developer.litprotocol.com/sdk/explanation/encryption/#encrypting)进行数据加密，然后将需要发布的内容上传至Arweave，内容格式为：

```json

"encryptionBy": "lit-protocol",
"accessCondition": [
{
"contractAddress": "${The contract address of Semantic SBT}",
"standardContractType": "ERC721",
"chain": "polygon",
"method": "isViewerOf",
"parameters": [
":userAddress",
"${The tokenId}"
],
"returnValueTest": {
"comparator": "=",
"value": true
}
}
],
"encryptedSymmetricKey": "${A hex string that LIT will use to decrypt your content as long as you satisfy the conditions}",
// encrypted content
"encryptedObject": "${The encrypted content}"
}
```

上传后得到的交易哈希，作为content记录至合约中

```javascript
const privacyContract = getContractInstance()
const content = 'zX_Oa1...';
const accounts = await ethereum.request({method: 'eth_requestAccounts'})

await (
    await privacyContract.post(content)
).wait()
```

3. 将内容分享给我的follower

用户可以将上传的隐私数据分享给follower，需要指定tokenId以及要分享的Follow合约地址。为了避免出现循环次数过多引发查询异常，合约内限制最多分享20个Follow合约地址

```javascript
const myFollowContractAddress = '0x000...';
const tokenId = '1';
const privacyContract = getContractInstance()

await (
    await privacyContract.shareToFollower(tokenId, myFollowContractAddress)
).wait()
```

4. 将内容分享给指定的Dao

用户可以将上传的隐私数据分享给指定的Dao，那么所有的Dao成员将可以通过Lit Protocol解密出隐私数据。为了避免出现循环次数过多引发查询异常，合约内限制最多分享20个Dao合约地址

```javascript
const myDaoContractAddress = '0x000...';
const tokenId = '1';
const privacyContract = getContractInstance()

await (
    await privacyContract.shareToDao(tokenId, myDaoContractAddress)
).wait()
```

5. 查询tokenId已分享的Follow合约地址列表

通过sharedFollowAddressCount 和 sharedFollowAddressByIndex方法可以遍历出tokenId已分享的Follow合约地址列表

```javascript
const addr = '0x000...';
const privacyContract = getContractInstance()
const tokenId = '1';

//查询tokenId已分享的Follow合约数量
const count = await contract.sharedFollowAddressCount(tokenId);
var followContractAddressList = [];
for (var i = 0; i < count; i++) {
    //查询Follow合约地址
    const followContractAddress = await contract.sharedFollowAddressByIndex(tokenId, i);
    followContractAddressList.push(followContractAddress);
}
```

6. 查询tokenId已分享的Dao合约地址列表

通过sharedDaoAddressCount 和 sharedFDaoAddressByIndex方法可以遍历出tokenId已分享的Follow合约地址列表

```javascript
const addr = '0x000...';
const privacyContract = getContractInstance()
const tokenId = '1';

//查询tokenId已分享的Dao合约数量
const count = await contract.sharedDaoAddressCount(tokenId);
var followContractAddressList = [];
for (var i = 0; i < count; i++) {
    //查询已分享的Dao合约地址
    const daoContractAddress = await contract.sharedFDaoAddressByIndex(tokenId, i);
    daoContractAddressList.push(daoContractAddress);
}
```

7. 查询用户发布的内容列表

遍历出用户的token列表，即可得到其发布的内容列表

```javascript
const addr = '0x000...';
const privacyContract = getContractInstance()

//查询地址持有的token数量
const balance = await contract.balanceOf(addr);
var contentList = [];
for (var i = 0; i < balance; i++) {
    //根据索引查到我持有的tokenId
    const tokenId = await contract.tokenOfOwnerByIndex(addr, i);
    //查询tokenId对应的发布内容
    const content = await contract.contentOf(tokenId);
    contentList.push(content);
}
```



8. 预生成token(代付Gas费)

用户对数据进行签名，构建上链参数。任意地址可携带此上链参数发起交易，Gas费由发起交易的地址支付。


```javascript
import { Bytes } from '@ethersproject/bytes'

const accounts = await ethereum.request({method: 'eth_requestAccounts'})
const privacyContract = getContractInstance()
const privacyWithSignContract = getPrivacyContentWithSignContractInstance()

const name = await privacyWithSignContract.name();
const nonce = await privacyWithSignContract.nonces(accounts[0]);
//签名过期时间(单位：秒)。此处示例为当前时间100s之后签名失效
const deadline = Date.parse(new Date()) / 1000 + 100;
const sign = await getSign(await buildPrepareParams(name, privacyWithSignContract.address.toLowerCase(),privacyContract.address, parseInt(nonce), deadline), accounts[0]);
var param = 
    {"sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline}, 
        "target": privacyContract.address,
        "addr": accounts[0]
    }
//实际场景中，这个方法由实际支付Gas的账户来调用
await privacyWithSignContract.connect(accounts[1]).prepareTokenWithSign(param);

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

async function buildPrepareParams(name, contractAddress, privacyContentAddress,nonce, deadline) {
    return {
        domain: {
            chainId: await getChainId(),
            name: name,
            verifyingContract: contractAddress,
            version: '1',
        },

        // Defining the message signing data content.
        message: {
            target: privacyContentAddress,
            nonce: nonce,
            deadline: deadline,
        },
        // Refers to the keys of the *types* object below.
        primaryType: 'PrepareTokenWithSign',
        types: {
            EIP712Domain: [
                {name: 'name', type: 'string'},
                {name: 'version', type: 'string'},
                {name: 'chainId', type: 'uint256'},
                {name: 'verifyingContract', type: 'address'},
            ],
            PrepareTokenWithSign: [
                {name: 'target', type: 'address'},
                {name: 'nonce', type: 'uint256'},
                {name: 'deadline', type: 'uint256'},
            ],
        },
    };
}
```

9. 发布内容(代付Gas费)

用户上传内容到Arweave，对数据进行签名，构建上链参数。任意地址可携带此上链参数发起交易，Gas费由发起交易的地址支付。

```javascript
import { Bytes } from '@ethersproject/bytes'

const content = 'zX_Oa1...';
const accounts = await ethereum.request({method: 'eth_requestAccounts'})
const privacyContract = getContractInstance()
const privacyWithSignContract = getPrivacyContentWithSignContractInstance()

let name = await privacyWithSignContract.name();
let nonce = await privacyWithSignContract.nonces(accounts[0]);
//签名过期时间(单位：秒)。此处示例为当前时间100s之后签名失效
let deadline = Date.parse(new Date()) / 1000 + 100;
let sign = await getSign(await buildPostParams(
        name,
        privacyWithSignContract.address.toLowerCase(),
        privacyContent.address.toLowerCase(),
        content,
        parseInt(nonce),
        deadline),
    accounts[0]);
let param = {
    "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
    "target": privacyContract.address,
    "addr": accounts[0],
    "content": content
}
//实际场景中，这个方法由实际支付Gas的账户来调用
await privacyWithSignContract.connect(accounts[1]).postWithSign(param);


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

async function buildPostParams(name, contractAddress, privacyContentAddress, content, nonce, deadline) {
    return {
        domain: {
            chainId: await getChainId(),
            name: name,
            verifyingContract: contractAddress,
            version: '1',
        },

        // Defining the message signing data content.
        message: {
            target: privacyContentAddress,
            content: content,
            nonce: nonce,
            deadline: deadline,
        },
        // Refers to the keys of the *types* object below.
        primaryType: 'PostWithSign',
        types: {
            EIP712Domain: [
                {name: 'name', type: 'string'},
                {name: 'version', type: 'string'},
                {name: 'chainId', type: 'uint256'},
                {name: 'verifyingContract', type: 'address'},
            ],
            PostWithSign: [
                {name: 'target', type: 'address'},
                {name: 'content', type: 'string'},
                {name: 'nonce', type: 'uint256'},
                {name: 'deadline', type: 'uint256'},
            ],
        },
    };
}
```

10. 将内容分享给我的follower(代支付Gas费)

用户对需要分享的tokenId以及Follow合约地址进行签名，构建上链参数。任意地址可携带此上链参数发起交易，Gas费由发起交易的地址支付。

```javascript
import { Bytes } from '@ethersproject/bytes'

const privacyContent = '';
const followContractAddress = '0x0001...';
const tokenId = '1'
const accounts = await ethereum.request({method: 'eth_requestAccounts'})
const privacyContent = getContractInstance()
const privacyWithSignContract = getPrivacyContentWithSignContractInstance()

let name = await privacyWithSignContract.name();
let nonce = await privacyWithSignContract.nonces(accounts[0]);
//签名过期时间(单位：秒)。此处示例为当前时间100s之后签名失效
let deadline = Date.parse(new Date()) / 1000 + 100;
let sign = await getSign(await buildShareToFollowerParams(
        name,
        privacyWithSignContract.address.toLowerCase(),
        privacyContent.address.toLowerCase(),
        tokenId,
        followContractAddress,
        parseInt(nonce),
        deadline),
    accounts[0]);
let param = {
    "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
    "target": privacyContent.address,
    "addr": accounts[0],
    "tokenId": parseInt(tokenId),
    "followContractAddress": followContractAddress
}
//实际场景中，这个方法由实际支付Gas的账户来调用
await privacyWithSignContract.connect(accounts[1]).shareToFollowerWithSign(param);


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

async function buildShareToFollowerParams(name, contractAddress, privacyContentAddress, tokenId, followContractAddress, nonce, deadline) {
    return {
        domain: {
            chainId: await getChainId(),
            name: name,
            verifyingContract: contractAddress,
            version: '1',
        },

        // Defining the message signing data content.
        message: {
            target: privacyContentAddress,
            tokenId: tokenId,
            followContractAddress: followContractAddress,
            nonce: nonce,
            deadline: deadline,
        },
        // Refers to the keys of the *types* object below.
        primaryType: 'ShareToFollowerWithSign',
        types: {
            EIP712Domain: [
                {name: 'name', type: 'string'},
                {name: 'version', type: 'string'},
                {name: 'chainId', type: 'uint256'},
                {name: 'verifyingContract', type: 'address'},
            ],
            ShareToFollowerWithSign: [
                {name: 'target', type: 'address'},
                {name: 'tokenId', type: 'uint256'},
                {name: 'followContractAddress', type: 'address'},
                {name: 'nonce', type: 'uint256'},
                {name: 'deadline', type: 'uint256'},
            ],
        },
    };
}
```

11. 将内容分享给指定的dao(代支付Gas费)

用户对需要分享的tokenId以及dao合约地址进行签名，构建上链参数。任意地址可携带此上链参数发起交易，Gas费由发起交易的地址支付。

```javascript
import { Bytes } from '@ethersproject/bytes'

const privacyContent = '';
const daoContractAddress = '0x0001...';
const tokenId = '1'
const accounts = await ethereum.request({method: 'eth_requestAccounts'})
const privacyContent = getContractInstance()
const privacyWithSignContract = getPrivacyContentWithSignContractInstance()

let name = await privacyWithSignContract.name();
let nonce = await privacyWithSignContract.nonces(accounts[0]);
//签名过期时间(单位：秒)。此处示例为当前时间100s之后签名失效
let deadline = Date.parse(new Date()) / 1000 + 100;
let sign = await getSign(await buildShareToDaoParams(
        name,
        privacyWithSignContract.address.toLowerCase(),
        privacyContent.address.toLowerCase(),
        tokenId,
        daoContractAddress,
        parseInt(nonce),
        deadline),
    accounts[0]);
let param = {
    "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
    "target": privacyContent.address,
    "addr": accounts[0],
    "tokenId": parseInt(tokenId),
    "daoContractAddress": daoContractAddress
}
//实际场景中，这个方法由实际支付Gas的账户来调用
await privacyWithSignContract.connect(accounts[1]).shareToDaoWithSign(param);


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

async function buildShareToDaoParams(name, contractAddress, privacyContentAddress, tokenId, daoContractAddress, nonce, deadline) {
    return {
        domain: {
            chainId: await getChainId(),
            name: name,
            verifyingContract: contractAddress,
            version: '1',
        },

        // Defining the message signing data content.
        message: {
            target: privacyContentAddress,
            tokenId: tokenId,
            daoContractAddress: daoContractAddress,
            nonce: nonce,
            deadline: deadline,
        },
        // Refers to the keys of the *types* object below.
        primaryType: 'ShareToDaoWithSign',
        types: {
            EIP712Domain: [
                {name: 'name', type: 'string'},
                {name: 'version', type: 'string'},
                {name: 'chainId', type: 'uint256'},
                {name: 'verifyingContract', type: 'address'},
            ],
            ShareToDaoWithSign: [
                {name: 'target', type: 'address'},
                {name: 'tokenId', type: 'uint256'},
                {name: 'daoContractAddress', type: 'address'},
                {name: 'nonce', type: 'uint256'},
                {name: 'deadline', type: 'uint256'},
            ],
        },
    };
}
```

