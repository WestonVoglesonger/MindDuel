'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChallengeNotification } from '@/types/challenge.types'
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react'

interface ChallengeToastProps {
  notification: ChallengeNotification
  onAccept: (challengeId: string) => Promise<boolean>
  onDecline: (challengeId: string) => Promise<boolean>
  onDismiss: (notificationId: string) => void
  autoDismiss?: boolean
  autoDismissDelay?: number
}

export function ChallengeToast({
  notification,
  onAccept,
  onDecline,
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = 10000
}: ChallengeToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  // Auto-dismiss after delay
  useEffect(() => {
    if (autoDismiss && notification.type === 'challenge_received') {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onDismiss(notification.id), 300) // Allow fade out
      }, autoDismissDelay)

      return () => clearTimeout(timer)
    }
  }, [autoDismiss, autoDismissDelay, notification.id, notification.type, onDismiss])

  const handleAccept = async () => {
    setProcessing('accept')
    await onAccept(notification.id)
    setProcessing(null)
    setIsVisible(false)
    setTimeout(() => onDismiss(notification.id), 300)
  }

  const handleDecline = async () => {
    setProcessing('decline')
    await onDecline(notification.id)
    setProcessing(null)
    setIsVisible(false)
    setTimeout(() => onDismiss(notification.id), 300)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss(notification.id), 300)
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'challenge_received':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'challenge_accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'challenge_declined':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'challenge_expired':
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getTitle = () => {
    switch (notification.type) {
      case 'challenge_received':
        return `Challenge from ${notification.challenger_display_name}`
      case 'challenge_accepted':
        return `${notification.challenger_display_name} accepted your challenge`
      case 'challenge_declined':
        return `${notification.challenger_display_name} declined your challenge`
      case 'challenge_expired':
        return `Challenge to ${notification.challenger_display_name} expired`
      default:
        return 'Challenge notification'
    }
  }

  const getDescription = () => {
    switch (notification.type) {
      case 'challenge_received':
        return notification.message || 'Wants to challenge you to a trivia duel!'
      case 'challenge_accepted':
        return 'Get ready to play!'
      case 'challenge_declined':
        return 'Maybe next time!'
      case 'challenge_expired':
        return 'The challenge timed out'
      default:
        return ''
    }
  }

  if (!isVisible) return null

  return (
    <Card className={`w-80 shadow-lg border-l-4 border-l-blue-500 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {notification.type === 'challenge_received' ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={notification.challenger_display_name} />
                <AvatarFallback>
                  {notification.challenger_display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-8 w-8 flex items-center justify-center">
                {getIcon()}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate">{getTitle()}</h4>
            <p className="text-xs text-muted-foreground mt-1">{getDescription()}</p>
            
            {notification.type === 'challenge_received' && (
              <div className="flex space-x-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleAccept}
                  disabled={!!processing}
                  className="h-7 px-3 text-xs"
                >
                  {processing === 'accept' ? 'Accepting...' : 'Accept'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDecline}
                  disabled={!!processing}
                  className="h-7 px-3 text-xs"
                >
                  {processing === 'decline' ? 'Declining...' : 'Decline'}
                </Button>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 flex-shrink-0"
          >
            ×
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
