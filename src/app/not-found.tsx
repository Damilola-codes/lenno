import Link from 'next/link'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 p-4">
      <div className="w-full max-w-lg">
        <Card className="p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary-900 mb-2">404 — Page not found</h1>
          <p className="text-sm text-primary-600 mb-6">We couldn’t find the page you were looking for. It may have been moved or removed.</p>

          <div className="flex justify-center gap-3">
            <Link href="/">
              <Button className="">Go to homepage</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Go back</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
