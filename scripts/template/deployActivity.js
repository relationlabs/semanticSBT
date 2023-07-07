// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const name = 'Activity Template';
const symbol = 'SBT';
const baseURI = 'https://api.example.com/v1/';
const schemaURI = 'ar://pEaI9o8moBFof5IkOSq1qNnl8RuP0edn2BFD1q6vdE4';
const class_ = ["Activity"];
const predicate_ = [["participate", 3]];

const myActivity = "Example-Activity";
const whiteList = ["0x0000000000000000000000000000000000000011","0x0000000000000000000000000000000000000022"]

async function main() {

    const [owner] = await ethers.getSigners();

    const SemanticSBTLogic = await hre.ethers.getContractFactory("SemanticSBTLogic");
    const semanticSBTLogicLibrary = await SemanticSBTLogic.deploy();
    console.log(`SemanticSBTLogic deployed ,contract address: ${semanticSBTLogicLibrary.address}`);

    const contractName = "Activity";
    const MyContract = await hre.ethers.getContractFactory(contractName, {
        libraries: {
            SemanticSBTLogic: semanticSBTLogicLibrary.address,
        }
    });
    const myContract = await MyContract.deploy();
    console.log(`${contractName} deployed ,contract address: ${myContract.address}`);
    await myContract.deployTransaction.wait();

    await (await myContract.initialize(
        owner.address,
        name,
        symbol,
        baseURI,
        schemaURI,
        class_,
        predicate_)).wait();
    console.log(`${contractName} initialized!`);


    await (await myContract.setActivity(myActivity)).wait()
    console.log(`The activity of ${myActivity} is set successfully!`);

    whiteList.push(owner.address)
    await (await myContract.addWhiteList(whiteList)).wait();
    console.log(`The whiteList is set successfully!`);

    await (await myContract.mint()).wait();
    console.log(`${owner.address} participate the activity successfully!`);

    const rdf = await myContract.rdfOf(1);
    console.log(`The rdf of the first token is:  ${rdf}`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
