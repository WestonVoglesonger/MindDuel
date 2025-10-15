'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CategoryHeaderProps {
  category: string
  description?: string
  questionCount?: number
  className?: string
}

export function CategoryHeader({
  category,
  description,
  questionCount,
  className = ''
}: CategoryHeaderProps) {
  return (
    <Card className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white ${className}`}>
      <CardContent className="p-4 text-center">
        <h3 className="font-bold text-sm md:text-base truncate mb-1">
          {category}
        </h3>
        {description && (
          <p className="text-xs opacity-90 truncate">
            {description}
          </p>
        )}
        {questionCount !== undefined && (
          <Badge variant="secondary" className="mt-2 text-xs">
            {questionCount} questions
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
