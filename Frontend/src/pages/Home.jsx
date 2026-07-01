import React from 'react'
import NavBar from '../components/NavBar'
import Hero from '../components/Hero'
import AITools from '../components/AITools'
import Testimonial from '../components/Testimonial'
import Plan from '../components/Plan'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <>
      <NavBar />
      <Hero/>
      <AITools/>
      <Testimonial/>
      <Plan/>
      <Footer/>
    </>
  )
}

export default Home