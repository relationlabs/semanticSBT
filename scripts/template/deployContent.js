// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const {ethers, upgrades} = require("hardhat");
const semanticSBTLogic = require("./deploySemanticSBTLogic");

const name = 'Relation Content';
const symbol = 'SBT';
const baseURI = '';
const schemaURI = 'ar://HENWTh3esXyAeLe1Yg_BrBOHhW-CcDQoU5inaAx-yNs';
const class_ = [];
const predicate_ = [["publicContent", 1]];


async function deployContentWithSign(semanticSBTLogicLibraryAddress) {
    const ContentWithSign = await hre.ethers.getContractFactory("ContentWithSign", {
        libraries: {
            SemanticSBTLogicUpgradeable: semanticSBTLogicLibraryAddress,
        }
    });
    const contentWithSignName = "Content With Sign";
    const contentWithSign = await upgrades.deployProxy(ContentWithSign,
        [contentWithSignName],
        {unsafeAllowLinkedLibraries: true});
    await contentWithSign.deployed();
    await contentWithSign.deployTransaction.wait();
    console.log(`ContentWithSign deployed ,contract address: ${contentWithSign.address}`);
    return contentWithSign.address
}

async function deployContent(semanticSBTLogicLibraryAddress, contentWithSignAddress, owner) {
    const MyContract = await hre.ethers.getContractFactory("Content", {
        libraries: {
            SemanticSBTLogicUpgradeable: semanticSBTLogicLibraryAddress,
        }
    });


    const contentContract = await upgrades.deployProxy(MyContract,
        [owner,
            contentWithSignAddress,
            name,
            symbol,
            baseURI,
            schemaURI,
            class_,
            predicate_],
        {
            unsafeAllowLinkedLibraries: true,
            initializer: 'initialize(address, address, string, string, string, string, string[], (string,uint8)[])'
        });

    await contentContract.deployed();
    console.log(
        `Content deployed ,contract address: ${contentContract.address}`
    );
    return contentContract.address
}

async function upgrade(semanticSBTLogicAddress,proxyAddress){
    const contractName = "Content";
    const MyContract = await hre.ethers.getContractFactory(contractName, {
        libraries: {
            SemanticSBTLogicUpgradeable: semanticSBTLogicAddress,
        }
    });

    //upgrade
    await upgrades.upgradeProxy(
        proxyAddress,
        MyContract,
        {unsafeAllowLinkedLibraries: true});
    console.log(`Content upgrade successfully!`)
}

async function main() {
    const [owner] = await ethers.getSigners();

    const semanticSBTLogicAddress = await semanticSBTLogic.deploy()
    const contentWithSignAddress = await deployContentWithSign(semanticSBTLogicAddress)
    const contentAddress = await deployContent(semanticSBTLogicAddress, contentWithSignAddress, owner.address)

    //upgrade
    // await upgrade(semanticSBTLogicAddress,contentAddress)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
