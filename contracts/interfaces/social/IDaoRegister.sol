// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "../ISemanticSBT.sol";


interface IDaoRegister is ISemanticSBT {

    /**
     * To deploy the "Dao" contract.
     * @param to : The address to be passed to the "Dao" contract.
     * @param name : The name to be passed to the "Dao" contract.
     * @return tokenId The tokenId for this Dao contract in the DaoRegister contract.
     */
    function deployDaoContract(address to, string calldata name) external returns (uint256);


    /**
      * Lookup the information on a DAO.
      * @param tokenId  The tokenId for this Dao contract in the DaoRegister contract.
     * @return owner  The owner of the DAO.
     * @return contractAddress  The contract address of the Dao contract.
     */
    function daoOf(uint256 tokenId) external view returns (address owner, address contractAddress);
}