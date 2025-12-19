# CRM System - Full Stack Application

A comprehensive Customer Relationship Management (CRM) system built with React, Node.js, Express, and MongoDB. This application provides complete contact management, sales pipeline tracking, marketing automation, customer support, and analytics capabilities.

## 🚀 Features

### Core Modules

#### 1. Contact & Lead Management
- Comprehensive contact database with customizable fields
- Contact segmentation and tagging system
- Lead tracking with automated scoring
- Lead source tracking and attribution
- Contact activity timeline
- Duplicate detection and merge functionality
- Import/export contacts (CSV, Excel)
- Custom fields for industry-specific data

#### 2. Sales Pipeline & Opportunity Management
- Visual drag-and-drop sales pipeline
- Customizable stages (Lead, Qualified, Proposal, Negotiation, Closed Won/Lost)
- Deal/opportunity tracking with value and probability
- Sales forecasting dashboard
- Quote and proposal generation
- Order management and tracking
- Win/loss analysis
- Sales activity logging
- Task and follow-up reminders

#### 3. Marketing Automation
- Email campaign builder
- Automated email sequences and drip campaigns
- Lead nurturing workflows
- Email templates library with personalization
- A/B testing for email campaigns
- Landing page builder
- Social media integration
- Campaign performance tracking
- Marketing attribution and ROI analysis

#### 4. Customer Service & Support
- Ticketing system with assignment and tracking
- Support ticket prioritization
- SLA tracking and alerts
- Knowledge base and FAQ management
- Live chat widget integration
- Customer satisfaction surveys
- Support ticket escalation workflows
- Canned responses and templates
- Multi-channel support

#### 5. Analytics & Reporting
- Customizable dashboard with drag-and-drop widgets
- Sales performance metrics
- Marketing campaign analytics
- Customer service metrics
- Custom report builder
- Scheduled report generation
- Data visualization (charts, graphs, heatmaps)
- Predictive analytics
- Customer segmentation analysis

#### 6. Team Collaboration
- Internal messaging and chat system
- @mentions and notifications
- Shared team calendar
- Task management with assignments
- File sharing and document management
- Activity feeds
- Comments and notes on records
- Email integration
- Video conferencing integration

#### 7. Workflow Automation
- Visual workflow builder
- Automated task creation
- Email automation based on behavior
- Lead assignment rules
- Notification and alert automation
- Data update automation
- Integration workflows

#### 8. Mobile CRM
- Responsive web design
- Progressive Web App (PWA) capabilities
- Offline data access and sync
- Mobile-optimized forms
- Click-to-call and email
- GPS check-in for field sales

## 🛠 Technology Stack

### Frontend (React)
- **React 18+** with hooks and functional components
- **React Router** for navigation
- **Redux Toolkit** for state management
- **Material-UI (MUI)** for UI components
- **React Hook Form** with Yup validation
- **React Query** for data fetching
- **Recharts** for data visualization
- **React Beautiful DnD** for drag-and-drop
- **Socket.io Client** for real-time features

### Backend (Node.js)
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** authentication with refresh tokens
- **Role-based access control (RBAC)**
- **bcrypt** for password hashing
- **Socket.io** for real-time communication
- **Express Validator** for input validation
- **Winston** for logging
- **Nodemailer** for email services
- **Multer** for file uploads

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd crm-system
```

### 2. Install Dependencies

Install dependencies for both server and client:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

Create environment files:

#### Server Environment (.env)
```bash
cd server
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=3333
MONGODB_URI=mongodb://localhost:27017/crm
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
CLIENT_URL=http://localhost:3000

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

#### Client Environment
```bash
cd ../client
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

### 4. Database Setup

Make sure MongoDB is running on your system. The application will automatically create the database and collections on first run.

### 5. Start the Application

#### Development Mode (Recommended)

From the root directory:

```bash
npm run dev
```

This will start both the server (port 5000) and client (port 3000) concurrently.

#### Production Mode

```bash
# Build the client
cd client
npm run build

# Start the server
cd ../server
npm start
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3333/api

## 👤 Default Users

The application includes demo credentials for testing:

- **Admin**: admin@crm.com / admin123
- **Sales**: sales@crm.com / sales123

## 📁 Project Structure

```
crm-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store and slices
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## 🔧 Available Scripts

### Root Directory
- `npm run dev` - Start both client and server in development mode
- `npm run install-all` - Install dependencies for all packages

### Server Directory
- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm test` - Run server tests

### Client Directory
- `npm start` - Start the React development server
- `npm run build` - Build the app for production
- `npm test` - Run client tests

## 🔐 Authentication & Authorization

The application uses JWT-based authentication with:

- **Access tokens** (15 minutes expiry)
- **Refresh tokens** (7 days expiry)
- **Role-based permissions** (admin, manager, sales, marketing, support)
- **Automatic token refresh**

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create new contact
- `GET /api/contacts/:id` - Get contact by ID
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Deals
- `GET /api/deals` - Get all deals
- `POST /api/deals` - Create new deal
- `GET /api/deals/:id` - Get deal by ID
- `PUT /api/deals/:id` - Update deal
- `DELETE /api/deals/:id` - Delete deal

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get campaign by ID
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Tickets
- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get ticket by ID
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Analytics
- `GET /api/analytics/overview` - Dashboard overview
- `GET /api/analytics/sales-performance` - Sales metrics
- `GET /api/analytics/pipeline` - Pipeline analytics
- `GET /api/analytics/campaigns` - Campaign performance

## 🔄 Real-time Features

The application includes real-time updates using Socket.io for:

- Live notifications
- Real-time dashboard updates
- Collaborative editing
- Activity feeds
- Chat messaging

## 📱 Mobile Support

The application is fully responsive and includes:

- Mobile-optimized interface
- Touch-friendly interactions
- Offline capability (PWA)
- Mobile-specific features

## 🧪 Testing

Run tests for both client and server:

```bash
# Server tests
cd server
npm test

# Client tests
cd client
npm test
```

## 🚀 Deployment

### Using Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment

1. Build the client application
2. Set up MongoDB database
3. Configure environment variables
4. Deploy server to your hosting platform
5. Serve client build files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- Advanced AI/ML features for lead scoring
- Integration with popular CRM platforms
- Advanced workflow automation
- Mobile native applications
- Advanced reporting and analytics
- Multi-language support
- Advanced security features

---

**Built with ❤️ using React, Node.js, and MongoDB**#   D e p l o y m e n t   t r i g g e r  
 