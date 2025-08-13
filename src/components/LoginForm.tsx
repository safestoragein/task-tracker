'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { Building2, Mail, Users } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!email) {
      setError('Please enter your email address')
      setIsLoading(false)
      return
    }

    if (!email.endsWith('@safestorage.in')) {
      setError('Please use your SafeStorage email address (ending with @safestorage.in)')
      setIsLoading(false)
      return
    }

    const success = login(email)
    if (!success) {
      setError('Email not found. Please contact your administrator if you believe this is an error.')
    }
    
    setIsLoading(false)
  }

  const teamEmails = [
    'ramesh@safestorage.in',
    'kushal@safestorage.in',
    'kiran@safestorage.in',
    'niranjan@safestorage.in', 
    'anush@safestorage.in',
    'harsha@safestorage.in',
    'manish@safestorage.in',
    'arun@safestorage.in',
    'shantraj@safestorage.in'
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">SafeStorage Task Manager</CardTitle>
          <p className="text-muted-foreground">Sign in with your SafeStorage email</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@safestorage.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Users className="h-4 w-4" />
              <span>SafeStorage Team Members:</span>
            </div>
            <div className="grid grid-cols-1 gap-1 text-sm">
              {teamEmails.map((teamEmail) => (
                <button
                  key={teamEmail}
                  onClick={() => setEmail(teamEmail)}
                  className="text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 hover:text-blue-800"
                  disabled={isLoading}
                >
                  {teamEmail}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}