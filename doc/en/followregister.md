# Follow Contract Guide

Using the FollowRegister contract deployed by Relation Protocol, we can create a Follow contract for a user. The Follow contract can follow and unfollow someone. Both the FollowRegister and Follow contracts have implemented the contract interface defined by the Contract Standard.

## Construct a Contract object

The contract addresses and abi files of the FollowRegister and FollowWithSign contract, and the abi file of the Follow contract, can be accessed via [Relation Protocol list of resources](./resource.md). The address of the Follow contract can be accessed via FollowRegister, with each address having its own Follow contract.

Construct a FollowRegisterContract object with "ethers":

```javascript
import { ethers, providers } from 'ethers'

const getFollowRegisterContractInstance = () => {
    // FollowRegister contract address
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

## Call the methods of a contract

### FollowRegister

1. Deploy the Follow contract:


```javascript
const followRegisterContract = getFollowRegisterContractInstance()
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
await (
    await followRegisterContract.deployFollowContract(accounts[0])
).wait()
```

2. Query the Follow contract of a user, and construct a Contract object.

Once a Follow contract is deployed by a user, the address of the contract can be acquired via the user's address.

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

1. Follow

To follow a certain address, a user will call the address's Follow contract:

```javascript
const addr = '0x000...';
const followRegisterContract = getFollowRegisterContractInstance()
const followContractAddress = await followRegisterContract.ownedFollowContract(addr);
const followContract = getFollowContractInstance(followContractAddress)

await (
    await followContract.follow()
).wait()
```


2. Unfollow


```javascript
const addr = '0x000...';
const followRegisterContract = getFollowRegisterContractInstance()
const followContractAddress = await followRegisterContract.ownedFollowContract(addr);
const followContract = getFollowContractInstance(followContractAddress)

await (
    await followContract.unfollow()
).wait()
```


3. A user's list of followers

We can get the list of followers of a user by querying the token owners of the user's Follow contract.

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

4. Follow(Gas fee can be paid by someone else)

A user signs against the data and constructs it into a parameter to be posted on the blockchain. Any address can initiate a transaction with this parameter, with the gas paid by said address.

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
//The parameter will be passed to the method "followWithSign"
var param =
    {"sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
        "target": followContractAddress,
        "addr": accounts[0]
    }
//In reality, this method will be called by the address paying the gas fee.
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

5. Unfollow(Gas fee can be paid by someone else)

A user signs against the data and constructs it into a parameter to be posted on the blockchain. Any address can initiate a transaction with this parameter, with the gas paid by said address.


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
//The parameter will be passed to the method "followWithSign"
var param =
    {"sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
    "target": followContractAddress,
    "addr": accounts[0]
    }
//In reality, this method will be called by the address paying the gas fee.
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
