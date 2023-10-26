const {ethers} = require("hardhat");

async function main() {

  const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
  
  const proxyAdmin = await ProxyAdmin.deploy();

  await proxyAdmin.deployed();

  console.log(
    `proxyAdmin deployed to ${proxyAdmin.address}`
  );
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

// npx hardhat run scripts/deployProxyAdmin.js --network goerli
// goerli: 0xc6dAAB3C0b0A2CE8a89fC7f5166a76318B2105E9

