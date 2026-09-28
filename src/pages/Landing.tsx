import Hero from '../components/hero/Hero';
import About from '../components/About';
import Tools from '../components/tools/Tools';
import Work from '../components/Work';
import Quote from '../components/Quote';
import Footer from '../components/Footer';

export default function Landing({ intro }: { intro: boolean }) {
  return (
    <main className="site">
      <Hero intro={intro} />
      <About />
      <Tools />
      <Work />
      <Quote />
      <Footer />
    </main>
  );
}
