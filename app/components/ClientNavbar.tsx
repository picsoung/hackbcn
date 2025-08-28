'use client'
import React, { useState } from 'react'
import Navbar from './Navbar'

const ClientNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <Navbar 
      mobileMenuOpen={mobileMenuOpen} 
      setMobileMenuOpen={setMobileMenuOpen} 
    />
  )
}

export default ClientNavbar