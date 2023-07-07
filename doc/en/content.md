# Content Contract Guide

Using the Relation Content deployed by Relation Protocol, we can store and query a user's identity data. The Relation Content contract is an implementation of the Content contract defined by the Contract Standard.

## Construct a Contract object

The address and abi file of the Content contract and the ContentWithSign contract can be accessed via [Relation Protocol's list of resources](./resource.md). You can construct a Contract object using "ethers":

```javascript
import { ethers, providers } from 'ethers'

const getContractInstance = () => {
  // Contract address
  const contractAddress = '0xAC0f863b66173E69b1C57Fec5e31c01c7C6959B7'
  const provider = new providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddress, contentAbi, signer)
  return contract
}

const getContentWithSignContractInstance = () => {
    // Contract address
    const contractAddress = ''
    const provider = new providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, contentWithSignAbi, signer)
    return contract
}
```

## How to call a contract

### Pay the gas fee by oneself

1. Publish content

A user can upload the content to be published to Arweave with the following format:
```json
{
  "content": {
    "body": "${The body of content}",
    "title": "${The title of content}"
  }
}
```
The subsequent transaction hash will be recorded as content in the contract.

```javascript
const contract = getContractInstance()
const content = 'zX_Oa1...';
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

await (
    await contract.post(content)
).wait()
```



2. Query the list of content published by a user

 We can get the list of content published by a user through the list of tokens the user holds.

```javascript

const addr = '0x000...';
const contract = getContractInstance()

//Query the number of tokens held by an address.
const balance = await contract.balanceOf(addr);
var contentList = [];
for(var i = 0; i < balance;i++){
    //Query the tokenId a user holds via index
    const tokenId = await contract.tokenOfOwnerByIndex(addr,i);
    //Query the published content via the tokenId
    const content = await contract.contentOf(tokenId);
    contentList.push(content);
}
```

### Pay for someone else's gas fee

A user signs against the data and constructs it into a parameter to be posted on the blockchain. Any address can initiate a transaction with this parameter, with the gas paid by said address.


1. Publish content(Gas fee can be paid by someone else)

A user can upload the content to be published to Arweave with the following format:
```json
{
  "content": {
    "body": "${The body of content}",
    "title": "${The title of content}"
  }
}
```
The subsequent transaction hash will be used to construct a parameter to be posted on the blockchain. The address paying for the gas fee should use this parameter to call the contract.

```javascript
import { Bytes } from '@ethersproject/bytes'

const contract = getContractInstance()
const contractWithSign = getContentWithSignContractInstance()
const postContent = 'zX_Oa1...';
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

let name = await contractWithSign.name();
let nonce = await contractWithSign.nonces(accounts[0]);
//The time when the signature expires(Unit: second). The following example means the signature will expire 100 seconds after the current time.
let deadline = Date.parse(new Date()) / 1000 + 100;
let sign = await getSign(await buildPostParams(
        name,
        contractWithSign.address.toLowerCase(),
    contract.address.toLowerCase(),
        postContent,
        parseInt(nonce),
        deadline),
    accounts[0]);
//Construct the parameter
let param = {
    "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
    "target": contract.address,
    "addr": accounts[0],
    "content": postContent
}
//In reality, this method will be called by the address paying the gas fee.
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
