import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LanguageProvider } from './lib/i18n';
import { DemoProvider } from './demo/store';
import { initSmoothScroll, lockScroll } from './lib/scroll';
import { loadArt } from './lib/art';
import Loader from './components/Loader';
import { CornerCrosses, CursorOrb, NoiseLayer } from './components/Chrome';
import SectionTransition from './components/SectionTransition';
import Topbar from './components/Topbar';
import MobileBottomNav from './components/demo/MobileBottomNav';
import Landing from './pages/Landing';
import Marketplace from './pages/Marketplace';
import CardDetail from './pages/CardDetail';
import Launchpad from './pages/Launchpad';
import LaunchpadCreate from './pages/LaunchpadCreate';
import YourCards from './pages/YourCards';
import MyCards from './pages/MyCards';
import CampaignsDiscover from './pages/CampaignsDiscover';
import CampaignsMine from './pages/CampaignsMine';
import CampaignsCreate from './pages/CampaignsCreate';
import CampaignDetail from './pages/CampaignDetail';
import Rewards from './pages/Rewards';
import CreatorRewards from './pages/CreatorRewards';
import Analytics from './pages/Analytics';
import HowItWorks from './pages/HowItWorks';
import Profile from './pages/Profile';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppShell() {
  const [assetsReady, setAssetsReady] = useState(false);
  const [intro, setIntro] = useState(false);

  useEffect(() => {
    const destroy = initSmoothScroll();
    lockScroll(true);
    return destroy;
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.all([document.fonts.ready, loadArt()]).then(() => {
      if (alive) setAssetsReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleReveal = useCallback(() => setIntro(true), []);
  const handleDone = useCallback(() => {
    lockScroll(false);
    ScrollTrigger.refresh();
  }, []);

  return (
    <LanguageProvider>
      <Loader ready={assetsReady} onReveal={handleReveal} onDone={handleDone} />
      <CornerCrosses />
      <NoiseLayer />
      <CursorOrb />
      <SectionTransition />
      <Topbar intro={intro} />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing intro={intro} />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/card/:id" element={<CardDetail />} />
        <Route path="/launchpad" element={<Launchpad />} />
        <Route path="/launchpad/create" element={<LaunchpadCreate />} />
        <Route path="/your-cards" element={<YourCards />} />
        <Route path="/my-cards" element={<MyCards />} />
        <Route path="/campaigns" element={<CampaignsDiscover />} />
        <Route path="/campaigns/mine" element={<CampaignsMine />} />
        <Route path="/campaigns/create" element={<CampaignsCreate />} />
        <Route path="/campaign/:id" element={<CampaignDetail />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/rewards/creator" element={<CreatorRewards />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <MobileBottomNav />
    </LanguageProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <DemoProvider>
        <AppShell />
      </DemoProvider>
    </BrowserRouter>
  );
}
