# NameService Contract Guide

We can use the Relation NameService contract deployed by Relation Protocol to store and query a user's identity data. The Relation NameService contract is an implementation of the Name Service defined by the Contract Standard.

## Construct a Contract object

Via [Relation Protocol's resources](./resource.md), you can acquire the contract address and the abi file of the NameService contract. Then you can construct a Contract object with "ethers".

```javascript
import { ethers, providers } from 'ethers'

const getContractInstance = () => {
  // Contract address
  const contractAddress = '0x0D195ab46a9C9C4f97666A76AADb35d93965Cac8'
  const provider = new providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddress, abi, signer)
  return contract
}
```

## How to call the contract

1. Register a name

A user can call the "register" to register a name. Or, a minter specified by an administrator can also register names for other users. On registration, you can select whether to set a resolve record. Once a name is linked to an address, you can query the mapping with methods like "addr" and "nameOf".

Below are two examples:

- Register a name for yourself, and set a resolve record.

```javascript
// The name to be registered
const registerName = 'name-one';
const contract = getContractInstance()
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
await (
    await contract.register(accounts[0], registerName, true)
).wait()
```
- A minter register a name for a specified address without setting a resolve record.
```javascript
// The name to be registered
const registerName = 'name-two';
const contract = getContractInstance()
const addr = '0x00000...';

await (
    await contract.register(addr, registerName, false)
).wait()
```


2. Query the names held by a user

You can query the list of names held by a user through the tokens in said user's possession.

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

3. Set a resolve record for a name

A user can set a resolve record for a name (without a resolve record) in his possession. After this setting, the token cannot be transferred.

```javascript
const contract = getContractInstance()
const name = 'name-one';
const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

await (
    await contract.setNameForAddr(accounts[0], name)
).wait()
```


4. Query the address mapped to a name

After a resolve record is set, you can query a name's mapped address via "addr".

```javascript
const contract = getContractInstance()
const name = 'name-one';
const addr = await contract.addr(name);
```

5. Query the name mapped to am address

After a resolve record is set, you can query an address mapped to a name via "nameOf".

```javascript
const contract = getContractInstance()
const addr = '0x0000...';
const name = await contract.nameOf(addr);
```


6. Configure the profileURI

Users can upload their avatar information to Arweave with the following json format:
```json
{
  "avatar": "${The URL of avatar}"
}
```
The subsequent transaction hash will be stored to a contract as the profileURI.

```javascript
const contract = getContractInstance()
const profilURI = 'zX_Mne...';

await (
    await contract.setProfileURI(profilURI)
).wait()
```


7. Query a user's profileURI


```javascript
const contract = getContractInstance()
const addr = '0x0000...';

const profileURI = await contract.profileURI(addr);
```
