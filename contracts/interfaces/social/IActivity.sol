// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "../ISemanticSBT.sol";

interface IActivity is ISemanticSBT {


    function setActivity(string memory activity) external;

    function addWhiteList(address[] memory addressList) external;

    function mint() external;


}