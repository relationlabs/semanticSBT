// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import "../interfaces/ISemanticSBTSchema.sol";

import "../interfaces/ISemanticSBT.sol";
import "../interfaces/IERC5192.sol";
import "./SemanticBaseStruct.sol";
import {SemanticSBTLogic} from "../libraries/SemanticSBTLogic.sol";

contract SemanticSBT is Ownable, Initializable, ERC165, ERC721Enumerable, ISemanticSBT, ISemanticSBTSchema, IERC5192 {
    using Address for address;
    using Strings for uint256;
    using Strings for uint160;

    using Strings for address;


    string internal _name;

    string private _symbol;

    SPO[] internal _tokens;


    mapping(address => bool) internal _minters;

    bool private _transferable;

    Subject[] internal _subjects;

    mapping(uint256 => mapping(string => uint256)) internal _subjectIndex;

    string internal _baseTokenURI;

    string public schemaURI;


    mapping(string => uint256) internal _classIndex;
    string[] internal _classNames;

    mapping(string => uint256) internal _predicateIndex;
    Predicate[] internal _predicates;


    string[] internal _stringO;
    BlankNodeO[] internal _blankNodeO;

    string  constant SOUL_CLASS_NAME = "Soul";

    event SetMinter(address indexed addr, bool isMinter);


    modifier onlyMinter() {
        require(_minters[msg.sender], "SemanticSBT: must be minter");
        _;
    }

    modifier onlyTransferable() {
        require(_transferable, "SemanticSBT: must transferable");
        _;
    }


    constructor() ERC721("", "") {
        SPO memory _spo = SPO(0, 0, new uint256[](0), new uint256[](0));
        Subject memory _subject = Subject("", 0);
        _tokens.push(_spo);
        _subjects.push(_subject);

        _classNames.push("");
        _classNames.push(SOUL_CLASS_NAME);
        _classIndex[SOUL_CLASS_NAME] = 1;
        _predicates.push(Predicate("", FieldType.INT));
    }

    /* ============ External Functions ============ */

    function initialize(
        address minter,
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        string memory schemaURI_,
        string[] memory classes_,
        Predicate[] memory predicates_
    ) public initializer {
        require(keccak256(abi.encode(schemaURI_)) != keccak256(abi.encode("")), "SemanticSBT: schemaURI cannot be empty");
        require(predicates_.length > 0, "SemanticSBT: predicate can not be empty");

        _minters[minter] = true;
        _name = name_;
        _symbol = symbol_;
        _baseTokenURI = baseURI_;
        schemaURI = schemaURI_;

        SemanticSBTLogic.addClass(classes_, _classNames, _classIndex);
        SemanticSBTLogic.addPredicate(predicates_, _predicates, _predicateIndex);
        emit SetMinter(minter, true);
    }


    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, ERC721Enumerable) returns (bool) {
        return interfaceId == type(IERC721).interfaceId ||
        interfaceId == type(IERC721Metadata).interfaceId ||
        interfaceId == type(IERC721Enumerable).interfaceId ||
        interfaceId == type(ISemanticSBT).interfaceId ||
        interfaceId == type(ISemanticSBTSchema).interfaceId ||
        super.supportsInterface(interfaceId);
    }

    function minters(address account) public view returns (bool) {
        return _minters[account];
    }


    function transferable() public view returns (bool) {
        return _transferable;
    }

    function locked(uint256 tokenId) external override view returns (bool){
        if (_transferable) {
            return true;
        }
        return false;
    }

    function baseURI() public view returns (string memory) {
        return _baseTokenURI;
    }


    function classIndex(string memory className_) public view returns (uint256 classIndex_) {
        classIndex_ = _classIndex[className_];
    }


    function className(uint256 cIndex) public view returns (string memory name_) {
        require(cIndex > 0 && cIndex < _classNames.length, "SemanticSBT: class not exist");
        name_ = _classNames[cIndex];
    }


    function predicateIndex(string memory predicateName_) public view returns (uint256 predicateIndex_) {
        predicateIndex_ = _predicateIndex[predicateName_];
    }


    function predicate(uint256 pIndex) public view returns (string memory name_, FieldType fieldType) {
        require(pIndex > 0 && pIndex < _predicates.length, "SemanticSBT: predicate not exist");

        Predicate memory predicate_ = _predicates[pIndex];
        name_ = predicate_.name;
        fieldType = predicate_.fieldType;
    }


    function subjectIndex(string memory subjectValue, string memory className_) public view returns (uint256){
        uint256 sIndex = _subjectIndex[_classIndex[className_]][subjectValue];
        require(sIndex > 0, "SemanticSBT: does not exist");
        return sIndex;
    }


    function subject(uint256 index) public view returns (string memory subjectValue, string memory className_){
        require(index > 0 && index < _subjects.length, "SemanticSBT: does not exist");
        subjectValue = _subjects[index].value;
        className_ = _classNames[_subjects[index].cIndex];
    }


    function rdfOf(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "SemanticSBT: SemanticSBT does not exist");
        return SemanticSBTLogic.buildRDF(_tokens[tokenId], _classNames, _predicates, _stringO, _subjects, _blankNodeO);
    }

    function getMinted() public view returns (uint256) {
        return _tokens.length - 1;
    }


    function isOwnerOf(address account, uint256 id)
    public
    view
    returns (bool)
    {
        address owner = ownerOf(id);
        return owner == account;
    }

    function name() public view virtual override returns (string memory) {
        return _name;
    }

    function symbol() public view virtual override returns (string memory) {
        return _symbol;
    }

    function tokenURI(uint256 tokenId)
    public
    view
    virtual
    override
    returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        return
        bytes(_baseTokenURI).length > 0
        ? string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"))
        : SemanticSBTLogic.getTokenURI(tokenId, _name, rdfOf(tokenId));
    }


    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public onlyTransferable override(IERC721, ERC721) {
        super.transferFrom(from, to, tokenId);
    }


    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public onlyTransferable override(IERC721, ERC721) {
        super.safeTransferFrom(from, to, tokenId, "");
    }


    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public onlyTransferable override(IERC721, ERC721) {
        super.safeTransferFrom(from, to, tokenId, _data);
    }


    function setURI(string calldata newURI) external onlyOwner {
        _baseTokenURI = newURI;
    }


    function setTransferable(bool transferable_) external onlyOwner {
        _transferable = transferable_;
    }


    function setName(string calldata newName) external virtual onlyOwner {
        _name = newName;
    }


    function setSymbol(string calldata newSymbol) external onlyOwner {
        _symbol = newSymbol;
    }


    function setMinter(address addr, bool _isMinter) external onlyOwner {
        _minters[addr] = _isMinter;
        emit SetMinter(addr, _isMinter);
    }


    /* ============ Internal Functions ============ */

    function _mint(uint256 tokenId, address account, IntPO[] memory intPOList, StringPO[] memory stringPOList,
        AddressPO[] memory addressPOList, SubjectPO[] memory subjectPOList,
        BlankNodePO[] memory blankNodePOList) internal {
        uint256[] storage pIndex = _tokens[tokenId].pIndex;
        uint256[] storage oIndex = _tokens[tokenId].oIndex;

        SemanticSBTLogic.mint(pIndex, oIndex, intPOList, stringPOList, addressPOList, subjectPOList, blankNodePOList, _predicates, _stringO, _subjects, _blankNodeO);
        require(pIndex.length > 0, "SemanticSBT: param error");

        super._safeMint(account, tokenId);
        emit CreateRDF(tokenId, rdfOf(tokenId));
    }

    function _burn(uint256 tokenId) internal override(ERC721) {
        string memory _rdf = rdfOf(tokenId);
        _tokens[tokenId].owner = 0;
        super._burn(tokenId);
        emit RemoveRDF(tokenId, _rdf);
    }

    function _addEmptyToken(address account, uint256 sIndex) internal returns (uint256){
        _tokens.push(SPO(uint160(account), sIndex, new uint256[](0), new uint256[](0)));
        return _tokens.length - 1;
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721) virtual {
        _tokens[tokenId].owner = uint160(to);
        super._transfer(from, to, tokenId);
    }

}