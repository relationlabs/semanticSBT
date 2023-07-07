const hre = require("hardhat");

module.exports = {
    deploy,
}


async function deploy(logicAddress) {
    const UpgradeableBeacon = await hre.ethers.getContractFactory("UpgradeableBeacon");
    const upgradeableBeacon = await UpgradeableBeacon.deploy(logicAddress);
    await upgradeableBeacon.deployTransaction.wait();
    console.log(`UpgradeableBeacon deployed ,contract address: ${upgradeableBeacon.address}`);
    return upgradeableBeacon.address
}

