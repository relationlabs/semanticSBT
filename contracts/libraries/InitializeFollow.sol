// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {IFollow} from "../interfaces/social/IFollow.sol";
import {Predicate, FieldType} from "../core/SemanticBaseStruct.sol";


library InitializeFollow {

    string constant  FOLLOWING = "following";
    string constant NAME = "Follow";
    string constant SYMBOL = "SBT";
    string constant BASE_URI = "";
    string constant SCHEMA_URI = "ar://k_dvbio3h16I82XK_O62oBBSTfMd9BnUXhY8uxfOmrk";

    function initFollow(address connection, address owner, address minter) internal returns (bool) {
        Predicate[] memory predicates_ = new Predicate[](1);
        predicates_[0] = Predicate(FOLLOWING, FieldType.SUBJECT);
        IFollow(connection).initialize(owner, minter, NAME, SYMBOL, BASE_URI, SCHEMA_URI, new string[](0), predicates_);
        return true;
    }


}