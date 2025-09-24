// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import '@openzeppelin/contracts/utils/Strings.sol';
import {FunctionsClient} from '@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol';
import {ConfirmedOwner} from '@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol';
import {FunctionsRequest} from '@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol';

// ERC-20接口
interface IERC20 {
  function transferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) external returns (bool);

  function balanceOf(address account) external view returns (uint256);

  function transfer(address recipient, uint256 amount) external returns (bool);

  function approve(address spender, uint256 amount) external returns (bool);

  function allowance(
    address owner,
    address spender
  ) external view returns (uint256);
}

contract ApichainPolygonPayment is FunctionsClient, ConfirmedOwner {
  using FunctionsRequest for FunctionsRequest.Request;
  using Strings for uint256;

  address private immutable i_owner;

  // WETH代币合约
  IERC20 private weth;

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
    address wethAddress,
    address router,
    bytes32 donID,
    uint32 gasLimit
  ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
    i_owner = msg.sender;
    i_donId = donID;
    i_gasLimit = gasLimit;
    weth = IERC20(wethAddress);
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
  ) external returns (bytes32 requestId) {
    FunctionsRequest.Request memory req;
    req.initializeRequestForInlineJavaScript(source);
    string memory amountStr = args[0];
    uint256 amount = stringToUint(amountStr);
    require(
      weth.transferFrom(msg.sender, address(this), amount),
      'WETH transfer failed'
    );
    string memory payData = args[1];
    string[] memory requestArgs = new string[](2);
    requestArgs[0] = amountStr;
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
    uint256 balance = weth.balanceOf(address(this));
    require(balance > 0, 'No funds to withdraw');
    require(weth.transfer(i_owner, balance), 'WETH withdrawal failed');
  }

  // 将字符串转换为uint256
  function stringToUint(string memory s) internal pure returns (uint256) {
    // 确保字符串不为空
    require(bytes(s).length > 0, 'Empty string');

    uint256 result = 0;
    bytes memory b = bytes(s);

    // 遍历字符串的每个字符
    for (uint256 i = 0; i < b.length; i++) {
      // 检查字符是否为数字（ASCII 48-57 对应 '0'-'9'）
      require(b[i] >= 0x30 && b[i] <= 0x39, 'Invalid character in string');
      // 将字符转换为数字并累加（result * 10 + 当前数字）
      result = result * 10 + (uint8(b[i]) - 0x30);
    }

    return result;
  }
}
