// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const {ethers, upgrades} = require("hardhat");

const name = "Follow Template";
const symbol = 'SBT';
const baseURI = '';
const schemaURI = 'ar://-2hCuTMqo1fz2iyzf7dbEbzoyceod5KFOyGGqNiEQWY';
const class_ = [];
const predicate_ = [["following", 3]];

async function main() {

    const [owner, addr1] = await ethers.getSigners();

    const SemanticSBTLogic = await hre.ethers.getContractFactory("SemanticSBTLogicUpgradeable");
    const semanticSBTLogicLibrary = await SemanticSBTLogic.deploy();
    console.log(
        `SemanticSBTLogicUpgradeable deployed ,contract address: ${semanticSBTLogicLibrary.address}`
    );
    const FollowRegisterLogic = await hre.ethers.getContractFactory("FollowRegisterLogic");
    const followRegisterLogicLibrary = await FollowRegisterLogic.deploy();
    console.log(
        `FollowRegisterLogic deployed ,contract address: ${followRegisterLogicLibrary.address}`
    );
    const FollowWithSign = await hre.ethers.getContractFactory("FollowWithSign", {
        libraries: {
            SemanticSBTLogicUpgradeable: semanticSBTLogicLibrary.address,
        }
    });
    const followWithSignName = "Follow With Sign";
    const followWithSign = await upgrades.deployProxy(FollowWithSign,
        [followWithSignName],
        {unsafeAllowLinkedLibraries: true});
    await followWithSign.deployed();
    await followWithSign.deployTransaction.wait();
    console.log(`FollowWithSign deployed ,contract address: ${followWithSign.address}`);



    const Follow = await hre.ethers.getContractFactory("Follow", {
        libraries: {
            SemanticSBTLogicUpgradeable: semanticSBTLogicLibrary.address,
        }
    });
    const follow = await Follow.deploy();
    await follow.deployTransaction.wait();
    console.log(
        `Follow deployed ,contract address: ${follow.address}`
    );
    await (await follow["initialize(address,address,address,string,string,string,string,string[],(string,uint8)[])"](
        owner.address,
        owner.address,
        followWithSign.address,
        name,
        symbol,
        baseURI,
        schemaURI,
        class_,
        predicate_)).wait();

    console.log(
        `Follow contract initialize successfully!`
    );

    await (await follow.connect(addr1).follow()).wait()
    console.log(`${addr1.address} following  ${owner.address} successfully!`);

    const rdf = await follow.rdfOf(1);
    console.log(`The rdf of the first token is:  ${rdf}`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
