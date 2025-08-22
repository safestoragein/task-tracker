'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTask } from '@/contexts/TaskContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { SimpleModal } from './SimpleModal'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  UserCheck, 
  Shield, 
  User,
  Calendar,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { TeamMember, UserRole, Group } from '@/types'

export function TeamManagement() {
  const { state: authState } = useAuth()
  const { state: taskState, dispatch, initializeDefaultGroups } = useTask()
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '',
    userRole: 'member' as UserRole
  })

  // Show loading state while authentication is being checked
  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team management...</p>
        </div>
      </div>
    )
  }

  // Only admins can access team management
  if (authState.user?.userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Access Restricted</h3>
          <p className="text-muted-foreground">Only administrators can access team management.</p>
        </div>
      </div>
    )
  }

  const handleAddMember = () => {
    if (newMember.name && newMember.email && newMember.role) {
      const id = Math.max(...taskState.teamMembers.map(m => parseInt(m.id)), 0) + 1
      const member: TeamMember = {
        id: id.toString(),
        name: newMember.name,
        email: newMember.email.toLowerCase(),
        role: newMember.role,
        userRole: newMember.userRole
      }

      dispatch({
        type: 'SET_TEAM_MEMBERS',
        payload: [...taskState.teamMembers, member]
      })

      setNewMember({ name: '', email: '', role: '', userRole: 'member' })
      setIsAddMemberOpen(false)
    }
  }

  const handleUpdateMember = (member: TeamMember) => {
    dispatch({
      type: 'SET_TEAM_MEMBERS',
      payload: taskState.teamMembers.map(m => 
        m.id === member.id ? member : m
      )
    })
    setEditingMember(null)
  }

  const handleDeleteMember = (memberId: string) => {
    // Don't allow deletion of current user
    if (memberId === authState.user?.id) return
    
    dispatch({
      type: 'SET_TEAM_MEMBERS',
      payload: taskState.teamMembers.filter(m => m.id !== memberId)
    })
  }

  const getMemberTaskStats = (memberId: string) => {
    const memberTasks = taskState.tasks.filter(t => t.assigneeId === memberId)
    return {
      total: memberTasks.length,
      completed: memberTasks.filter(t => t.status === 'done').length,
      inProgress: memberTasks.filter(t => t.status === 'in-progress').length,
      todo: memberTasks.filter(t => t.status === 'todo').length,
      backlog: memberTasks.filter(t => t.status === 'backlog').length
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">Manage SafeStorage team members and their roles</p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => initializeDefaultGroups()}
          >
            <Users className="h-4 w-4 mr-2" />
            Initialize Groups
          </Button>
          <Button 
            onClick={() => {
              console.log('Add Member button clicked!')
              setIsAddMemberOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Add Member Modal */}
      <SimpleModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        title="Add Team Member"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add a new member to the SafeStorage team.
          </p>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              placeholder="Enter member name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              placeholder="member@safestorage.in"
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              placeholder="e.g., Developer, Manager"
            />
          </div>
          <div>
            <Label htmlFor="userRole">Access Level</Label>
            <Select 
              value={newMember.userRole} 
              onValueChange={(value: UserRole) => setNewMember({ ...newMember, userRole: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="scrum_master">Scrum Master</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>
              Add Member
            </Button>
          </div>
        </div>
      </SimpleModal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {taskState.teamMembers.map((member) => {
          const stats = getMemberTaskStats(member.id)
          const isCurrentUser = member.id === authState.user?.id
          
          return (
            <Card key={member.id} className={isCurrentUser ? 'border-blue-200 bg-blue-50/50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription>{member.role}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {member.userRole === 'admin' && (
                      <Badge variant="default" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    {member.userRole === 'scrum_master' && (
                      <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Scrum Master
                      </Badge>
                    )}
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{member.email}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Task Summary</span>
                    <span className="font-medium">{stats.total} total</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      <span>Done: {stats.completed}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-blue-500" />
                      <span>In Progress: {stats.inProgress}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-orange-500" />
                      <span>Todo: {stats.todo}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3 text-gray-500" />
                      <span>Backlog: {stats.backlog}</span>
                    </div>
                  </div>
                </div>

                {!isCurrentUser && (
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMember(member)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMember(member.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Groups Section */}
      {taskState.groups.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Team Groups</h3>
            <span className="text-sm text-muted-foreground">{taskState.groups.length} groups</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {taskState.groups.map((group) => {
              const groupMembers = taskState.teamMembers.filter(member => 
                group.memberIds.includes(member.id)
              )
              const scrumMasters = taskState.teamMembers.filter(member => 
                group.scrumMasterIds.includes(member.id)
              )
              
              return (
                <Card key={group.id} className="border-orange-200 bg-orange-50/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg text-orange-800">{group.name}</CardTitle>
                        <CardDescription className="text-orange-600">{group.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                        {groupMembers.length} members
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {scrumMasters.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-orange-800 mb-2">Scrum Masters</div>
                        <div className="flex flex-wrap gap-1">
                          {scrumMasters.map(sm => (
                            <Badge key={sm.id} variant="default" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                              <UserCheck className="h-3 w-3 mr-1" />
                              {sm.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-sm font-medium text-orange-800 mb-2">Team Members</div>
                      <div className="flex flex-wrap gap-1">
                        {groupMembers.filter(member => !group.scrumMasterIds.includes(member.id)).map(member => (
                          <Badge key={member.id} variant="secondary" className="text-xs">
                            {member.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      <SimpleModal
        isOpen={editingMember !== null}
        onClose={() => setEditingMember(null)}
        title="Edit Team Member"
      >
        {editingMember && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Update member information and access level.
            </p>
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editingMember.name}
                onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editingMember.email}
                onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Input
                id="edit-role"
                value={editingMember.role}
                onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-userRole">Access Level</Label>
              <Select 
                value={editingMember.userRole} 
                onValueChange={(value: UserRole) => setEditingMember({ ...editingMember, userRole: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="scrum_master">Scrum Master</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingMember(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleUpdateMember(editingMember)}>
                Update Member
              </Button>
            </div>
          </div>
        )}
      </SimpleModal>
    </div>
  )
}