import { NextRequest, NextResponse } from 'next/server';
import {prisma} from "@/library/prisma";

export async function POST(
    request: NextRequest,
    { params }: { params: { proposalId: string } }
) {
    try {
        const { proposalId } = params;
        // Validate proposal exists and can be rejected
        const proposal = await prisma.proposal.findUnique({
            where: { id: proposalId }
        });

        if (!proposal) {
            return NextResponse.json(
                { error: 'Proposal not found' },
                { status: 404 }
            );
        }

        if (proposal.status === 'REJECTED') {
            return NextResponse.json(
                { error: 'Proposal is already rejected' },
                { status: 400 }
            );
        }

        if (proposal.status === 'ACCEPTED') {
            return NextResponse.json(
                { error: 'Cannot reject an accepted proposal' },
                { status: 400 }
            );
        }
        // update database to mark proposal as rejected
        await prisma.proposal.update({
            where: { id: proposalId },
            data: { status: 'REJECTED' }
        });

        // Or with a direct database query (example with your DB client):
        // await db.query('UPDATE proposals SET status = ? WHERE id = ?', ['rejected', proposalId]);
        
        return NextResponse.json(
            { message: 'Proposal rejected successfully', proposalId },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error rejecting proposal:', error);
        return NextResponse.json(
            { error: 'Failed to reject proposal' },
            { status: 500 }
        );
    }
}