// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  //chooose the contract you will deploy: SemanticSBT / Activity
  const contractName = "SemanticSBTWithMerkleTree";

  console.log(contractName)

  const MyContract = await hre.ethers.getContractFactory(contractName);
  const myContract = await MyContract.deploy();

  await myContract.deployed();
  console.log(
    `${contractName} deployed ,contract address: ${myContract.address}`
  );
  const [owner] = await ethers.getSigners();
  await myContract.initialize(
      owner.address,
      "test",
      "SBT",
      "124",
      "https://u2eirk2xuy7ui3zyrly4sbqp4ppl2ygkh4zqgvddmvy6oxroajva.arweave.net/poiIq1emP0RvOIrxyQYP4969YMo_MwNUY2Vx514uAmo",
      ["myTest"],
      [["test",3]],
  )
  console.log(` initialize done!`);

  var isMinter = await(await myContract.minters(owner.address));
  console.log(`owner.address is minter:` + isMinter);
  while(!isMinter){
    isMinter = await myContract.minters(owner.address);
    console.log(`owner.address is minter:` + isMinter);
    var count = 0;
    while(count < 100000){
      count++;
    }
  }

  await myContract.addSubject("1234","myTest")
  console.log(` addSubject done!`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
