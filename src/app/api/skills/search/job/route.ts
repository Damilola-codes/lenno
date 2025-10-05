import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/library/prisma'

interface IndeedJob {
    jobkey: string;
    jobtitle: string;
    company: string;
    formattedLocation: string;
    jobtype?: string;
    snippet: string;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const location = searchParams.get('location') || '';
        const jobType = searchParams.get('type') || '';

        // TODO: Implement job search logic here
        // Database and API search implementation
        const [dbJobs, apiJobs] = await Promise.all([
            // Database query
            searchJobsFromDatabase(query, location, jobType),
            // External job APIs
            searchJobsFromAPIs(query, location, jobType)
        ]);

        // Combine and deduplicate results
        const allJobs = [...dbJobs, ...apiJobs];
        const uniqueJobs = allJobs.filter((job, index, self) =>
            index === self.findIndex(j => j.id === job.id)
        );

    async function searchJobsFromDatabase(query: string, location: string, jobType: string) {
        // Replace with your actual database implementation (Prisma, MongoDB, etc.)
        const jobs = await prisma.job.findMany({
            where: {
                title: { contains: query, mode: 'insensitive' },
                // Replace 'location' with the actual field name from your Job model
                // Common alternatives: city, address, workplace, jobLocation
                // location: { contains: location, mode: 'insensitive' },
                ...(jobType ? { type: jobType } : {})
            }
        });
        return jobs;
    }

    async function searchJobsFromAPIs(query: string, location: string, jobType: string) {
        const results = [];

        try {
        // Example: Indeed API call
        const indeedResponse = await fetch(`https://api.indeed.com/ads/apisearch?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}${jobType ? `&jt=${encodeURIComponent(jobType)}` : ''}&format=json`, {
            headers: { 'User-Agent': 'YourApp/1.0' }
        });

        if (indeedResponse.ok) {
            const indeedData = await indeedResponse.json();
            results.push(...indeedData.results?.map((job: IndeedJob) => ({
            id: job.jobkey,
            title: job.jobtitle,
            company: job.company,
            location: job.formattedLocation,
            type: job.jobtype || 'Full-time',
            description: job.snippet,
            source: 'Indeed'
            })) || []);
        }
        } catch (error) {
        console.error('API search error:', error);
        }

        return results;
    }

        return NextResponse.json({
            success: true,
            data: uniqueJobs,
            total: uniqueJobs.length
        });

    } catch (error) {
        console.error('Job search error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to search jobs' },
            { status: 500 }
        );
    }
}