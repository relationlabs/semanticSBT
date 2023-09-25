// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {Clones} from '@openzeppelin/contracts/proxy/Clones.sol';
import {Activity} from "./Activity.sol";
import "../core/SemanticBaseStruct.sol";

contract ActivityFactory {

    event CreateActivity(address indexed owner, address indexed activity);


    string constant  ACTIVITY_CLASS_NAME = "Activity";
    string constant  PARTICIPATE_PREDICATE = "participate";
    string constant SCHEMA_URI = "ar://pEaI9o8moBFof5IkOSq1qNnl8RuP0edn2BFD1q6vdE4";

    mapping(address => uint256) public nonce;
    mapping(address => mapping(uint256 => address)) public addressOf;

    address public activityImpl;
    address public owner;

    constructor(){
        owner = msg.sender;
    }

    function setActivityImpl(address _activityImpl) external {
        require(owner == msg.sender, "Not owner");
        activityImpl = _activityImpl;
    }

    function createActivity(string calldata contractName, string calldata symbol,string calldata baseURI, string calldata activityName) external returns(address) {
        uint256 index = ++nonce[msg.sender];
        address activity = Clones.clone(activityImpl);

        _init(activity, msg.sender, contractName, symbol, baseURI, activityName);
        addressOf[msg.sender][index] = activity;
        emit CreateActivity(msg.sender, activity);
        return activity;
    }

    function _init(address activityAddress, address _owner, string memory contractName, string memory symbol,
                        string memory baseURI, string memory activityName) internal {
        string[] memory class_ = new string[](1);
        class_[0] = ACTIVITY_CLASS_NAME;
        Predicate[] memory predicates_ = new Predicate[](1);
        predicates_[0] = Predicate(PARTICIPATE_PREDICATE, FieldType.SUBJECT);
        Activity(activityAddress).initialize(address(this), contractName, symbol, baseURI, SCHEMA_URI, class_, predicates_);
        Activity(activityAddress).setActivity(activityName);
        Activity(activityAddress).setMinter(address(this), false);
        Activity(activityAddress).setMinter(_owner, true);
        Activity(activityAddress).transferOwnership(_owner);
    }

}
