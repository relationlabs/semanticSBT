// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Create2.sol";
import {IFollow} from "../interfaces/social/IFollow.sol";
import {Follow} from "../template/Follow.sol";
import {BeaconProxy} from "../upgrade/BeaconProxy.sol";
import {Predicate, FieldType} from "../core/SemanticBaseStruct.sol";

library FollowRegisterLogic {

    string constant  FOLLOWING = "following";
    string constant NAME = "Follow SBT";
    string constant SYMBOL = "SBT";
    string constant BASE_URI = "";
    string constant SCHEMA_URI = "ar://-2hCuTMqo1fz2iyzf7dbEbzoyceod5KFOyGGqNiEQWY";


    function createFollow(address beaconAddress, address verifyContract, address owner, address minter) external returns (address){
        address followContract;
        bytes memory code = type(BeaconProxy).creationCode;
        bytes memory data = _getEncodeWithSelector(verifyContract, owner, minter);
        bytes memory bytecode = abi.encodePacked(code, abi.encode(beaconAddress, data));
        bytes32 salt = keccak256(abi.encodePacked(owner, minter));
        return Create2.deploy(0, salt, bytecode);
    }

    function _getEncodeWithSelector(address verifyContract, address owner, address minter) internal pure returns (bytes memory) {
        Predicate[] memory predicates_ = new Predicate[](1);
        predicates_[0] = Predicate(FOLLOWING, FieldType.SUBJECT);
        bytes4 func = IFollow.initialize.selector;

        return abi.encodeWithSelector(func, owner, minter, verifyContract, NAME, SYMBOL, BASE_URI, SCHEMA_URI, new string[](0), predicates_);
    }


}
