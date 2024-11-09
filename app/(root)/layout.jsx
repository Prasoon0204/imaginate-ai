import MobileNav from '@/components/shared/MobileNav'
import Sidebar from '@/components/shared/Sidebar'
import { Toaster } from '@/components/ui/toaster'
import React from 'react'

const layout = ({children}) => {
  return (
    <main className="root">
      <Sidebar />
      <MobileNav />
        <div className="root-container">
            <div className="wrapper">
                {children}
            </div>
        </div>
        <Toaster />
    </main>
  )
}

export default layout