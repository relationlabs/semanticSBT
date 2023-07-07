// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "./IContent.sol";


interface IPrivacyContent is IContent {

    /**
     * Prepare a tokenId.
     * @return tokenId The prepared tokenId.
     */
    function prepareToken() external returns (uint256 tokenId);

    /**
     * Query the prepared tokenId.
     * @param addr The owner of prepared tokenId.
     * @return tokenId The prepared tokenId.
     */
    function ownedPrepareToken(address addr) external view returns (uint256 tokenId);

    /**
     * Prepare a tokenId. This can only be called by the verify contract.
     * @param addr The message signer.
     * @return tokenId The prepared tokenId.
     */
    function prepareTokenBySigner(address addr) external returns (uint256) ;

    /**
     * Share to followers. This can only be called by the verify contract.
     * @param addr The message signer.
     * @param tokenId The tokenId.
     * @param followContractAddress The address of Follow contract.
     */
    function shareToFollowerBySigner(address addr, uint256 tokenId, address followContractAddress) external;

    /**
     * Share to daos. This can only be called by the verify contract.
     * @param addr The message signer.
     * @param tokenId The tokenId.
     * @param daoContractAddress The address of Dao contract.
     */
    function shareToDaoBySigner(address addr, uint256 tokenId, address daoContractAddress) external;

    /**
     * Whether the address is authorized to be the view of the token.
     * @param viewer The address.
     * @param tokenId The tokenId.
     * @return isViewer true--has viewer permission; false--do not have viewer permission.
     */
    function isViewerOf(address viewer, uint256 tokenId) external view returns (bool isViewer);

}
