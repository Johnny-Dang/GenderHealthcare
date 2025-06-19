import React from 'react'
import Hero from '../../components/Hero'
import About from '../../components/About'
import Services from '../../components/Services'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import ChatBot from '../../components/ChatBot'

function HomePage() {
  return (
    <>
      <Navigation />
      <Hero />
      <About />
      <Services />
      <Footer />
      <ChatBot />
    </>
  )
}

export default HomePage
