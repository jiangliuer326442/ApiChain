// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 字符串处理库
library StringHelper {

    function toBytes32(string memory input) public pure returns (bytes32) {
        bytes32 result;
        assembly {
            // 读取字符串的内存位置并转换为 bytes32
            result := mload(add(input, 32))
        }
        return result;
    }

    function hash(string memory input) public pure returns (bytes32) {
        return keccak256(abi.encode(input));
    }

    // 将字符串按指定分隔符分割，返回子字符串数组
    function splitString(string memory input, bytes1 delimiter) internal pure returns (string[] memory) {
        // 将字符串转换为字节数组
        bytes memory inputBytes = bytes(input);
        // 统计分隔符的数量以确定结果数组大小
        uint delimiterCount = 0;
        for (uint i = 0; i < inputBytes.length; i++) {
            if (inputBytes[i] == delimiter) {
                delimiterCount++;
            }
        }

        // 创建结果数组，长度为分隔符数量 + 1
        string[] memory result = new string[](delimiterCount + 1);
        uint resultIndex = 0;
        uint start = 0;

        // 遍历字节数组，分割字符串
        for (uint i = 0; i < inputBytes.length; i++) {
            if (inputBytes[i] == delimiter) {
                // 提取子字符串
                result[resultIndex] = substring(input, start, i);
                resultIndex++;
                start = i + 1;
            }
        }
        // 添加最后一个子字符串
        result[resultIndex] = substring(input, start, inputBytes.length);

        return result;
    }

    // 辅助函数：提取子字符串
    function substring(string memory str, uint startIndex, uint endIndex) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }
}