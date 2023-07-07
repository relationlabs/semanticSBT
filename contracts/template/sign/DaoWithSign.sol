// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;


import "../../interfaces/social/IDao.sol";
import "./OperateWithSignBase.sol";

contract DaoWithSign is OperateWithSignBase {

    struct SetDaoURIWithSign {
        SemanticSBTLogicUpgradeable.Signature sig;
        address target;
        address addr;
        string daoURI;
    }

    struct SetFreeJoinWithSign {
        SemanticSBTLogicUpgradeable.Signature sig;
        address target;
        address addr;
        bool isFreeJoin;
    }

    struct AddMemberWithSign {
        SemanticSBTLogicUpgradeable.Signature sig;
        address target;
        address addr;
        address[] members;
    }

    struct JoinWithSign {
        SemanticSBTLogicUpgradeable.Signature sig;
        address target;
        address addr;
    }

    struct RemoveWithSign {
        SemanticSBTLogicUpgradeable.Signature sig;
        address target;
        address addr;
        address member;
    }

    bytes32 public constant SET_DAO_URI_WITH_SIGN_TYPE_HASH = keccak256('SetDaoURIWithSign(address target,string daoURI,uint256 nonce,uint256 deadline)');
    bytes32 public constant SET_FREE_JOIN_WITH_SIGN_TYPE_HASH = keccak256('SetFreeJoinWithSign(address target,bool isFreeJoin,uint256 nonce,uint256 deadline)');
    bytes32 public constant ADD_MEMBER_WITH_SIGN_TYPE_HASH = keccak256('AddMemberWithSign(address target,address[] members,uint256 nonce,uint256 deadline)');
    bytes32 public constant JOIN_WITH_SIGN_TYPE_HASH = keccak256('JoinWithSign(address target,uint256 nonce,uint256 deadline)');
    bytes32 public constant REMOVE_WITH_SIGN_TYPE_HASH = keccak256('RemoveWithSign(address target,address member,uint256 nonce,uint256 deadline)');

    /* ============ External Functions ============ */

    function setDaoURIWithSign(SetDaoURIWithSign calldata vars) external {
        address addr;
        unchecked {
            addr = SemanticSBTLogicUpgradeable.recoverSignerFromSignature(
                name(),
                address(this),
                keccak256(
                    abi.encode(
                        SET_DAO_URI_WITH_SIGN_TYPE_HASH,
                        vars.target,
                        keccak256(bytes(vars.daoURI)),
                        nonces[vars.addr]++,
                        vars.sig.deadline
                    )
                ),
                vars.addr,
                vars.sig
            );
        }
        IDao(vars.target).setDaoURIBySigner(addr, vars.daoURI);
    }

    function setFreeJoinWithSign(SetFreeJoinWithSign calldata vars) external {
        address addr;
        unchecked {
            addr = SemanticSBTLogicUpgradeable.recoverSignerFromSignature(
                name(),
                address(this),
                keccak256(
                    abi.encode(
                        SET_FREE_JOIN_WITH_SIGN_TYPE_HASH,
                        vars.target,
                        vars.isFreeJoin,
                        nonces[vars.addr]++,
                        vars.sig.deadline
                    )
                ),
                vars.addr,
                vars.sig
            );
        }
        IDao(vars.target).setFreeJoinBySigner(addr, vars.isFreeJoin);
    }


    function addMemberWithSign(AddMemberWithSign calldata vars) external {
        address addr;
        unchecked {
            addr = SemanticSBTLogicUpgradeable.recoverSignerFromSignature(
                name(),
                address(this),
                keccak256(
                    abi.encode(
                        ADD_MEMBER_WITH_SIGN_TYPE_HASH,
                        vars.target,
                        keccak256(abi.encodePacked(vars.members)),
                        nonces[vars.addr]++,
                        vars.sig.deadline
                    )
                ),
                vars.addr,
                vars.sig
            );
        }
        IDao(vars.target).addMemberBySigner(addr, vars.members);
    }

    function joinWithSign(JoinWithSign calldata vars) external {
        address addr;
        unchecked {
            addr = SemanticSBTLogicUpgradeable.recoverSignerFromSignature(
                name(),
                address(this),
                keccak256(
                    abi.encode(
                        JOIN_WITH_SIGN_TYPE_HASH,
                        vars.target,
                        nonces[vars.addr]++,
                        vars.sig.deadline
                    )
                ),
                vars.addr,
                vars.sig
            );
        }
        IDao(vars.target).joinBySigner(addr);

    }

    function removeWithSign(RemoveWithSign calldata vars) external {
        address addr;
        unchecked {
            addr = SemanticSBTLogicUpgradeable.recoverSignerFromSignature(
                name(),
                address(this),
                keccak256(
                    abi.encode(
                        REMOVE_WITH_SIGN_TYPE_HASH,
                        vars.target,
                        vars.member,
                        nonces[vars.addr]++,
                        vars.sig.deadline
                    )
                ),
                vars.addr,
                vars.sig
            );
        }
        IDao(vars.target).removeBySigner(addr, vars.member);
    }


}
