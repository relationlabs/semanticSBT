# Dao Contract Guide

We can create a Dao contract for an user using the DaoRegister contract deployed by Relation Protocol. A dao contract can provide a Dao with member management functions. Both the DaoRegister contract and the Dao contract implement the contract interface defined by the Contract Standard.

## Construct a Contract object

Via [Relation Protocol's resource list](./resource.md), you can acquire the contract address and abi file of DaoRegister and DaoWithSign, and the abi file of Dao contract. As for the address of a Dao contract, you need to query it through DaoRegister.

- Construct a DaoRegisterContract object:

```javascript
import { ethers, providers } from 'ethers'

const getDaoRegisterContractInstance = () => {
  // DaoRegister's contract address
  const contractAddress = '0xAC0f863b66173E69b1C57Fec5e31c01c7C6959B7'
  const provider = new providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddress, daoRegisterAbi, signer)
  return contract
}

const getDaoWithSignContractInstance = () => {
    // DaoRegister's contract address
    const contractAddress = '0xAC0f863b66173E69b1C57Fec5e31c01c7C6959B7'
    const provider = new providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, daoWithSignAbi, signer)
    return contract
}
```


## How to call a contract

### DaoRegister

1. Deploy a Dao contract


```javascript
const daoRegisterContract = getDaoRegisterContractInstance()
const daoName = 'my-first-dao';
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
await (
    await daoRegisterContract.deployDaoContract(accounts[0],daoName)
).wait()
```

2. Query the list of Daos created by an user

You can get the list of Daos created by a user by using a traversal process to go through the tokens held on the DaoRegister contract by said user.

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

- Construct a DaoContract Object
```javascript

const getDaoContractInstance = (contractAddress) => {
  const provider = new providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddress, daoRegisterAbi, signer)
  return contract
}

```



### Dao


1. Query the administrator of a Dao

```javascript
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const ownerAddress = await daoContract.ownerOfDao();
```


2. Configure the DaoURI

The administrator of a Dao can assign description and avatar for a Dao, with the description and avatar stored on Arweave. We use the data format for this as follows:
```json
{
  "avatar": "${The avatar of DAO}",
  "description": "${The description of DAO}"
}
```
The transaction hash of the upload will be stored in the contract as DaoURI

```javascript
const daoURI = 'hX_Mne1...';
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
await (
    await daoContract.setDaoURI(daoURI)
).wait()
```


3. Query the DaoURI


```javascript
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const daoURI = daoContract.daoURI();

```

4. Modify a Dao's name

The administrator of a Dao can modify its name.

```javascript
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const daoURI = daoContract.daoURI();
const daoName = 'new-name';
await (
    await daoContract.setName(daoName)
).wait()
```


5. Query a Dao's name

```javascript
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const daoName = daoContract.name();
```

6. When an administrator adds a member to a Dao

An administrator can add specific addresses to a Dao.

```javascript
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const members = ['0x001...','0x002...','0x003...'...];
await (
    await daoContract.addMember(members)
).wait()
```


7. Open Access(Optional for a Dao)

An administrator of a Dao can set it to Open Access, meaning that anyone can join the Dao.

```javascript
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
await (
    await daoContract.setFreeJoin(true)
).wait()
```


7. When a user joins a Dao

With Open Access enabled by the administrator of a Dao, users can join the Dao freely.

```javascript
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
await (
    await daoContract.join()
).wait()
```


8. Remove a Dao member

An administrator can remove a member from a Dao. Also, users can leave a Dao freely.

```javascript
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const addr = '0x001...';
await (
    await daoContract.remove(addr)
).wait()
```


9. Query the list of Dao members

You can get a whole list of Dao members with a traversal process to find all the token owners of said Dao.

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


10. Configure the DaoURI(Gas fee can be paid by someone else)

The administrator of a Dao can assign description and avatar to a Dao, with the content stored on Arweave. The format of the content should be:
```json
{
  "avatar": "${The avatar of DAO}",
  "description": "${The description of DAO}"
}
```
The administrator signs against the transaction hash and constructs a parameter to be posted on the blockchain. Any address can use this parameter to initiate a transaction on the blockchain, with the gas fee paid by said address.


```javascript
import { Bytes } from '@ethersproject/bytes'

const daoURI = 'hX_Mne1...';
const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const daoWithSignContract = getDaoWithSignContractInstance(daoContractAddress)
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })


let name = await daoWithSignContract.name();
let nonce = await daoWithSignContract.nonces(accounts[0]);
//The time when the signature expires(Unit: second). The following example means the signature will expire 100 seconds after the current time.
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
//In reality, this method will be called by the address paying the gas fee.
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

11. When an administrator adds a member to a Dao(Gas fee can be paid by someone else)

An administrator can add specific addresses to a Dao.


```javascript
import { Bytes } from '@ethersproject/bytes'

const daoContractAddress = '0x000...';
const daoContract = getDaoContractInstance(daoContractAddress)
const daoWithSignContract = getDaoWithSignContractInstance(daoContractAddress)
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

const members = ['0x001...','0x002...','0x003...'];
let name = await daoWithSignContract.name();
let nonce = await daoWithSignContract.nonces(accounts[0]);
//The time when the signature expires(Unit: second). The following example means the signature will expire 100 seconds after the current time.
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
//In reality, this method will be called by the address paying the gas fee.
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


12. Open Access(Gas fee can be paid by someone else)

An administrator of a Dao can set it to Open Access, meaning that anyone can join the Dao.

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
//In reality, this method will be called by the address paying the gas fee.
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


13. When an user joins a Dao(Gas fee can be paid by someone else)

With Open Access enabled by the administrator of a Dao, users can join the Dao freely.


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
//In reality, this method will be called by the address paying the gas fee.
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


14. Remove a Dao member(Gas fee can be paid by someone else)

An administrator can remove a member from a Dao. Also, users can leave a Dao freely.

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
//In reality, this method will be called by the address paying the gas fee.
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
