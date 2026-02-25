import { ethers } from 'ethers';
import {
    ROUTER_ADDRESS, POOL_FACTORY,
    AERO_ADDRESS, WETH_ADDRESS,
    ROUTER_ABI, ERC20_ABI,
    SWAP_DEADLINE_SECONDS,
} from './config.js';
import { randomSlippage } from './humanSimulator.js';

/**
 * ETH → AERO：用指定数量的 ETH 换 AERO
 */
export async function swapETHtoAERO(wallet, amountETH, label) {
    const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, wallet);
    const amountIn = ethers.parseEther(amountETH.toString());

    const routes = [{
        from: WETH_ADDRESS,
        to: AERO_ADDRESS,
        stable: false,
        factory: POOL_FACTORY,
    }];

    // 预估输出
    const amountsOut = await router.getAmountsOut(amountIn, routes);
    const expectedOut = amountsOut[amountsOut.length - 1];

    // 随机 slippage
    const slippage = randomSlippage();
    const amountOutMin = expectedOut * BigInt(100 - slippage) / 100n;

    const deadline = Math.floor(Date.now() / 1000) + SWAP_DEADLINE_SECONDS;

    console.log(`[${label}] ETH → AERO | 投入: ${amountETH} ETH | 预期: ${ethers.formatUnits(expectedOut, 18)} AERO | slippage: ${slippage}%`);

    const tx = await router.swapExactETHForTokens(
        amountOutMin,
        routes,
        wallet.address,
        deadline,
        { value: amountIn }
    );

    console.log(`[${label}] tx 已发送: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`[${label}] tx 确认: 区块 ${receipt.blockNumber} | gas: ${receipt.gasUsed.toString()}`);
    return receipt;
}

/**
 * AERO → ETH：把钱包里所有 AERO 换回 ETH
 */
export async function swapAEROtoETH(wallet, label) {
    const aeroToken = new ethers.Contract(AERO_ADDRESS, ERC20_ABI, wallet);
    const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, wallet);

    const balance = await aeroToken.balanceOf(wallet.address);
    if (balance === 0n) {
        console.log(`[${label}] AERO 余额为 0，跳过`);
        return null;
    }

    // 检查授权额度
    const allowance = await aeroToken.allowance(wallet.address, ROUTER_ADDRESS);
    if (allowance < balance) {
        console.log(`[${label}] 授权 AERO 给 Router...`);
        const approveTx = await aeroToken.approve(ROUTER_ADDRESS, ethers.MaxUint256);
        await approveTx.wait();
        console.log(`[${label}] 授权完成`);
    }

    const routes = [{
        from: AERO_ADDRESS,
        to: WETH_ADDRESS,
        stable: false,
        factory: POOL_FACTORY,
    }];

    const amountsOut = await router.getAmountsOut(balance, routes);
    const expectedOut = amountsOut[amountsOut.length - 1];

    const slippage = randomSlippage();
    const amountOutMin = expectedOut * BigInt(100 - slippage) / 100n;
    const deadline = Math.floor(Date.now() / 1000) + SWAP_DEADLINE_SECONDS;

    console.log(`[${label}] AERO → ETH | 投入: ${ethers.formatUnits(balance, 18)} AERO | 预期: ${ethers.formatEther(expectedOut)} ETH | slippage: ${slippage}%`);

    const tx = await router.swapExactTokensForETH(
        balance,
        amountOutMin,
        routes,
        wallet.address,
        deadline
    );

    console.log(`[${label}] tx 已发送: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`[${label}] tx 确认: 区块 ${receipt.blockNumber} | gas: ${receipt.gasUsed.toString()}`);
    return receipt;
}
