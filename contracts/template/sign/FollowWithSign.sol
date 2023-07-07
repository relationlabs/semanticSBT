// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "./OperateWithSignBase.sol";
import "../../interfaces/social/IFollow.sol";

contract FollowWithSign is OperateWithSignBase {

    struct OperateWithSign {
        SemanticSBTLogicUpgradeable.Signature sig;
        address target;
        address addr;
    }


    bytes32 internal constant FOLLOW_TYPE_HASH = keccak256('FollowWithSign(address target,uint256 nonce,uint256 deadline)');
    bytes32 internal constant UNFOLLOW_TYPE_HASH = keccak256('UnFollowWithSign(address target,uint256 nonce,uint256 deadline)');

    /* ============ External Functions ============ */

    function followWithSign(OperateWithSign calldata vars) external {
        address addr;
        unchecked {
            addr = SemanticSBTLogicUpgradeable.recoverSignerFromSignature(
                name(),
                address(this),
                keccak256(
                    abi.encode(
                        FOLLOW_TYPE_HASH,
                        vars.target,
                        nonces[vars.addr]++,
                        vars.sig.deadline
                    )
                ),
                vars.addr,
                vars.sig
            );
        }
        IFollow(vars.target).followBySigner(addr);
    }

    function unfollowWithSign(OperateWithSign calldata vars) external {
        address addr;
        unchecked {
            addr = SemanticSBTLogicUpgradeable.recoverSignerFromSignature(
                name(),
                address(this),
                keccak256(
                    abi.encode(
                        UNFOLLOW_TYPE_HASH,
                        vars.target,
                        nonces[vars.addr]++,
                        vars.sig.deadline
                    )
                ),
                vars.addr,
                vars.sig
            );
        }
        IFollow(vars.target).unfollowBySigner(addr);
    }


}