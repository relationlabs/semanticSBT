/*
* These cases are for testing the methods of Semantic SBT demo contract
*/
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const {expect} = require("chai");
const hre = require("hardhat");


/*
* Before Mint SBT, should initial the parameters of this contract. In this step, we prepare the element of semantic SBT
* @param name The name for the Semantic SBT
* @param symbol The symbol for the Semantic SBT
* @param baseURI The URI may point to a JSON file that conforms to the "ERC721Metadata JSON Schema".
* @param schemaURI The URI of the contract witch point to a JSON file that conforms to the "ISemanticMetadata Metadata JSON Schema".
* @param [className] The array of class name which are used for define the "SUBJECT" of SPO 
* @param [predicate] The array of five data types of predicates which are used for define the "PREDICATE" of SPO
*/
describe("ActivityFactory contract", function () {
    async function deployTokenFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const SemanticSBTLogic = await hre.ethers.getContractFactory("SemanticSBTLogicUpgradeable");
        const semanticSBTLogicLibrary = await SemanticSBTLogic.deploy();


        const Activity = await hre.ethers.getContractFactory("Activity", {
            libraries: {
                SemanticSBTLogicUpgradeable: semanticSBTLogicLibrary.address,
            }
        });
        const activity = await Activity.deploy();
        await activity.deployTransaction.wait();

        const ActivityFactory = await hre.ethers.getContractFactory("ActivityFactory");
        const activityFactory = await ActivityFactory.deploy();

        await (await activityFactory.setActivityImpl(activity.address)).wait();

        return {activityFactory, owner, addr1, addr2};
    }


    /*
    * Below are the test cases for mint and burn semantic SBT.
    * Due to predicate in contract has five data types: int, string, address, subject and blankNode
    * the fist five cases are belonging to the respective data type
    * the last one is for the unions of five data types 
    */
    describe("create activity by factory", function () {
        it("create activity contract and mint a token", async function () {
            const {activityFactory, owner} = await loadFixture(deployTokenFixture);
            await (await activityFactory.createActivity("my-activity", "MAC", "", "myActivity")).wait()
            const nonce = await activityFactory.nonce(owner.address)
            const activityContractAddress = await activityFactory.addressOf(owner.address, nonce)

            const activity = await ethers.getContractAt("Activity", activityContractAddress)
            await activity.addWhiteList([owner.address])
            await expect(activity.mint()).to.be.emit(activity, "CreateRDF")
                .withArgs(1, `:Soul_${owner.address.toLowerCase()} p:participate :Activity_myActivity . `)
        });

        it("user should mint failed when paused", async function () {
            const {activityFactory, owner} = await loadFixture(deployTokenFixture);
            await (await activityFactory.createActivity("my-activity", "MAC", "", "myActivity")).wait()
            const nonce = await activityFactory.nonce(owner.address)
            const activityContractAddress = await activityFactory.addressOf(owner.address, nonce)

            const activity = await ethers.getContractAt("Activity", activityContractAddress)
            await activity.pause()
            await activity.addWhiteList([owner.address])
            await expect(activity.mint()).to.be.revertedWith("Pausable: paused")
        });

    })

});

