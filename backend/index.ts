import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, './.env') });

// Add validation for required environment variables
if (!process.env.RAPID_API_KEY || !process.env.RAPID_API_HOST) {
  console.error('Missing required environment variables:');
  console.error('RAPID_API_KEY:', process.env.RAPID_API_KEY);
  console.error('RAPID_API_HOST:', process.env.RAPID_API_HOST);
  throw new Error('Missing required environment variables');
}

const pool = require('./db');
const app = express();
const port = process.env.PORT || 3001; // Note: Use 3001 since Next.js uses 3000
const http = require('https');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Update these variables
const JWT_SECRET = process.env.JWT_SECRET;
const RAPID_API_KEY = process.env.RAPID_API_KEY;
const RAPID_API_HOST = process.env.RAPID_API_HOST;

// At the top of your file, after dotenv.config()
console.log('API Key:', process.env.RAPID_API_KEY);
console.log('API Host:', process.env.RAPID_API_HOST);

// Update CORS configuration for production
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://swipe-rent.vercel.app',
    /\.vercel\.app$/  // Allow all Vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Move this before your routes
app.use(express.json());

// Middleware to verify JWT tokens
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if(!token){
    return res.status(401).json({ error: "Access denied" });
  }

  jwt.verify(token, JWT_SECRET!, (err: any, user: any) => {
    if(err){
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Add this function near the top with your other imports
function validatePassword(password: string) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) return false;
  if (!hasUpperCase) return false;
  if (!hasLowerCase) return false;
  if (!hasNumber) return false;
  if (!hasSpecialChar) return false;

  return true;
}

// Routes can now access req.body
app.post('/api/signup', async (req: any, res: any) => {
  try{
    const {username, email, password} = req.body;
    
    // Add password validation
    if (!validatePassword(password)) {
      return res.status(400).json({ 
        error: "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special characters" 
      });
    }

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if(existingUser.rows.length > 0){
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into the database
    const newUser = await pool.query
    ('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email', [username, email, hashedPassword])

    // Create JWT token
    const token = jwt.sign(
      { id: newUser.rows[0].id, 
        username: newUser.rows[0].username, 
        email: newUser.rows[0].email }, 
        JWT_SECRET, 
      { expiresIn: '1h' }
      );

      res.json({
        token,
        user: {
          id: newUser.rows[0].id,
          username: newUser.rows[0].username,
          email: newUser.rows[0].email
        }
      });


  }catch(error){
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Sign in route
app.post('/api/signin', async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email
      }
    });

  } catch (error) {
    console.error('Error in signin:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add the protected route that the tests are expecting
app.get('/api/protected-route', authenticateToken, (req: any, res: any) => {
  res.json({ message: 'Protected data' });
});

app.get('/api/health', (req: any, res: any) => {
  res.json({ status: 'ok' });
});

app.get('/', (req: any, res: any) => {
  res.json({ message: 'Welcome to the SwipeRent API' });
});

interface FilterParams {
  location?: string;
  zoneId?: string;
  resultsPerPage?: number;
  page?: number;
  sortBy?: 'best_match' | 'newest' | 'lowest_price' | 'highest_price' | 'photo_count';
  expandSearchArea?: 0 | 1 | 5 | 10 | 25 | 50;
  propertyType?: string[];
  prices?: { min?: number; max?: number };
  bedrooms?: number;
  bathrooms?: number;
  moveInDate?: string;
  homeSize?: { min?: number; max?: number };
  threeDtoursOnly?: boolean;
  pets?: ('cats' | 'dogs' | 'no_pets_allowed')[];
  features?: string[];
  nycAmenities?: string[];
}

function buildQueryString(params: FilterParams): string {
  const queryParts: string[] = [];

  // Required parameter
  if (params.location) {
    queryParts.push(`location=${encodeURIComponent(params.location)}`);
  }

  // Optional parameters
  if (params.zoneId) queryParts.push(`zoneId=${params.zoneId}`);
  if (params.resultsPerPage) queryParts.push(`resultsPerPage=${params.resultsPerPage}`);
  if (params.page) queryParts.push(`page=${params.page}`);
  if (params.sortBy) queryParts.push(`sortBy=${params.sortBy}`);
  if (params.expandSearchArea !== undefined) queryParts.push(`expandSearchArea=${params.expandSearchArea}`);
  
  if (params.propertyType?.length) {
    queryParts.push(`propertyType=${params.propertyType.join(',')}`);
  }

  if (params.prices) {
    const priceStr = `${params.prices.min || ''},${params.prices.max || ''}`;
    queryParts.push(`prices=${priceStr}`);
  }

  if (params.bedrooms) queryParts.push(`bedrooms=${params.bedrooms}`);
  if (params.bathrooms) queryParts.push(`bathrooms=${params.bathrooms}`);
  if (params.moveInDate) queryParts.push(`moveInDate=${params.moveInDate}`);

  if (params.homeSize) {
    const sizeStr = `${params.homeSize.min || ''},${params.homeSize.max || ''}`;
    queryParts.push(`homeSize=${sizeStr}`);
  }

  if (params.threeDtoursOnly) queryParts.push('threeDtoursOnly=true');
  
  if (params.pets?.length) {
    queryParts.push(`pets=${params.pets.join(',')}`);
  }

  if (params.features?.length) {
    queryParts.push(`features=${params.features.join(',')}`);
  }

  if (params.nycAmenities?.length) {
    queryParts.push(`nycAmenities=${params.nycAmenities.join(',')}`);
  }

  return queryParts.join('&');
}

// Modified API endpoint
app.get('/api/listings', async (req: any, res: any) => {
  try {
    console.log('Received request with query:', req.query);
    
    const filters: FilterParams = {
      location: String(req.query.location || 'city:Brea, CA'),
      zoneId: String(req.query.zoneId || ''),
      resultsPerPage: Number(req.query.resultsPerPage) || 20,
      page: Number(req.query.page) || 1,
      sortBy: (req.query.sortBy as FilterParams['sortBy']) || 'best_match',
      expandSearchArea: (Number(req.query.expandSearchArea) || 10) as FilterParams['expandSearchArea'],
      propertyType: typeof req.query.propertyType === 'string' ? req.query.propertyType.split(',') : undefined,
      prices: typeof req.query.prices === 'string' ? {
        min: Number(req.query.prices.split(',')[0]),
        max: Number(req.query.prices.split(',')[1])
      } : undefined,
      bedrooms: Number(req.query.bedrooms),
      bathrooms: Number(req.query.bathrooms),
      moveInDate: String(req.query.moveInDate || ''),
      homeSize: typeof req.query.homeSize === 'string' ? {
        min: Number(req.query.homeSize.split(',')[0]),
        max: Number(req.query.homeSize.split(',')[1])
      } : undefined,
      threeDtoursOnly: req.query.threeDtoursOnly === 'true',
      pets: typeof req.query.pets === 'string' ? req.query.pets.split(',') as FilterParams['pets'] : undefined,
      features: typeof req.query.features === 'string' ? req.query.features.split(',') : undefined,
      nycAmenities: typeof req.query.nycAmenities === 'string' ? req.query.nycAmenities.split(',') : undefined,
    };

    console.log('Processed filters:', filters);
    const queryString = buildQueryString(filters);
    console.log('Built query string:', queryString);

    // Update the options object to ensure values exist
    const options = {
      method: 'GET',
      hostname: process.env.RAPID_API_HOST || '',
      port: null,
      path: `/properties/search-rent?${queryString}`,
      headers: {
        'x-rapidapi-key': process.env.RAPID_API_KEY || '',
        'x-rapidapi-host': process.env.RAPID_API_HOST || ''
      }
    };

    // Add validation before making the request
    if (!process.env.RAPID_API_KEY || !process.env.RAPID_API_HOST) {
      throw new Error('Missing required API configuration');
    }

    const request = http.request(options, (response: any) => {
      let data = '';

      response.on('data', (chunk: any) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          console.log('API Response:', parsedData);
          res.json(parsedData);
        } catch (error) {
          console.error('Error parsing response:', error);
          res.status(500).json({ error: 'Failed to parse API response' });
        }
      });
    });

    request.on('error', (error: any) => {
      console.error('Error making request:', error);
      res.status(500).json({ error: 'Failed to fetch listings' });
    });

    request.end();
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add favorite listing
app.post('/api/favorites', authenticateToken, async (req: any, res: any) => {
  try {
    const { apartment } = req.body;
    if (!apartment) {
      return res.status(400).json({ error: 'No apartment data provided' });
    }

    const user_id = req.user.id;

    // First ensure user exists in public.users
    const userExists = await pool.query(
      'SELECT id FROM public.users WHERE id = $1',
      [user_id]
    );



    // Rest of your existing apartment logic
    const apartment_id = apartment.property_id || apartment.id;

    if (!apartment_id) {
      return res.status(400).json({ error: 'No apartment ID provided' });
    }

    // Check if apartment exists
    const existingApartment = await pool.query(
      'SELECT id FROM apartments WHERE id = $1',
      [apartment_id]
    );

    if (existingApartment.rows.length === 0) {
      // Create new apartment
      await pool.query(
        `INSERT INTO apartments 
         (id, title, price, location, bedrooms, bathrooms, square_feet, image_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          apartment_id,
          apartment.location?.address?.line || '',
          apartment.list_price_min || 0,
          `${apartment.location?.address?.city || ''}, ${apartment.location?.address?.state_code || ''}`,
          apartment.description?.beds_min || 0,
          apartment.description?.baths_min || 0,
          apartment.description?.sqft_min || 0,
          apartment.primary_photo?.href || ''
        ]
      );
    }

    // Check if favorite already exists
    const existingFavorite = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND apartment_id = $2',
      [user_id, apartment_id]
    );

    if (existingFavorite.rows.length > 0) {
      return res.json({ 
        message: 'Apartment already in favorites',
        favorite: existingFavorite.rows[0]
      });
    }

    // Create new favorite
    const favoriteResult = await pool.query(
      'INSERT INTO favorites (user_id, apartment_id) VALUES ($1, $2) RETURNING *',
      [user_id, apartment_id]
    );

    res.json({
      favorite: favoriteResult.rows[0],
      apartment_id
    });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Get user's favorites with all apartment details
app.get('/api/favorites', authenticateToken, async (req: any, res: any) => {
  try {
    const user_id = req.user.id;
    const favorites = await pool.query(
      `SELECT DISTINCT ON (a.title, a.location)
        a.id,
        a.title,
        a.price,
        a.location,
        a.bedrooms,
        a.bathrooms,
        a.square_feet,
        a.image_url,
        a.amenitites,
        f.id as favorite_id,
        f.created_at
       FROM apartments a 
       INNER JOIN favorites f ON a.id = f.apartment_id 
       WHERE f.user_id = $1
       ORDER BY a.title, a.location, f.created_at DESC`,
      [user_id]
    );

    // Transform the data remains the same
    const transformedFavorites = favorites.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      price: row.price,
      location: row.location,
      beds: row.bedrooms,
      baths: row.bathrooms,
      size: row.square_feet,
      imageUrl: row.image_url,
      amenities: row.amenitites ? JSON.parse(row.amenitites) : [],
      favorite_id: row.favorite_id,
      created_at: row.created_at
    }));

    res.json(transformedFavorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Remove favorite
app.delete('/api/favorites/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    await pool.query(
      'DELETE FROM favorites WHERE apartment_id = $1 AND user_id = $2',
      [id, user_id]
    );

    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// Combine POST and PUT into a single route
app.route('/api/profile')
  .get(authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const result = await pool.query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [userId]
      );
      if (result.rows.length === 0) {
        return res.json(null);
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Server error' });
    }
  })
  .post(authenticateToken, async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const {
        full_name,
        phone_number,
        date_of_birth,
        current_address,
        bio,
        occupation,
        monthly_income,
        preferred_locations,
        max_budget
      } = req.body;

      // Check if profile exists
      const existingProfile = await pool.query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [userId]
      );

      if (existingProfile.rows.length > 0) {
        // Update existing profile
        const result = await pool.query(
          `UPDATE user_profiles 
           SET full_name = $1, 
               phone_number = $2, 
               date_of_birth = $3, 
               current_address = $4, 
               bio = $5, 
               occupation = $6, 
               monthly_income = $7, 
               preferred_locations = $8, 
               max_budget = $9,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $10
           RETURNING *`,
          [
            full_name,
            phone_number,
            date_of_birth,
            current_address,
            bio,
            occupation,
            monthly_income,
            preferred_locations,
            max_budget,
            userId
          ]
        );
        res.json(result.rows[0]);
      } else {
        // Create new profile
        const result = await pool.query(
          `INSERT INTO user_profiles 
           (user_id, full_name, phone_number, date_of_birth, current_address, 
            bio, occupation, monthly_income, preferred_locations, max_budget)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
          [
            userId,
            full_name,
            phone_number,
            date_of_birth,
            current_address,
            bio,
            occupation,
            monthly_income,
            preferred_locations,
            max_budget
          ]
        );
        res.json(result.rows[0]);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

// Get user profile
app.get('/api/profile', authenticateToken, async (req: any, res: any) => {
  try {
    console.log('Fetching profile for user:', req.user.id);
    
    const result = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [req.user.id]
    );

    console.log('Profile query result:', result.rows[0]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Convert any date fields to proper format
    const profile = result.rows[0];
    if (profile.date_of_birth) {
      profile.date_of_birth = new Date(profile.date_of_birth).toISOString().split('T')[0];
    }

    // Convert snake_case to camelCase for frontend
    const formattedProfile = {
      id: profile.id,
      userId: profile.user_id,
      fullName: profile.full_name,
      phoneNumber: profile.phone_number,
      dateOfBirth: profile.date_of_birth,
      currentAddress: profile.current_address,
      bio: profile.bio,
      occupation: profile.occupation,
      monthlyIncome: parseFloat(profile.monthly_income),
      preferredLocations: profile.preferred_locations || [],
      maxBudget: parseFloat(profile.max_budget),
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    };

    console.log('Formatted profile:', formattedProfile);
    res.json(formattedProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      details: (error as Error).message 
    });
  }
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const userId = req.user.id;
    const userDir = path.join(__dirname, 'uploads', userId.toString());
    
    // Create user directory if it doesn't exist
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (req: any, file: any, cb: any) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow certain file types
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPEG, PNG, and DOC files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Add these routes to your existing Express app
app.post('/api/documents/upload', authenticateToken, upload.single('document'), async (req: any, res: any) => {
  try {
    const { documentType, originalName } = req.body;
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Save document metadata to database - Changed status to 'verified' for MVP
    const result = await pool.query(
      `INSERT INTO user_documents (
        user_id, 
        document_type, 
        file_path, 
        original_name, 
        file_size,
        mime_type,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        userId,
        documentType,
        file.path,
        originalName || file.originalname,
        file.size,
        file.mimetype,
        'verified'  // Changed from 'pending' to 'verified'
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ 
      error: 'Failed to upload document',
      details: (error as Error).message 
    });
  }
});

// Get user's documents
app.get('/api/documents', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      'SELECT * FROM user_documents WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ 
      error: 'Failed to fetch documents',
      details: (error as Error).message 
    });
  }
});

// Delete document
app.delete('/api/documents/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const documentId = req.params.id;

    // Get document info
    const document = await pool.query(
      'SELECT * FROM user_documents WHERE id = $1 AND user_id = $2',
      [documentId, userId]
    );

    if (document.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from storage
    fs.unlinkSync(document.rows[0].file_path);

    // Delete from database
    await pool.query(
      'DELETE FROM user_documents WHERE id = $1 AND user_id = $2',
      [documentId, userId]
    );

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ 
      error: 'Failed to delete document',
      details: (error as Error).message 
    });
  }
});

// Submit application
app.post('/api/applications', authenticateToken, async (req: any, res: any) => {
  try {
    console.log('Starting application submission...');
    const userId = req.user.id;
    const { apartmentId, propertyManagerEmail } = req.body;
    console.log('User ID:', userId);
    console.log('Apartment ID:', apartmentId);

    // First check if application already exists
    const existingApplication = await pool.query(
      'SELECT * FROM apartment_applications WHERE user_id = $1 AND apartment_id = $2::bigint',
      [userId, apartmentId]
    );

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ 
        error: 'You have already applied to this apartment',
        application: existingApplication.rows[0]
      });
    }

    // Check if apartment exists
    console.log('Checking if apartment exists...');
    const apartmentExists = await pool.query(
      'SELECT id FROM apartments WHERE id = $1',
      [apartmentId]
    );
    console.log('Apartment query result:', apartmentExists.rows);

    if (apartmentExists.rows.length === 0) {
      console.log('Apartment not found in database');
      return res.status(404).json({ error: 'Apartment not found' });
    }

    // Get user's verified documents
    console.log('Fetching verified documents...');
    const documents = await pool.query(
      'SELECT * FROM user_documents WHERE user_id = $1 AND status = $2',
      [userId, 'verified']
    );
    console.log('Verified documents found:', documents.rows.length);

    // Get user's profile
    console.log('Fetching user profile...');
    const profile = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    console.log('Profile found:', profile.rows[0] ? 'Yes' : 'No');

    if (!profile.rows[0]) {
      console.log('Profile not found - returning error');
      return res.status(400).json({ error: 'Please complete your profile before applying' });
    }

    if (documents.rows.length === 0) {
      console.log('No verified documents found - returning error');
      return res.status(400).json({ error: 'Please upload and verify your documents before applying' });
    }

    // Create application record
    console.log('Creating application record...');
    const documentIds = documents.rows.map((doc: any) => doc.id);
    const application = await pool.query(
      `INSERT INTO apartment_applications 
       (user_id, apartment_id, documents, property_manager_email, status)
       VALUES ($1, $2::bigint, $3::jsonb, $4, 'pending')
       RETURNING *`,
      [
        userId, 
        apartmentId, 
        JSON.stringify(documentIds), // Convert array to JSONB string
        propertyManagerEmail
      ]
    );
    console.log('Application created:', application.rows[0]);

    res.json(application.rows[0]);
  } catch (error) {
    console.error('Application submission error:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    res.status(500).json({ 
      error: 'Failed to submit application',
      details: (error as Error).message 
    });
  }
});

// Add this endpoint to check if user has already applied
app.get('/api/applications/check/:apartmentId', authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const apartmentId = req.params.apartmentId;

    const result = await pool.query(
      'SELECT * FROM apartment_applications WHERE user_id = $1 AND apartment_id = $2::bigint',
      [userId, apartmentId]
    );

    res.json({
      hasApplied: result.rows.length > 0,
      application: result.rows[0] || null
    });
  } catch (error) {
    console.error('Error checking application status:', error);
    res.status(500).json({ error: 'Failed to check application status' });
  }
});

// Update the server listen code at the bottom
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

export default app;