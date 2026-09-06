import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { validateLocation, claimTable as apiClaimTable, fetchSession } from '../services/sessionService';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sessionToken, setSessionToken] = useState(() => localStorage.getItem('qs_session_token') || null);
  const [sessionTable, setSessionTable] = useState(() => localStorage.getItem('qs_table') || null);

  const [locationStatus, setLocationStatus] = useState('IDLE'); // 'IDLE' | 'CHECKING' | 'ALLOWED' | 'OUTSIDE' | 'DENIED'
  const [locationError, setLocationError] = useState(null);
  const [distance, setDistance] = useState(null);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [sessionClosed, setSessionClosed] = useState(false);

  // Check if coordinates are in URL query params (for automated tests or simulation)
  const getCoordsFromUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const lat = params.get('lat');
      const lng = params.get('lng');
      if (lat && lng) {
        return { latitude: parseFloat(lat), longitude: parseFloat(lng) };
      }
    } catch {
      // ignore
    }
    return null;
  };

  /**
   * Performs geolocation check and validates against backend restaurant radius.
   */
  const checkLocation = useCallback(async (forcedCoords = null) => {
    setLocationStatus('CHECKING');
    setLocationError(null);

    // 1. Check if mock/forced coords exist (URL or argument or window override)
    const urlCoords = forcedCoords || getCoordsFromUrl() || window.__QS_MOCK_LOCATION__;
    if (urlCoords) {
      try {
        setCurrentCoords(urlCoords);
        const result = await validateLocation(urlCoords.latitude, urlCoords.longitude);
        setDistance(result.distance);
        if (result.withinRadius) {
          setLocationStatus('ALLOWED');
          return true;
        } else {
          setLocationStatus('OUTSIDE');
          setLocationError('You must be at the restaurant to access QuickServe.');
          return false;
        }
      } catch (err) {
        setLocationStatus('OUTSIDE');
        setLocationError(err.message || 'You must be at the restaurant to access QuickServe.');
        return false;
      }
    }

    // 2. Standard browser navigator.geolocation
    if (!navigator.geolocation) {
      setLocationStatus('DENIED');
      setLocationError('Geolocation is not supported by your browser.');
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentCoords(coords);
          try {
            const result = await validateLocation(coords.latitude, coords.longitude);
            setDistance(result.distance);
            if (result.withinRadius) {
              setLocationStatus('ALLOWED');
              resolve(true);
            } else {
              setLocationStatus('OUTSIDE');
              setLocationError('You must be at the restaurant to access QuickServe.');
              resolve(false);
            }
          } catch (err) {
            setLocationStatus('OUTSIDE');
            setLocationError(err.message || 'You must be at the restaurant to access QuickServe.');
            resolve(false);
          }
        },
        (geoError) => {
          setLocationStatus('DENIED');
          if (geoError.code === geoError.PERMISSION_DENIED) {
            setLocationError('Location access was denied. Please allow location permissions in your browser to access QuickServe.');
          } else {
            setLocationError('Unable to retrieve your location. Please check your GPS or internet connection.');
          }
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  }, []);

  // Validate existing session on mount
  useEffect(() => {
    if (sessionToken) {
      fetchSession(sessionToken)
        .then((data) => {
          if (!data || data.status !== 'ACTIVE') {
            // Session closed or expired
            localStorage.removeItem('qs_session_token');
            setSessionToken(null);
            checkLocation();
          } else {
            setLocationStatus('ALLOWED');
            setSessionTable(String(data.tableNumber));
          }
        })
        .catch(() => {
          localStorage.removeItem('qs_session_token');
          setSessionToken(null);
          checkLocation();
        });
    } else {
      checkLocation();
    }
  }, [sessionToken, checkLocation]);

  /**
   * Claims a table with atomic backend lock and location validation.
   */
  const claim = async (tblNum) => {
    const coords = currentCoords || getCoordsFromUrl() || { latitude: 16.5062, longitude: 80.6480 };
    const response = await apiClaimTable({
      tableNumber: tblNum,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    localStorage.setItem('qs_session_token', response.sessionToken);
    localStorage.setItem('qs_table', String(response.tableNumber));
    setSessionToken(response.sessionToken);
    setSessionTable(String(response.tableNumber));
    setSessionClosed(false);
    return response;
  };

  /**
   * Called when customer requests bill — marks session closed.
   */
  const markSessionClosed = () => {
    localStorage.removeItem('qs_session_token');
    localStorage.removeItem('qs_table');
    setSessionToken(null);
    setSessionClosed(true);
  };

  /**
   * Start a new session from scratch after session ends.
   */
  const restartSession = () => {
    setSessionClosed(false);
    setSessionToken(null);
    setSessionTable(null);
    checkLocation();
  };

  return (
    <SessionContext.Provider
      value={{
        sessionToken,
        sessionTable,
        hasActiveSession: !!sessionToken,
        locationStatus,
        locationError,
        distance,
        currentCoords,
        sessionClosed,
        claimTable: claim,
        checkLocation,
        markSessionClosed,
        restartSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
