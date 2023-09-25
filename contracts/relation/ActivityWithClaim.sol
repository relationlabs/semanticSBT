// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";


import "../core/SemanticSBTUpgradeable.sol";
import "../core/SemanticBaseStruct.sol";

contract ActivityWithClaim is SemanticSBTUpgradeable, PausableUpgradeable {
    using StringsUpgradeable for uint256;
    using StringsUpgradeable for address;

    struct Signature {
        uint8 _v;
        bytes32 _r;
        bytes32 _s;
    }

    uint256 _soulCIndex;
    uint256 _activityCIndex;
    uint256 _pIndex;
    uint256 _oIndex;


    mapping(address => mapping(uint256 => mapping(uint256 => bool)))  _mintedSPO;

    bool private _duplicatable;
    bool private _freeMintable;


    function initialize(
        address minter,
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        string memory schemaURI_,
        string[] memory classes_,
        Predicate[] memory predicates_
    ) public override {
        _soulCIndex = 1;
        _activityCIndex = 2;
        _pIndex = 1;
        _oIndex = 1;
        super.initialize(minter, name_, symbol_, baseURI_, schemaURI_, classes_, predicates_);
    }


    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function duplicatable() public view returns (bool) {
        return _duplicatable;
    }

    function freeMintable() public view returns (bool) {
        return _freeMintable;
    }


    function setActivity(string memory activityName) external onlyMinter {
        require(getMinted() == 0, "Activity:can not set activity after minted!");
        _oIndex = SemanticSBTLogicUpgradeable.addSubject(activityName, _classNames[_activityCIndex], _subjects, _subjectIndex, _classIndex);
    }

    function setDuplicatable(bool duplicatable_) external onlyOwner {
        _duplicatable = duplicatable_;
    }


    function setFreeMintable(bool freeMintable_) external onlyOwner {
        _freeMintable = freeMintable_;
    }


    function claim(Signature memory signature, uint256 expireTime) external whenNotPaused {
        if (!_freeMintable) {
            checkSignature(signature, expireTime);
        }
        require(_duplicatable || !_mintedSPO[msg.sender][_pIndex][_oIndex], "You have successfully claimed it");
        _mintedSPO[msg.sender][_pIndex][_oIndex] = true;

        SubjectPO[] memory subjectPO = new SubjectPO[](1);
        subjectPO[0] = SubjectPO(_pIndex, _oIndex);

        uint256 tokenId = _addEmptyToken(msg.sender, 0);

        _mint(tokenId, msg.sender, new IntPO[](0), new StringPO[](0), new AddressPO[](0),
            subjectPO, new BlankNodePO[](0));

    }

    function checkSignature(Signature memory signature, uint256 expireTime) internal {
        require(expireTime > block.timestamp, "Signature data expired");
        string memory originalData = string.concat(
            address(this).toHexString(),
            msg.sender.toHexString(),
            expireTime.toString());
        address signer = _verifyMessage(
            keccak256(abi.encodePacked(originalData)),
            signature._v,
            signature._r,
            signature._s
        );
        require(minters(signer), "SignData exception. Plz join Relation official Discord to open a ticket for support >> https://discord.com/invite/whGB5zEsHY");
    }

    function _verifyMessage(
        bytes32 _hashedMessage,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) internal pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHashMessage = keccak256(
            abi.encodePacked(prefix, _hashedMessage)
        );
        address signer = ecrecover(prefixedHashMessage, _v, _r, _s);
        return signer;
    }

}