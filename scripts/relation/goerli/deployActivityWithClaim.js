// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const {ethers, upgrades} = require("hardhat");
const semanticSBTLogic = require("../../template/deploySemanticSBTLogic");

const name = 'Activity with claim';
const symbol = 'SEC';
const baseURI = '';
const schemaURI = 'ar://pEaI9o8moBFof5IkOSq1qNnl8RuP0edn2BFD1q6vdE4';
const class_ = ["Activity"];
const predicate_ = [["participate", 3]];
const subjectValue = "myActivity"



async function deployContent(semanticSBTLogicLibraryAddress, owner) {
    const MyContract = await hre.ethers.getContractFactory("ActivityWithClaim", {
        libraries: {
            SemanticSBTLogicUpgradeable: semanticSBTLogicLibraryAddress,
        }
    });

    const activityWithClaimContract = await upgrades.deployProxy(MyContract,
        [owner,
            name,
            symbol,
            baseURI,
            schemaURI,
            class_,
            predicate_],
        {
            unsafeAllowLinkedLibraries: true,
            initializer: 'initialize(address,  string, string, string, string, string[], (string,uint8)[])'
        });

    await activityWithClaimContract.deployed();
    console.log(
        `ActivityWithClaim deployed ,contract address: ${activityWithClaimContract.address}`
    );
    return activityWithClaimContract.address
}


async function setActivityName(contractAddress) {
    const activityContract = await hre.ethers.getContractAt("ActivityWithClaim", contractAddress)

    await (await activityContract.setActivity(subjectValue)).wait()

    console.log(
        `ActivityWithClaim setActivity successfully!`
    );
}

async function setMinter(contractAddress, minter) {
    const activityContract = await hre.ethers.getContractAt("ActivityWithClaim", contractAddress)

    await (await activityContract.setMinter(minter, true)).wait()

    console.log(
        `ActivityWithClaim setMinter successfully!`
    );
}

async function upgrade(semanticSBTLogicAddress, proxyAddress) {
    const contractName = "ActivityWithClaim";
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
    console.log(`ActivityWithClaim upgrade successfully!`)
}

async function main() {
    const [owner] = await ethers.getSigners();

    const semanticSBTLogicAddress = await semanticSBTLogic.deploy()
    const activityWithClaimAddress = await deployContent(semanticSBTLogicAddress, owner.address)

    await setActivityName(activityWithClaimAddress)

    //upgrade
    // await upgrade(semanticSBTLogicAddress,activityWithClaimAddress)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
