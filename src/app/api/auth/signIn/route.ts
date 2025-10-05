import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/library/prisma'

export async function POST(request: NextRequest) {
    try {
        const { piUserId } = await request.json()

        if (!piUserId) {
            return NextResponse.json(
                { error: 'Pi Network user ID is required' },
                { status: 400 }
            )
        }

        // Find user by Pi Network ID
        const user = await prisma.user.findFirst({
            where: { piWalletId: piUserId },
            include: {
                profile: true
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'Account not found. Please sign up first as a Pi Network pioneer.' },
                { status: 404 }
            )
        }

        console.log(`Pi Network user signed in: ${user.username} (${user.userType})`)

        // Return user session data
        return NextResponse.json({
            message: 'Sign in successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                userType: user.userType,
                piWalletId: user.piWalletId,
                isVerified: user.isVerified,
                firstName: user.firstName,
                lastName: user.lastName,
                profile: user.profile
            }
        })

    } catch (error) {
        console.error('Pi Network sign in error:', error)
        return NextResponse.json(
            { error: 'Sign in failed. Please try again.' },
            { status: 500 }
        )
    }
}