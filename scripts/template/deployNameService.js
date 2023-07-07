// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const {ethers, upgrades} = require("hardhat");
const semanticSBTLogic = require("./deploySemanticSBTLogic");


const name = 'Relation Name Service V1';
const symbol = 'SBT';
const baseURI = '';
const schemaURI = 'ar://PsqAxxDYdxfk4iYa4UpPam5vm8XaEyKco3rzYwZJ_4E';
const class_ = ["Name"];
const predicate_ = [["hold", 3], ["resolved", 3], ["profileURI", 1]];

const suffix = ".soul";

async function deployNameServiceLogic() {
    const NameServiceLogicLibrary = await ethers.getContractFactory("NameServiceLogic");
    const nameServiceLogicLibrary = await NameServiceLogicLibrary.deploy();
    console.log(
        `NameServiceLogicLibrary deployed ,contract address: ${nameServiceLogicLibrary.address}`
    );
    await nameServiceLogicLibrary.deployTransaction.wait();
    return nameServiceLogicLibrary.address
}

async function deployNameService(semanticSBTLogicAddress, nameServiceLogicAddress, owner) {
    const contractName = "NameService";
    console.log(contractName)

    const MyContract = await ethers.getContractFactory(contractName, {
        libraries: {
            SemanticSBTLogicUpgradeable: semanticSBTLogicAddress,
            NameServiceLogic: nameServiceLogicAddress,
        }
    });
    const myContract = await upgrades.deployProxy(MyContract,
        [suffix,
            name,
            symbol,
            schemaURI,
            class_,
            predicate_],
        {
            unsafeAllowLinkedLibraries: true,
            initializer: 'initialize(string, string, string, string, string[], (string,uint8)[])'
        }
    );

    await myContract.deployed();
    await myContract.deployTransaction.wait();
    console.log(
        `${contractName} deployed ,contract address: ${myContract.address}`
    );
    return myContract.address
}


async function upgrade(semanticSBTLogicAddress, nameServiceLogicAddress, proxyAddress) {
    const contractName = "NameService";

    const MyContract = await ethers.getContractFactory(contractName, {
        libraries: {
            SemanticSBTLogicUpgradeable: semanticSBTLogicAddress,
            NameServiceLogic: nameServiceLogicAddress,
        }
    });

    await upgrades.upgradeProxy(
        proxyAddress,
        MyContract,
        {unsafeAllowLinkedLibraries: true});
    console.log(`${contractName} upgrade successfully!`)
}

async function main() {
    const [owner] = await ethers.getSigners();

    const semanticSBTLogicAddress = await semanticSBTLogic.deploy()
    const nameServiceLogicAddress = await deployNameServiceLogic()
    const nameServiceAddress = await deployNameService(semanticSBTLogicAddress, nameServiceLogicAddress, owner.address)


    // await upgrade(semanticSBTLogicAddress, nameServiceLogicAddress, nameServiceAddress)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
