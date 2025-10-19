'use client'

import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ChallengeNotificationBadgeProps {
  unreadCount: number
  onClick: () => void
  className?: string
}

export function ChallengeNotificationBadge({ 
  unreadCount, 
  onClick, 
  className = '' 
}: ChallengeNotificationBadgeProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`relative ${className}`}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  )
}
