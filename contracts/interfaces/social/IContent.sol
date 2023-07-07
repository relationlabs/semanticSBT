// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "../ISemanticSBT.sol";

interface IContent is ISemanticSBT {
    /**
     * Post a content.
     * @param content  The content should be the hash on arweave. The actual encrypted content and authorization records are stored on arweave.
     */
    function post(string calldata content) external;

    /**
     * Post a content. This can only be called by the verify contract.
     * @param addr  The message signer.
     * @param content  The content should be the hash on arweave. The actual encrypted content and authorization records are stored on arweave.
     */
    function postBySigner(address addr, string calldata content) external;

    /**
     * View the hash on arweave corresponding to the token.
     * @param tokenId The tokenId.
     * @return content The content.
     */
    function contentOf(uint256 tokenId) external view returns (string memory content);
}
