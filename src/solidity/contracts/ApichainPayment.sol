// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import '@openzeppelin/contracts/utils/Strings.sol';
import {FunctionsClient} from '@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol';
import {ConfirmedOwner} from '@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol';
import {FunctionsRequest} from '@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol';

contract ApichainPayment is FunctionsClient, ConfirmedOwner {
  using FunctionsRequest for FunctionsRequest.Request;
  using Strings for uint256;

  address payable private immutable i_owner;

  // State variables to store the last request ID, response, and error
  bytes32 public s_lastRequestId;
  bytes public s_lastResponse;
  bytes public s_lastError;

  // Custom error type
  error UnexpectedRequestID(bytes32 requestId);
  error RequestPending();
  error WithdrawalFailed();

  string source =
    'const money = args[0];'
    'const content = args[1];'
    'const apiResponse = await Functions.makeHttpRequest({'
    'url: `https://pay.apichain.app/pay/prepare/${money}/${content}`'
    '});'
    'if (apiResponse.error) {'
    "throw Error('Request failed');"
    '}'
    'const { data } = apiResponse;'
    'return Functions.encodeString(data.token);';

  uint32 private i_gasLimit;

  bytes32 private immutable i_donId;

  /**
   * @notice Initializes the contract with the Chainlink router address and sets the contract owner
   */
  constructor(
    address router,
    bytes32 donID,
    uint32 gasLimit
  ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
    i_owner = payable(msg.sender);
    i_donId = donID;
    i_gasLimit = gasLimit;
  }

  /**
   * @notice Sends an HTTP request for character information
   * @param subscriptionId The ID for the Chainlink subscription
   * @param args The arguments to pass to the HTTP request
   * @return requestId The ID of the request
   */
  function sendRequest(
    uint64 subscriptionId,
    string[] calldata args
  ) external payable returns (bytes32 requestId) {
    FunctionsRequest.Request memory req;
    req.initializeRequestForInlineJavaScript(source);
    string memory payData = args[0];
    string[] memory requestArgs = new string[](2);
    requestArgs[0] = msg.value.toString();
    requestArgs[1] = payData;
    req.setArgs(requestArgs);
    s_lastRequestId = _sendRequest(
      req.encodeCBOR(),
      subscriptionId,
      i_gasLimit,
      i_donId
    );

    return s_lastRequestId;
  }

  /**
   * @notice Callback function for fulfilling a request
   * @param requestId The ID of the request to fulfill
   * @param response The HTTP response data
   * @param err Any errors from the Functions request
   */
  function fulfillRequest(
    bytes32 requestId,
    bytes memory response,
    bytes memory err
  ) internal override {
    if (s_lastRequestId != requestId) {
      revert UnexpectedRequestID(requestId);
    }
    s_lastResponse = response;
    s_lastError = err;
  }

  function withdraw() external onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, 'No funds to withdraw');
    i_owner.transfer(balance);
  }
}
