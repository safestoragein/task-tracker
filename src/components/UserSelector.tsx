'use client'

import { useState } from 'react'
import { useTask } from '@/contexts/TaskContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Badge } from './ui/badge'
import { ChevronDown, Users, Filter } from 'lucide-react'
import { TeamMember } from '@/types'

interface UserSelectorProps {
  selectedUserId?: string
  onUserSelect: (userId: string | undefined) => void
  placeholder?: string
  showAllOption?: boolean
}

export function UserSelector({ 
  selectedUserId, 
  onUserSelect, 
  placeholder = "Select person",
  showAllOption = true 
}: UserSelectorProps) {
  const { state } = useTask()
  const { state: authState } = useAuth()
  
  const selectedUser = selectedUserId 
    ? state.teamMembers.find(member => member.id === selectedUserId)
    : null

  const canSelectUser = (member: TeamMember): boolean => {
    if (!authState.user) return false
    if (authState.user.userRole === 'admin') return true
    return member.id === authState.user.id
  }

  const availableMembers = state.teamMembers.filter(canSelectUser)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[200px]">
          <div className="flex items-center gap-2">
            {selectedUser ? (
              <>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback className="text-xs">
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span>{selectedUser.name}</span>
                {selectedUser.userRole === 'admin' && (
                  <Badge variant="secondary" className="text-xs px-1">
                    Admin
                  </Badge>
                )}
              </>
            ) : (
              <>
                <Filter className="h-4 w-4" />
                <span className="text-muted-foreground">{placeholder}</span>
              </>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]">
        {showAllOption && (
          <DropdownMenuItem
            onClick={() => onUserSelect(undefined)}
            className={!selectedUserId ? "bg-accent" : ""}
          >
            <Users className="mr-2 h-4 w-4" />
            <span>All Team Members</span>
          </DropdownMenuItem>
        )}
        
        {availableMembers.map((member) => (
          <DropdownMenuItem
            key={member.id}
            onClick={() => onUserSelect(member.id)}
            className={selectedUserId === member.id ? "bg-accent" : ""}
          >
            <Avatar className="mr-2 h-6 w-6">
              <AvatarImage src={member.avatar} />
              <AvatarFallback className="text-xs">
                {member.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span>{member.name}</span>
                {member.userRole === 'admin' && (
                  <Badge variant="secondary" className="text-xs px-1">
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{member.role}</p>
            </div>
          </DropdownMenuItem>
        ))}

        {availableMembers.length === 0 && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No accessible team members
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}