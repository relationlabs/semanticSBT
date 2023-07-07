// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


import "@openzeppelin/contracts/utils/introspection/ERC165.sol";


import "../core/SemanticSBTUpgradeable.sol";


contract MockSemanticSBTUpgradeable is SemanticSBTUpgradeable {

    /* ============ External Functions ============ */

    function addSubject(string memory value, string memory className_) public onlyMinter returns (uint256 sIndex) {
        return SemanticSBTLogicUpgradeable.addSubject(value, className_, _subjects, _subjectIndex, _classIndex);
    }

    function mint(address account, uint256 sIndex, IntPO[] memory intPOList, StringPO[] memory stringPOList,
        AddressPO[] memory addressPOList, SubjectPO[] memory subjectPOList,
        BlankNodePO[] memory blankNodePOList) external onlyMinter returns (uint256) {
        require(account != address(0), "SemanticSBT: mint to the zero address");
        require(sIndex < _subjects.length, "SemanticSBT: param error");

        uint256 tokenId = _addEmptyToken(account, sIndex);

        _mint(tokenId, account, intPOList, stringPOList, addressPOList, subjectPOList, blankNodePOList);
        return tokenId;
    }

    function burn(address account, uint256 id) external onlyMinter {
        require(
            _isApprovedOrOwner(_msgSender(), id),
            "SemanticSBT: caller is not approved or owner"
        );
        require(isOwnerOf(account, id), "SemanticSBT: not owner");
        _burn(id);
    }

}