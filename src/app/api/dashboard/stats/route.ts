// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/library/prisma";

// GET /api/dashboard/stats?range=week|month|year&userId=xxx - Get user dashboard statistics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('range') || 'month';
    const userId = searchParams.get('userId');
    
    // For now, we'll use a demo user ID since NextAuth isn't fully set up for Pi Network
    // In production, you'd get this from session or Pi Network token validation
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Check if this is a demo/temp user ID
    if (userId === 'demo-user-id' || userId === 'temp-user') {
      return NextResponse.json({
        userType: 'FREELANCER',
        totalEarnings: 125.75,
        pendingPayments: 45.50,
        completedJobs: 3,
        activeProjects: 2,
        totalJobs: 5,
        acceptedProposals: 4,
        monthlyEarnings: 85.25,
        weeklyEarnings: 25.50,
        recentActivity: [
          {
            id: '1',
            type: 'proposal_accepted',
            title: 'Proposal Accepted',
            description: 'Your proposal for "Build a React Dashboard" was accepted',
            amount: 150,
            timestamp: new Date().toISOString(),
            status: 'accepted'
          },
          {
            id: '2',
            type: 'payment_received',
            title: 'Payment Received',
            description: 'Received payment for completed milestone',
            amount: 75.50,
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            status: 'completed'
          }
        ],
        monthlyTrends: [
          { month: 'Nov', earnings: 45.25 },
          { month: 'Dec', earnings: 85.75 },
          { month: 'Jan', earnings: 125.50 }
        ]
      });
    }

    // Get user info to determine user type
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate date range for filtering
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    if (user.userType === "CLIENT") {
      // CLIENT DASHBOARD STATS
      const [
        totalJobs,
        activeJobs,
        completedJobs,
        totalSpent,
        pendingProposals,
        acceptedProposals,
        activeContracts,
        recentJobs,
        monthlySpending,
        topFreelancers
      ] = await Promise.all([
        // Total jobs posted
        prisma.job.count({ 
          where: { clientId: user.id } 
        }),
        
        // Active jobs
        prisma.job.count({ 
          where: { 
            clientId: user.id, 
            status: "OPEN" 
          } 
        }),
        
        // Completed jobs
        prisma.job.count({ 
          where: { 
            clientId: user.id, 
            status: "COMPLETED" 
          } 
        }),
        
        // Total amount spent (from completed contracts)
        prisma.contract.aggregate({
          where: { 
            clientId: user.id, 
            status: "COMPLETED" 
          },
          _sum: { amount: true }
        }),
        
        // Pending proposals
        prisma.proposal.count({
          where: {
            job: { clientId: user.id },
            status: "PENDING"
          }
        }),
        
        // Accepted proposals
        prisma.proposal.count({
          where: {
            job: { clientId: user.id },
            status: "ACCEPTED"
          }
        }),
        
        // Active contracts
        prisma.contract.count({ 
          where: { 
            clientId: user.id, 
            status: "ACTIVE" 
          } 
        }),
        
        // Recent jobs (last 5)
        prisma.job.findMany({
          where: { clientId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            _count: {
              select: { proposals: true }
            }
          }
        }),
        
        // Monthly spending trend
        prisma.contract.groupBy({
          by: ['createdAt'],
          where: {
            clientId: user.id,
            status: 'COMPLETED',
            createdAt: {
              gte: startDate
            }
          },
          _sum: {
            amount: true
          }
        }),
        
        // Top freelancers worked with
        prisma.contract.groupBy({
          by: ['freelancerId'],
          where: {
            clientId: user.id,
            status: 'COMPLETED'
          },
          _count: {
            freelancerId: true
          },
          _sum: {
            amount: true
          },
          orderBy: {
            _sum: {
              amount: 'desc'
            }
          },
          take: 5
        })
      ]);

      return NextResponse.json({
        userType: 'CLIENT',
        totalJobs,
        activeJobs,
        completedJobs,
        totalSpent: totalSpent._sum.amount || 0,
        pendingProposals,
        acceptedProposals,
        activeContracts,
        recentJobs,
        monthlySpending: monthlySpending.reduce((sum, month) => sum + (month._sum.amount || 0), 0),
        weeklySpending: monthlySpending
          .filter(m => m.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .reduce((sum, week) => sum + (week._sum.amount || 0), 0),
        topFreelancers
      });
      
    } else {
      // FREELANCER DASHBOARD STATS
      const [
        totalProposals,
        acceptedProposals,
        pendingProposals,
        rejectedProposals,
        activeProjects,
        completedJobs,
        totalEarnings,
        pendingPayments,
        monthlyEarnings,
        recentProposals,
        skillsInDemand,
        averageJobValue,
        successRate
      ] = await Promise.all([
        // Total proposals submitted
        prisma.proposal.count({ 
          where: { freelancerId: user.id } 
        }),
        
        // Accepted proposals
        prisma.proposal.count({ 
          where: { 
            freelancerId: user.id,
            status: "ACCEPTED" 
          } 
        }),
        
        // Pending proposals
        prisma.proposal.count({ 
          where: { 
            freelancerId: user.id,
            status: "PENDING" 
          } 
        }),
        
        // Rejected proposals
        prisma.proposal.count({ 
          where: { 
            freelancerId: user.id,
            status: "REJECTED" 
          } 
        }),
        
        // Active contracts/projects
        prisma.contract.count({ 
          where: { 
            freelancerId: user.id, 
            status: "ACTIVE" 
          } 
        }),
        
        // Completed jobs
        prisma.contract.count({
          where: { 
            freelancerId: user.id, 
            status: "COMPLETED" 
          }
        }),
        
        // Total earnings
        prisma.transaction.aggregate({
          where: { 
            freelancerId: user.id, 
            status: "COMPLETED" 
          },
          _sum: { netAmount: true }
        }),
        
        // Pending payments (escrow held)
        prisma.transaction.aggregate({
          where: {
            freelancerId: user.id,
            status: "ESCROW_HELD"
          },
          _sum: { netAmount: true }
        }),
        
        // Monthly earnings trend - use transactions for more accurate data
        prisma.transaction.groupBy({
          by: ['createdAt'],
          where: {
            freelancerId: user.id,
            status: 'COMPLETED',
            createdAt: {
              gte: startDate
            }
          },
          _sum: {
            netAmount: true
          }
        }),
        
        // Recent proposals (last 5)
        prisma.proposal.findMany({
          where: { freelancerId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            job: {
              select: {
                title: true,
                budget: true,
                isHourly: true
              }
            }
          }
        }),
        
        // Skills in demand (from jobs applied to)
        prisma.job.groupBy({
          by: ['id'],
          where: {
            proposals: {
              some: {
                freelancerId: user.id
              }
            }
          },
          _count: true,
          take: 10,
          orderBy: {
            _count: {
              id: 'desc'
            }
          }
        }),
        
        // Average job value
        prisma.transaction.aggregate({
          where: { 
            freelancerId: user.id,
            status: "COMPLETED"
          },
          _avg: { netAmount: true }
        }),
        
        // Success rate calculation
        prisma.proposal.groupBy({
          by: ['status'],
          where: { freelancerId: user.id },
          _count: true
        })
      ]);

      // Calculate success rate
      const successRateCalc = successRate.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      }, {} as Record<string, number>);
      
      const totalProposalsForRate = Object.values(successRateCalc).reduce((sum, count) => sum + count, 0);
      const acceptedCount = successRateCalc.ACCEPTED || 0;
      const calculatedSuccessRate = totalProposalsForRate > 0 ? Math.round((acceptedCount / totalProposalsForRate) * 100) : 0;

      return NextResponse.json({
        userType: 'FREELANCER',
        totalProposals,
        acceptedProposals,
        pendingProposals,
        rejectedProposals,
        activeProjects,
        completedJobs,
        totalEarnings: totalEarnings._sum.netAmount || 0,
        pendingPayments: pendingPayments._sum.netAmount || 0,
        monthlyEarnings: monthlyEarnings.reduce((sum, month) => sum + (month._sum.netAmount || 0), 0),
        weeklyEarnings: monthlyEarnings
          .filter(m => m.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          .reduce((sum, week) => sum + (week._sum.netAmount || 0), 0),
        recentProposals,
        averageJobValue: averageJobValue._avg.netAmount || 0,
        successRate: calculatedSuccessRate,
        skillsInDemand: skillsInDemand.length
      });
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}