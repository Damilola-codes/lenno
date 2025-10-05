import { NextResponse } from 'next/server';
import {prisma} from "@/library/prisma"

export async function GET() {
    try {
        // Replace with your actual database connection and query
        const skills = await prisma.skill.findMany();
        return NextResponse.json(skills);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Failed to fetch skills' },
            { status: 500 }
        );
    }
}