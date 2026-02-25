import {
    MIN_SWAP_ETH, MAX_SWAP_ETH,
    MIN_SLIPPAGE, MAX_SLIPPAGE,
    MIN_WAIT_BETWEEN_SWAPS, MAX_WAIT_BETWEEN_SWAPS,
    MIN_WAIT_IN_PAIR, MAX_WAIT_IN_PAIR,
    LONG_BREAK_CHANCE, LONG_BREAK_MIN, LONG_BREAK_MAX,
    MIN_DAILY_SWAPS, MAX_DAILY_SWAPS,
    MIN_DAILY_SELF_TRANSFERS, MAX_DAILY_SELF_TRANSFERS,
    SELF_TRANSFER_MIN_PERCENT, SELF_TRANSFER_MAX_PERCENT,
    ACTIVE_HOURS_START, ACTIVE_HOURS_END, TIMEZONE_OFFSET,
} from './config.js';

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * 获取 UTC+8 当前小时
 */
function getUTC8Hour() {
    const now = new Date();
    const utcHour = now.getUTCHours();
    return (utcHour + TIMEZONE_OFFSET) % 24;
}

export function randomSwapAmount() {
    const raw = randFloat(MIN_SWAP_ETH, MAX_SWAP_ETH);
    const decimals = randInt(5, 6);
    return parseFloat(raw.toFixed(decimals));
}

export function randomSlippage() {
    return randInt(MIN_SLIPPAGE, MAX_SLIPPAGE);
}

export function randomDailyCount() {
    return randInt(MIN_DAILY_SWAPS, MAX_DAILY_SWAPS);
}

export function randomSelfTransferCount() {
    return randInt(MIN_DAILY_SELF_TRANSFERS, MAX_DAILY_SELF_TRANSFERS);
}

/**
 * 随机自转百分比（1%~5%）
 */
export function randomSelfTransferPercent() {
    return randFloat(SELF_TRANSFER_MIN_PERCENT, SELF_TRANSFER_MAX_PERCENT);
}

export function randomPairWait() {
    return randInt(MIN_WAIT_IN_PAIR, MAX_WAIT_IN_PAIR);
}

export function randomBetweenWait() {
    if (Math.random() < LONG_BREAK_CHANCE) {
        return randInt(LONG_BREAK_MIN, LONG_BREAK_MAX);
    }
    return randInt(MIN_WAIT_BETWEEN_SWAPS, MAX_WAIT_BETWEEN_SWAPS);
}

/**
 * 判断当前是否在活跃时段（UTC+8 8:00~24:00）
 */
export function isActiveHours() {
    const hour = getUTC8Hour();
    return hour >= ACTIVE_HOURS_START && hour < ACTIVE_HOURS_END;
}

/**
 * 等待到活跃时段开始（UTC+8）
 */
export async function waitForActiveHours(label) {
    while (!isActiveHours()) {
        const now = new Date();
        const utcHour = now.getUTCHours();
        const utc8Hour = (utcHour + TIMEZONE_OFFSET) % 24;
        let hoursToWait;
        if (utc8Hour >= ACTIVE_HOURS_END) {
            hoursToWait = 24 - utc8Hour + ACTIVE_HOURS_START;
        } else {
            hoursToWait = ACTIVE_HOURS_START - utc8Hour;
        }
        const waitMin = hoursToWait * 60 - now.getUTCMinutes();
        console.log(`[${label}] 当前 UTC+8 ${utc8Hour}:00，非活跃时段，等待约 ${waitMin} 分钟后开始...`);
        await new Promise(r => setTimeout(r, Math.min(waitMin * 60000, 600000)));
    }
}

export function sleep(seconds) {
    return new Promise(r => setTimeout(r, seconds * 1000));
}
