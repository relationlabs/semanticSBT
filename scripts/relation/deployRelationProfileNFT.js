// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const {ethers, upgrades} = require("hardhat");


const name = '.soul profile ';
const symbol = 'SOUL';
const schemaURI = 'ar://PsqAxxDYdxfk4iYa4UpPam5vm8XaEyKco3rzYwZJ_4E';
const class_ = ["Name"];
const predicate_ = [["hold", 3], ["resolved", 3], ["profileURI", 1]];

const suffix = ".soul";

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
    const myContract = await upgrades.deployProxy(MyContract,
        [
            suffix,
            name,
            symbol,
            schemaURI,
            class_,
            predicate_],
        {
            unsafeAllowLinkedLibraries: true,
            initializer: 'initialize(string, string, string, string, string[], (string,uint8)[])'
        });

    await myContract.deployed();
    await myContract.deployTransaction.wait();
    console.log(
        `${contractName} deployed ,contract address: ${myContract.address}`
    );

    await (await myContract.setTransferable(true)).wait();
    await (await myContract.setMinter("0x27546C3D47dECBC5d72C446D9f0593d2141A92F6",true)).wait();

    const nameInContract = await myContract.name();
    const ownerInContract = await myContract.owner();
    const schemaURIInContract = await myContract.schemaURI();
    const suffixInContract = await myContract.suffix();
    const transferable = await myContract.transferable();
    console.log(
        `${contractName} nameInContract: ${nameInContract},
        \t ownerInContract:${ownerInContract},
        \t schemaURIInContract:${schemaURIInContract},
        \t suffixInContract:${suffixInContract}
        \t transferable:${transferable}`
    );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
