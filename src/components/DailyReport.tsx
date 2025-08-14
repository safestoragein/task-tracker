'use client'

import { useState, useEffect } from 'react'
import { useTask } from '@/contexts/TaskContext'
import { useAuth } from '@/contexts/AuthContext'
import { DailyReport as DailyReportType } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { UserSelector } from './UserSelector'
import { Plus, Calendar, User, AlertTriangle, Lock, Shield, Eye } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

export function DailyReport() {
  const { state, dispatch } = useTask()
  const { state: authState, canEditDailyReport } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined)
  const [activeReportUserId, setActiveReportUserId] = useState<string | undefined>(undefined)
  const [today, setToday] = useState(new Date().toISOString().split('T')[0])
  const [reportCounter, setReportCounter] = useState(1)
  const [formData, setFormData] = useState({
    yesterdayWork: '',
    todayPlan: '',
    blockers: '',
  })

  // Set current date on client side only
  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0]
    setSelectedDate(currentDate)
    setToday(currentDate)
    setReportCounter(state.dailyReports.length + 1)
  }, [state.dailyReports.length])

  const selectedDateObj = new Date(selectedDate)

  // Get reports for selected date and optionally filter by user
  const reportsForDate = state.dailyReports.filter(report => {
    const reportDate = new Date(report.date).toISOString().split('T')[0]
    const dateMatch = reportDate === selectedDate
    const userMatch = selectedUserId ? report.authorId === selectedUserId : true
    return dateMatch && userMatch
  })

  const handleSubmit = (authorId: string) => {
    if (!formData.yesterdayWork.trim() && !formData.todayPlan.trim()) return
    if (!canEditDailyReport(authorId)) return

    const currentDate = new Date()
    const reportId = `report-${authorId}-${selectedDate}-${reportCounter}`
    const newReport: DailyReportType = {
      id: reportId,
      authorId,
      date: selectedDateObj,
      yesterdayWork: formData.yesterdayWork.trim(),
      todayPlan: formData.todayPlan.trim(),
      blockers: formData.blockers.trim() || undefined,
      createdAt: currentDate,
      updatedAt: currentDate,
    }

    dispatch({ type: 'ADD_DAILY_REPORT', payload: newReport })
    setReportCounter(prev => prev + 1)
    setFormData({ yesterdayWork: '', todayPlan: '', blockers: '' })
    setIsCreating(false)
    setActiveReportUserId(undefined)
  }

  const hasUserReported = (userId: string) => {
    return reportsForDate.some(report => report.authorId === userId)
  }

  const getUserReport = (userId: string) => {
    return reportsForDate.find(report => report.authorId === userId)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold">Daily Standup</h2>
          <p className="text-muted-foreground">Team progress and planning</p>
          {authState.user?.userRole === 'member' && (
            <p className="text-sm text-blue-600 mt-1">
              <Eye className="h-4 w-4 inline mr-1" />
              You can only edit your own reports
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <UserSelector
            selectedUserId={selectedUserId}
            onUserSelect={setSelectedUserId}
            placeholder="All team members"
            showAllOption={true}
          />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
            max={today}
          />
        </div>
      </div>

      {/* Team Reports */}
      <div className="grid gap-4">
        {state.teamMembers
          .filter(member => !selectedUserId || member.id === selectedUserId)
          .map(member => {
          const userReport = getUserReport(member.id)
          const hasReported = hasUserReported(member.id)
          const canEdit = canEditDailyReport(member.id)
          const canView = authState.user?.userRole === 'admin' || member.id === authState.user?.id

          if (!canView) return null

          return (
            <Card key={member.id} className={cn(
              "border-l-4",
              hasReported ? "border-l-green-500" : "border-l-gray-300"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-sm">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{member.name}</h3>
                        {member.userRole === 'admin' && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {!canEdit && (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Read Only
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasReported ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <Calendar className="h-3 w-3 mr-1" />
                        Reported
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {canEdit && !hasReported && (
                      <Button 
                        size="sm"
                        onClick={() => {
                          setActiveReportUserId(member.id)
                          setIsCreating(true)
                        }}
                        disabled={isCreating}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Report
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              {userReport && (
                <CardContent className="space-y-4">
                  {userReport.yesterdayWork && (
                    <div>
                      <h4 className="font-medium text-sm text-green-700 mb-2">Yesterday&apos;s Work</h4>
                      <p className="text-sm bg-green-50 p-3 rounded-md">
                        {userReport.yesterdayWork}
                      </p>
                    </div>
                  )}

                  {userReport.todayPlan && (
                    <div>
                      <h4 className="font-medium text-sm text-blue-700 mb-2">Today&apos;s Plan</h4>
                      <p className="text-sm bg-blue-50 p-3 rounded-md">
                        {userReport.todayPlan}
                      </p>
                    </div>
                  )}

                  {userReport.blockers && (
                    <div>
                      <h4 className="font-medium text-sm text-red-700 mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Blockers
                      </h4>
                      <p className="text-sm bg-red-50 p-3 rounded-md">
                        {userReport.blockers}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Reported on {formatDate(userReport.createdAt)}
                  </div>
                </CardContent>
              )}

              {!hasReported && isCreating && activeReportUserId === member.id && canEdit && (
                <CardContent className="space-y-4">
                  <div className="mb-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      Creating daily standup report for <strong>{member.name}</strong>
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      What did you work on yesterday?
                    </label>
                    <Textarea
                      value={formData.yesterdayWork}
                      onChange={(e) => setFormData(prev => ({ ...prev, yesterdayWork: e.target.value }))}
                      placeholder="Describe your accomplishments from yesterday..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      What are you planning to work on today?
                    </label>
                    <Textarea
                      value={formData.todayPlan}
                      onChange={(e) => setFormData(prev => ({ ...prev, todayPlan: e.target.value }))}
                      placeholder="Outline your plan for today..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Any blockers or impediments?
                    </label>
                    <Textarea
                      value={formData.blockers}
                      onChange={(e) => setFormData(prev => ({ ...prev, blockers: e.target.value }))}
                      placeholder="Describe any obstacles or help needed (optional)..."
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleSubmit(member.id)}
                      disabled={!formData.yesterdayWork.trim() && !formData.todayPlan.trim()}
                    >
                      Submit Report
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreating(false)
                        setActiveReportUserId(undefined)
                        setFormData({ yesterdayWork: '', todayPlan: '', blockers: '' })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {reportsForDate.length === 0 && !isCreating && (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No reports for {formatDate(selectedDateObj)}
              {selectedUserId && (
                <span className="text-blue-600"> 
                  {' '}from {state.teamMembers.find(m => m.id === selectedUserId)?.name}
                </span>
              )}
            </h3>
            <p className="text-muted-foreground mb-4">
              {selectedUserId 
                ? "This team member hasn't submitted a report yet." 
                : "Be the first to share what you're working on!"
              }
            </p>
            {authState.user && (
              <div className="text-xs text-muted-foreground mb-4">
                {authState.user.userRole === 'admin' 
                  ? "As an admin, you can create reports for any team member."
                  : "You can only create your own daily reports."
                }
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}