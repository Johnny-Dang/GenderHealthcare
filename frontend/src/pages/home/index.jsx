import Hero from '../../components/Hero'
import Services from '../../components/Services'
import Navigation from '../../components/Navigation'
import ViewConsultant from '../../components/ViewConsultant'
import Footer from '../../components/Footer'
import ChatBot from '../../components/ChatBot'
import Introduction from '../../components/Introduction'
import PreFooter from '../../components/PreFooter'
import { useEffect, useRef, useState } from 'react'

const HomePage = () => {
  const contactRef = useRef(null)
  const [isVisible, setIsVisible] = useState({ contact: false })
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.8
      if (contactRef.current && scrollPosition > contactRef.current.offsetTop) {
        setIsVisible((prev) => ({ ...prev, contact: true }))
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  return (
    <>
      <Navigation />
      <Hero />
      <Introduction />
      <Services />
      <ViewConsultant />
      <PreFooter contactRef={contactRef} isVisible={isVisible} />
      <Footer />
      <ChatBot />
    </>
  )
}

export default HomePage
