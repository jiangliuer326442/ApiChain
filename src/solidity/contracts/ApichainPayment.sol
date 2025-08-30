// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import 'base64-sol/base64.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

contract ApichainPayment {
  address payable private s_owner;
  enum Product {
    Product9,
    Product10,
    Product11
  }
  mapping(Product => uint) private s_productMoney;
  mapping(Product => string) private s_productName;
  mapping(Product => uint) private s_productDays;

  uint private constant USD_ETH_RATE = 220;
  uint private constant CNY_ETH_RATE = 31;
  uint private constant RATE_DENOMINATOR = 1e6;

  mapping(string => Product) private s_orderProduct;
  mapping(string => string) private s_uidOrder;

  modifier onlyOwner() {
    require(msg.sender == s_owner, "Only owner can call this function");
    _;
  }

  constructor() {
    s_owner = payable(msg.sender);

    s_productMoney[Product.Product9] = 2;
    s_productMoney[Product.Product10] = 14;
    s_productMoney[Product.Product11] = 28;
    s_productName[Product.Product9] = 'product9';
    s_productName[Product.Product10] = 'product10';
    s_productName[Product.Product11] = 'product11';
    s_productDays[Product.Product9] = 31;
    s_productDays[Product.Product10] = 366;
    s_productDays[Product.Product11] = 20000;
  }

  function storePayData(
    string memory productName,
    string memory tradeNo,
    string memory uid
  ) external payable {
    require(msg.value > 0, 'send money');

    require(bytes(productName).length > 0, 'productName empty');
    require(bytes(tradeNo).length > 0, 'tradeNo empty');
    require(bytes(uid).length > 0, 'uid empty');

    Product product = stringToProduct(productName);

    uint money = s_productMoney[product];
    uint moneyEth = (money * USD_ETH_RATE * 1e18) / RATE_DENOMINATOR;
    if (msg.value < moneyEth) {
      revert('Not enough money');
    }

    s_uidOrder[uid] = tradeNo;
    s_orderProduct[tradeNo] = product;
  }

  function withdraw() external onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, "No funds to withdraw");
    s_owner.transfer(balance);
  }

  function getOrderReceipt(
    string calldata tradeNo,
    string calldata uid
  ) external view returns (string memory) {
    if (keccak256(bytes(s_uidOrder[uid])) != keccak256(bytes(tradeNo))) {
      return "";
    }
    Product product = s_orderProduct[tradeNo];

    string memory originString = string(
      abi.encodePacked(
        s_productName[product],
        ':',
        Strings.toString(s_productDays[product]),
        ':',
        Strings.toString(block.timestamp),
        ':dollerpay:',
        tradeNo
      )
    );
    return Base64.encode(bytes(originString));
  }

  function stringToProduct(
    string memory productName
  ) private pure returns (Product) {
    bytes32 hash = keccak256(abi.encodePacked(productName));
    if (hash == keccak256(abi.encodePacked('product9')))
      return Product.Product9;
    if (hash == keccak256(abi.encodePacked('product10')))
      return Product.Product10;
    if (hash == keccak256(abi.encodePacked('product11')))
      return Product.Product11;
    revert('Invalid product name');
  }

  function getOrderNoByUid(string memory uid) external view returns (string memory) {
    return s_uidOrder[uid];
  }

  function getOwner() external view returns (address) {
    return s_owner;
  }
}
