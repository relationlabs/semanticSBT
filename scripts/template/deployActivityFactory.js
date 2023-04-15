// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

    const SemanticSBTLogic = await hre.ethers.getContractFactory("SemanticSBTLogic");
    const semanticSBTLogicLibrary = await SemanticSBTLogic.deploy();
    console.log(`SemanticSBTLogic deployed ,contract address: ${semanticSBTLogicLibrary.address}`);


    const Activity = await hre.ethers.getContractFactory("Activity", {
        libraries: {
            SemanticSBTLogic: semanticSBTLogicLibrary.address,
        }
    });
    const activity = await Activity.deploy();
    console.log(`$Activity deployed ,contract address: ${activity.address}`);
    await activity.deployTransaction.wait();

    const ActivityFactory = await hre.ethers.getContractFactory("ActivityFactory");
    const activityFactory = await ActivityFactory.deploy();
    console.log(`ActivityFactory deployed ,contract address: ${activityFactory.address}`);

    await (await activityFactory.setActivityImpl(activity.address)).wait();

    const contractAddress = await (await activityFactory.createActivity("my-activity","MAC","myActivity")).wait()
    console.log(contractAddress)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
