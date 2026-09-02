'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#6366f1'];

interface AnalyticsChartsProps {
  monthlyData: { month: string; revenue: number; commission: number; orders: number }[];
  topSellers: { shopName: string; totalSales: number; totalUnits: number }[];
  topProducts: { name: string; totalRevenue: number; totalSold: number }[];
  categorySales: { name: string; totalRevenue: number; totalUnits: number }[];
  locationSales: {
    byProvince: { name: string; totalRevenue: number }[];
    byDistrict: { name: string; totalRevenue: number }[];
  };
}

const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl text-xs space-y-1">
        {label && <p className="font-bold text-gray-900 dark:text-slate-100 border-b border-gray-100 dark:border-slate-800 pb-1">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-gray-500 dark:text-slate-400 font-medium">{entry.name}:</span>
            <span className="font-bold text-gray-900 dark:text-slate-100">
              {formatter ? formatter(entry.value, entry.name) : formatPrice(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function AnalyticsCharts({
  monthlyData,
  topSellers,
  topProducts,
  categorySales,
  locationSales,
}: AnalyticsChartsProps) {
  return (
    <div className="space-y-8">
      {/* 1. Monthly Revenue & Commission Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Marketplace Revenue & Platform Commission Trend (LKR)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `Rs.${val}`}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Gross Sales"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="commission"
                  name="Platform Commission (10%)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCommission)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2. Top Sellers & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Sellers Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Sellers by Gross Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSellers} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" opacity={0.1} />
                  <XAxis type="number" tickFormatter={(v) => `Rs.${v}`} stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="shopName" type="category" width={110} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip formatter={(val: any) => formatPrice(val)} />} />
                  <Bar dataKey="totalSales" name="Gross Sales" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Best Selling Products by Units Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 50, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" opacity={0.1} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={130}
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(name) => (name.length > 15 ? `${name.substring(0, 15)}...` : name)}
                  />
                  <Tooltip content={<CustomTooltip formatter={(val: any) => `${val} units`} />} />
                  <Bar dataKey="totalSold" name="Units Sold" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Category Distribution & Province Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Sales Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Distribution by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySales}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="totalRevenue"
                    nameKey="name"
                  >
                    {categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip formatter={(val: any) => formatPrice(val)} />} />
                  <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Location Sales by Province */}
        <Card>
          <CardHeader>
            <CardTitle>Location-wise Sales (Provinces of Sri Lanka)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationSales.byProvince} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-15} textAnchor="end" />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `Rs.${v}`} />
                  <Tooltip content={<CustomTooltip formatter={(val: any) => formatPrice(val)} />} />
                  <Bar dataKey="totalRevenue" name="Sales Volume" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
