import { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { useCart } from '../context/CartContext';
import { fetchPublicTables } from '../services/sessionService';
import {
  MapPin,
  MapPinOff,
  AlertCircle,
  CheckCircle2,
  TableProperties,
  Users,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import './LocationGateModal.css';

const LocationGateModal = () => {
  const {
    hasActiveSession,
    sessionTable,
    sessionClosed,
    locationStatus,
    locationError,
    distance,
    claimTable,
    checkLocation,
    restartSession,
  } = useSession();

  const { setTableNumber, clearCart } = useCart();

  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [claimingTableNum, setClaimingTableNum] = useState(null);
  const [claimError, setClaimError] = useState(null);

  // Fetch tables when location is allowed and user has no active session
  useEffect(() => {
    if (locationStatus === 'ALLOWED' && !hasActiveSession) {
      setLoadingTables(true);
      fetchPublicTables()
        .then((data) => setTables(Array.isArray(data) ? data : []))
        .catch(() => setTables([]))
        .finally(() => setLoadingTables(false));
    }
  }, [locationStatus, hasActiveSession]);

  const handleClaim = async (tblNum) => {
    setClaimingTableNum(tblNum);
    setClaimError(null);
    try {
      const result = await claimTable(tblNum);
      setTableNumber(String(result.tableNumber));
    } catch (err) {
      setClaimError(err.message || 'Failed to claim table. Please choose another.');
      // Refresh table list
      fetchPublicTables().then((data) => setTables(Array.isArray(data) ? data : [])).catch(() => {});
    } finally {
      setClaimingTableNum(null);
    }
  };

  const handleRestart = () => {
    clearCart();
    restartSession();
  };

  // If user has active session and not closed, do not show modal
  if (hasActiveSession && !sessionClosed) {
    return null;
  }

  return (
    <div className="location-gate-overlay">
      <div className="location-gate-card card">
        {/* ── State 1: Session Closed ──────────────────────────────── */}
        {sessionClosed && (
          <div className="location-gate-state">
            <div className="gate-icon-wrap gate-icon--success">
              <CheckCircle2 size={40} strokeWidth={1.8} />
            </div>
            <h2 className="gate-title">Your table session has ended. Thank you!</h2>
            <p className="gate-subtitle">
              Your bill request has been sent to our staff. We hope you had a wonderful dining experience!
            </p>
            <button className="btn btn-primary w-full" onClick={handleRestart} style={{ marginTop: '1.25rem' }}>
              <Sparkles size={16} />
              <span>Start New Session</span>
            </button>
          </div>
        )}

        {/* ── State 2: Checking Location ────────────────────────────── */}
        {!sessionClosed && locationStatus === 'CHECKING' && (
          <div className="location-gate-state">
            <div className="gate-icon-wrap gate-icon--brand">
              <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
            <h2 className="gate-title">Checking your location...</h2>
            <p className="gate-subtitle">
              Verifying that you are physically inside the restaurant to access QuickServe.
            </p>
          </div>
        )}

        {/* ── State 3: Permission Denied ────────────────────────────── */}
        {!sessionClosed && locationStatus === 'DENIED' && (
          <div className="location-gate-state">
            <div className="gate-icon-wrap gate-icon--danger">
              <MapPinOff size={36} />
            </div>
            <h2 className="gate-title">Location Access Required</h2>
            <p className="gate-subtitle">
              {locationError || 'Please allow location access in your browser to verify you are inside the restaurant.'}
            </p>
            <button
              className="btn btn-primary w-full"
              onClick={() => checkLocation()}
              style={{ marginTop: '1.25rem' }}
            >
              <RefreshCw size={16} />
              <span>Retry Location Check</span>
            </button>
          </div>
        )}

        {/* ── State 4: Outside Restaurant ───────────────────────────── */}
        {!sessionClosed && locationStatus === 'OUTSIDE' && (
          <div className="location-gate-state">
            <div className="gate-icon-wrap gate-icon--warning">
              <MapPinOff size={36} />
            </div>
            <h2 className="gate-title">You must be at the restaurant to access QuickServe.</h2>
            <p className="gate-subtitle">
              {distance != null
                ? `You are approximately ${Math.round(distance)}m away. QuickServe ordering is only permitted inside the restaurant radius (100m).`
                : 'Ordering is restricted to diners physically at the restaurant.'}
            </p>
            <button
              className="btn btn-primary w-full"
              onClick={() => checkLocation()}
              style={{ marginTop: '1.25rem' }}
            >
              <RefreshCw size={16} />
              <span>Retry Location Check</span>
            </button>
          </div>
        )}

        {/* ── State 5: Location Allowed -> Table Selection ──────────── */}
        {!sessionClosed && locationStatus === 'ALLOWED' && (
          <div className="location-gate-state table-select-flow">
            <div className="gate-header">
              <div className="gate-icon-wrap gate-icon--brand-sm">
                <TableProperties size={22} />
              </div>
              <div>
                <h2 className="gate-title" style={{ textAlign: 'left', fontSize: '1.1875rem' }}>
                  Select Your Table
                </h2>
                <p className="gate-subtitle" style={{ textAlign: 'left', margin: 0 }}>
                  Claim an available table to begin ordering
                </p>
              </div>
            </div>

            {claimError && (
              <div className="gate-error-banner">
                <AlertCircle size={15} />
                <span>{claimError}</span>
              </div>
            )}

            {loadingTables ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 0.75rem', width: 24, height: 24 }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Loading tables...</span>
              </div>
            ) : (
              <div className="gate-table-grid">
                {tables.length > 0 ? (
                  tables.map((tbl) => {
                    const isOccupied = tbl.status === 'OCCUPIED';
                    const isClaiming = claimingTableNum === tbl.tableNumber;

                    return (
                      <button
                        key={tbl.id || tbl.tableNumber}
                        className={`gate-table-card ${isOccupied ? 'gate-table--occupied' : 'gate-table--available'}`}
                        disabled={isOccupied || isClaiming}
                        onClick={() => handleClaim(tbl.tableNumber)}
                        aria-label={`Table ${tbl.tableNumber} - ${tbl.status}`}
                      >
                        <div className="gate-table-num">Table {tbl.tableNumber}</div>
                        <div className="gate-table-meta">
                          <Users size={12} />
                          <span>{tbl.capacity} seats</span>
                        </div>
                        <div className={`gate-status-pill ${isOccupied ? 'pill--occupied' : 'pill--available'}`}>
                          {isClaiming ? 'Claiming...' : isOccupied ? 'Occupied' : 'Claim'}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div style={{ gridColumn: '1 / -1', padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No tables found. Please ask staff for assistance.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationGateModal;
