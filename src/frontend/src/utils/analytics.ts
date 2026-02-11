import type { Order } from '../backend';

export interface DailyStats {
  date: string;
  orderCount: number;
  revenue: bigint;
}

export function aggregateOrdersByDay(orders: Order[], products: Map<string, bigint>): DailyStats[] {
  const statsMap = new Map<string, { count: number; revenue: bigint }>();

  orders.forEach((order) => {
    const date = new Date(Number(order.id) * 1000).toISOString().split('T')[0];
    const revenue = order.items.reduce((sum, [productId, qty]) => {
      const price = products.get(productId) || 0n;
      return sum + price * qty;
    }, 0n);

    const existing = statsMap.get(date) || { count: 0, revenue: 0n };
    statsMap.set(date, {
      count: existing.count + 1,
      revenue: existing.revenue + revenue,
    });
  });

  return Array.from(statsMap.entries())
    .map(([date, stats]) => ({
      date,
      orderCount: stats.count,
      revenue: stats.revenue,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function aggregateByWeek(daily: DailyStats[]): DailyStats[] {
  const weekMap = new Map<string, { count: number; revenue: bigint }>();

  daily.forEach((day) => {
    const date = new Date(day.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];

    const existing = weekMap.get(weekKey) || { count: 0, revenue: 0n };
    weekMap.set(weekKey, {
      count: existing.count + day.orderCount,
      revenue: existing.revenue + day.revenue,
    });
  });

  return Array.from(weekMap.entries())
    .map(([date, stats]) => ({
      date,
      orderCount: stats.count,
      revenue: stats.revenue,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function aggregateByMonth(daily: DailyStats[]): DailyStats[] {
  const monthMap = new Map<string, { count: number; revenue: bigint }>();

  daily.forEach((day) => {
    const monthKey = day.date.substring(0, 7);
    const existing = monthMap.get(monthKey) || { count: 0, revenue: 0n };
    monthMap.set(monthKey, {
      count: existing.count + day.orderCount,
      revenue: existing.revenue + day.revenue,
    });
  });

  return Array.from(monthMap.entries())
    .map(([date, stats]) => ({
      date,
      orderCount: stats.count,
      revenue: stats.revenue,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
