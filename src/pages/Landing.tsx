import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { About } from "../components/About";
import { Services } from "../components/Services";
import { Pricing } from "../components/Pricing";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";
import { useLanguage } from "../contexts/LanguageContext";
import myScrollTo from "../lib/scroll_to_section";

const Landing: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();

  const onGetStarted = ()=>{
    navigate('/login')
  }
  //?: CASE WHEN I COME TO THE PAGE FROM THE PAY(STAR) BUtton
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      // Wait a tick to ensure section is rendered
      setTimeout(() => {
        myScrollTo(location.state.scrollTo);
      }, 50);
    }
  }, [location]);

  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "services", "pricing", "contact"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGetStarted = () => {
    navigate("/register");
  };

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${
        isRTL ? "font-arabic" : ""
      }`}
    >
      <Header
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main>
        <Hero onGetStarted={onGetStarted}/>
        <About />
        <Services  onGetStarted={onGetStarted}/>
        <Pricing />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
