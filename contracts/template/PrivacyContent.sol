// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import "../interfaces/social/IPrivacyContent.sol";
import "../interfaces/social/IFollowRegister.sol";
import "../interfaces/social/IFollow.sol";
import "../interfaces/social/IDaoRegister.sol";
import "../interfaces/social/IDao.sol";
import "./Content.sol";

import "../core/SemanticSBTUpgradeable.sol";
import "../core/SemanticBaseStruct.sol";

contract PrivacyContent is IPrivacyContent, SemanticSBTUpgradeable, Content {
    struct PrepareTokenWithSign {
        SemanticSBTLogicUpgradeable.Signature sig;
        address addr;
    }

    struct ShareToFollowerWithSign {
        SemanticSBTLogicUpgradeable.Signature sig;
        address addr;
        uint256 tokenId;
        address followContractAddress;
    }

    struct ShareToDaoWithSign {
        SemanticSBTLogicUpgradeable.Signature sig;
        address addr;
        uint256 tokenId;
        address daoContractAddress;
    }

    uint256 constant  PRIVACY_DATA_PREDICATE = 1;


    mapping(address => mapping(uint256 => bool)) internal _isViewerOf;
    mapping(address => uint256) internal _prepareToken;

    mapping(uint256 => mapping(address => bool)) _shareToDao;
    mapping(uint256 => mapping(address => bool)) _shareToFollow;
    mapping(uint256 => address[]) _shareDaoAddress;
    mapping(uint256 => address[]) _shareFollowAddress;
    mapping(uint256 => uint256) public sharedDaoAddressCount;
    mapping(uint256 => uint256) public sharedFollowAddressCount;

    bytes32 internal constant PREPARE_TOKEN_WITH_SIGN_TYPE_HASH = keccak256('PrepareTokenWithSign(uint256 nonce,uint256 deadline)');
    bytes32 internal constant SHARE_TO_FOLLOW_WITH_SIGN_TYPE_HASH = keccak256('ShareToFollowerWithSign(uint256 tokenId,address followContractAddress,uint256 nonce,uint256 deadline)');
    bytes32 internal constant SHARE_TO_DAO_WITH_SIGN_TYPE_HASH = keccak256('ShareToDaoWithSign(uint256 tokenId,address daoContractAddress,uint256 nonce,uint256 deadline)');
    /* ============ External Functions ============ */


    function isViewerOf(address viewer, uint256 tokenId) external override view returns (bool) {
        return isOwnerOf(viewer, tokenId) ||
        _isFollowing(viewer, tokenId) ||
        _isMemberOfDao(viewer, tokenId);
    }


    function ownedPrepareToken(address owner) external view returns (uint256) {
        return _prepareToken[owner];
    }

    function prepareToken() external returns (uint256) {
        return _prepareTokenInternal(msg.sender);
    }


    function post(string calldata content) override(Content, IContent) external {
        _post(msg.sender, _prepareToken[msg.sender], content);
    }

    function shareToFollower(uint256 tokenId, address followContractAddress) external {
        _shareToFollowerInternal(msg.sender, tokenId, followContractAddress);
    }

    function shareToDao(uint256 tokenId, address daoAddress) external {
        _shareToDaoInternal(msg.sender, tokenId, daoAddress);
    }

    function sharedFollowAddressByIndex(uint256 tokenId, uint256 index) external view returns (address){
        return _shareFollowAddress[tokenId][index];
    }

    function sharedDaoAddressByIndex(uint256 tokenId, uint256 index) external view returns (address){
        return _shareDaoAddress[tokenId][index];
    }


    function prepareTokenBySigner(address addr) external returns (uint256) {
        return _prepareTokenInternal(addr);
    }

    function postBySigner(address addr, string  calldata content) override(Content, IContent) external {
        _post(addr, _prepareToken[addr], content);
    }


    function shareToFollowerBySigner(address addr, uint256 tokenId, address followContractAddress) external {
        _shareToFollowerInternal(addr, tokenId, followContractAddress);
    }


    function shareToDaoBySigner(address addr, uint256 tokenId, address daoContractAddress) external {
        _shareToDaoInternal(addr, tokenId, daoContractAddress);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(SemanticSBTUpgradeable, Content) returns (bool) {
        return interfaceId == type(IPrivacyContent).interfaceId ||
        super.supportsInterface(interfaceId);
    }


    /* ============ Internal Functions ============ */

    function _prepareTokenInternal(address addr) internal returns (uint256){
        require(_prepareToken[addr] == 0, "PrivacyContent:Already prepared");
        uint256 tokenId = _addEmptyToken(addr, 0);
        _prepareToken[addr] = tokenId;
        return tokenId;
    }

    function _post(address addr, uint256 tokenId, string memory content) internal {
        SemanticSBTLogicUpgradeable.checkPredicate(PRIVACY_DATA_PREDICATE, FieldType.STRING, _predicates);
        require(tokenId > 0, "PrivacyContent:Token id not exist");
        delete _prepareToken[addr];
        super._post(addr,tokenId,PRIVACY_DATA_PREDICATE,content);
    }

    function _shareToFollowerInternal(address addr, uint256 tokenId, address followContractAddress) internal {
        require(isOwnerOf(addr, tokenId), "PrivacyContent: caller is not owner");
        require(_shareFollowAddress[tokenId].length < 20, "PrivacyContent: shared to too many Follow contracts");
        try IFollow(followContractAddress).isFollowing(addr) returns (
            bool
        ) {
            _shareToFollow[tokenId][followContractAddress] = true;
            _shareFollowAddress[tokenId].push(followContractAddress);
            sharedFollowAddressCount[tokenId]++;
        } catch (bytes memory reason) {
            if (reason.length == 0) {
                revert('PrivacyContent: non Follow implementer');
            } else {
                assembly {
                    revert(add(32, reason), mload(reason))
                }
            }
        }
    }

    function _shareToDaoInternal(address addr, uint256 tokenId, address daoAddress) internal {
        require(isOwnerOf(addr, tokenId), "PrivacyContent: caller is not owner");
        require(_shareDaoAddress[tokenId].length < 20, "PrivacyContent: shared to too many DAOs");
        try IDao(daoAddress).isMember(addr) returns (
            bool
        ) {
            _shareToDao[tokenId][daoAddress] = true;
            _shareDaoAddress[tokenId].push(daoAddress);
            sharedDaoAddressCount[tokenId]++;
        } catch (bytes memory reason) {
            if (reason.length == 0) {
                revert('PrivacyContent: non Dao implementer');
            } else {
                assembly {
                    revert(add(32, reason), mload(reason))
                }
            }
        }
    }

    function _isFollowing(address viewer, uint256 tokenId) internal view returns (bool){
        address[] memory followContractAddress = _shareFollowAddress[tokenId];
        for (uint256 i = 0; i < followContractAddress.length; i++) {
            if (IFollow(followContractAddress[i]).isFollowing(viewer)) {
                return true;
            }
        }
        return false;
    }

    function _isMemberOfDao(address viewer, uint256 tokenId) internal view returns (bool){
        address[] memory daoAddress = _shareDaoAddress[tokenId];
        for (uint256 i = 0; i < daoAddress.length; i++) {
            if (IDao(daoAddress[i]).isMember(viewer)) {
                return true;
            }
        }
        return false;
    }
}
