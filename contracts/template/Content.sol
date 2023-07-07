// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;


import "../interfaces/social/IContent.sol";
import "../core/SemanticSBTUpgradeable.sol";
import "../core/SemanticBaseStruct.sol";

contract Content is IContent, SemanticSBTUpgradeable {


    struct PostWithSign {
        SemanticSBTLogicUpgradeable.Signature sig;
        address addr;
        string content;
    }

    uint256 constant  PUBLIC_CONTENT_PREDICATE = 1;

    mapping(address => mapping(string => uint256)) internal _mintContent;
    mapping(uint256 => string) _contentOf;
    address public verifyContract;

    modifier onlyVerifyContract{
        require(msg.sender == verifyContract, "Content: must be verify contract");
        _;
    }

    /* ============ External Functions ============ */

    function initialize(
        address minter,
        address verifyContract_,
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        string memory schemaURI_,
        string[] memory classes_,
        Predicate[] memory predicates_
    ) public initializer {
        super.initialize(minter,name_,symbol_,baseURI_,schemaURI_,classes_,predicates_);
        verifyContract = verifyContract_;
    }

    function post(string calldata content) virtual external {
        uint256 tokenId = _addEmptyToken(msg.sender, 0);
        _post(msg.sender, tokenId, PUBLIC_CONTENT_PREDICATE, content);
    }


    function postBySigner(address addr, string calldata content) virtual onlyVerifyContract external {

        uint256 tokenId = _addEmptyToken(addr, 0);
        _post(addr, tokenId, PUBLIC_CONTENT_PREDICATE, content);
    }


    function contentOf(uint256 tokenId) external view returns (string memory){
        return _contentOf[tokenId];
    }


    function supportsInterface(bytes4 interfaceId) public view virtual override(SemanticSBTUpgradeable) returns (bool) {
        return interfaceId == type(IContent).interfaceId ||
        super.supportsInterface(interfaceId);
    }


    /* ============ Internal Functions ============ */

    function _post(address addr, uint256 tokenId,uint256 pIndex, string memory content) internal {
        SemanticSBTLogicUpgradeable.checkPredicate(pIndex, FieldType.STRING, _predicates);
        _mint(addr,tokenId, pIndex, content);
        _mintContent[addr][content] = tokenId;
        _contentOf[tokenId] = content;
    }

    function _mint(address addr,uint256 tokenId, uint256 pIndex, string memory object) internal {
        StringPO[] memory stringPOList = new StringPO[](1);
        stringPOList[0] = StringPO(pIndex, object);
        _mint(
            tokenId,
            addr,
            new IntPO[](0),
            stringPOList,
            new AddressPO[](0),
            new SubjectPO[](0),
            new BlankNodePO[](0)
        );
    }
}
