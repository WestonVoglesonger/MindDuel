'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Player } from '@/types/game.types'
import { Trophy, MessageSquare } from 'lucide-react'

interface SendChallengeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  player: Player
  onSendChallenge: (playerId: string, message?: string) => Promise<boolean>
  loading?: boolean
  error?: string | null
}

export function SendChallengeDialog({
  open,
  onOpenChange,
  player,
  onSendChallenge,
  loading = false,
  error
}: SendChallengeDialogProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    setSending(true)
    const success = await onSendChallenge(player.id, message.trim() || undefined)
    setSending(false)
    
    if (success) {
      setMessage('')
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setMessage('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Send Challenge</span>
          </DialogTitle>
          <DialogDescription>
            Challenge {player.displayName} to a trivia duel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Player Info */}
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={player.avatarUrl || ''} alt={player.displayName} />
              <AvatarFallback>
                {player.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-semibold">{player.displayName}</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Trophy className="h-3 w-3" />
                <span>ELO: {player.eloRating}</span>
                <span>•</span>
                <span>{player.gamesPlayed} games</span>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="message">Optional Message</Label>
            <Textarea
              id="message"
              placeholder="Add a friendly message to your challenge..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || loading}>
            {sending ? 'Sending...' : 'Send Challenge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
