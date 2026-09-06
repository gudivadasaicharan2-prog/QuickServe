import { Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <Outlet />
      </div>
    </ThemeProvider>
  );
}

export default App;
