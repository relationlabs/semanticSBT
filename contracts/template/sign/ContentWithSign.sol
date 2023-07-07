// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;


import "../../interfaces/social/IContent.sol";
import "../../libraries/SemanticSBTLogicUpgradeable.sol";
import "./OperateWithSignBase.sol";

contract ContentWithSign is OperateWithSignBase {


    struct PostWithSign {
        SemanticSBTLogicUpgradeable.Signature sig;
        address target;
        address addr;
        string content;
    }


    bytes32 internal constant POST_WITH_SIGN_TYPE_HASH = keccak256('PostWithSign(address target,string content,uint256 nonce,uint256 deadline)');



    /* ============ External Functions ============ */


    function postWithSign(PostWithSign calldata vars) virtual external {
        address addr;
        unchecked {
            addr = SemanticSBTLogicUpgradeable.recoverSignerFromSignature(
                name(),
                address(this),
                keccak256(
                    abi.encode(
                        POST_WITH_SIGN_TYPE_HASH,
                            vars.target,
                        keccak256(bytes(vars.content)),
                        nonces[vars.addr]++,
                        vars.sig.deadline
                    )
                ),
                vars.addr,
                vars.sig
            );
        }
        IContent(vars.target).postBySigner(addr, vars.content);
    }

}
