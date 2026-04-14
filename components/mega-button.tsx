"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"
import { MegaInstallerModal } from "@/components/mega-installer-modal"

export function MegaButton() {
  const [localAIAvailable, setLocalAIAvailable] = useState<boolean | null>(null)
  const [showInstaller, setShowInstaller] = useState(false)
  
  useEffect(() => {
    fetch('/api/local-ai-status')
      .then(res => res.json())
      .then(data => setLocalAIAvailable(data.localAIAvailable))
      .catch(() => setLocalAIAvailable(false))
  }, [])

  if (localAIAvailable === null) {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          className="hidden md:flex items-center gap-2.5 relative overflow-hidden rounded-full border border-purple-400/50 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 hover:border-purple-400/80 dark:hover:border-purple-400 bg-purple-50/80 dark:bg-purple-950/20 hover:bg-purple-100/80 dark:hover:bg-purple-900/30 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-purple-500/10"
          onClick={() => setShowInstaller(true)}
        >
          <div className="relative z-10 flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="font-medium">Hybrid AI</span>
            <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-blue-600 text-white">
              NEW
            </span>
          </div>
          <div className="absolute inset-0 animate-sweep-light bg-gradient-to-r from-transparent via-purple-200/10 dark:via-purple-300/8 to-transparent" />
        </Button>
      </div>
      
      <MegaInstallerModal 
        open={showInstaller} 
        onOpenChange={setShowInstaller}
      />
    </>
  )
}
