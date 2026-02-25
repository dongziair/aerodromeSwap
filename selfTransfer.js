import { ethers } from 'ethers';
import { randomSelfTransferPercent } from './humanSimulator.js';

/**
 * 自转 ETH：从钱包发送给自己，金额为余额的 1%~5%
 */
export async function selfTransferETH(wallet, provider, label) {
    const balance = await provider.getBalance(wallet.address);
    if (balance === 0n) {
        console.log(`[${label}] ETH 余额为 0，跳过自转`);
        return null;
    }

    const percent = randomSelfTransferPercent();
    const amount = balance * BigInt(Math.floor(percent * 100)) / 10000n;

    if (amount === 0n) {
        console.log(`[${label}] 自转金额过小，跳过`);
        return null;
    }

    console.log(`[${label}] 自转 ETH | 金额: ${ethers.formatEther(amount)} ETH (${percent.toFixed(2)}%)`);

    const tx = await wallet.sendTransaction({
        to: wallet.address,
        value: amount,
    });

    console.log(`[${label}] 自转 tx 已发送: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`[${label}] 自转 tx 确认: 区块 ${receipt.blockNumber} | gas: ${receipt.gasUsed.toString()}`);
    return receipt;
}
