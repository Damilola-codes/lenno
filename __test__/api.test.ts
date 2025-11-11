// __tests__/api.test.ts
// @ts-nocheck
import { NextRequest } from 'next/server'
import { GET as getJobs, POST as createJob } from '@/app/api/jobs/route'

describe('/api/jobs', () => {
  test('GET /api/jobs returns jobs list', async () => {
    const request = new NextRequest('http://localhost:3000/api/jobs')
    const response = await getJobs(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('jobs')
  })

  test('POST /api/jobs creates new job', async () => {
    const jobData = {
      title: 'Test Job',
      description: 'Test Description',
      budget: 1000
    }
    
    const request = new NextRequest('http://localhost:3000/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    })
    
    const response = await createJob(request)
    expect(response.status).toBe(201)
  })
})