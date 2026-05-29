import ArsArenaScroll from "./ArsArenaScroll";
import Header from "./Header";
import RewindScroll from "./RewindScroll";
import Archive3DCoverflow from "./Archive3DCoverflow";

import CoreTeamAccordion from "./CoreTeamAccordion";
import Footer from "./Footer";

export default function Home() {
  return (
    <main className="relative bg-[#F5F2EB] min-h-screen">
      <Header />

      {/* Scrollytelling Section */}
      <div id="home">
        <ArsArenaScroll />
      </div>
      
      {/* Archive Cover Flow Section */}
      <Archive3DCoverflow />

      {/* The Core Team Section */}
      <CoreTeamAccordion />

      {/* Rewind Section (Horizontal Pinned Scroll) */}
      <RewindScroll />

      {/* Join Us Section */}
      <Footer />
    </main>
  );
}
