// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Strings.sol";

import "../core/SemanticSBT.sol";
import "../interfaces/social/IDaoRegister.sol";
import "../interfaces/social/IDao.sol";
import {SocialGraphData} from "../libraries/SocialGraphData.sol";
import {DeployDao} from "../libraries/DeployDao.sol";
import {InitializeDao} from "../libraries/InitializeDao.sol";
import {SemanticSBTLogic} from "../libraries/SemanticSBTLogic.sol";

contract DaoRegister is IDaoRegister, SemanticSBT {
    using Strings for uint256;
    using Strings for address;

    struct DaoStruct {
        address owner;
        address contractAddress;
    }

    uint256 constant DAO_CONTRACT_PREDICATE_INDEX = 1;

    uint256 constant soulCIndex = 1;
    uint256 constant contractCIndex = 2;

    mapping(address => address[]) _ownedDaoContract;
    mapping(uint256 => DaoStruct) _daoOf;

    function ownedDaoContract(address owner) external view returns (address[] memory){
        return _ownedDaoContract[owner];
    }


    function deployDaoContract(address to) external returns (uint256){
        uint256 tokenId = _addEmptyToken(to, 0);
        address daoContractAddress = DeployDao.deployDao();
        InitializeDao.initDao(daoContractAddress, to, address(this));
        _ownedDaoContract[to].push(daoContractAddress);
        _daoOf[tokenId] = DaoStruct(to, daoContractAddress);
        uint256 contractIndex = _addSubject(daoContractAddress.toHexString(), contractCIndex);

        SubjectPO[] memory subjectPOList = generateSubjectPOList(contractIndex);
        _mint(tokenId, to, new IntPO[](0), new StringPO[](0), new AddressPO[](0), subjectPOList, new BlankNodePO[](0));
        return tokenId;
    }

    function daoOf(uint256 tokenId) external returns (address owner, address contractAddress){
        DaoStruct memory dao = _daoOf[tokenId];
        owner = dao.owner;
        contractAddress = dao.contractAddress;
    }


    function supportsInterface(bytes4 interfaceId) public view virtual override(SemanticSBT) returns (bool) {
        return interfaceId == type(IDaoRegister).interfaceId ||
        super.supportsInterface(interfaceId);
    }


    function generateSubjectPOList(uint256 contractIndex) internal pure returns (SubjectPO[] memory) {
        SubjectPO[] memory subjectPOList = new SubjectPO[](1);
        subjectPOList[0] = SubjectPO(DAO_CONTRACT_PREDICATE_INDEX, contractIndex);
        return subjectPOList;
    }

}