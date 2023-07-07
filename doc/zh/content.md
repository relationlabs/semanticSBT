# Content 使用说明

我们使用Relation Protocol部署好的Relation Content合约，可以实现用户身份数据的存储与查询。Relation Content合约是对Contract Standard里Content的实现。

## 构建Contract对象

Content以及ContentWithSign的合约地址以及abi文件可以查询[Relation Protocol资源列表](./resource.md)获得，通过ethers构建Contract对象：

```javascript
import { ethers, providers } from 'ethers'

const getContractInstance = () => {
  // 合约地址
  const contractAddress = '0xAC0f863b66173E69b1C57Fec5e31c01c7C6959B7'
  const provider = new providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddress, contentAbi, signer)
  return contract
}

const getContentWithSignContractInstance = () => {
    // 合约地址
    const contractAddress = ''
    const provider = new providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, contentWithSignAbi, signer)
    return contract
}
```

## 调用合约方法

### 用户自付Gas费

1. 发布内容

用户可以将需要发布的内容上传至Arweave，内容格式为：
```json
{
  "content": {
    "body": "${The body of content}",
    "title": "${The title of content}"
  }
}
```
上传后得到的交易哈希，作为content记录至合约中

```javascript
const contract = getContractInstance()
const content = 'zX_Oa1...';
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

await (
    await contract.post(content)
).wait()
```



2. 查询用户发布的内容列表

遍历出用户的token列表，即可得到其发布的内容列表

```javascript

const addr = '0x000...';
const contract = getContractInstance()

//查询地址持有的token数量
const balance = await contract.balanceOf(addr);
var contentList = [];
for(var i = 0; i < balance;i++){
    //根据索引查到我持有的tokenId
    const tokenId = await contract.tokenOfOwnerByIndex(addr,i);
    //查询tokenId对应的发布内容
    const content = await contract.contentOf(tokenId);
    contentList.push(content);
}
```

### 代付Gas费

用户对数据进行签名，构建上链参数。任意地址可携带此上链参数调用合约发起交易，Gas费由发起交易的地址支付。


1. 发布内容（代支付Gas费）

用户可以将需要发布的内容上传至Arweave，内容格式为：
```json
{
  "content": {
    "body": "${The body of content}",
    "title": "${The title of content}"
  }
}
```
上传后得到的交易哈希，构建上链参数。由实际支付Gas费的地址携带此上链参数调用合约。

```javascript
import { Bytes } from '@ethersproject/bytes'

const contract = getContractInstance()
const contractWithSign = getContentWithSignContractInstance()
const postContent = 'zX_Oa1...';
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

let name = await contractWithSign.name();
let nonce = await contractWithSign.nonces(accounts[0]);
//签名过期时间(单位：秒)。此处示例为当前时间100s之后签名失效
let deadline = Date.parse(new Date()) / 1000 + 100;
let sign = await getSign(await buildPostParams(
        name,
        contractWithSign.address.toLowerCase(),
    contract.address.toLowerCase(),
        postContent,
        parseInt(nonce),
        deadline),
    accounts[0]);
//构建参数
let param = {
    "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
    "target": contract.address,
    "addr": accounts[0],
    "content": postContent
}
//实际场景中，这个方法由实际支付Gas的账户来调用
await contractWithSign.connect(accounts[1]).postWithSign(param);



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

function buildPostParams(name, contractAddress, contentContractAddress, content, nonce, deadline) {
    return {
        domain: {
            chainId: getChainId(),
            name: name,
            verifyingContract: contractAddress,
            version: '1',
        },

        // Defining the message signing data content.
        message: {
            target: contentContractAddress,
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

