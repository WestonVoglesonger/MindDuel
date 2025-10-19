'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChallengeWithUsers } from '@/types/challenge.types'
import { Clock, Trophy, User, MessageSquare } from 'lucide-react'

interface ChallengesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sentChallenges: ChallengeWithUsers[]
  receivedChallenges: ChallengeWithUsers[]
  loading: boolean
  onAcceptChallenge: (challengeId: string) => Promise<boolean>
  onDeclineChallenge: (challengeId: string) => Promise<boolean>
  onCancelChallenge: (challengeId: string) => Promise<boolean>
}

export function ChallengesModal({
  open,
  onOpenChange,
  sentChallenges,
  receivedChallenges,
  loading,
  onAcceptChallenge,
  onDeclineChallenge,
  onCancelChallenge
}: ChallengesModalProps) {
  const [processingChallenge, setProcessingChallenge] = useState<string | null>(null)

  const handleAccept = async (challengeId: string) => {
    setProcessingChallenge(challengeId)
    await onAcceptChallenge(challengeId)
    setProcessingChallenge(null)
  }

  const handleDecline = async (challengeId: string) => {
    setProcessingChallenge(challengeId)
    await onDeclineChallenge(challengeId)
    setProcessingChallenge(null)
  }

  const handleCancel = async (challengeId: string) => {
    setProcessingChallenge(challengeId)
    await onCancelChallenge(challengeId)
    setProcessingChallenge(null)
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return 'Expired'
    
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'accepted': return 'bg-green-500'
      case 'declined': return 'bg-red-500'
      case 'expired': return 'bg-gray-500'
      case 'cancelled': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'accepted': return 'Accepted'
      case 'declined': return 'Declined'
      case 'expired': return 'Expired'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  const ChallengeCard = ({ challenge, isReceived }: { challenge: ChallengeWithUsers, isReceived: boolean }) => {
    const user = isReceived ? challenge.challenger : challenge.challenged
    const isProcessing = processingChallenge === challenge.id
    const timeRemaining = getTimeRemaining(challenge.expires_at)
    const isExpired = timeRemaining === 'Expired'

    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url || ''} alt={user.display_name} />
              <AvatarFallback>
                {user.display_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold truncate">{user.display_name}</h3>
                <Badge variant="secondary" className={`text-xs ${getStatusColor(challenge.status)} text-white`}>
                  {getStatusText(challenge.status)}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Trophy className="h-3 w-3" />
                <span>ELO: {user.elo_rating}</span>
                <Clock className="h-3 w-3 ml-2" />
                <span className={isExpired ? 'text-red-500' : ''}>{timeRemaining}</span>
              </div>
            </div>
          </div>

          {challenge.message && (
            <div className="mb-3 p-2 bg-muted rounded-md">
              <div className="flex items-start space-x-2">
                <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <p className="text-sm">{challenge.message}</p>
              </div>
            </div>
          )}

          {isReceived && challenge.status === 'pending' && !isExpired && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleAccept(challenge.id)}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Accepting...' : 'Accept'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDecline(challenge.id)}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Declining...' : 'Decline'}
              </Button>
            </div>
          )}

          {!isReceived && challenge.status === 'pending' && !isExpired && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCancel(challenge.id)}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Cancelling...' : 'Cancel Challenge'}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Challenges</span>
          </DialogTitle>
          <DialogDescription>
            Manage your game challenges and invitations
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="received" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received" className="flex items-center space-x-2">
              <span>Received</span>
              {receivedChallenges.filter(c => c.status === 'pending').length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {receivedChallenges.filter(c => c.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center space-x-2">
              <span>Sent</span>
              {sentChallenges.filter(c => c.status === 'pending').length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {sentChallenges.filter(c => c.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="mt-4 overflow-y-auto max-h-[50vh]">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading challenges...</p>
              </div>
            ) : receivedChallenges.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No challenges received yet</p>
              </div>
            ) : (
              receivedChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} isReceived={true} />
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="mt-4 overflow-y-auto max-h-[50vh]">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading challenges...</p>
              </div>
            ) : sentChallenges.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No challenges sent yet</p>
              </div>
            ) : (
              sentChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} isReceived={false} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
