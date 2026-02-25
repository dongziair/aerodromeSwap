import 'dotenv/config';

// Aerodrome Router V2
export const ROUTER_ADDRESS = '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43';
// Aerodrome PoolFactory
export const POOL_FACTORY = '0x420DD381b31aEf6683db6B902084cB0FFECe40Da';
// AERO token
export const AERO_ADDRESS = '0x940181a94A35A4569E4529A3CDFb74e38FD98631';
// WETH on Base
export const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';

// swap 金额范围（单位 ETH）
export const MIN_SWAP_ETH = 0.00001;
export const MAX_SWAP_ETH = 0.00006;

// 每日 swap 交互次数范围（从 .env 读取）
export const MIN_DAILY_SWAPS = parseInt(process.env.MIN_DAILY_SWAPS || '50', 10);
export const MAX_DAILY_SWAPS = parseInt(process.env.MAX_DAILY_SWAPS || '80', 10);

// 每日自转次数范围
export const MIN_DAILY_SELF_TRANSFERS = parseInt(process.env.MIN_DAILY_SELF_TRANSFERS || '10', 10);
export const MAX_DAILY_SELF_TRANSFERS = parseInt(process.env.MAX_DAILY_SELF_TRANSFERS || '30', 10);

// 自转金额占余额百分比范围
export const SELF_TRANSFER_MIN_PERCENT = parseFloat(process.env.SELF_TRANSFER_MIN_PERCENT || '1');
export const SELF_TRANSFER_MAX_PERCENT = parseFloat(process.env.SELF_TRANSFER_MAX_PERCENT || '5');

// gas 上限（gwei），超过则暂停
export const MAX_GAS_GWEI = parseFloat(process.env.MAX_GAS_GWEI || '0.05');

// slippage 范围（百分比）
export const MIN_SLIPPAGE = 3;
export const MAX_SLIPPAGE = 8;

// swap deadline（秒）
export const SWAP_DEADLINE_SECONDS = 1200;

// 两笔 swap 之间的等待范围（秒）
export const MIN_WAIT_BETWEEN_SWAPS = 30;
export const MAX_WAIT_BETWEEN_SWAPS = 120;

// 一对 swap（买+卖）之间的等待范围（秒）
export const MIN_WAIT_IN_PAIR = 30;
export const MAX_WAIT_IN_PAIR = 90;

// 长休息概率和时长（秒）
export const LONG_BREAK_CHANCE = 0.1;
export const LONG_BREAK_MIN = 300;
export const LONG_BREAK_MAX = 900;

// gas 检查轮询间隔（秒）
export const GAS_CHECK_INTERVAL = 30;

// 活跃时段（UTC+8 时区，24 小时制，8:00~24:00）
export const ACTIVE_HOURS_START = 8;
export const ACTIVE_HOURS_END = 24;
export const TIMEZONE_OFFSET = 8;

// RPC
export const RPC_URL = process.env.RPC_URL || 'https://mainnet.base.org';

// 私钥列表
export const PRIVATE_KEYS = (process.env.PRIVATE_KEYS || '')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);

// 代理列表
export const PROXIES = (process.env.PROXIES || '')
  .split(',')
  .map(p => p.trim())
  .filter(Boolean);

// Aerodrome Router ABI（仅需用到的方法）
export const ROUTER_ABI = [
  'function swapExactETHForTokens(uint amountOutMin, (address from, address to, bool stable, address factory)[] routes, address to, uint deadline) payable returns (uint[] amounts)',
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, (address from, address to, bool stable, address factory)[] routes, address to, uint deadline) returns (uint[] amounts)',
  'function getAmountsOut(uint amountIn, (address from, address to, bool stable, address factory)[] routes) view returns (uint[] amounts)',
];

// ERC20 ABI（approve + balanceOf）
export const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
];
