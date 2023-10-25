const {ethers} = require("hardhat");
const RelationProfileNFTABI = require('../abi/RelationProfileNFT.json')
const TokenABI = require('../abi/Token.json')

const RelationProfileNFTAddress = '0xB64C5ba4Ec01D1eb7DB8cb9356C24DD733B9E6A9'
const TokenAddress = '0xDEbC0cf7f1EF97713c5D9fd11b8Ad58D1BBd02Eb'

async function withdrawREL() {
  const provider = ethers.provider
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(RelationProfileNFTAddress, RelationProfileNFTABI, signer)
  const tx = await contract.withdrawToken(TokenAddress)
  await tx.wait()

  console.log('withdraw token succeed');
}

async function withdrawETH() {
  const provider = ethers.provider
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(RelationProfileNFTAddress, RelationProfileNFTABI, signer)
  const tx = await contract.withdraw()
  await tx.wait()

  console.log('withdraw eth succeed');
}


// withdrawREL()
withdrawETH()

// npx hardhat run scripts/relation/withdraw.js --network goerli