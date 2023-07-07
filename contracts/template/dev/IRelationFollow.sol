// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;


interface IRelationFollow {

    function devFollow(address[] memory addr) external;

    function devUnfollow(address[] memory addr) external;
}