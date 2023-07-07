// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Strings.sol";

import "../../core/SemanticSBTUpgradeable.sol";
import "../../interfaces/social/IDaoRegister.sol";
import "../../interfaces/social/IDao.sol";
import {DaoRegisterLogic} from "../../libraries/DaoRegisterLogic.sol";

contract RelationDaoRegister is IDaoRegister, SemanticSBTUpgradeable {
    using Strings for uint256;
    using Strings for address;

    struct DaoStruct {
        address owner;
        address contractAddress;
    }

    uint256 constant DAO_CONTRACT_PREDICATE_INDEX = 1;

    uint256 constant SOUL_CLASS_INDEX = 1;
    uint256 constant CONTRACT_CLASS_INDEX = 2;

    mapping(uint256 => DaoStruct) _daoOf;
    string public daoBaseURI;

    address public daoImpl;

    address public verifyContract;


    function setDaoVerifyContract(address _verifyContract) external onlyMinter {
        verifyContract = _verifyContract;
    }

    function setDaoBaseURI(string memory daoBaseURI_) external onlyOwner {
        daoBaseURI = daoBaseURI_;
    }

    function setDaoImpl(address _daoImpl) external onlyOwner {
        daoImpl = _daoImpl;
    }

    function deployDaoContract(address to, string calldata name_) external returns (uint256){
        require(daoImpl != address(0), "DaoRegister:daoImpl not set");
        require(to == msg.sender || _minters[msg.sender], "DaoRegister:permission Denied");
        uint256 tokenId = _addEmptyToken(to, 0);
        address daoContractAddress = DaoRegisterLogic.createDao(daoImpl, verifyContract, to, address(this), name_, daoBaseURI);
        _daoOf[tokenId] = DaoStruct(to, daoContractAddress);
        uint256 contractIndex = SemanticSBTLogicUpgradeable.addSubject(daoContractAddress.toHexString(), _classNames[CONTRACT_CLASS_INDEX], _subjects, _subjectIndex, _classIndex);

        SubjectPO[] memory subjectPOList = generateSubjectPOList(contractIndex);
        _mint(tokenId, to, new IntPO[](0), new StringPO[](0), new AddressPO[](0), subjectPOList, new BlankNodePO[](0));
        return tokenId;
    }

    function daoOf(uint256 tokenId) external view returns (address daoOwner, address contractAddress){
        DaoStruct memory dao = _daoOf[tokenId];
        daoOwner = dao.owner;
        contractAddress = dao.contractAddress;
    }

    function devAddMember(address daoAddress,address[] memory members) external{
        IDao(daoAddress).addMember(members);
    }


    function supportsInterface(bytes4 interfaceId) public view virtual override(SemanticSBTUpgradeable) returns (bool) {
        return interfaceId == type(IDaoRegister).interfaceId ||
        super.supportsInterface(interfaceId);
    }


    function generateSubjectPOList(uint256 contractIndex) internal pure returns (SubjectPO[] memory) {
        SubjectPO[] memory subjectPOList = new SubjectPO[](1);
        subjectPOList[0] = SubjectPO(DAO_CONTRACT_PREDICATE_INDEX, contractIndex);
        return subjectPOList;
    }

}