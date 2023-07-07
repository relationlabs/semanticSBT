# NameService 使用说明

使用Relation Protocol部署好的Relation NameService合约，可以实现用户身份数据的存储与查询。Relation NameService合约是对Contract Standard里Name Service的实现。

## 构建Contract对象

NameService的合约地址以及abi文件可以查询[Relation Protocol资源列表](./resource.md)获得，通过ethers构建Contract对象：

```javascript
import { ethers, providers } from 'ethers'

const getContractInstance = () => {
  // 合约地址
  const contractAddress = '0x0D195ab46a9C9C4f97666A76AADb35d93965Cac8'
  const provider = new providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddress, abi, signer)
  return contract
}
```

## 调用合约方法

1. 注册名称

register可以由用户调用给自己注册，也可以由管理员指定的minter用户给其他用户注册。且注册的同时，可以选择是否设置解析，设置解析的名称，则可以直接通过addr和nameOf方法查到名称与地址的映射关系。

我们给出其中两个示例供参考：

- 给自己注册名称。注册并设置解析
```javascript
// 要注册的名称
const registerName = 'name-one';
const contract = getContractInstance()
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
await (
    await contract.register(accounts[0], registerName, true)
).wait()
```
- minter用户给指定的地址进行注册。仅注册，不设置解析
```javascript
// 要注册的名称
const registerName = 'name-two';
const contract = getContractInstance()
const addr = '0x00000...';
    
await (
    await contract.register(addr, registerName, false)
).wait()
```


2. 查询用户持有的名称列表

通过遍历用户的token可以获得名称列表

```javascript
const contract = getContractInstance()
const addr = '0x00000...';
const balance = await contract.balanceOf(addr);
var nameList = [];
for(var i = 0; i < balance; i++){
    const tokenId = await contract.tokenOfOwnerByIndex(addr,i);
    const name = await contract.nameOfToken(tokenId);
    nameList.push(name);
}
```

3. 设置名称解析

用户对自己持有且未设置解析的名称，进行设置解析操作。设置解析之后，则token将无法进行transfer

```javascript
const contract = getContractInstance()
const name = 'name-one';
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

await (
    await contract.setNameForAddr(accounts[0], name)
).wait()
```


4. 查询名称映射的地址

设置解析之后的名称，可以通过addr查询出其映射的地址

```javascript
const contract = getContractInstance()
const name = 'name-one';
const addr = await contract.addr(name);
```

5. 查询地址映射的名称

设置解析之后，可以通过nameOf查询出地址映射的名称

```javascript
const contract = getContractInstance()
const addr = '0x0000...';
const name = await contract.nameOf(addr);
```


6. 设置profileURI

用户可以将自己的头像信息上传到Arweave，其中json格式为
```json
{
  "avatar": "${The URL of avatar}"
}
```
上传后得到的交易哈希，作为profileURI,存储至合约中

```javascript
const contract = getContractInstance()
const profilURI = 'zX_Mne...';

await (
    await contract.setProfileURI(profilURI)
).wait()
```


7. 查询用户的profileURI


```javascript
const contract = getContractInstance()
const addr = '0x0000...';

const profileURI = await contract.profileURI(addr);
```





