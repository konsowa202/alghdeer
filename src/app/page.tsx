import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Events from "@/components/Events";
import About from "@/components/About";
import Experiences from "@/components/Experiences";
import Services from "@/components/Services";
import Stats from "@/components/Stats";
import Facilities from "@/components/Facilities";
import FullImage from "@/components/FullImage";
import Philosophy from "@/components/Philosophy";
import Testimonials from "@/components/Testimonials";
import Gallery from "@/components/Gallery";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      {/* 1. Navbar */}
      <Navbar />
      {/* 2. Hero - Full screen with يمتد animation */}
      <Hero />
      {/* 3. فعالياتنا - Our Events (Instagram content) */}
      <Events />
      {/* 4. About / Concept (white) */}
      <About />
      {/* 5. Experiences (dark) */}
      <Experiences />
      {/* 6. Services (white) */}
      <Services />
      {/* 7. Full Image Parallax */}
      <FullImage />
      {/* 8. Stats (white) */}
      <Stats />
      {/* 9. Facilities (dark) */}
      <Facilities />
      {/* 10. Philosophy (white) */}
      <Philosophy />
      {/* 11. Testimonials (white) */}
      <Testimonials />
      {/* 12. Gallery (dark) */}
      <Gallery />
      {/* 13. Footer / Contact */}
      <Footer />
    </main>
  );
}
