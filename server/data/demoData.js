export const rooms = [
  {
    id: 'room-01', name: 'The Garden Room', type: 'King room', price: 245,
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=85',
    description: 'Morning light, a private terrace, and a bed made for slow Sundays.',
    amenities: ['Private terrace', 'King bed', 'Rain shower'], size: '32 m2', guests: 2, available: true,
  },
  {
    id: 'room-02', name: 'The Cove Suite', type: 'One-bedroom suite', price: 390,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
    description: 'A separate sitting room with wide water views and a deep soaking tub.',
    amenities: ['Water view', 'Living room', 'Soaking tub'], size: '54 m2', guests: 3, available: true,
  },
  {
    id: 'room-03', name: 'The Loft', type: 'Twin loft', price: 285,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
    description: 'High ceilings, two full beds, and a little room to spread out.',
    amenities: ['Two beds', 'Work desk', 'Breakfast included'], size: '41 m2', guests: 4, available: true,
  },
  {
    id: 'room-04', name: 'The Hideaway', type: 'King room', price: 210,
    image: 'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1200&q=85',
    description: 'Our most peaceful room, tucked behind the garden with a reading nook.',
    amenities: ['Garden access', 'King bed', 'Reading nook'], size: '28 m2', guests: 2, available: true,
  },
];

export const users = [
  { id: 'user-demo', name: 'Maya Chen', email: 'maya@example.com', password: 'demo-password', role: 'guest' },
];

export const reservations = [
  { id: 'RSV-2048', userId: 'user-demo', roomId: 'room-02', guestName: 'Maya Chen', checkIn: '2026-09-18', checkOut: '2026-09-21', guests: 2, total: 1170, status: 'Confirmed', createdAt: '2026-08-28T10:00:00.000Z' },
];
