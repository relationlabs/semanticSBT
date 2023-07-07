/*
* These cases are for testing the methods of Semantic SBT demo contract
*/
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const {expect} = require("chai");
const {MerkleTree} = require('merkletreejs');
const keccak256 = require('keccak256');
var Web3 = require('web3');
const hre = require("hardhat");

const name = 'privacy example SBT';
const symbol = 'SBT';
const baseURI = 'https://api.example.com/v1/';
const schemaURI = 'https://schema.example.com/v1/';
const className = 'TestClass';
const subjectPredicate = ['subjectPredicate', 3];
const subjectValue = "myTest";

const whiteListURL = "ar://";


/*
* Before Mint SBT, should initial the parameters of this contract. In this step, we prepare the element of semantic SBT
* @param name The name for the Semantic SBT
* @param symbol The symbol for the Semantic SBT
* @param baseURI The URI may point to a JSON file that conforms to the "ERC721Metadata JSON Schema".
* @param schemaURI The URI of the contract witch point to a JSON file that conforms to the "ISemanticMetadata Metadata JSON Schema".
* @param [className] The array of class name which are used for define the "SUBJECT" of SPO 
* @param [className] The array of five data types of predicates which are used for define the "PREDICATE" of SPO 
*/
describe("SemanticSBTWithMerkleTree contract", function () {
    async function deployTokenFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const SemanticSBTLogic = await hre.ethers.getContractFactory("SemanticSBTLogic");
        const semanticSBTLogicLibrary = await SemanticSBTLogic.deploy();
        const SemanticSBT = await ethers.getContractFactory("SemanticSBTWithMerkleTree", {
            libraries: {
                SemanticSBTLogic: semanticSBTLogicLibrary.address,
            }
        });
        const semanticSBT = await SemanticSBT.deploy();
        await semanticSBT.initialize(
            owner.address,
            name,
            symbol,
            baseURI,
            schemaURI,
            [className],
            [subjectPredicate]);
        await semanticSBT.addSubject(subjectValue, className);

        return {semanticSBT, owner, addr1, addr2};
    }

    // check semanticSBT belong this contract owner
    it("owner", async function () {
        const {semanticSBT, owner} = await loadFixture(deployTokenFixture);
        expect(await semanticSBT.owner()).to.equal(owner.address);
    });
    // make sure contract owner can mint SBT
    it("minter", async function () {
        const {semanticSBT, owner} = await loadFixture(deployTokenFixture);
        expect(await semanticSBT.minters(owner.address)).to.equal(true);
    });

    // make sure the name of semantic SBT setup up as expected
    it("name", async function () {
        const {semanticSBT} = await loadFixture(deployTokenFixture);
        expect(await semanticSBT.name()).to.equal(name);
    });

    // make sure the symbol of semantic SBT setup up as expected
    it("symbol", async function () {
        const {semanticSBT} = await loadFixture(deployTokenFixture);
        expect(await semanticSBT.symbol()).to.equal(symbol);
    });

    // make sure the schemaURI of semantic SBT setup up as expected
    it("schemaURI", async function () {
        const {semanticSBT} = await loadFixture(deployTokenFixture);
        expect(await semanticSBT.schemaURI()).to.equal(schemaURI);
    });


    /*
    * Below are the test cases for mint and burn semantic SBT.
    * Due to predicate in contract has five data types: int, string, address, subject and blankNode
    * the fist five cases are belonging to the respective data type
    * the last one is for the unions of five data types
    */
    describe("mint with verify whitelist", function () {
        it("setWhiteList ", async function () {
            const {semanticSBT, owner, addr1} = await loadFixture(deployTokenFixture);

            let whitelistAddresses = [
                owner.address,
                addr1.address,
            ];
            let leafNodes = whitelistAddresses.map(address => keccak256(address));
            let tree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});
            await expect(semanticSBT.setWhiteList(whiteListURL,tree.getHexRoot()));
            expect(await  semanticSBT.whiteListURL()).to.equal(whiteListURL);
        });

        it("Mint with proof", async function () {
            const {semanticSBT, owner, addr1} = await loadFixture(deployTokenFixture);

            let whitelistAddresses = [
                owner.address,
                addr1.address,
            ];
            let leafNodes = whitelistAddresses.map(address => keccak256(address));
            let tree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});
            await expect(semanticSBT.setWhiteList(whiteListURL,tree.getHexRoot()));
            expect(await  semanticSBT.whiteListURL()).to.equal(whiteListURL);

            let leaf = keccak256(owner.address);
            let proof = tree.getHexProof(leaf);
            await semanticSBT.mintWithProof(proof);
            expect(await semanticSBT.balanceOf(owner.address)).to.equal(1);
        });

        it("User should failed to mint with a wrong proof ", async function () {
            const {semanticSBT, owner, addr1} = await loadFixture(deployTokenFixture);

            let whitelistAddresses = [
                owner.address,
                addr1.address,
            ];
            let leafNodes = whitelistAddresses.map(address => keccak256(address));
            let tree = new MerkleTree(leafNodes, keccak256, {sortPairs: true});
            await expect(semanticSBT.setWhiteList(whiteListURL,tree.getHexRoot()));
            expect(await  semanticSBT.whiteListURL()).to.equal(whiteListURL);

            let leaf = keccak256(addr1.address);
            let proof = tree.getHexProof(leaf);
            await expect(semanticSBT.mintWithProof(proof)).to.be.revertedWith("Activity: permission denied")
        });



    })

})

