// app/api/dashboard/trends/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/library/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const period = searchParams.get('period') || 'month'; // week, month, quarter, year
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get user to determine type
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate date ranges based on period
    const now = new Date();
    const periods: { start: Date; end: Date; label: string }[] = [];
    
    if (period === 'week') {
      // Last 12 weeks
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(now.getDate() - (i + 1) * 7);
        const end = new Date(now);
        end.setDate(now.getDate() - i * 7);
        periods.push({
          start,
          end,
          label: `Week ${12 - i}`
        });
      }
    } else if (period === 'month') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        periods.push({
          start,
          end,
          label: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        });
      }
    } else if (period === 'quarter') {
      // Last 8 quarters
      for (let i = 7; i >= 0; i--) {
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - i * 3, 1);
        const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
        periods.push({
          start: quarterStart,
          end: quarterEnd,
          label: `Q${Math.floor(quarterStart.getMonth() / 3) + 1} ${quarterStart.getFullYear().toString().slice(-2)}`
        });
      }
    } else {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const start = new Date(now.getFullYear() - i, 0, 1);
        const end = new Date(now.getFullYear() - i, 11, 31);
        periods.push({
          start,
          end,
          label: start.getFullYear().toString()
        });
      }
    }

    const trends = await Promise.all(
      periods.map(async (period) => {
        if (user.userType === 'CLIENT') {
          // Client spending trends
          const spending = await prisma.contract.aggregate({
            where: {
              clientId: userId,
              status: 'COMPLETED',
              createdAt: {
                gte: period.start,
                lte: period.end
              }
            },
            _sum: { amount: true },
            _count: true
          });

          return {
            period: period.label,
            amount: spending._sum.amount || 0,
            count: spending._count,
            start: period.start,
            end: period.end
          };
        } else {
          // Freelancer earnings trends
          const earnings = await prisma.contract.aggregate({
            where: {
              freelancerId: userId,
              status: 'COMPLETED',
              createdAt: {
                gte: period.start,
                lte: period.end
              }
            },
            _sum: { amount: true },
            _count: true
          });

          return {
            period: period.label,
            amount: earnings._sum.amount || 0,
            count: earnings._count,
            start: period.start,
            end: period.end
          };
        }
      })
    );

    // Calculate growth rate
    const currentPeriod = trends[trends.length - 1];
    const previousPeriod = trends[trends.length - 2];
    const growthRate = previousPeriod && previousPeriod.amount > 0 
      ? ((currentPeriod.amount - previousPeriod.amount) / previousPeriod.amount) * 100
      : 0;

    // Calculate totals
    const totalAmount = trends.reduce((sum, trend) => sum + trend.amount, 0);
    const totalCount = trends.reduce((sum, trend) => sum + trend.count, 0);
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    return NextResponse.json({
      userType: user.userType,
      period,
      trends,
      summary: {
        totalAmount,
        totalCount,
        averageAmount,
        growthRate: Math.round(growthRate * 100) / 100,
        currentPeriod: currentPeriod.amount,
        previousPeriod: previousPeriod?.amount || 0
      }
    });

  } catch (error) {
    console.error("Error fetching dashboard trends:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}