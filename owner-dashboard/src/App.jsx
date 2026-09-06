import { Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <div className="App">
          <Outlet />
        </div>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
