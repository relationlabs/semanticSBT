// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";


import "../interfaces/social/IActivity.sol";
import "../core/SemanticSBTUpgradeable.sol";
import "../core/SemanticBaseStruct.sol";

contract Activity is IActivity, SemanticSBTUpgradeable, PausableUpgradeable {
    using StringsUpgradeable for uint256;
    using StringsUpgradeable for address;


    uint256 _soulCIndex;
    uint256 _activityCIndex;
    uint256 _pIndex;
    uint256 _oIndex;


    mapping(address => mapping(uint256 => mapping(uint256 => bool)))  _mintedSPO;

    bool private _duplicatable;
    bool private _freeMintable;

    mapping(address => bool) public whiteList;
    address[] _whiteLists;

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

    function whiteListRange(uint256 offset, uint256 limit) public view returns (address[] memory whiteList_){
        if (offset > _whiteLists.length) {
            return new address[](0);
        }
        uint256 end = (offset + limit) > _whiteLists.length ? _whiteLists.length : offset + limit;
        limit = (offset + limit) > _whiteLists.length ? (_whiteLists.length - offset) : limit;
        whiteList_ = new address[](limit);
        for (uint256 i = offset; i < end; i++) {
            whiteList_[i - offset] = _whiteLists[i];
        }
    }

    function addWhiteList(address[] memory addressList) external
    onlyMinter {
        for (uint256 i = 0; i < addressList.length; i++) {
            if (!whiteList[addressList[i]]) {
                whiteList[addressList[i]] = true;
                _whiteLists.push(addressList[i]);
            }
        }
    }

    function setDuplicatable(bool duplicatable_) external onlyOwner {
        _duplicatable = duplicatable_;
    }


    function setFreeMintable(bool freeMintable_) external onlyOwner {
        _freeMintable = freeMintable_;
    }


    function mint() external whenNotPaused {
        require(_freeMintable || whiteList[msg.sender], "Activity: permission denied");
        require(_duplicatable || !_mintedSPO[msg.sender][_pIndex][_oIndex], "Activity: already minted");
        _mintedSPO[msg.sender][_pIndex][_oIndex] = true;

        SubjectPO[] memory subjectPO = new SubjectPO[](1);
        subjectPO[0] = SubjectPO(_pIndex, _oIndex);

        uint256 tokenId = _addEmptyToken(msg.sender, 0);

        _mint(tokenId, msg.sender, new IntPO[](0), new StringPO[](0), new AddressPO[](0),
            subjectPO, new BlankNodePO[](0));

    }

}