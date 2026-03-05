"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  BanknotesIcon,
  BoltIcon,
  ChartBarIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  WalletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import MobileLayout from "@/components/layout/MobileLayout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Auth } from "@/library/auth";
import TransactionDetailModal from "@/components/wallet/TransactionDetailModal";

type WalletView = "wallet" | "statistic" | "topup";
type StatRange = "weekly" | "monthly";
type FlowAction = "transfer" | "withdraw" | "topup";
type FlowStep = "input" | "review" | "success";

interface WalletStats {
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalSpent: number;
  neoPoints: number;
  level: number;
}

interface WalletTransaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  currencyLabel: string;
  type: "credit" | "debit";
  timestamp?: string;
}

interface LegacyWalletTransaction {
  id: string;
  type?: "received" | "sent" | "reward" | "bonus";
  amount: number;
  description?: string;
  timestamp?: string;
}

interface TopUpMethod {
  id: string;
  label: string;
  detail: string;
}

const MAX_WALLET_VALUE = 99_999_999;

const topUpMethods: TopUpMethod[] = [
  { id: "bank", label: "Bank Transfer", detail: "•••• •••• •••• 5324" },
  { id: "paypal", label: "PayPal", detail: "freelancer@lenno.app" },
  { id: "payoneer", label: "Payoneer", detail: "Lenno Workspace" },
  { id: "usdc", label: "USDC Wallet", detail: "ERC20 / Polygon" },
];

const defaultTransactions: WalletTransaction[] = [
  {
    id: "tx-1",
    title: "Transfer For Jason",
    date: "March 18, 2024",
    amount: 230,
    currencyLabel: "Lenno Cash",
    type: "credit",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "tx-2",
    title: "Payment Figma Pro",
    date: "March 17, 2024",
    amount: -50,
    currencyLabel: "Lenno Cash",
    type: "debit",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "tx-3",
    title: "Payment Apple Music",
    date: "March 17, 2024",
    amount: -12,
    currencyLabel: "Lenno Cash",
    type: "debit",
    timestamp: new Date(Date.now() - 259200000).toISOString(),
  },
];

const defaultStats: WalletStats = {
  balance: 1459.7,
  pendingBalance: 0,
  totalEarned: 1459.7,
  totalSpent: 127.96,
  neoPoints: 320,
  level: 1,
};

const topUpAmounts = [5, 10, 20, 50, 100, 150, 200, 250];

function clampValue(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(MAX_WALLET_VALUE, Math.max(0, value));
}

function formatMoney(value: number, minimumFractionDigits = 2) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  });
}

function getAmountTextClass(displayText: string): string {
  if (displayText.length > 16) return "text-2xl sm:text-3xl";
  if (displayText.length > 12) return "text-2xl sm:text-3xl";
  return "text-4xl";
}

function getStatAmountClass(value: number): string {
  const display = formatMoney(value);
  if (display.length > 12) return "text-[11px] sm:text-xs";
  if (display.length > 9) return "text-xs sm:text-sm";
  return "text-sm sm:text-base";
}

function toIsoOrNow(dateLike?: string): string {
  if (!dateLike) return new Date().toISOString();
  const date = new Date(dateLike);
  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString();
}

function toDisplayDate(dateLike?: string): string {
  const date = new Date(toIsoOrNow(dateLike));
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeTransactions(raw: string | null): WalletTransaction[] {
  if (!raw) return defaultTransactions;

  try {
    const parsed = JSON.parse(raw) as Array<
      WalletTransaction | LegacyWalletTransaction
    >;
    if (!Array.isArray(parsed) || parsed.length === 0)
      return defaultTransactions;

    return parsed.map((item, index) => {
      if ("title" in item && "date" in item) {
        return {
          id: item.id || `tx-${index}`,
          title: item.title,
          date: item.date,
          amount:
            clampValue(Math.abs(item.amount)) * (item.amount >= 0 ? 1 : -1),
          currencyLabel: item.currencyLabel || "Lenno Cash",
          type: item.amount >= 0 ? "credit" : "debit",
          timestamp: toIsoOrNow(item.timestamp || item.date),
        };
      }

      const legacy = item as LegacyWalletTransaction;
      return {
        id: legacy.id || `legacy-${index}`,
        title: legacy.description || "Wallet activity",
        date: toDisplayDate(legacy.timestamp),
        amount:
          clampValue(Math.abs(legacy.amount)) * (legacy.amount >= 0 ? 1 : -1),
        currencyLabel: "Lenno Cash",
        type: legacy.amount >= 0 ? "credit" : "debit",
        timestamp: toIsoOrNow(legacy.timestamp),
      };
    });
  } catch {
    return defaultTransactions;
  }
}

function useAnimatedNumber(targetValue: number, duration = 450) {
  const [displayValue, setDisplayValue] = useState(targetValue);

  useEffect(() => {
    let frame = 0;
    const startValue = displayValue;
    const difference = targetValue - startValue;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + difference * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [targetValue, displayValue, duration]);

  return displayValue;
}

export default function WalletPage() {
  const [view, setView] = useState<WalletView>("wallet");
  const [showBalance, setShowBalance] = useState(true);
  const [statRange, setStatRange] = useState<StatRange>("weekly");
  const [activeBarIndex, setActiveBarIndex] = useState(3);
  const [selectedMethod, setSelectedMethod] = useState(topUpMethods[0].id);
  const [selectedTopUpAmount, setSelectedTopUpAmount] = useState(200);
  const [topUpInput, setTopUpInput] = useState("200");
  const [isAmountEditing, setIsAmountEditing] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<WalletTransaction | null>(null);
  const [flowAction, setFlowAction] = useState<FlowAction | null>(null);
  const [flowStep, setFlowStep] = useState<FlowStep>("input");
  const [flowAmountInput, setFlowAmountInput] = useState("25");
  const [flowTarget, setFlowTarget] = useState("");
  const [flowError, setFlowError] = useState("");
  const [flowDraftAmount, setFlowDraftAmount] = useState(0);
  const [flowDraftTarget, setFlowDraftTarget] = useState("");
  const [walletStats, setWalletStats] = useState<WalletStats>(defaultStats);
  const [transactions, setTransactions] =
    useState<WalletTransaction[]>(defaultTransactions);

  const displayBalance = useAnimatedNumber(walletStats.balance);
  const displayConnects = useAnimatedNumber(walletStats.neoPoints, 520);

  useEffect(() => {
    const user = Auth.getCurrentUser();
    if (!user) {
      window.location.href = "/auth/signup";
      return;
    }

    const statsKey = `wallet_stats_${user.id}`;
    const txKey = `wallet_transactions_${user.id}`;

    try {
      const rawStats = window.localStorage.getItem(statsKey);
      const rawTx = window.localStorage.getItem(txKey);

      if (rawStats) {
        const parsed = JSON.parse(rawStats) as Partial<WalletStats>;
        setWalletStats((previous) => ({
          ...previous,
          ...parsed,
          balance: clampValue(parsed.balance ?? previous.balance),
          pendingBalance: clampValue(
            parsed.pendingBalance ?? previous.pendingBalance,
          ),
          totalEarned: clampValue(parsed.totalEarned ?? previous.totalEarned),
          totalSpent: clampValue(parsed.totalSpent ?? previous.totalSpent),
          neoPoints: clampValue(parsed.neoPoints ?? previous.neoPoints),
        }));
      }

      setTransactions(normalizeTransactions(rawTx));
    } catch {
      setWalletStats(defaultStats);
      setTransactions(defaultTransactions);
    }
  }, []);

  useEffect(() => {
    const numericAmount = Number(topUpInput.replace(/,/g, ""));
    if (!Number.isNaN(numericAmount) && numericAmount > 0) {
      setSelectedTopUpAmount(clampValue(numericAmount));
    }
  }, [topUpInput]);

  const normalizedTopUpInput = useMemo(() => {
    const parsed = Number(topUpInput.replace(/,/g, ""));
    return Number.isNaN(parsed) ? 0 : clampValue(parsed);
  }, [topUpInput]);

  const selectedMethodLabel =
    topUpMethods.find((method) => method.id === selectedMethod)?.label ||
    "Bank Transfer";

  const topUpTax = useMemo(() => {
    const percentageTax = selectedTopUpAmount * 0.005;
    return Number((1 + percentageTax).toFixed(2));
  }, [selectedTopUpAmount]);

  const topUpTotal = useMemo(() => {
    return Number((selectedTopUpAmount + topUpTax).toFixed(2));
  }, [selectedTopUpAmount, topUpTax]);

  const weeklyData = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return labels.map((label, index) => {
      const tx = transactions[index] || transactions[transactions.length - 1];
      const magnitude = Math.min(100, Math.max(18, Math.abs(tx?.amount || 0)));
      return { label, value: magnitude };
    });
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const labels = ["W1", "W2", "W3", "W4"];
    return labels.map((label, index) => {
      const source =
        transactions[index] || transactions[transactions.length - 1];
      const magnitude = Math.min(
        100,
        Math.max(24, Math.abs(source?.amount || 0) + index * 5),
      );
      return { label, value: magnitude };
    });
  }, [transactions]);

  const chartData = statRange === "weekly" ? weeklyData : monthlyData;
  const activeDataPoint = chartData[activeBarIndex] || chartData[0];

  const incomeTotal = useMemo(
    () =>
      transactions
        .filter((item) => item.amount > 0)
        .reduce((sum, item) => sum + item.amount, 0),
    [transactions],
  );

  const expenseTotal = useMemo(
    () =>
      Math.abs(
        transactions
          .filter((item) => item.amount < 0)
          .reduce((sum, item) => sum + item.amount, 0),
      ),
    [transactions],
  );

  const persistWallet = (
    nextStats: WalletStats,
    nextTransactions: WalletTransaction[],
  ) => {
    const user = Auth.getCurrentUser();
    if (!user) return;

    try {
      window.localStorage.setItem(
        `wallet_stats_${user.id}`,
        JSON.stringify(nextStats),
      );
      window.localStorage.setItem(
        `wallet_transactions_${user.id}`,
        JSON.stringify(nextTransactions),
      );
    } catch {
      // ignore write failures
    }
  };

  const resetFlow = () => {
    setFlowAction(null);
    setFlowStep("input");
    setFlowAmountInput("25");
    setFlowTarget("");
    setFlowError("");
    setFlowDraftAmount(0);
    setFlowDraftTarget("");
  };

  const handleStartPayFlow = () => {
    if (!flowAction) return;

    const parsedAmount = Number(flowAmountInput.replace(/,/g, ""));
    const amount = clampValue(Number.isNaN(parsedAmount) ? 0 : parsedAmount);

    if (amount <= 0) {
      setFlowError("Enter a valid amount.");
      return;
    }

    if (flowAction !== "topup" && amount > walletStats.balance) {
      setFlowError("Insufficient balance for this action.");
      return;
    }

    const recipient = flowTarget.trim();
    if (!recipient) {
      setFlowError("Enter receiver name or destination.");
      return;
    }

    setFlowDraftAmount(amount);
    setFlowDraftTarget(recipient);
    setFlowError("");
    setFlowStep("review");
  };

  const handleConfirmPay = () => {
    if (!flowAction) return;

    const isTopUp = flowAction === "topup";
    const title = isTopUp
      ? `Top Up via ${flowDraftTarget}`
      : flowAction === "transfer"
        ? `Transfer to ${flowDraftTarget}`
        : `Withdraw to ${flowDraftTarget}`;

    const nextStats: WalletStats = isTopUp
      ? {
          ...walletStats,
          balance: clampValue(
            Number((walletStats.balance + flowDraftAmount).toFixed(2)),
          ),
          totalEarned: clampValue(
            Number((walletStats.totalEarned + flowDraftAmount).toFixed(2)),
          ),
          neoPoints: clampValue(
            walletStats.neoPoints +
              Math.max(1, Math.floor(flowDraftAmount / 10)),
          ),
        }
      : {
          ...walletStats,
          balance: clampValue(
            Number((walletStats.balance - flowDraftAmount).toFixed(2)),
          ),
          totalSpent: clampValue(
            Number((walletStats.totalSpent + flowDraftAmount).toFixed(2)),
          ),
        };

    const flowTransaction: WalletTransaction = {
      id: `tx-${Date.now()}`,
      title,
      date: toDisplayDate(),
      amount: isTopUp ? flowDraftAmount : -flowDraftAmount,
      currencyLabel: "Lenno Cash",
      type: isTopUp ? "credit" : "debit",
      timestamp: new Date().toISOString(),
    };

    const nextTransactions = [flowTransaction, ...transactions];
    setWalletStats(nextStats);
    setTransactions(nextTransactions);
    persistWallet(nextStats, nextTransactions);
    setFlowStep("success");
  };

  const handleBeginTopUpFlow = () => {
    if (selectedTopUpAmount <= 0) return;
    setFlowAction("topup");
    setFlowStep("review");
    setFlowDraftAmount(selectedTopUpAmount);
    setFlowDraftTarget(selectedMethodLabel);
    setFlowError("");
  };

  const balanceText = showBalance
    ? `$ ${formatMoney(displayBalance)}`
    : "$ ••••";
  const balanceTextClass = getAmountTextClass(balanceText);

  return (
    <MobileLayout>
      <div className="px-4 lg:px-6 py-4 bg-[#eef3f6] min-h-screen">
        <div className="max-w-[460px] mx-auto space-y-4">
          <div className="rounded-3xl bg-white border border-primary-200 p-4">
            <div className="inline-flex rounded-full border border-primary-200 bg-primary-50 p-1">
              {[
                { key: "wallet", label: "Wallet" },
                { key: "statistic", label: "Statistic" },
                { key: "topup", label: "Top Up" },
              ].map((item) => {
                const isActive = view === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setView(item.key as WalletView)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      isActive
                        ? "bg-[#0a4abf] text-white"
                        : "text-primary-700 hover:text-primary-900"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {view === "wallet" && (
              <>
                <div className="mt-4 rounded-3xl border border-primary-200 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary-500">
                      Lenno Cash Main Balance
                    </span>
                    <button
                      onClick={() => setShowBalance((previous) => !previous)}
                      className="text-primary-500"
                    >
                      {showBalance ? (
                        <EyeIcon className="w-5 h-5" />
                      ) : (
                        <EyeSlashIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <p
                    className={`font-semibold text-primary-900 mt-1 whitespace-nowrap leading-tight ${balanceTextClass}`}
                  >
                    {balanceText}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-primary-700">
                    <div>
                      <p className="text-xs text-primary-500">Wallet Number</p>
                      <p className="font-medium">•••• •••• •••• 5324</p>
                    </div>
                    <div>
                      <p className="text-xs text-primary-500">Lenno Connects</p>
                      <p className="font-medium">
                        {Math.round(displayConnects).toLocaleString("en-US")}{" "}
                        Connects
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-primary-500 mt-2">
                    Lenno Connects work like proposal credits, similar to Upwork
                    Connects.
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => {
                        setFlowAction("transfer");
                        setFlowStep("input");
                        setFlowError("");
                        setFlowTarget("");
                        setFlowAmountInput("25");
                      }}
                      className="rounded-full bg-[#abff31] text-primary-900 hover:bg-[#9ae62c]"
                    >
                      <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
                      Transfer
                    </Button>
                    <Button
                      onClick={() => {
                        setFlowAction("withdraw");
                        setFlowStep("input");
                        setFlowError("");
                        setFlowTarget(selectedMethodLabel);
                        setFlowAmountInput("25");
                      }}
                      className="rounded-full bg-[#abff31] text-primary-900 hover:bg-[#9ae62c]"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                      Withdraw
                    </Button>
                  </div>
                </div>
              </>
            )}

            {view === "statistic" && (
              <div className="mt-4 rounded-3xl border border-primary-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs text-primary-500">Total Expense</p>
                    <p
                      className={`font-semibold text-primary-900 mt-1 whitespace-nowrap ${getAmountTextClass(
                        `-$ ${formatMoney(expenseTotal)}`,
                      )}`}
                    >
                      -$ {formatMoney(expenseTotal)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 w-full sm:w-auto rounded-full border border-primary-200 bg-primary-50 p-1">
                    {(["weekly", "monthly"] as StatRange[]).map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setStatRange(range);
                          setActiveBarIndex(0);
                        }}
                        className={`px-2 py-1 rounded-full text-xs text-center whitespace-nowrap ${
                          statRange === range
                            ? "bg-[#abff31] text-primary-900"
                            : "text-primary-700"
                        }`}
                      >
                        {range === "weekly" ? "Weekly" : "Monthly"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-7 gap-1 items-end h-28">
                  {chartData.map((point, index) => (
                    <button
                      key={point.label}
                      onClick={() => setActiveBarIndex(index)}
                      className="flex flex-col items-center gap-1"
                    >
                      <div
                        className={`w-8 rounded-full transition-all duration-500 ${
                          activeBarIndex === index
                            ? "bg-[#abff31]"
                            : "bg-primary-100"
                        }`}
                        style={{ height: `${point.value * 0.95}px` }}
                      />
                      <span className="text-[10px] text-primary-500">
                        {point.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-2 text-xs text-primary-600">
                  Selected: {activeDataPoint.label} • intensity{" "}
                  {Math.round(activeDataPoint.value)}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Card className="p-2 bg-white border border-gray-200 shadow-none">
                    <p className="text-xs text-primary-500">Income</p>
                    <p
                      className={`font-semibold text-primary-900 leading-tight break-words ${getStatAmountClass(
                        incomeTotal,
                      )}`}
                    >
                      +$ {formatMoney(incomeTotal)}
                    </p>
                  </Card>
                  <Card className="p-2 bg-white border border-gray-200 shadow-none">
                    <p className="text-xs text-primary-500">Expense</p>
                    <p
                      className={`font-semibold text-primary-900 leading-tight break-words ${getStatAmountClass(
                        expenseTotal,
                      )}`}
                    >
                      -$ {formatMoney(expenseTotal)}
                    </p>
                  </Card>
                </div>
              </div>
            )}

            {view === "topup" && (
              <div className="mt-4 space-y-3">
                <Card className="border border-primary-200 p-3 bg-white">
                  <p className="text-xs text-primary-500">Top Up Methods</p>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {topUpMethods.map((method) => {
                      const isActive = selectedMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`rounded-2xl border p-3 text-left transition-colors ${
                            isActive
                              ? "border-[#abff31] bg-[#f5ffe5]"
                              : "border-primary-200 hover:border-primary-300"
                          }`}
                        >
                          <p className="text-sm font-medium text-primary-900">
                            {method.label}
                          </p>
                          <p className="text-xs text-primary-500">
                            {method.detail}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                <Card className="border border-primary-200 p-3 bg-white">
                  <p className="text-xs text-primary-500">Top Up Amount</p>
                  <div className="mt-1 flex items-center gap-2 rounded-2xl border border-primary-200 px-3 py-2">
                    <span className="text-primary-600">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={
                        isAmountEditing
                          ? topUpInput
                          : formatMoney(normalizedTopUpInput)
                      }
                      onFocus={() => {
                        setIsAmountEditing(true);
                        setTopUpInput(String(normalizedTopUpInput));
                      }}
                      onBlur={() => {
                        setIsAmountEditing(false);
                        setTopUpInput(String(normalizedTopUpInput));
                      }}
                      onChange={(event) => {
                        const rawValue = event.target.value.replace(/,/g, "");
                        if (!/^\d*(\.\d{0,2})?$/.test(rawValue)) return;
                        const numericValue = Number(rawValue || "0");
                        if (numericValue > MAX_WALLET_VALUE) {
                          setTopUpInput(String(MAX_WALLET_VALUE));
                          setSelectedTopUpAmount(MAX_WALLET_VALUE);
                          return;
                        }
                        setTopUpInput(rawValue);
                      }}
                      className={`w-full font-semibold text-primary-900 bg-transparent outline-none whitespace-nowrap ${
                        normalizedTopUpInput >= 1_000_000
                          ? "text-3xl sm:text-4xl"
                          : "text-4xl"
                      }`}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {topUpAmounts.map((amount) => {
                      const isActive = selectedTopUpAmount === amount;
                      return (
                        <button
                          key={amount}
                          onClick={() => {
                            setSelectedTopUpAmount(amount);
                            setTopUpInput(String(amount));
                          }}
                          className={`rounded-full border px-2 py-1.5 text-sm ${
                            isActive
                              ? "bg-[#abff31] border-[#9ae62c] text-primary-900 font-medium"
                              : "border-primary-200 text-primary-700"
                          }`}
                        >
                          $ {amount}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={handleBeginTopUpFlow}
                    className="mt-4 w-full rounded-full bg-[#abff31] text-primary-900 hover:bg-[#9ae62c]"
                  >
                    <BoltIcon className="w-4 h-4 mr-2" />
                    Top Up
                  </Button>
                </Card>

                <Card className="border border-primary-200 p-3 bg-white">
                  <p className="text-sm font-medium text-primary-900 mb-2">
                    Detail Top up
                  </p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between text-primary-600">
                      <span>From</span>
                      <span>{selectedMethodLabel}</span>
                    </div>
                    <div className="flex items-center justify-between text-primary-600">
                      <span>To</span>
                      <span>Top Up Lenno</span>
                    </div>
                    <div className="flex items-center justify-between text-primary-600">
                      <span>Amount</span>
                      <span>$ {formatMoney(selectedTopUpAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-primary-600">
                      <span>Tax</span>
                      <span>$ {formatMoney(topUpTax)}</span>
                    </div>
                    <div className="flex items-center justify-between font-semibold text-primary-900 pt-1 border-t border-primary-100">
                      <span>Total</span>
                      <span>$ {formatMoney(topUpTotal)}</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary-900">
                  Recent Transaction
                </h3>
                <button
                  className="text-sm text-primary-500 underline"
                  onClick={() => setIsHistoryModalOpen(true)}
                >
                  View all
                </button>
              </div>

              <div className="mt-2 space-y-2">
                {transactions.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedTransaction(item)}
                    className="w-full rounded-2xl border border-primary-200 bg-white px-3 py-2 flex items-center justify-between text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-primary-900">
                        {item.title}
                      </p>
                      <p className="text-xs text-primary-500">{item.date}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${item.amount >= 0 ? "text-[#2e7b4d]" : "text-primary-800"}`}
                      >
                        {item.amount >= 0 ? "+" : "-"}${" "}
                        {formatMoney(Math.abs(item.amount))}
                      </p>
                      <p className="text-xs text-primary-500">
                        {item.currencyLabel}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-primary-200 bg-white p-3 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-primary-700 text-sm">
              <ChartBarIcon className="w-5 h-5" />
              <span>
                Interactive insights update automatically from wallet activity
              </span>
            </div>
            <CheckCircleIcon className="w-5 h-5 text-[#2e7b4d]" />
          </div>

          <div className="rounded-2xl border border-primary-200 bg-white p-3 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-primary-700 text-sm">
              <WalletIcon className="w-5 h-5" />
              <span>Lenno Connects available for proposal submissions</span>
            </div>
            <BanknotesIcon className="w-5 h-5 text-[#0a4abf]" />
          </div>
        </div>

        <TransactionDetailModal
          open={!!selectedTransaction}
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          formatAmount={(value) => formatMoney(value)}
        />

        {flowAction && (
          <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
            <button
              className="absolute inset-0 bg-[#0a4abf]/20"
              onClick={resetFlow}
            />
            <div className="relative w-full max-w-sm rounded-3xl border border-primary-200 bg-white p-5">
              <button
                onClick={resetFlow}
                className="absolute right-4 top-4 h-8 w-8 rounded-full border border-primary-200 flex items-center justify-center text-primary-700 hover:bg-primary-50"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>

              {flowStep === "input" && (
                <>
                  <p className="text-xs uppercase tracking-wide text-primary-500">
                    Quick action
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-primary-900 capitalize">
                    {flowAction}
                  </h3>
                  <p className="mt-1 text-sm text-primary-600">
                    {flowAction === "transfer"
                      ? "Send funds to another freelancer or collaborator."
                      : flowAction === "topup"
                        ? "Add funds from your selected method to your wallet."
                        : "Move wallet funds to your selected payout destination."}
                  </p>

                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-xs text-primary-500">
                        Receiver / Destination
                      </label>
                      <input
                        type="text"
                        value={flowTarget}
                        onChange={(event) => {
                          setFlowTarget(event.target.value);
                          setFlowError("");
                        }}
                        placeholder={
                          flowAction === "transfer"
                            ? "Enter receiver name"
                            : selectedMethodLabel
                        }
                        className="mt-1 w-full rounded-2xl border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-primary-500">Amount</label>
                      <div className="mt-1 flex items-center rounded-2xl border border-primary-200 px-3 py-2">
                        <span className="text-primary-600 mr-2">$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={flowAmountInput}
                          onChange={(event) => {
                            const rawValue = event.target.value.replace(
                              /,/g,
                              "",
                            );
                            if (!/^\d*(\.\d{0,2})?$/.test(rawValue)) return;
                            const numericValue = Number(rawValue || "0");
                            setFlowAmountInput(
                              numericValue > MAX_WALLET_VALUE
                                ? String(MAX_WALLET_VALUE)
                                : rawValue,
                            );
                            setFlowError("");
                          }}
                          className="w-full bg-transparent text-lg font-semibold text-primary-900 outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl bg-primary-50 border border-primary-100 p-3 text-xs text-primary-700">
                      Available balance: $ {formatMoney(walletStats.balance)}
                    </div>

                    {flowError && (
                      <p className="text-xs text-red-600">{flowError}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={resetFlow}
                        className="rounded-full border border-primary-200 px-4 py-2 text-sm text-primary-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleStartPayFlow}
                        className="rounded-full bg-[#abff31] px-4 py-2 text-sm font-medium text-primary-900 hover:bg-[#9ae62c]"
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                </>
              )}

              {flowStep === "review" && (
                <>
                  <p className="text-xs uppercase tracking-wide text-primary-500">
                    Payment overview
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-primary-900">
                    {flowAction === "topup"
                      ? "You are about to top up your wallet"
                      : "You are about to send a payment"}
                  </h3>
                  <p className="mt-1 text-sm text-primary-600">
                    {flowAction === "topup"
                      ? "Please confirm the source method and amount before we process this top up."
                      : "Please confirm the receiver and amount below before we process this payment."}
                  </p>

                  <div className="mt-4 rounded-2xl bg-primary-50 border border-primary-100 p-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between text-primary-600">
                      <span>
                        {flowAction === "topup" ? "Method" : "Receiver"}
                      </span>
                      <span className="font-medium text-primary-900">
                        {flowDraftTarget}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-primary-600">
                      <span>Amount</span>
                      <span className="font-semibold text-primary-900">
                        $ {formatMoney(flowDraftAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-primary-600">
                      <span>Action</span>
                      <span className="capitalize text-primary-900">
                        {flowAction}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFlowStep("input")}
                      className="rounded-full border border-primary-200 px-4 py-2 text-sm text-primary-700"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirmPay}
                      className="rounded-full bg-[#abff31] px-4 py-2 text-sm font-medium text-primary-900 hover:bg-[#9ae62c]"
                    >
                      {flowAction === "topup"
                        ? "Confirm top up"
                        : "Confirm pay"}
                    </button>
                  </div>
                </>
              )}

              {flowStep === "success" && (
                <>
                  <p className="text-xs uppercase tracking-wide text-primary-500">
                    Success
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-primary-900">
                    {flowAction === "topup"
                      ? "Top up completed"
                      : "Payment completed"}
                  </h3>
                  <p className="mt-1 text-sm text-primary-600">
                    {flowAction === "topup"
                      ? `$ ${formatMoney(flowDraftAmount)} was added successfully from ${flowDraftTarget}.`
                      : `$ ${formatMoney(flowDraftAmount)} was transferred successfully to ${flowDraftTarget}.`}
                  </p>

                  <div className="mt-4 rounded-2xl bg-[#f5ffe5] border border-[#d4efaa] p-3 text-sm text-primary-800">
                    <p className="font-medium">
                      {flowAction === "topup"
                        ? "Top up successful"
                        : "Transfer successful"}
                    </p>
                    <p className="mt-1">
                      {flowAction === "topup" ? "Method" : "Receiver"}:{" "}
                      {flowDraftTarget}
                    </p>
                    <p>Amount: $ {formatMoney(flowDraftAmount)}</p>
                  </div>

                  <button
                    onClick={resetFlow}
                    className="mt-4 w-full rounded-full bg-[#abff31] px-4 py-2 text-sm font-medium text-primary-900 hover:bg-[#9ae62c]"
                  >
                    Done
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-[74] flex items-center justify-center p-4">
            <button
              className="absolute inset-0 bg-[#0a4abf]/20"
              onClick={() => setIsHistoryModalOpen(false)}
            />
            <div className="relative w-full max-w-md rounded-3xl border border-primary-200 bg-white p-5">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="absolute right-4 top-4 h-8 w-8 rounded-full border border-primary-200 flex items-center justify-center text-primary-700 hover:bg-primary-50"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>

              <p className="text-xs uppercase tracking-wide text-primary-500">
                History
              </p>
              <h3 className="mt-1 text-xl font-semibold text-primary-900">
                Transaction history
              </h3>

              <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-2 pr-1">
                {transactions.map((item) => (
                  <button
                    key={`history-modal-${item.id}`}
                    onClick={() => {
                      setSelectedTransaction(item);
                      setIsHistoryModalOpen(false);
                    }}
                    className="w-full rounded-xl border border-primary-100 px-3 py-2 flex items-center justify-between text-left hover:bg-primary-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-primary-900">
                        {item.title}
                      </p>
                      <p className="text-xs text-primary-500">{item.date}</p>
                    </div>
                    <p className="text-sm font-semibold text-primary-800">
                      {item.amount >= 0 ? "+" : "-"}${" "}
                      {formatMoney(Math.abs(item.amount))}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
