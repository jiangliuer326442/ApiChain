// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SimpleStorage {
  // State variable to store a number
  uint256 private storedNumber;

  // Event to emit when the number is updated
  event NumberStored(uint256 newNumber);

  // Function to set a new number
  function setNumber(uint256 _number) public {
    storedNumber = _number;
    emit NumberStored(_number);
  }

  // Function to get the stored number
  function getNumber() public view returns (uint256) {
    return storedNumber;
  }
}
