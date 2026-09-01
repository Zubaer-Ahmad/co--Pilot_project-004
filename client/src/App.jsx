import { useEffect, useMemo, useState } from 'react';

const API = import.meta.env.VITE_API_URL || '/api';
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const today = new Date().toISOString().slice(0, 10);

export default function App() {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [query, setQuery] = useState('');
  const [capacity, setCapacity] = useState('Any size');
  const [selected, setSelected] = useState(null);
  const [auth, setAuth] = useState({ token: localStorage.getItem('coveToken') || '', user: null });
  const [authMode, setAuthMode] = useState('login');
  const [authOpen, setAuthOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [booking, setBooking] = useState({ checkIn: '2026-09-18', checkOut: '2026-09-21', guests: 2, guestName: '' });
  const [notice, setNotice] = useState('');

  const load = async () => {
    const [roomRes, reservationRes, summaryRes] = await Promise.all([fetch(`${API}/rooms`), fetch(`${API}/reservations`), fetch(`${API}/summary`)]);
    setRooms((await roomRes.json()).rooms || []);
    setReservations((await reservationRes.json()).reservations || []);
    setSummary(await summaryRes.json());
  };
  useEffect(() => { load().catch(() => setNotice('The hotel desk is temporarily offline.')); }, []);
  useEffect(() => {
    if (!auth.token) return;
    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${auth.token}` } }).then((res) => res.json()).then((data) => {
      if (data.user) setAuth((prev) => ({ ...prev, user: data.user }));
    }).catch(() => localStorage.removeItem('coveToken'));
  }, [auth.token]);

  const filteredRooms = useMemo(() => rooms.filter((room) => (capacity === 'Any size' || room.guests >= Number(capacity)) && `${room.name} ${room.type} ${room.description}`.toLowerCase().includes(query.toLowerCase())), [rooms, query, capacity]);
  const nights = Math.max(1, Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000));

  const updateForm = (setter, key, value) => setter((prev) => ({ ...prev, [key]: value }));
  const submitAuth = async (event) => {
    event.preventDefault();
    const res = await fetch(`${API}/auth/${authMode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return setNotice(data.message || 'Could not sign in.');
    localStorage.setItem('coveToken', data.token); setAuth({ token: data.token, user: data.user }); setAuthOpen(false); setForm({ name: '', email: '', password: '' }); setNotice(`Welcome back, ${data.user.name.split(' ')[0]}.`);
  };
  const reserve = async (event) => {
    event.preventDefault();
    if (!auth.user) return setAuthOpen(true) || setNotice('Sign in to complete your reservation.');
    const res = await fetch(`${API}/reservations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...booking, roomId: selected.id, userId: auth.user.id, guestName: booking.guestName || auth.user.name }) });
    const data = await res.json();
    if (!res.ok) return setNotice(data.message || 'Please check your dates.');
    setSelected(null); setNotice(`Reservation ${data.reservation.id} is confirmed.`); load();
  };

  return <div className="site-shell">
    <header className="nav"><a className="wordmark" href="#top"><span className="wordmark-mark">CH</span><span>Cove House<small>STAY AWHILE</small></span></a><nav><a href="#rooms">Rooms</a><a href="#story">Our house</a><a href="#journal">Journal</a></nav><div className="nav-actions">{auth.user ? <button className="user-button" onClick={() => { localStorage.removeItem('coveToken'); setAuth({ token: '', user: null }); }}>Hi, {auth.user.name.split(' ')[0]} · Sign out</button> : <button className="text-button" onClick={() => setAuthOpen(true)}>Sign in</button>}<a className="nav-cta" href="#rooms">Book a room <span>↗</span></a></div></header>
    <main id="top">
      <section className="hero"><div className="hero-image"/><div className="hero-copy"><p className="eyebrow">A small hotel by the water · Maine</p><h1>A quieter kind<br/>of <em>stay.</em></h1><p className="hero-text">Cove House is a twelve-room retreat for long walks, late breakfasts, and the luxury of nowhere else to be.</p><a className="button dark" href="#rooms">Find your room <span>↓</span></a></div><div className="hero-note"><span>EST.</span><strong>1987</strong><span>ROCKPORT, ME</span></div></section>
      <section className="booking-bar" id="rooms"><div><label>Arrive</label><input type="date" min={today} value={booking.checkIn} onChange={(e) => updateForm(setBooking, 'checkIn', e.target.value)}/></div><div><label>Depart</label><input type="date" min={booking.checkIn} value={booking.checkOut} onChange={(e) => updateForm(setBooking, 'checkOut', e.target.value)}/></div><div><label>Guests</label><select value={booking.guests} onChange={(e) => updateForm(setBooking, 'guests', e.target.value)}><option value="1">1 guest</option><option value="2">2 guests</option><option value="3">3 guests</option><option value="4">4 guests</option></select></div><button className="button dark" onClick={() => document.getElementById('room-grid').scrollIntoView({ behavior: 'smooth' })}>Check availability <span>→</span></button></section>
      <section className="intro" id="story"><div><p className="eyebrow">Stay curious</p><h2>Come for the<br/><em>view.</em> Stay for<br/>the feeling.</h2></div><div className="intro-copy"><p>Part coastal inn, part private house. Cove House sits above Rockport Harbor with rooms that feel collected, not decorated. The kind of place where the day finds its own pace.</p><a className="underlined" href="#journal">A note from the house <span>↗</span></a></div></section>
      <section className="rooms-section"><div className="section-head"><div><p className="eyebrow">Make yourself at home</p><h2>Rooms with room<br/><em>to breathe.</em></h2></div><div className="filters"><input aria-label="Search rooms" placeholder="Search rooms" value={query} onChange={(e) => setQuery(e.target.value)}/><select value={capacity} onChange={(e) => setCapacity(e.target.value)}><option>Any size</option><option value="2">2+ guests</option><option value="3">3+ guests</option><option value="4">4 guests</option></select></div></div><div className="room-grid" id="room-grid">{filteredRooms.map((room) => <article className="room-card" key={room.id}><div className="room-image"><img src={room.image} alt={room.name}/><span className="room-type">{room.type}</span></div><div className="room-info"><div><h3>{room.name}</h3><p>{room.description}</p></div><div className="room-bottom"><span>{room.size} · up to {room.guests}</span><strong>{money(room.price)} <small>/ night</small></strong></div><button className="room-link" onClick={() => { setSelected(room); setBooking((prev) => ({ ...prev, guestName: auth.user?.name || '' })); }}>View room <span>→</span></button></div></article>)}</div>{filteredRooms.length === 0 && <p className="empty">No rooms match those filters.</p>}</section>
      <section className="operations"><div><p className="eyebrow">The house, today</p><h2>A little inside<br/>information.</h2></div><div className="stats">{[['Rooms', summary?.rooms || 0], ['Occupancy', `${summary?.occupancy || 0}%`], ['Nights booked', summary?.nightsBooked || 0]].map(([label, value]) => <div className="stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></section>
      <section className="journal" id="journal"><div className="journal-image"/><div><p className="eyebrow">From the journal · 04</p><h2>The art of<br/><em>doing less.</em></h2><p>There is a particular pleasure in an unplanned afternoon by the coast. Our favorite places to wander, eat, and linger.</p><a className="underlined" href="#top">Read the journal <span>↗</span></a></div></section>
    </main>
    <footer><span>© 2026 Cove House</span><span>Rockport, Maine · 44.184° N</span><span>Made for slow mornings</span></footer>
    {notice && <div className="notice" onClick={() => setNotice('')}>{notice} <span>×</span></div>}
    {authOpen && <div className="modal-backdrop" onClick={() => setAuthOpen(false)}><div className="modal auth-modal" onClick={(e) => e.stopPropagation()}><button className="close" onClick={() => setAuthOpen(false)}>×</button><p className="eyebrow">Welcome to Cove House</p><h2>{authMode === 'login' ? 'Good to see you.' : 'Make it yours.'}</h2><form onSubmit={submitAuth}>{authMode === 'register' && <input required placeholder="Full name" value={form.name} onChange={(e) => updateForm(setForm, 'name', e.target.value)}/>}<input required type="email" placeholder="Email address" value={form.email} onChange={(e) => updateForm(setForm, 'email', e.target.value)}/><input required type="password" placeholder="Password" minLength="6" value={form.password} onChange={(e) => updateForm(setForm, 'password', e.target.value)}/><button className="button dark" type="submit">{authMode === 'login' ? 'Sign in' : 'Create account'} <span>→</span></button></form><button className="switch" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>{authMode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button></div></div>}
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="modal booking-modal" onClick={(e) => e.stopPropagation()}><button className="close" onClick={() => setSelected(null)}>×</button><img src={selected.image} alt={selected.name}/><div className="booking-content"><p className="eyebrow">{selected.type} · {selected.size}</p><h2>{selected.name}</h2><p>{selected.description}</p><div className="amenities">{selected.amenities.map((item) => <span key={item}>{item}</span>)}</div><form onSubmit={reserve}><div className="booking-fields"><label>Arrive<input required type="date" min={today} value={booking.checkIn} onChange={(e) => updateForm(setBooking, 'checkIn', e.target.value)}/></label><label>Depart<input required type="date" min={booking.checkIn} value={booking.checkOut} onChange={(e) => updateForm(setBooking, 'checkOut', e.target.value)}/></label></div><input placeholder="Name on reservation" value={booking.guestName} onChange={(e) => updateForm(setBooking, 'guestName', e.target.value)} required/><div className="booking-total"><span>{money(selected.price)} × {nights} nights</span><strong>{money(selected.price * nights)}</strong></div><button className="button dark" type="submit">{auth.user ? 'Confirm reservation' : 'Sign in to reserve'} <span>→</span></button></form></div></div></div>}
  </div>;
}
