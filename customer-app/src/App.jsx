import { Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import CustomerHeader from './components/CustomerHeader';
import BottomNav from './components/BottomNav';
import LocationGateModal from './components/LocationGateModal';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="app-container">
        <LocationGateModal />
        <CustomerHeader />
        <main className="app-main">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </ThemeProvider>
  );
}

export default App;
