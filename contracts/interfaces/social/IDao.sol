// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "../../core/SemanticBaseStruct.sol";
import "../ISemanticSBT.sol";

interface IDao is ISemanticSBT {


    function initialize(
        address owner,
        address minter,
        address verifyContract,
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        string memory schemaURI_,
        string[] memory classes_,
        Predicate[] memory predicates_
    ) external;

    /**
      * Set the URI for a dao.
      * @param daoURI  A resource address pointing to the data of a dao's information. It is a transaction hash on Arweave.
     */
    function setDaoURI(string calldata daoURI) external;

    /**
     * Is this an open dao?
     */
    function isFreeJoin() external view returns (bool);

    /**
     * Add the specified address to dao in batches.
     * @param addr The specified address.
     */
    function addMember(address[] calldata addr) external;

    /**
     * Join a dao.
     * @param tokenId  The tokenId for this member in the dao.
     */
    function join() external returns (uint256 tokenId);

    /**
     * Removed from a dao.
     * @param addr The address.
     * @return tokenId The tokenId.
     */
    function remove(address addr) external returns (uint256 tokenId);

    /**
     * The URI for a dao.
     * @return daoURI  A resource address pointing to the data of a dao's information. It is a transaction hash on Arweave.
     */
    function daoURI() external view returns (string memory daoURI);

    /**
    * Set the URI for a dao. This can only be called by the verify contract.
     * @param addr The message signer.
    * @param daoURI  A resource address pointing to the data of a dao's information. It is a transaction hash on Arweave.
     */
    function setDaoURIBySigner(address addr, string calldata daoURI) external;

    /**
     * Set whether it is an open dao. This can only be called by the verify contract.
     * @param addr The message signer.
     * @param isFreeJoin_ Is this an open dao
     */
    function setFreeJoinBySigner(address addr, bool isFreeJoin_) external;


    /**
     * Add the specified address to dao in batches. This can only be called by the verify contract.
     * @param addr The message signer.
     * @param members The specified address.
     */
    function addMemberBySigner(address addr, address[] calldata members) external;

    /**
     * Join a dao. This can only be called by the verify contract.
     * @param addr The message signer.
     */
    function joinBySigner(address addr) external;

    /**
     * Removed from a dao.This can only be called by the verify contract.
     * @param addr The message signer.
     * @param member The address.
     */
    function removeBySigner(address addr, address member) external;


    /**
     * The owner of a dao.
     * @param owner The owner of a dao.
     */
    function ownerOfDao() external view returns (address owner);

    /**
      * Is a member of the dao?
      * @param addr The address.
      * @return result : true--is a member of the dao;false--not a member of the dao.
     */
    function isMember(address addr) external view returns (bool result);

}