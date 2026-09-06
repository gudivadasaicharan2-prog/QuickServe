import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useSession } from '../context/SessionContext';
import { fetchPublicTables } from '../services/sessionService';
import { Sun, Moon, ChefHat, ChevronDown, Check, AlertCircle } from 'lucide-react';
import './CustomerHeader.css';

const CustomerHeader = () => {
  const { theme, toggleTheme } = useTheme();
  const { tableNumber, setTableNumber } = useCart();
  const { sessionTable, hasActiveSession, claimTable } = useSession();
  const currentTable = sessionTable || tableNumber || '1';

  const [tables, setTables] = useState([]);
  const [isSelectingTable, setIsSelectingTable] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublicTables()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTables(data);
        }
      })
      .catch(() => {
        // Fallback: silently ignore if table list cannot be fetched
      });
  }, [isSelectingTable]);

  const handleSelectTable = async (tblNum) => {
    setError(null);
    try {
      if (claimTable) {
        await claimTable(tblNum);
      }
      setTableNumber(String(tblNum));
      setIsSelectingTable(false);
    } catch (err) {
      setError(err.message || `Table ${tblNum} is currently occupied.`);
    }
  };

  return (
    <>
      <header className="customer-header">
        {/* Brand Wordmark */}
        <div className="customer-header__brand">
          <div className="customer-header__icon">
            <ChefHat size={18} strokeWidth={2.2} />
          </div>
          <span className="customer-header__name">QuickServe</span>
        </div>

        {/* Table Selector / Badge */}
        <div className="customer-header__table-wrap">
          <button
            className="customer-header__table-badge"
            onClick={() => {
              setError(null);
              setIsSelectingTable((v) => !v);
            }}
            aria-label="Change table number"
            title={hasActiveSession ? 'Active Table Session' : 'Select Table'}
          >
            <span className="customer-header__table-label">TABLE</span>
            <strong className="customer-header__table-number">{currentTable}</strong>
            {hasActiveSession && (
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--success)',
                  display: 'inline-block',
                }}
                title="Active Session"
              />
            )}
            <ChevronDown size={13} style={{ opacity: 0.6 }} />
          </button>
        </div>

        {/* Theme Toggle */}
        <div className="customer-header__actions">
          <button
            className="btn-icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Table Selection Dropdown / Modal */}
      {isSelectingTable && (
        <div
          className="table-select-overlay"
          onClick={() => setIsSelectingTable(false)}
        >
          <div
            className="table-select-modal card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="table-select-header">
              <h3>Select Your Table</h3>
              <p>Choose your table to link orders and requests</p>
            </div>

            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.875rem',
                  background: 'var(--danger-light)',
                  color: 'var(--danger)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  marginBottom: '0.875rem',
                }}
              >
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div className="table-grid">
              {tables.length > 0 ? (
                tables.map((tbl) => {
                  const isSelected = String(tbl.tableNumber) === String(currentTable);
                  const isOccupied = tbl.status === 'OCCUPIED' && !isSelected;

                  return (
                    <button
                      key={tbl.id}
                      className={`table-btn${isSelected ? ' table-btn--selected' : ''}`}
                      disabled={isOccupied}
                      style={isOccupied ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                      onClick={() => handleSelectTable(tbl.tableNumber)}
                    >
                      <span className="table-btn__num">Table {tbl.tableNumber}</span>
                      <span className="table-btn__cap">
                        {isOccupied ? 'Occupied' : `${tbl.capacity} seats`}
                      </span>
                      {isSelected && (
                        <Check size={14} className="table-btn__check" />
                      )}
                    </button>
                  );
                })
              ) : (
                // Fallback 1-12 if API returned no tables
                Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className={`table-btn${
                      String(n) === String(tableNumber) ? ' table-btn--selected' : ''
                    }`}
                    onClick={() => handleSelectTable(n)}
                  >
                    <span className="table-btn__num">Table {n}</span>
                    {String(n) === String(tableNumber) && (
                      <Check size={14} className="table-btn__check" />
                    )}
                  </button>
                ))
              )}
            </div>

            <button
              className="btn btn-secondary w-full"
              style={{ marginTop: '1rem' }}
              onClick={() => setIsSelectingTable(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerHeader;
