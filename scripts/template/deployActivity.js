// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const name = 'Sonorus Rhythm SBT';
const symbol = 'SRSBT';
let baseURI = 'https://sbt0.io/sbt/polygon/';
const schemaURI = 'ar://pEaI9o8moBFof5IkOSq1qNnl8RuP0edn2BFD1q6vdE4';
const class_ = ["Activity"];
const predicate_ = [["participant", 3]];

const myActivity = "SonorusRhythm";
const whiteList = ["0x0000000000000000000000000000000000000011","0x0000000000000000000000000000000000000022"]

async function main() {

    const [owner] = await ethers.getSigners();

    // const SemanticSBTLogic = await hre.ethers.getContractFactory("SemanticSBTLogicUpgradeable");
    // const semanticSBTLogicLibrary = await SemanticSBTLogic.deploy();
    // console.log(`SemanticSBTLogic deployed ,contract address: ${semanticSBTLogicLibrary.address}`);

    // polygon: SemanticSBTLogic deployed ,contract address: 0xb6b10404e70Be418e1f0222CFDDf3692fF0d28B8
    //mumbai: SemanticSBTLogic deployed ,contract address: 0xB9D0144c60Cfc70f17958Dc7b190908aC7b25091
    //base SemanticSBTLogic deployed ,contract address: 0x34a336b5F55625eC28B07c6e2334560BE9A12d0e

    const contractName = "Activity";
    const MyContract = await hre.ethers.getContractFactory(contractName, {
        libraries: {
            SemanticSBTLogicUpgradeable: "0xb6b10404e70Be418e1f0222CFDDf3692fF0d28B8",
        }
    });
    const myContract = await MyContract.deploy();
    console.log(`Activity deployed ,contract address: ${myContract.address}`);
    await myContract.deployTransaction.wait();

    baseURI = baseURI+ myContract.address + '/json/';
    console.log(`baseURI: ${baseURI}`)
    await (await myContract.initialize(
        owner.address,
        name,
        symbol,
        baseURI,
        schemaURI,
        class_,
        predicate_)).wait();
    console.log(`Activity initialized!`);


    await (await myContract.setActivity(myActivity)).wait()
    console.log(`The activity of ${myActivity} is set successfully!`);

    // whiteList.push(owner.address)
    // await (await myContract.addWhiteList(whiteList)).wait();
    // console.log(`The whiteList is set successfully!`);

    await (await myContract.setFreeMintable(true)).wait();
    console.log(`setFreeMintable successfully!`);

    // await (await myContract.mint()).wait();
    // console.log(`${owner.address} participant the activity successfully!`);

    // const rdf = await myContract.rdfOf(1);
    // console.log(`The rdf of the first token is:  ${rdf}`);

//    npx hardhat verify --network mumbai 0x9B42c6ab3BFA566Da0a0B60CB5C646928eaa3c2b
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
