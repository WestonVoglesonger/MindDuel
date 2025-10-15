'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, Clock } from 'lucide-react'

interface BuzzerButtonProps {
  enabled: boolean
  pressed: boolean
  timeRemaining: number
  onPress: () => void
  disabled?: boolean
  className?: string
}

export function BuzzerButton({
  enabled,
  pressed,
  timeRemaining,
  onPress,
  disabled = false,
  className = ''
}: BuzzerButtonProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000)
    return seconds.toString()
  }

  const getButtonVariant = () => {
    if (pressed) return 'secondary'
    if (enabled) return 'default'
    return 'outline'
  }

  const getButtonClass = () => {
    const baseClass = 'relative w-32 h-32 rounded-full text-2xl font-bold transition-all duration-200'
    
    if (pressed) {
      return `${baseClass} bg-gray-500 text-white scale-95`
    }
    
    if (enabled) {
      return `${baseClass} bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl animate-pulse hover:scale-105`
    }
    
    return `${baseClass} bg-gray-300 text-gray-500 cursor-not-allowed`
  }

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Timer Display */}
      {enabled && timeRemaining > 0 && (
        <div className="flex items-center space-x-2 text-green-600">
          <Clock className="h-5 w-5" />
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {formatTime(timeRemaining)}s
          </Badge>
        </div>
      )}

      {/* Buzzer Button */}
      <Button
        variant={getButtonVariant()}
        size="lg"
        onClick={onPress}
        disabled={disabled || !enabled || pressed}
        className={getButtonClass()}
      >
        <div className="flex flex-col items-center space-y-2">
          {pressed ? (
            <>
              <Zap className="h-8 w-8" />
              <span className="text-sm">PRESSED</span>
            </>
          ) : enabled ? (
            <>
              <Zap className="h-8 w-8" />
              <span className="text-sm">BUZZ</span>
            </>
          ) : (
            <>
              <Zap className="h-8 w-8 opacity-50" />
              <span className="text-sm">WAIT</span>
            </>
          )}
        </div>
      </Button>

      {/* Status Text */}
      <div className="text-center">
        {pressed ? (
          <p className="text-sm text-gray-600">You buzzed in!</p>
        ) : enabled ? (
          <p className="text-sm text-green-600 font-semibold animate-pulse">
            🔔 BUZZ NOW!
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            Wait for buzzer to activate
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground text-center max-w-xs">
        {enabled && !pressed ? (
          <p>Click the button or press SPACE to buzz in</p>
        ) : pressed ? (
          <p>You were first! Answer the question above</p>
        ) : (
          <p>Wait for the question to be revealed and buzzer to activate</p>
        )}
      </div>
    </div>
  )
}
