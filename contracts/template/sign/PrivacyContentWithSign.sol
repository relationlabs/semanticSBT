// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;


import "../../interfaces/social/IPrivacyContent.sol";
import "./ContentWithSign.sol";

contract PrivacyContentWithSign is ContentWithSign {

    struct PrepareTokenWithSign {
        SemanticSBTLogicUpgradeable.Signature sig;
        address target;
        address addr;
    }

    struct ShareToFollowerWithSign {
        SemanticSBTLogicUpgradeable.Signature sig;
        address target;
        address addr;
        uint256 tokenId;
        address followContractAddress;
    }

    struct ShareToDaoWithSign {
        SemanticSBTLogicUpgradeable.Signature sig;
        address target;
        address addr;
        uint256 tokenId;
        address daoContractAddress;
    }


    bytes32 internal constant PREPARE_TOKEN_WITH_SIGN_TYPE_HASH = keccak256('PrepareTokenWithSign(address target,uint256 nonce,uint256 deadline)');
    bytes32 internal constant SHARE_TO_FOLLOW_WITH_SIGN_TYPE_HASH = keccak256('ShareToFollowerWithSign(address target,uint256 tokenId,address followContractAddress,uint256 nonce,uint256 deadline)');
    bytes32 internal constant SHARE_TO_DAO_WITH_SIGN_TYPE_HASH = keccak256('ShareToDaoWithSign(address target,uint256 tokenId,address daoContractAddress,uint256 nonce,uint256 deadline)');



    /* ============ External Functions ============ */
    function prepareTokenWithSign(PrepareTokenWithSign calldata vars) external {
        address addr;
        unchecked {
            addr = SemanticSBTLogicUpgradeable.recoverSignerFromSignature(
                name(),
                address(this),
                keccak256(
                    abi.encode(
                        PREPARE_TOKEN_WITH_SIGN_TYPE_HASH,
                            vars.target,
                        nonces[vars.addr]++,
                        vars.sig.deadline
                    )
                ),
                vars.addr,
                vars.sig
            );
        }
        IPrivacyContent(vars.target).prepareTokenBySigner(addr);
    }


    function shareToFollowerWithSign(ShareToFollowerWithSign calldata vars) external {
        address addr;
        unchecked {
            addr = SemanticSBTLogicUpgradeable.recoverSignerFromSignature(
                name(),
                address(this),
                keccak256(
                    abi.encode(
                        SHARE_TO_FOLLOW_WITH_SIGN_TYPE_HASH,
                            vars.target,
                        vars.tokenId,
                        vars.followContractAddress,
                        nonces[vars.addr]++,
                        vars.sig.deadline
                    )
                ),
                vars.addr,
                vars.sig
            );
        }
        IPrivacyContent(vars.target).shareToFollowerBySigner(addr, vars.tokenId, vars.followContractAddress);
    }


    function shareToDaoWithSign(ShareToDaoWithSign calldata vars) external {
        address addr;
        unchecked {
            addr = SemanticSBTLogicUpgradeable.recoverSignerFromSignature(
                name(),
                address(this),
                keccak256(
                    abi.encode(
                        SHARE_TO_DAO_WITH_SIGN_TYPE_HASH,
                            vars.target,
                        vars.tokenId,
                        vars.daoContractAddress,
                        nonces[vars.addr]++,
                        vars.sig.deadline
                    )
                ),
                vars.addr,
                vars.sig
            );
        }
        IPrivacyContent(vars.target).shareToDaoBySigner(addr, vars.tokenId, vars.daoContractAddress);

    }


}
