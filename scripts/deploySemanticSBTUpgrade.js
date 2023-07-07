// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const {ethers, upgrades} = require("hardhat");


const name = 'Semantic SBT Upgrade V1';
const symbol = 'SBT';
const baseURI = 'https://api.example.com/v1/';
const schemaURI = 'ar://Za2Zvs8bYMKqqS0dfvA1M5g_qkQzyM1nkKG32RWv_9Q';
const class_ = ["Name"];
const predicate_ = [["hold", 3], ["resolved", 3]];

async function main() {
    const [owner] = await ethers.getSigners();

    const SemanticSBTLogic = await ethers.getContractFactory("SemanticSBTLogicUpgradeable");
    const semanticSBTLogicLibrary = await SemanticSBTLogic.deploy();
    console.log(
        `SemanticSBTLogicUpgradeable deployed ,contract address: ${semanticSBTLogicLibrary.address}`
    );

    const contractName = "SemanticSBTUpgradeable";
    console.log(contractName)

    const MyContract = await ethers.getContractFactory(contractName);
    const myContract = await upgrades.deployProxy(MyContract,
        [owner.address,
            name,
            symbol,
            baseURI,
            schemaURI,
            class_,
            predicate_],
        {unsafeAllowLinkedLibraries: true});

    await myContract.deployed();

    console.log(
        `${contractName} deployed ,contract address: ${myContract.address}`
    );
    const proxyContract = "";
    await upgrades.upgradeProxy(proxyContract,
        MyContract,
        {unsafeAllowLinkedLibraries: true});

    console.log(
        `The contract has upgraded!`
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
