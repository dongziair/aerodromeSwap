import { ethers } from 'ethers';
import { MAX_GAS_GWEI, GAS_CHECK_INTERVAL } from './config.js';

/**
 * 获取当前 gas 价格（gwei）
 */
export async function getGasPrice(provider) {
    const feeData = await provider.getFeeData();
    const gasPriceWei = feeData.gasPrice ?? feeData.maxFeePerGas ?? 0n;
    return parseFloat(ethers.formatUnits(gasPriceWei, 'gwei'));
}

/**
 * 判断当前 gas 是否在可接受范围
 */
export async function isGasAcceptable(provider) {
    const gasGwei = await getGasPrice(provider);
    const ok = gasGwei <= MAX_GAS_GWEI;
    return { ok, gasGwei };
}

/**
 * 等待 gas 降到阈值以下
 */
export async function waitForLowGas(provider, label) {
    while (true) {
        const { ok, gasGwei } = await isGasAcceptable(provider);
        if (ok) {
            console.log(`[${label}] gas 正常: ${gasGwei.toFixed(4)} gwei`);
            return gasGwei;
        }
        console.log(`[${label}] gas 过高: ${gasGwei.toFixed(4)} gwei > ${MAX_GAS_GWEI} gwei，等待 ${GAS_CHECK_INTERVAL}s...`);
        await new Promise(r => setTimeout(r, GAS_CHECK_INTERVAL * 1000));
    }
}
