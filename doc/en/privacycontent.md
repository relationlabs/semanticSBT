# PrivacyContent Contract Guide

Using the Relation PrivacyContent deployed by Relation Protocol, we can store and query users' identity data. The Relation PrivacyContent contract is an implementation of the PrivacyContent contract defined in the Contract
Standard.

## Construct a Contract object

The contract address and abi file of PrivacyContent and PrivacyContentWithSign contract can be accessed via [Relation Protocol list of resources](./resource.md). You can construct a Contract object with "ethers".

```javascript
import {ethers, providers} from 'ethers'

const getContractInstance = () => {
    // Contract address
    const contractAddress = '0x1A4231bedA090c6903c4731518C616F8FAEc5dc7'
    const provider = new providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, privacyContentAbi, signer)
    return contract
}

const getPrivacyContentWithSignContractInstance = () => {
    // Contract address
    const contractAddress = ''
    const provider = new providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, privacyContentWithSignAbi, signer)
    return contract
}
```

## Call methods of the contract

### When a user pays gas fee

1. Prepare a token

A user needs to prepare a token, and passes the tokenId when calling the "post" method. Once the "post" method is called, the prepared token will be consumed.

```javascript
const privacyContract = getContractInstance()
await (
    await privacyContract.prepareToken()
).wait()
```

2. Query th token prepared by a user:

```javascript
const privacyContract = getContractInstance()
const accounts = await ethereum.request({method: 'eth_requestAccounts'})

const tokenId = await privacyContract.ownedPrepareToken(accounts[0]);
```

3. Publish the content

A user can only publish the content Once a token is prepared. The content is encrypted via [Lit Protocol](https://developer.litprotocol.com/sdk/explanation/encryption/#encrypting), with the content uploaded to Arweave with the following format:

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

The subsequent transaction hash will be stored in the contract as the content's record.

```javascript
const privacyContract = getContractInstance()
const content = 'zX_Oa1...';
const accounts = await ethereum.request({method: 'eth_requestAccounts'})

await (
    await privacyContract.post(content)
).wait()
```

3. Share the content to one's follower

Users can share the uploaded privacy content to their followers by specifying the tokenId and the address of the Follow contract sharing the content. A contract can only share with 20 Follow contract addresses to avoid query errors due to too many recursive calls.

```javascript
const myFollowContractAddress = '0x000...';
const tokenId = '1';
const privacyContract = getContractInstance()

await (
    await privacyContract.shareToFollower(tokenId, myFollowContractAddress)
).wait()
```

4. Share the content to specified Dao

Users can share the uploaded privacy content to a certain Dao, and all Dao members can decrypt the privacy content via Lit Protocol. A contract can only share with 20 Dao contract addresses to avoid query errors due to too many recursive calls.

```javascript
const myDaoContractAddress = '0x000...';
const tokenId = '1';
const privacyContract = getContractInstance()

await (
    await privacyContract.shareToDao(tokenId, myDaoContractAddress)
).wait()
```

5. Query the list of Follow contract addresses that a tokenId has shared the content with:

The methods sharedFollowAddressCount and sharedFollowAddressByIndex can get the list of Follow contract addresses that a tokenId has shared the content with.

```javascript
const addr = '0x000...';
const privacyContract = getContractInstance()
const tokenId = '1';

// Query the number of Follow contract addresses that a tokenId has shared the content with.
const count = await contract.sharedFollowAddressCount(tokenId);
var followContractAddressList = [];
for (var i = 0; i < count; i++) {
    //Query the Follow contract addresses
    const followContractAddress = await contract.sharedFollowAddressByIndex(tokenId, i);
    followContractAddressList.push(followContractAddress);
}
```

6. Query the list of Dao contract addresses that a tokenId has shared the content with:

The methods sharedDaoAddressCount and sharedFDaoAddressByIndex can get the list of Dao contract addresses that a tokenId has shared the content with.

```javascript
const addr = '0x000...';
const privacyContract = getContractInstance()
const tokenId = '1';

//Query the number of Dao contract addresses that a tokenId has shared the content with
const count = await contract.sharedDaoAddressCount(tokenId);
var followContractAddressList = [];
for (var i = 0; i < count; i++) {
    //Query the list of Dao contract addresses that a tokenId has shared the content with.
    const daoContractAddress = await contract.sharedFDaoAddressByIndex(tokenId, i);
    daoContractAddressList.push(daoContractAddress);
}
```

7. Query the list of published contents of a user.

We can get the list of published contents of a user through said user's list of tokens.

```javascript
const addr = '0x000...';
const privacyContract = getContractInstance()

//Query the number of tokens held by an address
const balance = await contract.balanceOf(addr);
var contentList = [];
for (var i = 0; i < balance; i++) {
    //Query the tokenId held by a user via the index
    const tokenId = await contract.tokenOfOwnerByIndex(addr, i);
    //Query the published content via the tokenId
    const content = await contract.contentOf(tokenId);
    contentList.push(content);
}
```



8. Prepare a token(Gas fee can be paid by someone else)

A user signs against the data and constructs it into a parameter to be posted on the blockchain. Any address can initiate a transaction with this parameter, with the gas paid by said address.


```javascript
import { Bytes } from '@ethersproject/bytes'

const accounts = await ethereum.request({method: 'eth_requestAccounts'})
const privacyContract = getContractInstance()
const privacyWithSignContract = getPrivacyContentWithSignContractInstance()

const name = await privacyWithSignContract.name();
const nonce = await privacyWithSignContract.nonces(accounts[0]);
//The time when the signature expires(Unit: second). The following example means the signature will expire 100 seconds after the current time.
const deadline = Date.parse(new Date()) / 1000 + 100;
const sign = await getSign(await buildPrepareParams(name, privacyWithSignContract.address.toLowerCase(),privacyContract.address, parseInt(nonce), deadline), accounts[0]);
var param =
    {"sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
        "target": privacyContract.address,
        "addr": accounts[0]
    }
// In reality, this method will be called by the address paying the gas fee.
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

9. Publish the content(Gas fee can be paid by someone else)

A user uploads the content to Arweave, signs against the data and constructs it into a parameter to be posted on the blockchain. Any address can initiate a transaction with this parameter, with the gas paid by said address.

```javascript
import { Bytes } from '@ethersproject/bytes'

const content = 'zX_Oa1...';
const accounts = await ethereum.request({method: 'eth_requestAccounts'})
const privacyContract = getContractInstance()
const privacyWithSignContract = getPrivacyContentWithSignContractInstance()

let name = await privacyWithSignContract.name();
let nonce = await privacyWithSignContract.nonces(accounts[0]);
//The time when the signature expires(Unit: second). The following example means the signature will expire 100 seconds after the current time.
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
//In reality, this method will be called by the address paying the gas fee.
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

10. Share the content with my followers(Gas fee can be paid by someone else)

A user signs against the tokenId and the Follow contract addresses to be shared with and constructs it into a parameter to be posted on the blockchain. Any address can initiate a transaction with this parameter, with the gas paid by said address.

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
//The time when the signature expires(Unit: second). The following example means the signature will expire 100 seconds after the current time.
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
//In reality, this method will be called by the address paying the gas fee.
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

11. Share the content with specified Daos(Gas fee can be paid by someone else)

A user signs against the tokenId and the Dao contract addresses to be shared with and constructs it into a parameter to be posted on the blockchain. Any address can initiate a transaction with this parameter, with the gas paid by said address.

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
//The time when the signature expires(Unit: second). The following example means the signature will expire 100 seconds after the current time.
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
//In reality, this method will be called by the address paying the gas fee.
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
