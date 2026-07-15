import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { authApi } from './api/auth';
import { Header } from './components/Header';
import { ShelfView } from './views/ShelfView';
import { RoomView } from './views/RoomView';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <div style={{ fontFamily: 'var(--sq-header-font)', fontWeight: 700, fontSize: 28 }}>
          QUEUE<span style={{ color: 'var(--sq-accent)' }}>//</span>NIGHT
        </div>
        <p style={{ color: 'var(--sq-muted)', margin: 0 }}>Games the squad wants to play together</p>
        <a
          href={authApi.loginUrl}
          style={{
            marginTop: 8,
            padding: '12px 28px',
            borderRadius: 'var(--sq-radius)',
            background: 'var(--sq-accent)',
            color: '#fff',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Sign in
        </a>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sq-bg)' }}>
      <Header />
      <Routes>
        <Route path="/" element={<ShelfView />} />
        <Route path="/room/:roomId" element={<RoomView />} />
      </Routes>
    </div>
  );
}
