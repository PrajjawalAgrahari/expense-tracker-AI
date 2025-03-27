import Hero from "@/app/ui/Landing/hero";
import Stats from "@/app/ui/Landing/stats";
import Features from "@/app/ui/Landing/features";
import HowItWorks from "@/app/ui/Landing/Working";
import Testimonials from "@/app/ui/Landing/testimonials";
import Concluding from "@/app/ui/Landing/concluding";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Concluding />
    </>
  );
}
