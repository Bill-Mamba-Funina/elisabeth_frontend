"use client";

import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: "positive" | "negative" | "neutral";
}

export default function StatCard({
  title,
  value,
  description,
  trend = "neutral",
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>
        </div>
      </div>

      {description && (
        <div className="mt-3">
          <p
            className={`text-xs ${
              trend === "positive"
                ? "text-emerald-600"
                : trend === "negative"
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {description}
          </p>
        </div>
      )}
    </div>
  );
}