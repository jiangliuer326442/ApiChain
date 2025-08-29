// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./StringHelper.sol";

contract ApichainPayment {

    using StringHelper for string;

    address private s_owner;

    bytes32 public hashFirstPart;

    bytes32 public lastPart;

    string public parts0;
    string public parts2;

    constructor() {
        s_owner = msg.sender;
    }

    function storePayData(string memory payData) payable external {
        string[] memory parts = payData.splitString("&");
        require(parts.length >= 3, "Invalid payData format: must contain at least 3 parts");
        parts0 = parts[0];
        parts2 = parts[2];
        hashFirstPart = parts0.hash();
        lastPart = parts2.toBytes32();
        // require(lastPart == hashFirstPart, "Hash mismatch");
    }

    function getOwner() public view returns (address) {
        return s_owner;
    }

}