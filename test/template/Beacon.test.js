/*
* These cases are for testing the methods of Semantic SBT demo contract
*/
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const {expect} = require("chai");
const hre = require("hardhat");
const Wallet = require('@ethersproject/wallet');
const Bytes = require('@ethersproject/bytes');

const name = 'Follow Register';
const symbol = 'SBT';
const baseURI = 'https://api.example.com/v1/';
const schemaURI = 'ar://auPfoCDBtJ3RJ_WyUqV9O7GAARDzkUT4TSuj9uuax-0';
const class_ = ["Contract"];
const predicate_ = [["followContract", 3]];


/*
* Before Mint SBT, should initial the parameters of this contract. In this step, we prepare the element of semantic SBT
* @param name The name for the Semantic SBT
* @param symbol The symbol for the Semantic SBT
* @param baseURI The URI may point to a JSON file that conforms to the "ERC721Metadata JSON Schema".
* @param schemaURI The URI of the contract witch point to a JSON file that conforms to the "ISemanticMetadata Metadata JSON Schema".
* @param [className] The array of class name which are used for define the "SUBJECT" of SPO 
* @param [className] The array of five data types of predicates which are used for define the "PREDICATE" of SPO 
*/
describe("FollowRegister contract", function () {
    async function deployTokenFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();

        const SemanticSBTLogic = await hre.ethers.getContractFactory("SemanticSBTLogicUpgradeable");
        const semanticSBTLogicLibrary = await SemanticSBTLogic.deploy();

        const FollowRegisterLogic = await hre.ethers.getContractFactory("FollowRegisterLogic",);
        const followRegisterLogicLibrary = await FollowRegisterLogic.deploy();

        const Follow = await hre.ethers.getContractFactory("Follow", {
            libraries: {
                SemanticSBTLogicUpgradeable: semanticSBTLogicLibrary.address,
            }
        });
        const follow = await Follow.deploy();
        await follow.deployTransaction.wait();

        const UpgradeableBeacon = await hre.ethers.getContractFactory("UpgradeableBeacon");
        const upgradeableBeacon = await UpgradeableBeacon.deploy(follow.address);
        await upgradeableBeacon.deployTransaction.wait();
        console.log(`Follow:${follow.address} , UpgradeableBeacon:${upgradeableBeacon.address}`);

        const fragment = Follow.interface.getFunction("initialize(address, address, address, string, string, string, string, string[], (string,uint8)[])");
        const _data  = Follow.interface.encodeFunctionData(fragment, [
            owner.address,
            owner.address,
            owner.address,
            name,
            symbol,
            baseURI,
            schemaURI,
            class_,
            predicate_]);
        const BeaconProxy = await hre.ethers.getContractFactory("BeaconProxy");
        const beaconProxy = await BeaconProxy.deploy(upgradeableBeacon.address,_data);
        await beaconProxy.deployTransaction.wait();
        console.log(`beaconProxy: ${beaconProxy.address}`)
        const followContract = await hre.ethers.getContractAt("Follow",beaconProxy.address);
        console.log(`followContract:${followContract.address}`);
        return {followContract, owner, addr1, addr2};
    }

    // check semanticSBT belong this contract owner
    it("owner", async function () {
        const {followContract, owner} = await loadFixture(deployTokenFixture);
        expect(await followContract.owner()).to.equal(owner.address);
    });
    // make sure contract owner can mint SBT
    it("minter", async function () {
        const {followContract, owner} = await loadFixture(deployTokenFixture);
        expect(await followContract.minters(owner.address)).to.equal(true);
    });

    // make sure the name of semantic SBT setup up as expected
    it("name", async function () {
        const {followContract} = await loadFixture(deployTokenFixture);
        expect(await followContract.name()).to.equal(name);
    });

    // make sure the symbol of semantic SBT setup up as expected
    it("symbol", async function () {
        const {followContract} = await loadFixture(deployTokenFixture);
        expect(await followContract.symbol()).to.equal(symbol);
    });

    // make sure the schemaURI of semantic SBT setup up as expected
    it("schemaURI", async function () {
        const {followContract} = await loadFixture(deployTokenFixture);
        expect(await followContract.schemaURI()).to.equal(schemaURI);
    });




})

