/*
* These cases are for testing the methods of Semantic SBT demo contract
*/
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const {expect} = require("chai");
const hre = require("hardhat");
const Bytes = require("@ethersproject/bytes");
const {upgrades} = require("hardhat");

const name = 'Privacy Content';
const symbol = 'SBT';
const baseURI = 'https://api.example.com/v1/';
const schemaURI = 'ar://DeM6LRONjAUYr3qixkguLuFvYSHkykN7ZRKHn2HR5Gs';
const class_ = [];
const predicate_ = [["privacyContent", 1]];
const content = "ar://the tx hash of content on arweave";

const firstDAOName = "First DAO name";

/*
* Before Mint SBT, should initial the parameters of this contract. In this step, we prepare the element of semantic SBT
* @param name The name for the Semantic SBT
* @param symbol The symbol for the Semantic SBT
* @param baseURI The URI may point to a JSON file that conforms to the "ERC721Metadata JSON Schema".
* @param schemaURI The URI of the contract witch point to a JSON file that conforms to the "ISemanticMetadata Metadata JSON Schema".
* @param [className] The array of class name which are used for define the "SUBJECT" of SPO 
* @param [className] The array of five data types of predicates which are used for define the "PREDICATE" of SPO 
*/
describe("Privacy Content contract", function () {
    async function deployFollowRegister() {
        const name = 'Follow Register';
        const symbol = 'SBT';
        const baseURI = 'https://api.example.com/v1/';
        const schemaURI = 'ar://auPfoCDBtJ3RJ_WyUqV9O7GAARDzkUT4TSuj9uuax-0';
        const class_ = ["Contract"];
        const predicate_ = [["followContract", 3]];
        const [owner] = await ethers.getSigners();

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
        return followRegister;
    }

    async function deployDaoRegister() {
        const name = 'Dao Register';
        const symbol = 'SBT';
        const baseURI = 'https://api.example.com/v1/';
        const schemaURI = 'ar://7mRfawDArdDEcoHpiFkmrURYlMSkREwDnK3wYzZ7-x4';
        const class_ = ["Dao"];
        const predicate_ = [["daoContract", 3]];
        const [owner] = await ethers.getSigners();

        const SemanticSBTLogic = await hre.ethers.getContractFactory("SemanticSBTLogicUpgradeable");
        const semanticSBTLogicLibrary = await SemanticSBTLogic.deploy();

        const DaoRegisterLogic = await hre.ethers.getContractFactory("DaoRegisterLogic");
        const daoRegisterLogicLibrary = await DaoRegisterLogic.deploy();
        const Dao = await hre.ethers.getContractFactory("Dao", {
            libraries: {
                SemanticSBTLogicUpgradeable: semanticSBTLogicLibrary.address,
            }
        });
        const dao = await Dao.deploy();
        await dao.deployTransaction.wait();

        const UpgradeableBeacon = await hre.ethers.getContractFactory("UpgradeableBeacon");
        const upgradeableBeacon = await UpgradeableBeacon.deploy(dao.address);
        await upgradeableBeacon.deployTransaction.wait();


        const contractName = "DaoRegister";
        const MyContract = await hre.ethers.getContractFactory(contractName, {
            libraries: {
                SemanticSBTLogicUpgradeable: semanticSBTLogicLibrary.address,
                DaoRegisterLogic: daoRegisterLogicLibrary.address,
            }
        });
        const daoRegister = await MyContract.deploy();

        await daoRegister.initialize(
            owner.address,
            name,
            symbol,
            baseURI,
            schemaURI,
            class_,
            predicate_);
        await daoRegister.setDaoImpl(upgradeableBeacon.address);
        return daoRegister;
    }

    async function deployTokenFixture() {
        const [owner, addr1] = await ethers.getSigners();

        const SemanticSBTLogic = await hre.ethers.getContractFactory("SemanticSBTLogicUpgradeable");
        const semanticSBTLogicLibrary = await SemanticSBTLogic.deploy();

        const PrivacyContentWithSign = await hre.ethers.getContractFactory("PrivacyContentWithSign", {
            libraries: {
                SemanticSBTLogicUpgradeable: semanticSBTLogicLibrary.address,
            }
        });
        const privacyContentWithSign = await PrivacyContentWithSign.deploy();
        await privacyContentWithSign.deployTransaction.wait();
        const privacyContentWithSignName = 'Privacy Content With Sign';
        await privacyContentWithSign.initialize(privacyContentWithSignName);


        const contractName = "PrivacyContent";
        const MyContract = await hre.ethers.getContractFactory(contractName, {
            libraries: {
                SemanticSBTLogicUpgradeable: semanticSBTLogicLibrary.address,
            }
        });
        const privacyContent = await upgrades.deployProxy(MyContract,
            [owner.address,
                privacyContentWithSign.address,
                name,
                symbol,
                baseURI,
                schemaURI,
                class_,
                predicate_],
            {
                unsafeAllowLinkedLibraries: true,
                initializer: 'initialize(address, address, string, string, string, string, string[], (string,uint8)[])'
            });
        await privacyContent.deployed();
        const followRegister = await deployFollowRegister();
        return {privacyContent: privacyContent, privacyContentWithSign, followRegister, owner, addr1};
    }

    // check semanticSBT belong this contract owner
    it("owner", async function () {
        const {privacyContent, owner} = await loadFixture(deployTokenFixture);
        expect(await privacyContent.owner()).to.equal(owner.address);
    });
    // make sure contract owner can mint SBT
    it("minter", async function () {
        const {privacyContent, owner} = await loadFixture(deployTokenFixture);
        expect(await privacyContent.minters(owner.address)).to.equal(true);
    });

    // make sure the name of semantic SBT setup up as expected
    it("name", async function () {
        const {privacyContent} = await loadFixture(deployTokenFixture);
        expect(await privacyContent.name()).to.equal(name);
    });

    // make sure the symbol of semantic SBT setup up as expected
    it("symbol", async function () {
        const {privacyContent} = await loadFixture(deployTokenFixture);
        expect(await privacyContent.symbol()).to.equal(symbol);
    });

    // make sure the schemaURI of semantic SBT setup up as expected
    it("schemaURI", async function () {
        const {privacyContent} = await loadFixture(deployTokenFixture);
        expect(await privacyContent.schemaURI()).to.equal(schemaURI);
    });


    /*
    * Below are the test cases for mint and burn semantic SBT.
    * Due to predicate in contract has five data types: int, string, address, subject and blankNode
    * the fist five cases are belonging to the respective data type
    * the last one is for the unions of five data types
    */
    describe("Post privacy content", function () {
        it("User should fail to post without call prepare token", async function () {
            const {privacyContent, owner} = await loadFixture(deployTokenFixture);
            expect(await privacyContent.ownedPrepareToken(owner.address)).to.equal(0);
            await expect(privacyContent.post(content))
                .to.revertedWith("PrivacyContent:Token id not exist")
        });

        it("User should owner a sbt after post a privacy content ", async function () {
            const {privacyContent, owner} = await loadFixture(deployTokenFixture);
            const subject = ':Soul_' + owner.address.toLowerCase();
            const predicate = "p:privacyContent";
            const object = `"${content}"`;
            const rdf = subject + ' ' + predicate + ' ' + object + ' . ';

            await privacyContent.prepareToken();
            expect(await privacyContent.ownedPrepareToken(owner.address)).to.equal(1);

            await expect(privacyContent.post(content))
                .to.emit(privacyContent, "CreateRDF")
                .withArgs(1, rdf);
            expect(await privacyContent.rdfOf(1)).to.equal(rdf);
            expect(await privacyContent.contentOf(1)).to.equal(content);
            expect(await privacyContent.ownerOf(1)).to.equal(owner.address);
        });

        it("Should return false when the address is not the viewer", async function () {
            const {privacyContent, owner, addr1} = await loadFixture(deployTokenFixture);
            const subject = ':Soul_' + owner.address.toLowerCase();
            const predicate = "p:privacyContent";
            const object = `"${content}"`;
            const rdf = subject + ' ' + predicate + ' ' + object + ' . ';

            await privacyContent.prepareToken();
            expect(await privacyContent.ownedPrepareToken(owner.address)).to.equal(1);

            await expect(privacyContent.post(content))
                .to.emit(privacyContent, "CreateRDF")
                .withArgs(1, rdf);
            expect(await privacyContent.rdfOf(1)).to.equal(rdf);
            expect(await privacyContent.contentOf(1)).to.equal(content);
            expect(await privacyContent.isViewerOf(owner.address, 1)).to.equal(true);
            expect(await privacyContent.isViewerOf(addr1.address, 1)).to.equal(false);
        });

        it("Should revert when the shared address not Follow implementer", async function () {
            const {privacyContent, owner, addr1} = await loadFixture(deployTokenFixture);
            const subject = ':Soul_' + owner.address.toLowerCase();
            const predicate = "p:privacyContent";
            const object = `"${content}"`;
            const rdf = subject + ' ' + predicate + ' ' + object + ' . ';

            await privacyContent.prepareToken();
            expect(await privacyContent.ownedPrepareToken(owner.address)).to.equal(1);

            await expect(privacyContent.post(content))
                .to.emit(privacyContent, "CreateRDF")
                .withArgs(1, rdf);
            expect(await privacyContent.rdfOf(1)).to.equal(rdf);
            expect(await privacyContent.contentOf(1)).to.equal(content);
            expect(await privacyContent.isViewerOf(owner.address, 1)).to.equal(true);
            expect(await privacyContent.isViewerOf(addr1.address, 1)).to.equal(false);

            await expect(privacyContent.connect(owner).shareToFollower(1, privacyContent.address)).revertedWith("PrivacyContent: non Follow implementer")
        });

        it("Should revert when the shared address not Dao implementer", async function () {
            const {privacyContent, owner, addr1} = await loadFixture(deployTokenFixture);
            const subject = ':Soul_' + owner.address.toLowerCase();
            const predicate = "p:privacyContent";
            const object = `"${content}"`;
            const rdf = subject + ' ' + predicate + ' ' + object + ' . ';

            await privacyContent.prepareToken();
            expect(await privacyContent.ownedPrepareToken(owner.address)).to.equal(1);

            await expect(privacyContent.post(content))
                .to.emit(privacyContent, "CreateRDF")
                .withArgs(1, rdf);
            expect(await privacyContent.rdfOf(1)).to.equal(rdf);
            expect(await privacyContent.contentOf(1)).to.equal(content);
            expect(await privacyContent.isViewerOf(owner.address, 1)).to.equal(true);
            expect(await privacyContent.isViewerOf(addr1.address, 1)).to.equal(false);

            await expect(privacyContent.connect(owner).shareToDao(1, privacyContent.address)).revertedWith("PrivacyContent: non Dao implementer")
        });

        it("Should return true when the address is following the owner of token", async function () {
            const {privacyContent, followRegister, owner, addr1} = await loadFixture(deployTokenFixture);
            const subject = ':Soul_' + owner.address.toLowerCase();
            const predicate = "p:privacyContent";
            const object = `"${content}"`;
            const rdf = subject + ' ' + predicate + ' ' + object + ' . ';

            await privacyContent.prepareToken();
            expect(await privacyContent.ownedPrepareToken(owner.address)).to.equal(1);

            await expect(privacyContent.post(content))
                .to.emit(privacyContent, "CreateRDF")
                .withArgs(1, rdf);
            expect(await privacyContent.rdfOf(1)).to.equal(rdf);
            expect(await privacyContent.contentOf(1)).to.equal(content);
            expect(await privacyContent.isViewerOf(owner.address, 1)).to.equal(true);
            expect(await privacyContent.isViewerOf(addr1.address, 1)).to.equal(false);

            await followRegister.deployFollowContract(owner.address);
            const followContractAddress = await followRegister.ownedFollowContract(owner.address);
            const followContract = await hre.ethers.getContractAt("Follow", followContractAddress);
            await followContract.connect(addr1).follow();
            expect(await privacyContent.isViewerOf(addr1.address, 1)).to.equal(false);
            await privacyContent.connect(owner).shareToFollower(1, followContractAddress);
            expect(await privacyContent.sharedFollowAddressCount(1)).to.equal(1);
            expect(await privacyContent.sharedFollowAddressByIndex(1, 0)).to.equal(followContractAddress);
            expect(await privacyContent.isViewerOf(addr1.address, 1)).to.equal(true);
        });


        it("Should return true when the address in the dao shared by the token owner", async function () {
            const {privacyContent, owner, addr1} = await loadFixture(deployTokenFixture);
            const subject = ':Soul_' + owner.address.toLowerCase();
            const predicate = "p:privacyContent";
            const object = `"${content}"`;
            const rdf = subject + ' ' + predicate + ' ' + object + ' . ';

            await privacyContent.prepareToken();
            expect(await privacyContent.ownedPrepareToken(owner.address)).to.equal(1);

            await expect(privacyContent.post(content))
                .to.emit(privacyContent, "CreateRDF")
                .withArgs(1, rdf);
            expect(await privacyContent.rdfOf(1)).to.equal(rdf);
            expect(await privacyContent.contentOf(1)).to.equal(content);
            expect(await privacyContent.isViewerOf(owner.address, 1)).to.equal(true);
            expect(await privacyContent.isViewerOf(addr1.address, 1)).to.equal(false);

            const daoRegister = await deployDaoRegister();
            await daoRegister.deployDaoContract(owner.address, firstDAOName);
            const daoContractAddress = await daoRegister.daoOf(1);
            const daoContract = await hre.ethers.getContractAt("Dao", daoContractAddress.contractAddress);
            await daoContract.setFreeJoin(true);
            await daoContract.connect(addr1).join();
            await privacyContent.shareToDao(1, daoContractAddress.contractAddress);
            expect(await privacyContent.sharedDaoAddressCount(1)).to.equal(1);
            expect(await privacyContent.sharedDaoAddressByIndex(1, 0)).to.equal(daoContractAddress.contractAddress);
            expect(await privacyContent.isViewerOf(addr1.address, 1)).to.equal(true);

        });

    })

    describe("Call privacyContent with signData", function () {
        it("Prepare token with signData", async function () {
            const {privacyContent, privacyContentWithSign, owner, addr1} = await loadFixture(deployTokenFixture);
            const name = await privacyContentWithSign.name();
            const nonce = await privacyContentWithSign.nonces(owner.address);
            const deadline = Date.parse(new Date()) / 1000 + 100;
            const sign = await getSign(buildPrepareParams(name, privacyContentWithSign.address.toLowerCase(), privacyContent.address.toLowerCase(), parseInt(nonce), deadline), owner.address);
            var param =
                {
                    "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
                    "target": privacyContent.address,
                    "addr": owner.address
                }
            await privacyContentWithSign.connect(addr1).prepareTokenWithSign(param);
            expect(await privacyContent.ownedPrepareToken(owner.address)).to.equal(1);
        });

        it("Post with signData", async function () {
            const {privacyContent, privacyContentWithSign, owner, addr1} = await loadFixture(deployTokenFixture);
            const subject = ':Soul_' + owner.address.toLowerCase();
            const predicate = "p:privacyContent";
            const object = `"${content}"`;
            const rdf = subject + ' ' + predicate + ' ' + object + ' . ';

            let name = await privacyContentWithSign.name();
            let nonce = await privacyContentWithSign.nonces(owner.address);
            let deadline = Date.parse(new Date()) / 1000 + 100;
            let sign = await getSign(buildPrepareParams(name, privacyContentWithSign.address.toLowerCase(), privacyContent.address.toLowerCase(), parseInt(nonce), deadline), owner.address);
            let param =
                {
                    "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
                    "target": privacyContent.address,
                    "addr": owner.address
                }
            await privacyContentWithSign.connect(addr1).prepareTokenWithSign(param);
            expect(await privacyContent.ownedPrepareToken(owner.address)).to.equal(1);


            nonce = await privacyContentWithSign.nonces(owner.address);
            deadline = Date.parse(new Date()) / 1000 + 100;
            sign = await getSign(buildPostParams(
                    name,
                    privacyContentWithSign.address.toLowerCase(),
                    privacyContent.address.toLowerCase(),
                    content,
                    parseInt(nonce),
                    deadline),
                owner.address);
            param = {
                "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
                "target": privacyContent.address,
                "addr": owner.address,
                "content": content
            }
            await privacyContentWithSign.connect(addr1).postWithSign(param);
            expect(await privacyContent.rdfOf(1)).to.equal(rdf);
            expect(await privacyContent.ownerOf(1)).to.equal(owner.address);
        });


        it("Share to follow with signData", async function () {
            const {
                privacyContent,
                privacyContentWithSign,
                followRegister,
                owner,
                addr1
            } = await loadFixture(deployTokenFixture);
            const subject = ':Soul_' + owner.address.toLowerCase();
            const predicate = "p:privacyContent";
            const object = `"${content}"`;
            const rdf = subject + ' ' + predicate + ' ' + object + ' . ';

            let name = await privacyContentWithSign.name();
            let nonce = await privacyContentWithSign.nonces(owner.address);
            let deadline = Date.parse(new Date()) / 1000 + 100;
            let sign = await getSign(buildPrepareParams(name, privacyContentWithSign.address.toLowerCase(), privacyContent.address.toLowerCase(), parseInt(nonce), deadline), owner.address);
            let param =
                {
                    "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
                    "target": privacyContent.address,
                    "addr": owner.address
                }
            await privacyContentWithSign.connect(addr1).prepareTokenWithSign(param);
            expect(await privacyContent.ownedPrepareToken(owner.address)).to.equal(1);


            nonce = await privacyContentWithSign.nonces(owner.address);
            deadline = Date.parse(new Date()) / 1000 + 100;
            const tokenId = await privacyContent.ownedPrepareToken(owner.address);
            sign = await getSign(buildPostParams(
                    name,
                    privacyContentWithSign.address.toLowerCase(),
                    privacyContent.address.toLowerCase(),
                    content,
                    parseInt(nonce),
                    deadline),
                owner.address);
            param = {
                "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
                "target": privacyContent.address,
                "addr": owner.address,
                "content": content
            }
            await privacyContentWithSign.connect(addr1).postWithSign(param);
            expect(await privacyContent.rdfOf(parseInt(tokenId))).to.equal(rdf);


            await followRegister.deployFollowContract(owner.address);
            const followContractAddress = await followRegister.ownedFollowContract(owner.address);
            const followContract = await hre.ethers.getContractAt("Follow", followContractAddress);
            await followContract.connect(addr1).follow();
            expect(await privacyContent.isViewerOf(addr1.address, 1)).to.equal(false);

            nonce = await privacyContentWithSign.nonces(owner.address);
            deadline = Date.parse(new Date()) / 1000 + 100;
            sign = await getSign(buildShareToFollowerParams(
                    name,
                    privacyContentWithSign.address.toLowerCase(),
                    privacyContent.address.toLowerCase(),
                    parseInt(tokenId),
                    followContractAddress,
                    parseInt(nonce),
                    deadline),
                owner.address);
            param = {
                "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
                "target": privacyContent.address,
                "addr": owner.address,
                "tokenId": parseInt(tokenId),
                "followContractAddress": followContractAddress
            }
            await privacyContentWithSign.connect(addr1).shareToFollowerWithSign(param);
            expect(await privacyContent.isViewerOf(addr1.address, 1)).to.equal(true);

        });


        it("Share to dao with signData", async function () {
            const {privacyContent, privacyContentWithSign, owner, addr1} = await loadFixture(deployTokenFixture);
            const subject = ':Soul_' + owner.address.toLowerCase();
            const predicate = "p:privacyContent";
            const object = `"${content}"`;
            const rdf = subject + ' ' + predicate + ' ' + object + ' . ';

            let name = await privacyContentWithSign.name();
            let nonce = await privacyContentWithSign.nonces(owner.address);
            let deadline = Date.parse(new Date()) / 1000 + 100;
            let sign = await getSign(buildPrepareParams(name, privacyContentWithSign.address.toLowerCase(), privacyContent.address.toLowerCase(), parseInt(nonce), deadline), owner.address);
            let param =
                {
                    "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
                    "target": privacyContent.address,
                    "addr": owner.address
                }
            await privacyContentWithSign.connect(addr1).prepareTokenWithSign(param);
            expect(await privacyContent.ownedPrepareToken(owner.address)).to.equal(1);


            nonce = await privacyContentWithSign.nonces(owner.address);
            deadline = Date.parse(new Date()) / 1000 + 100;
            const tokenId = await privacyContent.ownedPrepareToken(owner.address);
            sign = await getSign(buildPostParams(
                    name,
                    privacyContentWithSign.address.toLowerCase(),
                    privacyContent.address.toLowerCase(),
                    content,
                    parseInt(nonce),
                    deadline),
                owner.address);
            param = {
                "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
                "target": privacyContent.address,
                "addr": owner.address,
                "content": content
            }
            await privacyContentWithSign.connect(addr1).postWithSign(param);
            expect(await privacyContent.rdfOf(parseInt(tokenId))).to.equal(rdf);


            const daoRegister = await deployDaoRegister();
            await daoRegister.deployDaoContract(owner.address, firstDAOName);
            const daoContractAddress = await daoRegister.daoOf(1);
            const daoContract = await hre.ethers.getContractAt("Dao", daoContractAddress.contractAddress);
            await daoContract.setFreeJoin(true);
            await daoContract.connect(addr1).join();
            expect(await privacyContent.isViewerOf(addr1.address, 1)).to.equal(false);

            nonce = await privacyContentWithSign.nonces(owner.address);
            deadline = Date.parse(new Date()) / 1000 + 100;
            sign = await getSign(buildShareToDaoParams(
                    name,
                    privacyContentWithSign.address.toLowerCase(),
                    privacyContent.address.toLowerCase(),
                    parseInt(tokenId),
                    daoContractAddress.contractAddress,
                    parseInt(nonce),
                    deadline),
                owner.address);
            param = {
                "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
                "target": privacyContent.address,
                "addr": owner.address,
                "tokenId": parseInt(tokenId),
                "daoContractAddress": daoContractAddress.contractAddress
            }
            await privacyContentWithSign.connect(addr1).shareToDaoWithSign(param);
            // expect(await privacyContent.isViewerOf(addr1.address, 1)).to.equal(true);

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

    function buildPrepareParams(name, contractAddress, privacyContractAddress, nonce, deadline) {
        return {
            domain: {
                chainId: getChainId(),
                name: name,
                verifyingContract: contractAddress,
                version: '1',
            },

            // Defining the message signing data content.
            message: {
                target: privacyContractAddress,
                nonce: nonce,
                deadline: deadline,
            },
            // Refers to the keys of the *types* object below.
            primaryType: 'PrepareTokenWithSign',
            types: {
                EIP712Domain: [
                    {name: 'name', type: 'string'},
                    {name: 'version', type: 'string'},
                    {name: 'chainId', type: 'uint256'},
                    {name: 'verifyingContract', type: 'address'},
                ],
                PrepareTokenWithSign: [
                    {name: 'target', type: 'address'},
                    {name: 'nonce', type: 'uint256'},
                    {name: 'deadline', type: 'uint256'},
                ],
            },
        };
    }

    function buildPostParams(name, contractAddress, privacyContractAddress, content, nonce, deadline) {
        return {
            domain: {
                chainId: getChainId(),
                name: name,
                verifyingContract: contractAddress,
                version: '1',
            },

            // Defining the message signing data content.
            message: {
                target: privacyContractAddress,
                content: content,
                nonce: nonce,
                deadline: deadline,
            },
            // Refers to the keys of the *types* object below.
            primaryType: 'PostWithSign',
            types: {
                EIP712Domain: [
                    {name: 'name', type: 'string'},
                    {name: 'version', type: 'string'},
                    {name: 'chainId', type: 'uint256'},
                    {name: 'verifyingContract', type: 'address'},
                ],
                PostWithSign: [
                    {name: 'target', type: 'address'},
                    {name: 'content', type: 'string'},
                    {name: 'nonce', type: 'uint256'},
                    {name: 'deadline', type: 'uint256'},
                ],
            },
        };
    }

    function buildShareToFollowerParams(name, contractAddress, privacyContractAddress, tokenId, followContractAddress, nonce, deadline) {
        return {
            domain: {
                chainId: getChainId(),
                name: name,
                verifyingContract: contractAddress,
                version: '1',
            },

            // Defining the message signing data content.
            message: {
                target: privacyContractAddress,
                tokenId: tokenId,
                followContractAddress: followContractAddress,
                nonce: nonce,
                deadline: deadline,
            },
            // Refers to the keys of the *types* object below.
            primaryType: 'ShareToFollowerWithSign',
            types: {
                EIP712Domain: [
                    {name: 'name', type: 'string'},
                    {name: 'version', type: 'string'},
                    {name: 'chainId', type: 'uint256'},
                    {name: 'verifyingContract', type: 'address'},
                ],
                ShareToFollowerWithSign: [
                    {name: 'target', type: 'address'},
                    {name: 'tokenId', type: 'uint256'},
                    {name: 'followContractAddress', type: 'address'},
                    {name: 'nonce', type: 'uint256'},
                    {name: 'deadline', type: 'uint256'},
                ],
            },
        };
    }

    function buildShareToDaoParams(name, contractAddress, privacyContractAddress, tokenId, daoContractAddress, nonce, deadline) {
        return {
            domain: {
                chainId: getChainId(),
                name: name,
                verifyingContract: contractAddress,
                version: '1',
            },

            // Defining the message signing data content.
            message: {
                target: privacyContractAddress,
                tokenId: tokenId,
                daoContractAddress: daoContractAddress,
                nonce: nonce,
                deadline: deadline,
            },
            // Refers to the keys of the *types* object below.
            primaryType: 'ShareToDaoWithSign',
            types: {
                EIP712Domain: [
                    {name: 'name', type: 'string'},
                    {name: 'version', type: 'string'},
                    {name: 'chainId', type: 'uint256'},
                    {name: 'verifyingContract', type: 'address'},
                ],
                ShareToDaoWithSign: [
                    {name: 'target', type: 'address'},
                    {name: 'tokenId', type: 'uint256'},
                    {name: 'daoContractAddress', type: 'address'},
                    {name: 'nonce', type: 'uint256'},
                    {name: 'deadline', type: 'uint256'},
                ],
            },
        };
    }

})

