// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Strings.sol";
import "../core/SemanticSBTUpgradeable.sol";
import "../interfaces/social/IDao.sol";

contract Dao is IDao, SemanticSBTUpgradeable {

    using Strings for uint256;
    using Strings for address;


    SubjectPO[] private joinDaoSubjectPO;

    uint256 constant JOIN_PREDICATE_INDEX = 1;
    uint256 constant DAO_URI_PREDICATE_INDEX = 2;

    string  constant DAO_CLASS_NAME = "Dao";

    address public ownerOfDao;
    string public daoURI;
    bool _setDaoURI;
    bool _isFreeJoin;
    mapping(address => uint256) ownedTokenId;
    address public verifyContract;


    modifier onlyDaoOwner{
        require(msg.sender == ownerOfDao, "Dao: must be daoOwner");
        _;
    }

    modifier onlyVerifyContract{
        require(msg.sender == verifyContract, "Dao: must be verify contract");
        _;
    }


    /* ============ External Functions ============ */

    function initialize(
        address owner,
        address minter,
        address verifyContract_,
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        string memory schemaURI_,
        string[] memory classes_,
        Predicate[] memory predicates_
    ) external override {
        super.initialize(minter, name_, symbol_, baseURI_, schemaURI_, classes_, predicates_);
        _setOwner(owner);
        _join(owner);
        verifyContract = verifyContract_;
    }

    function setDaoURI(string calldata daoURI_) external {
        _setDaoURIInternal(msg.sender, daoURI_);
    }

    function setName(string calldata newName) external override {
        _setName(msg.sender, newName);
    }

    function setFreeJoin(bool isFreeJoin_) external {
        _setFreeJoin(msg.sender, isFreeJoin_);
    }


    function ownerTransfer(address to) external {
        _ownerTransfer(msg.sender, to);
    }

    function addMember(address[] calldata addr) external onlyDaoOwner {
        for (uint256 i = 0; i < addr.length;) {
            _join(addr[i]);
            unchecked{
                i++;
            }
        }
    }

    function join() external returns (uint256 tokenId){
        require(_isFreeJoin, "Dao: permission denied");
        tokenId = _join(msg.sender);
    }

    function remove(address addr) external returns (uint256 tokenId){
        return _remove(msg.sender, addr);
    }


    function setDaoURIBySigner(address addr, string calldata daoURI_) external onlyVerifyContract {
        _setDaoURIInternal(addr, daoURI_);
    }

    function setFreeJoinBySigner(address addr, bool isFreeJoin_) external onlyVerifyContract {
        _setFreeJoin(addr, isFreeJoin_);
    }


    function addMemberBySigner(address addr,address[] calldata members) external onlyVerifyContract {
        require(addr == ownerOfDao, "Dao: permission denied");
        for (uint256 i = 0; i < members.length;) {
            _join(members[i]);
            unchecked{
                i++;
            }
        }
    }

    function joinBySigner(address addr) external onlyVerifyContract {
        require(_isFreeJoin, "Dao: permission denied");
        _join(addr);
    }

    function removeBySigner(address addr, address member) external onlyVerifyContract {
        _remove(addr, member);
    }


    function isFreeJoin() external view returns (bool){
        return _isFreeJoin;
    }

    function isMember(address addr) external view returns (bool){
        return ownedTokenId[addr] != 0;
    }


    function supportsInterface(bytes4 interfaceId) public view virtual override(SemanticSBTUpgradeable) returns (bool) {
        return interfaceId == type(IDao).interfaceId ||
        super.supportsInterface(interfaceId);
    }

    /* ============ Internal Functions ============ */

    function _setOwner(address owner) internal {
        ownerOfDao = owner;
        uint256 sIndex = SemanticSBTLogicUpgradeable.addSubject(address(this).toHexString(), DAO_CLASS_NAME, _subjects, _subjectIndex, _classIndex);
        joinDaoSubjectPO.push(SubjectPO(JOIN_PREDICATE_INDEX, sIndex));
    }

    function _setDaoURIInternal(address addr, string memory daoURI_) internal {
        require(addr == ownerOfDao, "Dao: must be daoOwner");
        daoURI = daoURI_;
        string memory rdf = SemanticSBTLogicUpgradeable.buildStringRDFCustom(DAO_CLASS_NAME, address(this).toHexString(), _predicates[DAO_URI_PREDICATE_INDEX].name, string.concat('"', daoURI_, '"'));
        if (!_setDaoURI) {
            _setDaoURI = true;
            emit CreateRDF(0, rdf);
        } else {
            emit UpdateRDF(0, rdf);
        }
    }

    function _setName(address addr, string memory newName) internal {
        require(addr == ownerOfDao, "Dao: must be daoOwner");
        _name = newName;
    }

    function _setFreeJoin(address addr, bool isFreeJoin_) internal {
        require(addr == ownerOfDao, "Dao: must be daoOwner");
        _isFreeJoin = isFreeJoin_;
    }

    function _ownerTransfer(address addr, address to) internal {
        require(addr == ownerOfDao, "Dao: must be daoOwner");
        ownerOfDao = to;
    }

    function _join(address addr) internal returns (uint256 tokenId){
        require(ownedTokenId[addr] == 0, string.concat("Dao:", addr.toHexString(), " already minted"));
        tokenId = _addEmptyToken(addr, 0);
        ownedTokenId[addr] = tokenId;
        _mint(tokenId, addr, new IntPO[](0), new StringPO[](0), new AddressPO[](0),
            joinDaoSubjectPO, new BlankNodePO[](0));
    }

    function _remove(address caller, address addr) internal returns (uint256 tokenId){
        require(caller == ownerOfDao || caller == addr, "Dao: permission denied");
        tokenId = ownedTokenId[addr];
        require(ownedTokenId[addr] != 0, "Dao: not the member of dao");
        super._burn(ownedTokenId[addr]);
        delete ownedTokenId[addr];
        if(addr == ownerOfDao){
            ownerOfDao = address(0);
        }
        return tokenId;
    }

}