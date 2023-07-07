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

        const FollowRegisterLogic = await hre.ethers.getContractFactory("FollowRegisterLogic");
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

        const FollowWithSign = await hre.ethers.getContractFactory("FollowWithSign", {
            libraries: {
                SemanticSBTLogicUpgradeable: semanticSBTLogicLibrary.address,
            }
        });
        const followWithSign = await FollowWithSign.deploy();
        await followWithSign.deployTransaction.wait();
        const followWithSignName = 'Follow With Sign';
        await followWithSign.initialize(followWithSignName);


        const contractName = "FollowRegister";
        const MyContract = await hre.ethers.getContractFactory(contractName, {
            libraries: {
                SemanticSBTLogicUpgradeable: semanticSBTLogicLibrary.address,
                FollowRegisterLogic: followRegisterLogicLibrary.address,
            }
        });
        const followRegister = await MyContract.deploy();

        await followRegister.initialize(
            owner.address,
            name,
            symbol,
            baseURI,
            schemaURI,
            class_,
            predicate_);
        await followRegister.setFollowImpl(upgradeableBeacon.address);
        await followRegister.setFollowVerifyContract(followWithSign.address);
        return {followRegister, followWithSign, owner, addr1, addr2};
    }

    // check semanticSBT belong this contract owner
    it("owner", async function () {
        const {followRegister, owner} = await loadFixture(deployTokenFixture);
        expect(await followRegister.owner()).to.equal(owner.address);
    });
    // make sure contract owner can mint SBT
    it("minter", async function () {
        const {followRegister, owner} = await loadFixture(deployTokenFixture);
        expect(await followRegister.minters(owner.address)).to.equal(true);
    });

    // make sure the name of semantic SBT setup up as expected
    it("name", async function () {
        const {followRegister} = await loadFixture(deployTokenFixture);
        expect(await followRegister.name()).to.equal(name);
    });

    // make sure the symbol of semantic SBT setup up as expected
    it("symbol", async function () {
        const {followRegister} = await loadFixture(deployTokenFixture);
        expect(await followRegister.symbol()).to.equal(symbol);
    });

    // make sure the schemaURI of semantic SBT setup up as expected
    it("schemaURI", async function () {
        const {followRegister} = await loadFixture(deployTokenFixture);
        expect(await followRegister.schemaURI()).to.equal(schemaURI);
    });


    /*
    * Below are the test cases for mint and burn semantic SBT.
    * Due to predicate in contract has five data types: int, string, address, subject and blankNode
    * the fist five cases are belonging to the respective data type
    * the last one is for the unions of five data types
    */
    describe("Deploy follow contracts and follow other user", function () {
        it("Deploy one follow contract ", async function () {
            const {followRegister, owner} = await loadFixture(deployTokenFixture);
            await followRegister.deployFollowContract(owner.address);

            const followContract = await followRegister.ownedFollowContract(owner.address);
            const rdf = `:Soul_${owner.address.toLowerCase()} p:followContract :Contract_${followContract.toLowerCase()} . `;
            expect(await followRegister.rdfOf(1)).equal(rdf);
        });

        it("Deploy two follow contracts for two users", async function () {
            const {followRegister, owner, addr1} = await loadFixture(deployTokenFixture);
            await followRegister.deployFollowContract(owner.address);
            await followRegister.deployFollowContract(addr1.address);

            const followContract1 = await followRegister.ownedFollowContract(owner.address);
            const rdf1 = `:Soul_${owner.address.toLowerCase()} p:followContract :Contract_${followContract1.toLowerCase()} . `;
            expect(await followRegister.rdfOf(1)).equal(rdf1);
            const followContract2 = await followRegister.ownedFollowContract(addr1.address);
            const rdf2 = `:Soul_${addr1.address.toLowerCase()} p:followContract :Contract_${followContract2.toLowerCase()} . `;
            expect(await followRegister.rdfOf(2)).equal(rdf2);
        });


        it("User should have a SBT at followed user's follow contract", async function () {
            const {followRegister, owner, addr1} = await loadFixture(deployTokenFixture);
            await followRegister.deployFollowContract(owner.address);
            await followRegister.deployFollowContract(addr1.address);

            const followContractAddress = await followRegister.ownedFollowContract(addr1.address);
            const followContract = await hre.ethers.getContractAt("Follow", followContractAddress);
            await followContract.connect(owner).follow();
            const rdf = `:Soul_${owner.address.toLowerCase()} p:following :Soul_${addr1.address.toLowerCase()} . `;
            expect(await followContract.rdfOf(1)).to.be.equal(rdf);
        });

        it("User should burn the SBT when unfollow", async function () {
            const {followRegister, owner, addr1} = await loadFixture(deployTokenFixture);
            await followRegister.deployFollowContract(addr1.address);

            const followContractAddress = await followRegister.ownedFollowContract(addr1.address);
            const followContract = await hre.ethers.getContractAt("Follow", followContractAddress);
            const rdf = `:Soul_${owner.address.toLowerCase()} p:following :Soul_${addr1.address.toLowerCase()} . `;
            await expect(followContract.connect(owner).follow())
                .to.emit(followContract, "CreateRDF")
                .withArgs(1, rdf);
            expect(await followContract.rdfOf(1)).to.be.equal(rdf);

            await expect(followContract.connect(owner).unfollow())
                .to.emit(followContract, "RemoveRDF")
                .withArgs(1, rdf);

        });


    })

    describe("Call follow contracts with signData", function () {
        it("Follow with signData", async function () {
            const {followRegister, followWithSign, owner, addr1} = await loadFixture(deployTokenFixture);
            await followRegister.deployFollowContract(addr1.address);

            const followContractAddress = await followRegister.ownedFollowContract(addr1.address);
            const followContract = await hre.ethers.getContractAt("Follow", followContractAddress);

            const name = await followWithSign.name();
            const nonce = await followWithSign.nonces(owner.address);
            const deadline = Date.parse(new Date()) / 1000 + 100;
            const sign = await getSign(buildFollowParams(name, followWithSign.address.toLowerCase(), followContractAddress.toLowerCase(), parseInt(nonce), deadline), owner.address);
            var param =
                {
                    "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
                    "target": followContractAddress,
                    "addr": owner.address
                }
            await followWithSign.connect(addr1).followWithSign(param);
            expect(await followContract.ownerOf(1)).equal(owner.address)
        });

        it("Unfollow with signData", async function () {
            const {followRegister, followWithSign, owner, addr1} = await loadFixture(deployTokenFixture);
            await followRegister.deployFollowContract(addr1.address);

            const followContractAddress = await followRegister.ownedFollowContract(addr1.address);
            const followContract = await hre.ethers.getContractAt("Follow", followContractAddress);

            const name = await followWithSign.name();
            let nonce = await followWithSign.nonces(owner.address);
            let deadline = Date.parse(new Date()) / 1000 + 100;
            let sign = await getSign(buildFollowParams(name, followWithSign.address.toLowerCase(), followContractAddress.toLowerCase(), parseInt(nonce), deadline), owner.address);
            let param = {
                "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
                "target": followContractAddress,
                "addr": owner.address
            }
            await followWithSign.connect(addr1).followWithSign(param);
            expect(await followContract.ownerOf(1)).equal(owner.address)

            nonce = await followWithSign.nonces(owner.address);
            deadline = Date.parse(new Date()) / 1000 + 100;
            sign = await getSign(buildUnFollowParams(name, followWithSign.address.toLowerCase(), followContractAddress.toLowerCase(), parseInt(nonce), deadline), owner.address);
            param = {
                "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
                "target": followContractAddress,
                "addr": owner.address
            }
            await followWithSign.connect(addr1).unfollowWithSign(param);
            expect(await followContract.totalSupply()).equal(0)
        });


    })


    async function getSign(msgParams, signerAddress) {
        const params = [signerAddress, msgParams];
        const trace = await hre.network.provider.send(
            "eth_signTypedData_v4", params);
        return Bytes.splitSignature(trace);
    }

    function getChainId() {
        return hre.network.config.chainId;
    }

    function buildFollowParams(name, contractAddress, followContractAddress, nonce, deadline) {
        return {
            domain: {
                chainId: getChainId(),
                name: name,
                verifyingContract: contractAddress,
                version: '1',
            },

            // Defining the message signing data content.
            message: {
                target: followContractAddress,
                nonce: nonce,
                deadline: deadline,
            },
            // Refers to the keys of the *types* object below.
            primaryType: 'FollowWithSign',
            types: {
                EIP712Domain: [
                    {name: 'name', type: 'string'},
                    {name: 'version', type: 'string'},
                    {name: 'chainId', type: 'uint256'},
                    {name: 'verifyingContract', type: 'address'},
                ],
                FollowWithSign: [
                    {name: 'target', type: 'address'},
                    {name: 'nonce', type: 'uint256'},
                    {name: 'deadline', type: 'uint256'},
                ],
            },
        };
    }

    function buildUnFollowParams(name, contractAddress, followContractAddress, nonce, deadline) {
        return {
            domain: {
                chainId: getChainId(),
                name: name,
                verifyingContract: contractAddress,
                version: '1',
            },

            // Defining the message signing data content.
            message: {
                target: followContractAddress,
                nonce: nonce,
                deadline: deadline,
            },
            // Refers to the keys of the *types* object below.
            primaryType: 'UnFollowWithSign',
            types: {
                EIP712Domain: [
                    {name: 'name', type: 'string'},
                    {name: 'version', type: 'string'},
                    {name: 'chainId', type: 'uint256'},
                    {name: 'verifyingContract', type: 'address'},
                ],
                UnFollowWithSign: [
                    {name: 'target', type: 'address'},
                    {name: 'nonce', type: 'uint256'},
                    {name: 'deadline', type: 'uint256'},
                ],
            },
        };
    }


})

