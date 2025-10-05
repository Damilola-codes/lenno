import { NextRequest, NextResponse } from 'next/server';
import {prisma} from "@/library/prisma"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const skill = searchParams.get('skill');

        if (!skill) {
            return NextResponse.json({ error: 'Skill parameter is required' }, { status: 400 });
        }

       const freelancers = await prisma.user.findMany({
            where: {
                userType: 'FREELANCER',  // Filter for freelancer users
                profile: {
                    skills: {
                        some: {
                            name: {
                                contains: skill,
                                mode: 'insensitive',
                            },
                        },
                    },
                },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                profile: {
                    include: {
                        skills: true,
                    },
                },
            },
        });

        return NextResponse.json(freelancers);
    } catch (error) {
        console.error('Error fetching freelancers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}