"use client"

import { IconDotsVertical } from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { useSafeUser } from "@/hooks/use-safe-user"
import { useTheme } from "next-themes"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { theme } = useTheme()
  const { user: clerkUser } = useSafeUser()
  
  // Demo mode user
  const demoUser = {
    fullName: "Demo User",
    primaryEmailAddress: { emailAddress: "demo@example.com" },
    imageUrl: null
  }
  
  const user = clerkUser || demoUser
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  
  const handleUserClick = () => {
    if (isDemoMode) {
      alert("Demo Mode: User profile is not available in demo mode")
      return
    }
    
    // In real mode, would open Clerk user profile
    // Disabled in demo mode to avoid dependency issues
    console.log("User profile click - feature available in production mode")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={handleUserClick}
        >
          <Avatar className="h-8 w-8 rounded-lg grayscale">
            <AvatarImage src={user?.imageUrl || ""} alt={user?.fullName || ""} />
            <AvatarFallback className="rounded-lg">
              {user?.fullName?.charAt(0) || "D"}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user?.fullName}</span>
            <span className="text-muted-foreground truncate text-xs">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
          </div>
          <IconDotsVertical className="ml-auto size-4" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
