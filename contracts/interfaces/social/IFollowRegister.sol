// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "../ISemanticSBT.sol";


interface IFollowRegister is ISemanticSBT {

    /**
     * To deploy the "Follow" contract.
     * @param addr : The address to be passed to the "Follow" contract.
     * @return tokenId : The tokenId.
     */
    function deployFollowContract(address addr) external returns (uint256);

    /**
     * To query the address of a "Follow" contract owned by a certain addewss
     * @param owner: who owns the "Follow" contract address
     * @return contractAddress : The address of the "Follow" contract
     */
    function ownedFollowContract(address owner) external view returns (address);

}