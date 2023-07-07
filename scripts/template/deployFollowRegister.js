// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const {ethers, upgrades} = require("hardhat");
const semanticSBTLogic = require("./deploySemanticSBTLogic");
const upgradeableBeacon = require("./deployUpgradeableBeacon");

const name = 'Relation Follow Register';
const symbol = 'SBT';
const baseURI = '';
const schemaURI = 'ar://auPfoCDBtJ3RJ_WyUqV9O7GAARDzkUT4TSuj9uuax-0';
const class_ = ["Contract"];
const predicate_ = [["followContract", 3]];

async function deployFollowRegisterLogic() {
    const FollowRegisterLogic = await hre.ethers.getContractFactory("FollowRegisterLogic");
    const followRegisterLogicLibrary = await FollowRegisterLogic.deploy();
    console.log(
        `FollowRegisterLogic deployed ,contract address: ${followRegisterLogicLibrary.address}`
    );
    return followRegisterLogicLibrary.address
}

async function deployFollow(semanticSBTLogicAddress) {
    const Follow = await hre.ethers.getContractFactory("Follow", {
        libraries: {
            SemanticSBTLogicUpgradeable: semanticSBTLogicAddress,
        }
    });
    const follow = await Follow.deploy();
    await follow.deployTransaction.wait();
    console.log(
        `Follow deployed ,contract address: ${follow.address}`
    );
    return follow.address
}

async function deployFollowWithSign(semanticSBTLogicAddress) {
    const FollowWithSign = await hre.ethers.getContractFactory("FollowWithSign", {
        libraries: {
            SemanticSBTLogicUpgradeable: semanticSBTLogicAddress,
        }
    });
    const followWithSignName = "Follow With Sign";
    const followWithSign = await upgrades.deployProxy(FollowWithSign,
        [followWithSignName],
        {unsafeAllowLinkedLibraries: true});
    await followWithSign.deployed();
    await followWithSign.deployTransaction.wait();
    console.log(`FollowWithSign deployed ,contract address: ${followWithSign.address}`);
    return followWithSign.address
}

async function deployFollowRegister(semanticSBTLogicAddress, followRegisterLogicAddress, owner) {
    const contractName = "FollowRegister";
    const MyContract = await hre.ethers.getContractFactory(contractName, {
        libraries: {
            SemanticSBTLogicUpgradeable: semanticSBTLogicAddress,
            FollowRegisterLogic: followRegisterLogicAddress,
        }
    });
    const followRegister = await upgrades.deployProxy(MyContract,
        [owner,
            name,
            symbol,
            baseURI,
            schemaURI,
            class_,
            predicate_],
        {unsafeAllowLinkedLibraries: true});

    await followRegister.deployed();
    console.log(
        `${contractName} deployed ,contract address: ${followRegister.address}`
    );
    return followRegister.address
}

async function setImpl(followRegisterAddress, followImplAddress) {
    const followRegister = await hre.ethers.getContractAt("FollowRegister", followRegisterAddress)
    await (await followRegister.setFollowImpl(followImplAddress)).wait();
    console.log(
        `FollowRegister setFollowImpl successfully!`
    );
}

async function setVerifyContract(followRegisterAddress, followWithSignAddress) {
    const followRegister = await hre.ethers.getContractAt("FollowRegister", followRegisterAddress)
    await (await followRegister.setFollowVerifyContract(followWithSignAddress)).wait();
    console.log(
        `FollowRegister setFollowVerifyContract successfully!`
    );
}

async function main() {

    const [owner] = await ethers.getSigners();

    const semanticSBTLogicAddress = await semanticSBTLogic.deploy()
    const followRegisterLogicAddress = await deployFollowRegisterLogic()
    const followAddress = await deployFollow(semanticSBTLogicAddress)
    const followUpgradeableBeaconAddress = await upgradeableBeacon.deploy(followAddress)
    const followWithSignAddress = await deployFollowWithSign(semanticSBTLogicAddress)
    const followRegisterAddress = await deployFollowRegister(semanticSBTLogicAddress, followRegisterLogicAddress,owner.address)

    await setImpl(followRegisterAddress, followUpgradeableBeaconAddress)
    await setVerifyContract(followRegisterAddress, followWithSignAddress)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
