// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import '@openzeppelin/contracts/utils/Strings.sol';
import {FunctionsClient} from '@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol';
import {ConfirmedOwner} from '@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol';
import {FunctionsRequest} from '@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol';

contract ApichainPayment is FunctionsClient, ConfirmedOwner {
  using FunctionsRequest for FunctionsRequest.Request;
  using Strings for uint256;

  address payable private immutable i_owner;
  bytes32 private immutable i_donId;
  uint32 private i_gasLimit;
  uint64 private immutable i_subscriptionId;

  mapping(address => bytes32) private s_userRequestId;
  mapping(address => uint256) private s_userPay;

  // State variables to store the last request ID, response, and error
  bytes32 public s_lastRequestId;
  bytes public s_lastResponse;
  bytes public s_lastError;
  uint256 public s_lastPay;
  address payable public s_lastAddress;

  // Custom error type
  error UnexpectedRequestID(bytes32 requestId);
  error RequestPending();
  error WithdrawalFailed();

  // Event to log responses
  event Response(
    bytes32 indexed requestId,
    uint256 status,
    bytes response,
    bytes err
  );

  event Withdrawn(address indexed owner, uint256 amount);

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
    'return Functions.encodeUint256(data.status);';

  constructor(
    address router,
    bytes32 donID,
    uint32 gasLimit,
    uint64 subscriptionId
  ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
    i_owner = payable(msg.sender);
    i_donId = donID;
    i_gasLimit = gasLimit;
    i_subscriptionId = subscriptionId;
  }

  function sendRequest(string memory payData) external payable {
    require(
      s_userRequestId[msg.sender] == bytes32(0),
      'Previous request pending'
    );
    string[] memory args = new string[](2);
    args[0] = msg.value.toString();
    args[1] = payData;
    FunctionsRequest.Request memory req;
    req.initializeRequestForInlineJavaScript(source);
    req.setArgs(args);
    s_lastRequestId = _sendRequest(
      req.encodeCBOR(),
      i_subscriptionId,
      i_gasLimit,
      i_donId
    );
    s_lastPay = msg.value;
    s_lastAddress = payable(msg.sender);
    s_userRequestId[msg.sender] = s_lastRequestId;
    s_userPay[msg.sender] = msg.value;
  }

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

    // uint256 status;
    //     if (err.length == 0 && response.length > 0) {
    //         status = abi.decode(response, (uint256));

    // emit Response(requestId, string(response), s_lastResponse, s_lastError);
  }

  function withdraw() external onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, 'No funds to withdraw');
    i_owner.transfer(balance);
  }

  function getOwner() external view returns (address) {
    return i_owner;
  }
}
