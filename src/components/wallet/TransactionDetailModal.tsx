"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import Card from "@/components/ui/Card";

interface WalletTransaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  currencyLabel: string;
  type: "credit" | "debit";
  timestamp?: string;
}

interface TransactionDetailModalProps {
  open: boolean;
  transaction: WalletTransaction | null;
  onClose: () => void;
  formatAmount: (value: number) => string;
}

export default function TransactionDetailModal({
  open,
  transaction,
  onClose,
  formatAmount,
}: TransactionDetailModalProps) {
  if (!open || !transaction) return null;

  const signedAmount = transaction.amount >= 0 ? "+" : "-";
  const isCredit = transaction.amount >= 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#0a4abf]/20 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <Card className="relative w-full max-w-sm rounded-3xl p-5 bg-white border border-primary-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8 rounded-full border border-primary-200 flex items-center justify-center text-primary-700 hover:bg-primary-50"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <p className="text-xs uppercase tracking-wide text-primary-500">
          Notification
        </p>
        <h3 className="text-xl font-semibold text-primary-900 mt-1">
          Transaction detail
        </h3>
        <p className="text-sm text-primary-600 mt-1">
          Your payment record was updated successfully.
        </p>

        <div className="mt-4 space-y-2 text-sm rounded-2xl bg-primary-50 border border-primary-100 p-3">
          <div className="flex items-center justify-between text-primary-600">
            <span>Title</span>
            <span className="text-primary-900 font-medium">
              {transaction.title}
            </span>
          </div>
          <div className="flex items-center justify-between text-primary-600">
            <span>Date</span>
            <span className="text-primary-900">{transaction.date}</span>
          </div>
          <div className="flex items-center justify-between text-primary-600">
            <span>Type</span>
            <span className="capitalize text-primary-900">
              {transaction.type}
            </span>
          </div>
          <div className="flex items-center justify-between text-primary-600">
            <span>Currency</span>
            <span className="text-primary-900">
              {transaction.currencyLabel}
            </span>
          </div>
          <div className="flex items-center justify-between text-primary-600 pt-2 border-t border-primary-100">
            <span>Total</span>
            <span
              className={`font-semibold ${isCredit ? "text-[#2e7b4d]" : "text-primary-900"}`}
            >
              {signedAmount}$ {formatAmount(Math.abs(transaction.amount))}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-full bg-[#abff31] px-4 py-2.5 text-sm font-medium text-primary-900 hover:bg-[#9ae62c]"
        >
          Dismiss
        </button>
      </Card>
    </div>
  );
}
