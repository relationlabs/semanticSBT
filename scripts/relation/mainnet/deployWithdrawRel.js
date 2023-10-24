const {ethers} = require("hardhat");

async function main() {
  const name = 'SoulProfileWithdrawRel'
  const minter = '0xeeeee2c6884e4811AF3864552b64372Dd953f54b'
  const relTokenAddress = '0xe45dFC26215312edC131e34Ea9299FBCA53275ca'

  const SoulProfileWithdrawRel = await ethers.getContractFactory("SoulProfileWithdrawRel");
  
  const withdrawRel = await SoulProfileWithdrawRel.deploy(minter, name, relTokenAddress);

  await withdrawRel.deployed();

  console.log(
    `deployed to ${withdrawRel.address}`
  );
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

// npx hardhat run scripts/relation/deployWithdrawRel.js --network mainnet 
// mainnet: 

// npx hardhat verify --network mainnet --constructor-args scripts/relation/mainnet/verifyParams/withdrawRelParams.js <address>
