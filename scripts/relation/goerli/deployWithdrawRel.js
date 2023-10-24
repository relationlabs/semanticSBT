const {ethers} = require("hardhat");

async function main() {
  const name = 'SoulProfileWithdrawRel'
  const minter = '0x27546C3D47dECBC5d72C446D9f0593d2141A92F6'
  const relTokenAddress = '0xDEbC0cf7f1EF97713c5D9fd11b8Ad58D1BBd02Eb'

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

// npx hardhat run scripts/relation/deployWithdrawRel.js --network goerli 
// goerli: 0x0F670df50155889553025AfEcf2f3278Cfe6029b
// npx hardhat verify --network goerli --constructor-args scripts/relation/goerli/verifyParams/withdrawRelParams.js 0x0F670df50155889553025AfEcf2f3278Cfe6029b
