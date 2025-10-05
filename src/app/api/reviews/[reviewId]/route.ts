import { NextRequest, NextResponse } from 'next/server';
import {prisma} from "@/library/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: { reviewId: string } }
) {
    try {
        const { reviewId } = params;
        
        // TODO: Implement review retrieval logic
        // Validate reviewId
        if (!reviewId) {
            return NextResponse.json(
                { error: 'Review ID is required' },
                { status: 400 }
            );
        }

        const review = await prisma.review.findUnique({
            where: {
            id: reviewId
            },
        });

        if (!review) {
            return NextResponse.json(
                { error: 'Review not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(review);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Failed to fetch review' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { reviewId: string } }
) {
    try {
        const { reviewId } = params;
        const body = await request.json();
        
        // TODO: Implement review update logic
        // Validate reviewId
        if (!reviewId) {
            return NextResponse.json(
            { error: 'Review ID is required' },
            { status: 400 }
            );
        }

        // Check if review exists
        const existingReview = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!existingReview) {
            return NextResponse.json(
            { error: 'Review not found' },
            { status: 404 }
            );
        }

        // Update the review
        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: body
        });
        
        return NextResponse.json(updatedReview);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Failed to update review' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { reviewId: string } }
) {
    try {
        const { reviewId } = params;
        
        // TODO: Implement review deletion logic
        // Validate reviewId
        if (!reviewId) {
            return NextResponse.json(
            { error: 'Review ID is required' },
            { status: 400 }
            );
        }

        // Check if review exists
        const existingReview = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!existingReview) {
            return NextResponse.json(
            { error: 'Review not found' },
            { status: 404 }
            );
        }

        // Delete the review
        await prisma.review.delete({
            where: { id: reviewId }
        });
        
        return NextResponse.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Failed to delete review' },
            { status: 500 }
        );
    }
}