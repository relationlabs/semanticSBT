// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const {ethers, upgrades} = require("hardhat");
const hre = require("hardhat");
const semanticSBTLogic = require("./deploySemanticSBTLogic");
const upgradeableBeacon = require("./deployUpgradeableBeacon");

const name = 'Relation Dao Register';
const symbol = 'SBT';
const baseURI = '';
const schemaURI = 'ar://7mRfawDArdDEcoHpiFkmrURYlMSkREwDnK3wYzZ7-x4';
const class_ = ["Contract"];
const predicate_ = [["daoContract", 3]];


async function deployDaoRegisterLogic() {
    const DaoRegisterLogic = await ethers.getContractFactory("DaoRegisterLogic");
    const daoRegisterLogicLibrary = await DaoRegisterLogic.deploy();
    console.log(`DaoRegisterLogic deployed ,contract address: ${daoRegisterLogicLibrary.address}`);
    return daoRegisterLogicLibrary.address
}

async function deployDao(semanticSBTLogicAddress) {
    const Dao = await ethers.getContractFactory("Dao", {
        libraries: {
            SemanticSBTLogicUpgradeable: semanticSBTLogicAddress,
        }
    });
    const dao = await Dao.deploy();
    await dao.deployTransaction.wait();
    console.log(`Dao deployed ,contract address: ${dao.address}`);
    return dao.address
}

async function deployDaoWithSign(semanticSBTLogicAddress) {
    const DaoWithSign = await ethers.getContractFactory("DaoWithSign", {
        libraries: {
            SemanticSBTLogicUpgradeable: semanticSBTLogicAddress,
        }
    });
    const daoWithSignName = "Dao With Sign";
    const daoWithSign = await upgrades.deployProxy(DaoWithSign,
        [daoWithSignName],
        {unsafeAllowLinkedLibraries: true});
    await daoWithSign.deployed();
    await daoWithSign.deployTransaction.wait();
    console.log(`DaoWithSign deployed ,contract address: ${daoWithSign.address}`);
    return daoWithSign.address
}

async function deployDaoRegister(semanticSBTLogicAddress, daoRegisterLogicAddress, owner) {
    const MyContract = await ethers.getContractFactory("DaoRegister", {
        libraries: {
            SemanticSBTLogicUpgradeable: semanticSBTLogicAddress,
            DaoRegisterLogic: daoRegisterLogicAddress,
        }
    });
    const daoRegister = await upgrades.deployProxy(MyContract,
        [owner,
            name,
            symbol,
            baseURI,
            schemaURI,
            class_,
            predicate_],
        {unsafeAllowLinkedLibraries: true});

    await daoRegister.deployed();
    console.log(`DaoRegister deployed ,contract address: ${daoRegister.address}`);
    return daoRegister.address
}

async function setDaoImpl(daoRegisterAddress,daoImplAddress){
    const daoRegister = await hre.ethers.getContractAt("DaoRegister",daoRegisterAddress)
    await (await daoRegister.setDaoImpl(daoImplAddress)).wait();
    console.log(`DaoRegister setDaoImpl successfully!`);
}

async function setVerifyContract(daoRegisterAddress,verifyContractAddress){
    const daoRegister = await hre.ethers.getContractAt("DaoRegister",daoRegisterAddress)
    await (await daoRegister.setDaoVerifyContract(verifyContractAddress)).wait();
    console.log(`DaoRegister setDaoVerifyContract successfully!`);
}


async function main() {

    const [owner] = await ethers.getSigners();
    console.log(`Start...`)
    const semanticSBTLogicAddress = await semanticSBTLogic.deploy()
    const daoRegisterLogicAddress = await deployDaoRegisterLogic()
    const daoAddress = await deployDao(semanticSBTLogicAddress)
    const daoUpgradeableBeaconAddress = await upgradeableBeacon.deploy(daoAddress)
    const daoWithSignAddress = await deployDaoWithSign(semanticSBTLogicAddress)
    const daoRegisterAddress = await deployDaoRegister(semanticSBTLogicAddress,daoRegisterLogicAddress,owner.address)

    await setDaoImpl(daoRegisterAddress,daoUpgradeableBeaconAddress)
    await setVerifyContract(daoRegisterAddress,daoWithSignAddress)

    console.log(`Done!`)

}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
