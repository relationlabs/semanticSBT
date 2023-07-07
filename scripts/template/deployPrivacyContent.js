// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const {ethers, upgrades} = require("hardhat");
const semanticSBTLogic = require("./deploySemanticSBTLogic");


const name = 'Privacy Content';
const symbol = 'SBT';
const baseURI = '';
const schemaURI = 'ar://DeM6LRONjAUYr3qixkguLuFvYSHkykN7ZRKHn2HR5Gs';
const class_ = [];
const predicate_ = [["privacyContent", 1]];


async function deployPrivacyContentWithSign(semanticSBTLogicAddress) {
    const PrivacyContentWithSign = await hre.ethers.getContractFactory("PrivacyContentWithSign", {
        libraries: {
            SemanticSBTLogicUpgradeable: semanticSBTLogicAddress,
        }
    });
    const privacyContentWithSignName = "Privacy Content With Sign";
    const privacyContentWithSign = await upgrades.deployProxy(PrivacyContentWithSign,
        [privacyContentWithSignName],
        {unsafeAllowLinkedLibraries: true});
    await privacyContentWithSign.deployed();
    await privacyContentWithSign.deployTransaction.wait();
    console.log(`PrivacyContentWithSign deployed ,contract address: ${privacyContentWithSign.address}`);
    return privacyContentWithSign.address
}

async function deployPrivacyContent(semanticSBTLogicAddress, privacyContentWithSignAddress, owner) {
    const contractName = "PrivacyContent";
    const MyContract = await hre.ethers.getContractFactory(contractName, {
        libraries: {
            SemanticSBTLogicUpgradeable: semanticSBTLogicAddress,
        }
    });
    const privacyContentContract = await upgrades.deployProxy(MyContract,
        [owner,
            privacyContentWithSignAddress,
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

    await privacyContentContract.deployed();
    console.log(
        `${contractName} deployed ,contract address: ${privacyContentContract.address}`
    );
    return privacyContentContract.address
}

async function upgrade(semanticSBTLogicAddress, proxyAddress) {
    const contractName = "PrivacyContent";
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
    console.log(`${contractName} upgrade successfully!`)
}

async function main() {
    const [owner] = await ethers.getSigners();

    const semanticSBTLogicAddress = await semanticSBTLogic.deploy();
    const privacyContentWithSignAddress = await deployPrivacyContentWithSign(semanticSBTLogicAddress);
    const privacyContentAddress = await deployPrivacyContent(semanticSBTLogicAddress, privacyContentWithSignAddress, owner.address)

    await upgrade(semanticSBTLogicAddress, privacyContentAddress)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
