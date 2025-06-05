import React from 'react'
import Hero from '../../components/Hero'
import About from '../../components/About'
import Services from '../../components/Services'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'

function HomePage() {
  return (
    <>
      <Navigation />
      <Hero />
      <About />
      <Services />
      <Footer />
    </>
  )
}

export default HomePage
