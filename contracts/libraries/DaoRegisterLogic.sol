// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {IDao} from "../interfaces/social/IDao.sol";
import {BeaconProxy} from "../upgrade/BeaconProxy.sol";
import {Predicate, FieldType} from "../core/SemanticBaseStruct.sol";


library DaoRegisterLogic {

    string constant  DAO_CLASS_NAME = "Dao";
    string constant  JOIN_PREDICATE = "join";
    string constant  DAO_URI_PREDICATE = "daoURI";
    string constant SYMBOL = "DSBT";
    string constant SCHEMA_URI = "ar://UTbYdbPy5Ov2bZ1ikWm_4RhMT5GJPvasE57qtSfL1oQ";

    function createDao(address beaconAddress, address verifyContract, address owner, address minter, string memory name, string memory baseURI) external returns (address){
        address daoContract;
        bytes memory code = type(BeaconProxy).creationCode;
        bytes memory data = _getEncodeWithSelector(verifyContract, owner, minter, name, baseURI);
        bytes memory bytecode = abi.encodePacked(code, abi.encode(beaconAddress, data));
        bytes32 salt = keccak256(abi.encodePacked(owner, minter,name,block.number));
        assembly {
            daoContract := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        return daoContract;
    }


    function _getEncodeWithSelector(address verifyContract, address owner, address minter, string memory name, string memory baseURI) internal pure returns (bytes memory) {
        string[] memory classNames_ = new string[](1);
        classNames_[0] = DAO_CLASS_NAME;
        Predicate[] memory predicates_ = new Predicate[](2);
        predicates_[0] = Predicate(JOIN_PREDICATE, FieldType.SUBJECT);
        predicates_[1] = Predicate(DAO_URI_PREDICATE, FieldType.STRING);
        bytes4 func = IDao.initialize.selector;

        return abi.encodeWithSelector(func,
            owner,
            minter,
            verifyContract,
            name,
            SYMBOL,
            string.concat(baseURI, "/json/"),
            SCHEMA_URI,
            classNames_,
            predicates_);
    }

}