import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FlightProvider } from './context/FlightContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LiveMap from './components/LiveMap';
import FlightList from './components/FlightList';
import FlightDetail from './components/FlightDetail';
import AirportGrid from './components/AirportGrid';
import CargoTracker from './components/CargoTracker';
import ChatBot from './components/ChatBot';
import Toast from './components/Toast';
import AuthModal from './components/AuthModal';
import TransportOptions from './components/TransportOptions';
import Footer from './components/Footer';
import './index.css';

function MainPage() {
  const [activeTab, setActiveTab] = React.useState(0);
  const [toast, setToast] = React.useState(null);
  const [showAuth, setShowAuth] = React.useState(false);

  const showToast = (msg, duration = 2500) => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-white overflow-x-hidden flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} showToast={showToast} setShowAuth={setShowAuth} />
      
      <div className="flex-1">
        {activeTab === 0 && (
          <>
            <Hero showToast={showToast} />
            <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-8">
              <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1 min-w-0">
                  <LiveMap showToast={showToast} />
                </div>
                <div className="xl:w-96">
                  <FlightList showToast={showToast} />
                </div>
              </div>
              <TransportOptions />
            </div>
          </>
        )}

        {activeTab === 1 && (
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 pt-28 pb-8">
            <FlightList showToast={showToast} fullPage />
          </div>
        )}

        {activeTab === 2 && (
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 pt-28 pb-8">
            <AirportGrid showToast={showToast} />
          </div>
        )}

        {activeTab === 3 && (
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 pt-28 pb-8">
            <CargoTracker showToast={showToast} />
          </div>
        )}
      </div>

      <Footer />
      <FlightDetail showToast={showToast} />
      <ChatBot showToast={showToast} />
      {toast && <Toast message={toast} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} showToast={showToast} />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <FlightProvider>
          <Routes>
            <Route path="/*" element={<MainPage />} />
          </Routes>
        </FlightProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
