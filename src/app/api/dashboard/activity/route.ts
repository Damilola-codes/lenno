// app/api/dashboard/activity/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/library/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    
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

    let activities: {
      id: string;
      type: string;
      title: string;
      description: string;
      amount: number;
      timestamp: Date;
      status: string;
    }[] = [];

    if (user.userType === 'CLIENT') {
      // Client activities: job posts, proposals received, transactions
      const [jobActivities, proposalActivities, transactionActivities] = await Promise.all([
        // Recent job posts
        prisma.job.findMany({
          where: { clientId: userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          select: {
            id: true,
            title: true,
            createdAt: true,
            status: true,
            budget: true
          }
        }),
        
        // Recent proposals received
        prisma.proposal.findMany({
          where: {
            job: { clientId: userId }
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: {
            freelancer: {
              select: {
                username: true,
                firstName: true,
                lastName: true
              }
            },
            job: {
              select: {
                title: true
              }
            }
          }
        }),
        
        // Recent transactions
        prisma.transaction.findMany({
          where: { clientId: userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: {
            freelancer: {
              select: {
                username: true,
                firstName: true,
                lastName: true
              }
            },
            job: {
              select: {
                title: true
              }
            }
          }
        })
      ]);

      // Format activities
      jobActivities.forEach(job => {
        activities.push({
          id: `job-${job.id}`,
          type: 'job_posted',
          title: 'Job Posted',
          description: job.title,
          amount: job.budget,
          timestamp: job.createdAt,
          status: job.status
        });
      });

      proposalActivities.forEach(proposal => {
        activities.push({
          id: `proposal-${proposal.id}`,
          type: 'proposal_received',
          title: 'New Proposal',
          description: `${proposal.freelancer.username} applied to "${proposal.job.title}"`,
          amount: proposal.proposedRate,
          timestamp: proposal.createdAt,
          status: proposal.status
        });
      });

      transactionActivities.forEach(transaction => {
        activities.push({
          id: `transaction-${transaction.id}`,
          type: transaction.status === 'COMPLETED' ? 'payment_sent' : 'payment_processing',
          title: transaction.status === 'COMPLETED' ? 'Payment Sent' : 'Payment Processing',
          description: `Payment for "${transaction.job.title}" to ${transaction.freelancer.username}`,
          amount: transaction.amount,
          timestamp: transaction.createdAt,
          status: transaction.status
        });
      });
      
    } else {
      // Freelancer activities: proposals sent, transactions, payments received
      const [proposalActivities, transactionActivities, paymentActivities] = await Promise.all([
        // Recent proposals sent
        prisma.proposal.findMany({
          where: { freelancerId: userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: {
            job: {
              select: {
                title: true,
                budget: true
              }
            }
          }
        }),
        
        // Recent transactions as freelancer
        prisma.transaction.findMany({
          where: { freelancerId: userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: {
            job: {
              select: {
                title: true
              }
            },
            client: {
              select: {
                username: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }),
        
        // Recent payments
        prisma.transaction.findMany({
          where: {
            freelancerId: userId,
            status: 'COMPLETED'
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: {
            job: {
              select: {
                title: true
              }
            }
          }
        })
      ]);

      // Format activities
      proposalActivities.forEach(proposal => {
        const statusText = proposal.status === 'ACCEPTED' ? 'Proposal Accepted' : 
                          proposal.status === 'REJECTED' ? 'Proposal Rejected' : 'Proposal Submitted';
        activities.push({
          id: `proposal-${proposal.id}`,
          type: proposal.status === 'ACCEPTED' ? 'proposal_accepted' : 
                proposal.status === 'REJECTED' ? 'proposal_rejected' : 'proposal_submitted',
          title: statusText,
          description: `"${proposal.job.title}"`,
          amount: proposal.proposedRate,
          timestamp: proposal.createdAt,
          status: proposal.status
        });
      });

      transactionActivities.forEach(transaction => {
        activities.push({
          id: `transaction-${transaction.id}`,
          type: transaction.status === 'COMPLETED' ? 'job_completed' : 'work_in_progress',
          title: transaction.status === 'COMPLETED' ? 'Work Completed' : 'Work In Progress',
          description: `"${transaction.job.title}" for ${transaction.client.username}`,
          amount: transaction.netAmount,
          timestamp: transaction.createdAt,
          status: transaction.status
        });
      });

      paymentActivities.forEach(payment => {
        activities.push({
          id: `payment-${payment.id}`,
          type: 'payment_received',
          title: 'Payment Received',
          description: `Payment for "${payment.job.title}"`,
          amount: payment.netAmount, // Use netAmount (after platform fee)
          timestamp: payment.createdAt,
          status: 'completed'
        });
      });
    }

    // Sort all activities by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    activities = activities.slice(0, limit);

    return NextResponse.json({
      activities,
      userType: user.userType
    });

  } catch (error) {
    console.error("Error fetching dashboard activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}