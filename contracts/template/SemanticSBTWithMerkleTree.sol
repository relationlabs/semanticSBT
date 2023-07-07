// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

import "../core/SemanticSBT.sol";
import "../core/SemanticBaseStruct.sol";

contract SemanticSBTWithMerkleTree is SemanticSBT {
    using Strings for uint256;
    using Strings for address;


    bytes32 constant MINT_ROLE = 0x0000000000000000000000000000000000000000000000000000000000000001;

    string public whiteListURL;
    bytes32 public merkleRoot;

    uint256 private constant _pIndex = 1;
    uint256 private constant _oIndex = 1;


    mapping(address => mapping(uint256 => mapping(uint256 => bool)))  _mintedSPO;

    bool private _duplicatable;
    bool private _freeMintable;


    function duplicatable() public view returns (bool) {
        return _duplicatable;
    }

    function freeMintable() public view returns (bool) {
        return _freeMintable;
    }

    function addSubject(string memory value, string memory className_) public onlyMinter returns (uint256 sIndex) {
        return SemanticSBTLogic.addSubject(value, className_, _subjects, _subjectIndex, _classIndex);
    }

    function setWhiteList(string memory whiteListURL_, bytes32 _root) external onlyOwner {
        whiteListURL = whiteListURL_;
        merkleRoot = _root;
    }


    function setDuplicatable(bool duplicatable_) external onlyOwner {
        _duplicatable = duplicatable_;
    }


    function setFreeMintable(bool freeMintable_) external onlyOwner {
        _freeMintable = freeMintable_;
    }


    function mintWithProof(bytes32[] calldata proof) external {
        require(_freeMintable || _verify(_leaf(msg.sender), proof), "Activity: permission denied");
        require(_duplicatable || !_mintedSPO[msg.sender][_pIndex][_oIndex], "Activity: already minted");
        _mintedSPO[msg.sender][_pIndex][_oIndex] = true;

        SubjectPO[] memory subjectPO = new SubjectPO[](1);
        subjectPO[0] = SubjectPO(_pIndex, _oIndex);

        uint256 tokenId = _addEmptyToken(msg.sender, 0);

        _mint(tokenId, msg.sender, new IntPO[](0), new StringPO[](0), new AddressPO[](0),
            subjectPO, new BlankNodePO[](0));

    }

    function _leaf(address account) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(account));
    }

    function _verify(bytes32 leaf, bytes32[] memory proof) internal view returns (bool) {
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

}