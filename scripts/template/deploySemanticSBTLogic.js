const hre = require("hardhat");

module.exports = {
    deploy,
}


async function deploy(){
    const SemanticSBTLogic = await hre.ethers.getContractFactory("SemanticSBTLogicUpgradeable");
    const semanticSBTLogicLibrary = await SemanticSBTLogic.deploy();
    console.log(`SemanticSBTLogic deployed ,contract address: ${semanticSBTLogicLibrary.address}`);
    return semanticSBTLogicLibrary.address
}
