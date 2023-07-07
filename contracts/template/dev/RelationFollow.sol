// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Strings.sol";
import "../../core/SemanticSBTUpgradeable.sol";
import "../../interfaces/social/IFollow.sol";
import "./IRelationFollow.sol";

contract RelationFollow is IFollow, IRelationFollow, SemanticSBTUpgradeable {

    using Strings for uint256;
    using Strings for address;


    SubjectPO[] private ownerSubjectPO;

    uint256 constant FOLLOWING_PREDICATE_INDEX = 1;

    uint256 constant SOUL_CLASS_INDEX = 1;

    mapping(address => bool) _isFollowing;
    address public representedAddress;
    address public verifyContract;

    modifier onlyVerifyContract{
        require(msg.sender == verifyContract, "Follow: must be verify contract");
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
        verifyContract = verifyContract_;
    }


    function follow() external returns (uint256){
        return _follow(msg.sender);
    }

    function unfollow() external returns (uint256){
        return _unfollow(msg.sender);
    }

    function devFollow(address[] memory addr) external override onlyMinter {
        for (uint256 i = 0; i < addr.length;) {
            _follow(addr[i]);
            unchecked {
                i++;
            }
        }
    }

    function devUnfollow(address[] memory addr) external override onlyMinter {
        for (uint256 i = 0; i < addr.length;) {
            _unfollow(addr[i]);
            unchecked {
                i++;
            }
        }
    }

    function followBySigner(address addr) external onlyVerifyContract returns(uint256) {
        return _follow(addr);
    }

    function unfollowBySigner(address addr) external onlyVerifyContract returns (uint256){
        return _unfollow(addr);
    }


    function isFollowing(address addr) external view returns (bool){
        return _isFollowing[addr];
    }


    function supportsInterface(bytes4 interfaceId) public view virtual override(SemanticSBTUpgradeable) returns (bool) {
        return interfaceId == type(IFollow).interfaceId ||
        super.supportsInterface(interfaceId);
    }

    /* ============ Internal Functions ============ */

    function _setOwner(address owner) internal {
        uint256 sIndex = SemanticSBTLogicUpgradeable.addSubject(owner.toHexString(), SOUL_CLASS_NAME, _subjects, _subjectIndex, _classIndex);
        ownerSubjectPO.push(SubjectPO(FOLLOWING_PREDICATE_INDEX, sIndex));
        representedAddress = owner;
    }

    function _follow(address addr) internal returns (uint256){
        require(!_isFollowing[addr], "Follow:Already followed!");
        _isFollowing[addr] = true;
        uint256 tokenId = _addEmptyToken(addr, 0);
        _mint(tokenId, addr, new IntPO[](0), new StringPO[](0), new AddressPO[](0), ownerSubjectPO, new BlankNodePO[](0));
        return tokenId;
    }

    function _unfollow(address addr) internal returns (uint256){
        uint256 tokenId = tokenOfOwnerByIndex(addr, 0);
        super._burn(tokenId);
        _isFollowing[addr] = false;
        return tokenId;
    }

}