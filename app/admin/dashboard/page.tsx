"use client"

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { LogOut, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import Stats from "@/components/stats"
import { TestCases } from '@/components/TestCases'

export default function DashboardPage() {
  const [editProjectId, setEditProjectId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('test-cases')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [expandedProjects, setExpandedProjects] = useState<number[]>([])

  const descriptionRef = useRef<HTMLTextAreaElement>(null)
  const detailsRef = useRef<HTMLTextAreaElement>(null)

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 1000)}px`
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        window.location.href = '/'
      } else {
        console.error('Logout failed')
        setIsLoggingOut(false)
      }
    } catch (error) {
      console.error('Error during logout:', error)
      setIsLoggingOut(false)
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + '...'
  }

  return (
    <>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <Button variant="destructive" onClick={handleLogout} disabled={isLoggingOut}>
          <LogOut className="mr-2 h-4 w-4" /> {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-2">
          <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="test-cases">
          <TestCases />
        </TabsContent>
        <TabsContent value="statistics">
          <Stats initialSystemInfo={null} />
        </TabsContent>
      </Tabs>
    </div>
    </>
  )
}
