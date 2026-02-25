import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import { ethers } from 'ethers';
import { setupWallets } from './proxyManager.js';
import { waitForLowGas } from './gasChecker.js';
import { swapETHtoAERO, swapAEROtoETH } from './swap.js';
import { selfTransferETH } from './selfTransfer.js';
import {
    randomSwapAmount, randomDailyCount, randomSelfTransferCount,
    randomPairWait, randomBetweenWait,
    waitForActiveHours, isActiveHours, sleep,
} from './humanSimulator.js';
import { TIMEZONE_OFFSET } from './config.js';

function timestamp() {
    const now = new Date();
    const utc8 = new Date(now.getTime() + TIMEZONE_OFFSET * 3600000);
    return utc8.toISOString().replace('T', ' ').slice(0, 19) + ' UTC+8';
}

/**
 * 单个钱包的主循环
 */
async function runWalletLoop(wallet, provider, label) {
    while (true) {
        await waitForActiveHours(label);

        const swapCount = randomDailyCount();
        const selfCount = randomSelfTransferCount();
        const totalActions = swapCount + selfCount;

        // 构建今天的操作队列：swap 和 selfTransfer 随机打乱
        const actions = [
            ...Array(swapCount).fill('swap'),
            ...Array(selfCount).fill('self'),
        ];
        for (let i = actions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [actions[i], actions[j]] = [actions[j], actions[i]];
        }

        console.log(`\n[${timestamp()}][${label}] ===== 今日计划: ${swapCount} 次 swap + ${selfCount} 次自转 = ${totalActions} 次 =====`);

        let completed = 0;

        for (const action of actions) {
            if (!isActiveHours()) {
                console.log(`[${timestamp()}][${label}] 已过活跃时段，今日完成 ${completed}/${totalActions} 次`);
                break;
            }

            await waitForLowGas(provider, label);
            completed++;
            console.log(`\n[${timestamp()}][${label}] --- 第 ${completed}/${totalActions} 次 [${action === 'swap' ? 'SWAP' : '自转'}] ---`);

            if (action === 'self') {
                try {
                    await selfTransferETH(wallet, provider, label);
                } catch (err) {
                    console.error(`[${timestamp()}][${label}] 自转失败: ${err.message}`);
                    await sleep(60);
                }
            } else {
                const amount = randomSwapAmount();
                try {
                    await swapETHtoAERO(wallet, amount, label);
                } catch (err) {
                    console.error(`[${timestamp()}][${label}] ETH→AERO 失败: ${err.message}`);
                    await sleep(60);
                    continue;
                }

                const pairWait = randomPairWait();
                console.log(`[${timestamp()}][${label}] 等待 ${pairWait}s 后执行反向 swap...`);
                await sleep(pairWait);

                await waitForLowGas(provider, label);

                try {
                    await swapAEROtoETH(wallet, label);
                } catch (err) {
                    console.error(`[${timestamp()}][${label}] AERO→ETH 失败: ${err.message}`);
                    await sleep(60);
                }
            }

            // 两次操作间随机等待
            const betweenWait = randomBetweenWait();
            console.log(`[${timestamp()}][${label}] 等待 ${betweenWait}s 后开始下一次操作...`);
            await sleep(betweenWait);
        }

        console.log(`[${timestamp()}][${label}] 今日已完成 ${completed} 次操作，等待明天...`);
        await waitForActiveHours(label);
    }
}

async function main() {
    console.log('========================================');
    console.log('  Aerodrome ETH ↔ AERO 自动交互脚本');
    console.log('  （含自转 ETH + UTC+8 时区）');
    console.log('========================================\n');

    const walletInfos = setupWallets();
    console.log(`\n已加载 ${walletInfos.length} 个钱包\n`);

    for (const { wallet, provider, label } of walletInfos) {
        const balance = await provider.getBalance(wallet.address);
        console.log(`[${label}] 地址: ${wallet.address} | 余额: ${ethers.formatEther(balance)} ETH`);
    }
    console.log('');

    const tasks = walletInfos.map(({ wallet, provider, label }) =>
        runWalletLoop(wallet, provider, label)
    );

    await Promise.all(tasks);
}

main().catch(err => {
    console.error('致命错误:', err);
    process.exit(1);
});
