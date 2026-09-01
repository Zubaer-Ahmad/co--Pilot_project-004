import dotenv from 'dotenv';
import { app, connectDatabase } from './app.js';

dotenv.config();
const port = process.env.PORT || 5004;
await connectDatabase();
app.listen(port, () => console.log(`Cove House server running on http://localhost:${port}`));
