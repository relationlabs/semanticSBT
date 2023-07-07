/*
* These cases are for testing the methods of Semantic SBT demo contract
*/
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const {expect} = require("chai");
const hre = require("hardhat");
const Bytes = require("@ethersproject/bytes");
const {ethers, upgrades} = require("hardhat");

const name = 'Content';
const symbol = 'SBT';
const baseURI = 'https://api.example.com/v1/';
const schemaURI = 'ar://HENWTh3esXyAeLe1Yg_BrBOHhW-CcDQoU5inaAx-yNs';
const class_ = [];
const predicate_ = [["publicContent", 1]];
const postContent =  "ar://the tx hash of content on arweave";

/*
* Before Mint SBT, should initial the parameters of this contract. In this step, we prepare the element of semantic SBT
* @param name The name for the Semantic SBT
* @param symbol The symbol for the Semantic SBT
* @param baseURI The URI may point to a JSON file that conforms to the "ERC721Metadata JSON Schema".
* @param schemaURI The URI of the contract witch point to a JSON file that conforms to the "ISemanticMetadata Metadata JSON Schema".
* @param [className] The array of class name which are used for define the "SUBJECT" of SPO 
* @param [className] The array of five data types of predicates which are used for define the "PREDICATE" of SPO 
*/
describe("Public Content contract", function () {
    async function deployTokenFixture() {
        const [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();

        const SemanticSBTLogic = await hre.ethers.getContractFactory("SemanticSBTLogicUpgradeable");
        const semanticSBTLogicLibrary = await SemanticSBTLogic.deploy();

        const ContentWithSign = await hre.ethers.getContractFactory("ContentWithSign", {
            libraries: {
                SemanticSBTLogicUpgradeable: semanticSBTLogicLibrary.address,
            }
        });
        const contentWithSignName = 'Content With Sign';
        const contentWithSign = await upgrades.deployProxy(ContentWithSign,[contentWithSignName],{unsafeAllowLinkedLibraries: true});
        await contentWithSign.deployed();
        await contentWithSign.deployTransaction.wait();


        const contractName = "Content";
        const MyContract = await hre.ethers.getContractFactory(contractName, {
            libraries: {
                SemanticSBTLogicUpgradeable: semanticSBTLogicLibrary.address,
            }
        });
        const content = await upgrades.deployProxy(MyContract,
            [owner.address,
                contentWithSign.address,
                name,
                symbol,
                baseURI,
                schemaURI,
                class_,
                predicate_],
            {unsafeAllowLinkedLibraries: true, initializer: 'initialize(address, address, string, string, string, string, string[], (string,uint8)[])'});

        await content.deployed();
        return {content: content, contentWithSign, owner, addr1};
    }

    // check semanticSBT belong this contract owner
    it("owner", async function () {
        const {content, owner} = await loadFixture(deployTokenFixture);
        expect(await content.owner()).to.equal(owner.address);
    });
    // make sure contract owner can mint SBT
    it("minter", async function () {
        const {content, owner} = await loadFixture(deployTokenFixture);
        expect(await content.minters(owner.address)).to.equal(true);
    });

    // make sure the name of semantic SBT setup up as expected
    it("name", async function () {
        const {content} = await loadFixture(deployTokenFixture);
        expect(await content.name()).to.equal(name);
    });

    // make sure the symbol of semantic SBT setup up as expected
    it("symbol", async function () {
        const {content} = await loadFixture(deployTokenFixture);
        expect(await content.symbol()).to.equal(symbol);
    });

    // make sure the schemaURI of semantic SBT setup up as expected
    it("schemaURI", async function () {
        const {content} = await loadFixture(deployTokenFixture);
        expect(await content.schemaURI()).to.equal(schemaURI);
    });


    /*
    * Below are the test cases for mint and burn semantic SBT.
    * Due to predicate in contract has five data types: int, string, address, subject and blankNode
    * the fist five cases are belonging to the respective data type
    * the last one is for the unions of five data types
    */
    describe("Post  content", function () {

        it("User should owner a sbt after post a  content ", async function () {
            const {content, owner} = await loadFixture(deployTokenFixture);
            const subject = ':Soul_' + owner.address.toLowerCase();
            const predicate = "p:publicContent";
            const object = `"${postContent}"`;
            const rdf = subject + ' ' + predicate + ' ' + object + ' . ';

            await expect(content.post(postContent))
                .to.emit(content, "CreateRDF")
                .withArgs(1, rdf);
            expect(await content.rdfOf(1)).to.equal(rdf);
            expect(await content.contentOf(1)).to.equal(postContent);
        });

    })


    describe("Call content with signData", function () {

        it("Post with signData", async function () {
            const { content, contentWithSign, owner, addr1} = await loadFixture(deployTokenFixture);
            const subject = ':Soul_' + owner.address.toLowerCase();
            const predicate = "p:publicContent";
            const object = `"${postContent}"`;
            const rdf = subject + ' ' + predicate + ' ' + object + ' . ';

            let name = await contentWithSign.name();
            let nonce = await contentWithSign.nonces(owner.address);
            let deadline = Date.parse(new Date()) / 1000 + 100;
            let sign = await getSign(buildPostParams(
                    name,
                    contentWithSign.address.toLowerCase(),
                    content.address.toLowerCase(),
                    postContent,
                    parseInt(nonce),
                    deadline),
                owner.address);
            let param = {
                "sig": {"v": sign.v, "r": sign.r, "s": sign.s, "deadline": deadline},
                "target": content.address,
                "addr": owner.address,
                "content": postContent
            }
            await contentWithSign.connect(addr1).postWithSign(param)
            expect(await content.rdfOf(1)).to.equal(rdf);
            expect(await content.ownerOf(1)).to.equal(owner.address);
            expect(await content.contentOf(1)).to.equal(postContent);


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


    function buildPostParams(name, contractAddress, contentContractAddress, content, nonce, deadline) {
        return {
            domain: {
                chainId: getChainId(),
                name: name,
                verifyingContract: contractAddress,
                version: '1',
            },

            // Defining the message signing data content.
            message: {
                target: contentContractAddress,
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


})

