/*
* These cases are for testing the methods of Semantic SBT demo contract
*/
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const {expect} = require("chai");
const {ethers, upgrades} = require("hardhat");
const Web3 = require("web3");
const {min} = require("hardhat/internal/util/bigint");
const w3 = new Web3();
const {hexlify, toUtf8Bytes} = ethers.utils;


const name = 'Name Service';
const symbol = 'SBT';
const schemaURI = 'ar://PsqAxxDYdxfk4iYa4UpPam5vm8XaEyKco3rzYwZJ_4E';
const class_ = ["Name"];
const predicate_ = [["hold", 3], ["resolved", 3], ["profileHash", 1]];

const suffix = ".rel";

/*
* Before Mint SBT, should initial the parameters of this contract. In this step, we prepare the element of semantic SBT
* @param name The name for the Semantic SBT
* @param symbol The symbol for the Semantic SBT
* @param baseURI The URI may point to a JSON file that conforms to the "ERC721Metadata JSON Schema".
* @param schemaURI The URI of the contract witch point to a JSON file that conforms to the "ISemanticMetadata Metadata JSON Schema".
* @param [className] The array of class name which are used for define the "SUBJECT" of SPO 
* @param [className] The array of five data types of predicates which are used for define the "PREDICATE" of SPO 
*/
describe("Relation Name Service contract", function () {
    async function deployTokenFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();


        const SemanticSBTLogic = await ethers.getContractFactory("SemanticSBTLogicUpgradeable");
        const semanticSBTLogicLibrary = await SemanticSBTLogic.deploy();
        const NameServiceLogicLibrary = await ethers.getContractFactory("NameServiceLogic");
        const nameServiceLogicLibrary = await NameServiceLogicLibrary.deploy();

        const contractName = "RelationProfileNFT";
        console.log(contractName)

        const MyContract = await ethers.getContractFactory(contractName, {
            libraries: {
                SemanticSBTLogicUpgradeable: semanticSBTLogicLibrary.address,
                NameServiceLogic: nameServiceLogicLibrary.address,
            }
        });
        const nameService = await upgrades.deployProxy(MyContract,
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
        await nameService.deployed();
        await nameService.deployTransaction.wait();
        return {nameService, owner, addr1, addr2};
    }

    // check semanticSBT belong this contract owner
    it("owner", async function () {
        const {nameService, owner} = await loadFixture(deployTokenFixture);
        expect(await nameService.owner()).to.equal(owner.address);
    });

    // make sure contract owner can mint SBT
    it("minter", async function () {
        const {nameService, owner} = await loadFixture(deployTokenFixture);
        expect(await nameService.minters(owner.address)).to.equal(true);
    });

    // make sure the name of semantic SBT setup up as expected
    it("name", async function () {
        const {nameService} = await loadFixture(deployTokenFixture);
        expect(await nameService.name()).to.equal(name);
    });

    // make sure the symbol of semantic SBT setup up as expected
    it("symbol", async function () {
        const {nameService} = await loadFixture(deployTokenFixture);
        expect(await nameService.symbol()).to.equal(symbol);
    });

    // make sure the schemaURI of semantic SBT setup up as expected
    it("schemaURI", async function () {
        const {nameService} = await loadFixture(deployTokenFixture);
        expect(await nameService.schemaURI()).to.equal(schemaURI);
    });


    describe("Create name by Name Service ", function () {
        it("Register a name", async function () {
            const {nameService, owner} = await loadFixture(deployTokenFixture);
            const name = "my-fist-name";
            await nameService["register(address,string,bool)"](owner.address, name, true);

            const fullName = name + suffix;
            const rdf = `:Soul_${owner.address.toLowerCase()} p:resolved :Name_${fullName} . `;
            expect(await nameService.rdfOf(1)).to.be.equal(rdf);
        });


        it("User should get name by name after register a name,and then call the function setNameForAddr ", async function () {
            const {nameService, owner} = await loadFixture(deployTokenFixture);
            const name = "my-name";
            await nameService["register(address,string,bool)"](owner.address, name, false);

            const fullName = name + suffix;
            expect(await nameService.addr(fullName)).to.be.equal("0x0000000000000000000000000000000000000000");
            expect(await nameService.nameOf(owner.address)).to.be.equal("");

            await nameService.setNameForAddr(owner.address, fullName);
            expect(await nameService.addr(fullName)).to.be.equal(owner.address);
            expect(await nameService.nameOf(owner.address)).to.be.equal(fullName);
        });

        it("User should fail to register whit insufficient value", async function () {
            const {nameService, owner} = await loadFixture(deployTokenFixture);
            const name = "my-name";

            const deadline = Date.parse(new Date()) / 1000 + 10000000;
            const mintCount = 500;
            const price = 1000000000;
            //sign with originalData: 0xdc64a140aa3e981100a9beca4e685f962f0cf6c90xf39fd6e51aad88f6f4ce6ab8827279cfffb9226616906912462100my-name
            const signature = "0xba98f67f2e2069a334f1f43faf40f0d2400c1f34831070017d119ce8ce6099464adc101eb90a8c7008ffab310ca68a08c197dd5580842bd9577d0abc65bfd6631c";

            await expect(nameService["register(string,uint256,uint256,uint256,bytes)"](name, deadline, mintCount, price, signature, {value: (price - 1)})).revertedWith("NameService: insufficient value");
        })

        it("User should register whit a signature by minter", async function () {
            const {nameService, owner} = await loadFixture(deployTokenFixture);
            const minter = "0x000c1dD252027dB65484bA0D3AcdBAB0047A01a1";
            await nameService.setMinter(minter, true);
            expect(await nameService.minters(minter)).equal(true);

            const name = "my-name";
            const deadline = 1690691246;
            const mintCount = 2;
            const price = 100;
            const originalData = buildOriginalSignData(nameService.address, owner.address, deadline, mintCount, price, name);
            const signature = await sign(owner, originalData)

            await nameService["register(string,uint256,uint256,uint256,bytes)"](name, deadline, mintCount, price, signature, {value: price});

        })

        it("User should get address by name after call the function setNameForAddr ", async function () {
            const {nameService, owner} = await loadFixture(deployTokenFixture);
            const name = "my-name";
            await nameService["register(address,string,bool)"](owner.address, name, false);

            const fullName = name + suffix;
            expect(await nameService.addr(fullName)).to.be.equal("0x0000000000000000000000000000000000000000");
            expect(await nameService.nameOf(owner.address)).to.be.equal("");

            await nameService.setNameForAddr(owner.address, fullName);
            expect(await nameService.addr(fullName)).to.be.equal(owner.address);
            expect(await nameService.nameOf(owner.address)).to.be.equal(fullName);
        });

        it("Should return zero address after call setNameForAddr with zero address", async function () {
            const {nameService, owner} = await loadFixture(deployTokenFixture);
            const name = "my-name";
            await nameService["register(address,string,bool)"](owner.address, name, false);

            const fullName = name + suffix;
            expect(await nameService.addr(fullName)).to.be.equal("0x0000000000000000000000000000000000000000");
            expect(await nameService.nameOf(owner.address)).to.be.equal("");

            await nameService.setNameForAddr(owner.address, fullName);
            expect(await nameService.addr(fullName)).to.be.equal(owner.address);
            expect(await nameService.nameOf(owner.address)).to.be.equal(fullName);

            await nameService.setNameForAddr("0x0000000000000000000000000000000000000000", fullName);
            expect(await nameService.addr(fullName)).to.be.equal("0x0000000000000000000000000000000000000000");
            expect(await nameService.nameOf(owner.address)).to.be.equal("");
        });

        it("User should fail to transfer when not be transferable", async function () {
            const {nameService, owner, addr1} = await loadFixture(deployTokenFixture);
            const name = "my-name";
            await nameService["register(address,string,bool)"](owner.address, name, false);
            await expect(nameService.transferFrom(owner.address, addr1.address, 1)).to.be.revertedWith("SemanticSBT: must transferable")
        });


        it("User should fail to transfer when name has resolved", async function () {
            const {nameService, owner, addr1} = await loadFixture(deployTokenFixture);
            await nameService.setTransferable(true);

            const name = "my-name";
            await nameService["register(address,string,bool)"](owner.address, name, true);
            await expect(nameService.transferFrom(owner.address, addr1.address, 1)).to.be.revertedWith("NameService:can not transfer when resolved");
        });


        it("User could set resolve after own a transferred token", async function () {
            const {nameService, owner, addr1} = await loadFixture(deployTokenFixture);
            await nameService.setTransferable(true);

            const name = "my-name";
            const fullName = name + suffix;
            const rdf1 = `:Soul_${owner.address.toLowerCase()} p:hold :Name_${fullName} . `;
            await expect(nameService["register(address,string,bool)"](owner.address, name, false))
                .to.be.emit(nameService, "CreateRDF")
                .withArgs(1, rdf1);

            const rdf2 = `:Soul_${addr1.address.toLowerCase()} p:hold :Name_${fullName} . `;
            await expect(nameService.transferFrom(owner.address, addr1.address, 1))
                .to.be.emit(nameService, "UpdateRDF")
                .withArgs(1, rdf2);
        });


        it("User should fail to setProfileHash when name has not resolved", async function () {
            const {nameService, owner, addr1} = await loadFixture(deployTokenFixture);
            const name = "my-name";

            await nameService["register(address,string,bool)"](owner.address, name, false);
            const profileURI = String(Math.random())
            expect(nameService.setProfileURI(profileURI)).to.be.revertedWith("NameService:not resolved the name")
        })

        it("User could setProfileHash when name has resolved and get the right profileHash", async function () {
            const {nameService, owner, addr1} = await loadFixture(deployTokenFixture);
            const name = "my-name";

            await nameService["register(address,string,bool)"](owner.address, name, true);
            const profileURI = String(Math.random())
            await nameService.setProfileURI(profileURI)
            expect(await nameService.profileURI(owner.address.toLowerCase())).to.be.equal(profileURI)
        })
    })

    function buildOriginalSignData(contractAddress, owner, deadline, mintCount, price, name) {
        return ethers.utils.solidityKeccak256(["address", "address", "uint256", "uint256", "uint256", "string",],
            [contractAddress, owner, deadline, mintCount, price, name]);

        // return w3.utils.encodePacked(contractAddress.toLowerCase(), owner.toLowerCase(),deadline,mintCount,price,name)
    }

    async function sign(account, originalData) {

        return await account.signMessage(ethers.utils.arrayify(originalData))
    }


})

