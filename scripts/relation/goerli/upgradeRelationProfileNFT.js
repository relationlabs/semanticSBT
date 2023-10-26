// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const {ethers, upgrades} = require("hardhat");


async function main() {

    const SemanticSBTLogic = await ethers.getContractFactory("SemanticSBTLogicUpgradeable");
    const semanticSBTLogicLibrary = await SemanticSBTLogic.deploy();
    console.log(
        `SemanticSBTLogicUpgradeable deployed ,contract address: ${semanticSBTLogicLibrary.address}`
    );
    await semanticSBTLogicLibrary.deployTransaction.wait();

    const NameServiceLogicLibrary = await ethers.getContractFactory("NameServiceLogic");
    const nameServiceLogicLibrary = await NameServiceLogicLibrary.deploy();
    console.log(
        `NameServiceLogicLibrary deployed ,contract address: ${nameServiceLogicLibrary.address}`
    );
    await nameServiceLogicLibrary.deployTransaction.wait();

    const contractName = "RelationProfileNFT";
    console.log(contractName)

    const MyContract = await ethers.getContractFactory(contractName, {
        libraries: {
            SemanticSBTLogicUpgradeable: semanticSBTLogicLibrary.address,
            NameServiceLogic: nameServiceLogicLibrary.address,
        }
    });

    //upgrade
    const proxyAddress = "0x5a493fc3e70ceb5a98842099a03031f006aad0c6";
    const myContract = await upgrades.upgradeProxy(
    proxyAddress,
        MyContract,
        {unsafeAllowLinkedLibraries: true});
    console.log(myContract.address);

    // await (await myContract.setTransferable(true)).wait();
    // await (await myContract.setMinter("0x27546C3D47dECBC5d72C446D9f0593d2141A92F6",true)).wait();

    // await upgrades.forceImport(proxyAddress, MyContract)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});


/**
 * goerli:
 * npx hardhat run scripts/relation/goerli/upgradeRelationProfileNFT.js --network goerli 
 * npx hardhat verify --network goerli 0xB64C5ba4Ec01D1eb7DB8cb9356C24DD733B9E6A9
 */


/**
 * mainnet:
 */