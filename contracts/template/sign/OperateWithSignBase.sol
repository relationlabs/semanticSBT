// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "../../interfaces/social/IContent.sol";
import "../../libraries/SemanticSBTLogicUpgradeable.sol";

contract OperateWithSignBase is Initializable, OwnableUpgradeable {


    string internal _name;

    mapping(address => uint256) public nonces;



    /* ============ External Functions ============ */

    function initialize(
        string calldata name_
    ) external initializer {
        __Ownable_init();
        _name = name_;
    }

    function setName(string calldata name_) external onlyOwner {
        _name = name_;
    }

    function name() public view returns (string memory){
        return _name;
    }
}
