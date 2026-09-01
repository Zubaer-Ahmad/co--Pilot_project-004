import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { reservations, rooms, users } from '../data/demoData.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cove-house-dev-secret';
const publicUser = ({ id, name, email, role }) => ({ id, name, email, role });
const findUser = (email) => users.find((user) => user.email.toLowerCase() === String(email).toLowerCase());

router.get('/rooms', (req, res) => {
  const guests = Number(req.query.guests || 1);
  res.json({ rooms: rooms.filter((room) => room.available && room.guests >= guests) });
});
router.get('/rooms/:id', (req, res) => {
  const room = rooms.find((item) => item.id === req.params.id);
  return room ? res.json({ room }) : res.status(404).json({ message: 'Room not found.' });
});

router.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6) return res.status(400).json({ message: 'Name, email, and a 6+ character password are required.' });
  if (findUser(email)) return res.status(409).json({ message: 'An account with that email already exists.' });
  const user = { id: `user-${Date.now()}`, name, email, password: await bcrypt.hash(password, 10), role: 'guest' };
  users.push(user);
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: publicUser(user) });
});
router.post('/auth/login', async (req, res) => {
  const user = findUser(req.body.email || '');
  if (!user || (user.password.startsWith('$2') ? !(await bcrypt.compare(req.body.password || '', user.password)) : user.password !== req.body.password)) return res.status(401).json({ message: 'Email or password is incorrect.' });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: publicUser(user) });
});
router.get('/me', (req, res) => {
  try {
    const payload = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), JWT_SECRET);
    const user = users.find((item) => item.id === payload.id);
    return user ? res.json({ user: publicUser(user) }) : res.status(401).json({ message: 'Unauthorized.' });
  } catch { return res.status(401).json({ message: 'Unauthorized.' }); }
});

router.get('/reservations', (req, res) => res.json({ reservations }));
router.post('/reservations', (req, res) => {
  const { userId, roomId, guestName, checkIn, checkOut, guests } = req.body;
  const room = rooms.find((item) => item.id === roomId);
  const start = new Date(checkIn); const end = new Date(checkOut);
  if (!userId || !room || !guestName || !checkIn || !checkOut || !guests || end <= start) return res.status(400).json({ message: 'Please complete the booking details.' });
  const nights = Math.ceil((end - start) / 86400000);
  const reservation = { id: `RSV-${Math.floor(1000 + Math.random() * 9000)}`, userId, roomId, guestName, checkIn, checkOut, guests: Number(guests), total: nights * room.price, status: 'Confirmed', createdAt: new Date().toISOString() };
  reservations.unshift(reservation);
  res.status(201).json({ reservation });
});
router.get('/summary', (req, res) => res.json({ nightsBooked: reservations.reduce((total, item) => total + Math.ceil((new Date(item.checkOut) - new Date(item.checkIn)) / 86400000), 0), reservations: reservations.length, occupancy: 78, rooms: rooms.length }));

export { router as apiRouter };
