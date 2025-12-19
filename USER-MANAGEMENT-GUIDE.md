# 👥 User Management Guide - How to Add Users as Admin

## 🔑 Admin Access Required

Only users with **Admin** role can add, edit, and manage other users in the system.

## 📋 Step-by-Step Guide to Add Users

### **Method 1: Through the Web Interface (Recommended)**

1. **Login as Admin**:
   - Go to http://localhost:3000
   - Login with: `admin@crm.com` / `admin123`

2. **Navigate to Settings**:
   - Click on **Settings** in the sidebar
   - Click on the **User Management** tab (only visible to admins)

3. **Add New User**:
   - Click the **"Add User"** button
   - Fill out the user form with:

#### **Required Fields:**
- **First Name**: User's first name
- **Last Name**: User's last name  
- **Email**: User's email address (must be unique)
- **Password**: Initial password (minimum 6 characters)
- **Role**: Select from available roles

#### **Optional Fields:**
- **Phone**: User's phone number
- **Department**: Select from predefined departments
- **Territory**: Geographic or account territory
- **Quota**: Monthly sales quota (for sales roles)
- **Commission Rate**: Commission percentage (for sales roles)
- **Active Status**: Enable/disable user account

4. **Select User Role**:
   Choose the appropriate role based on the user's responsibilities:

   - **🎯 SDR (Sales Development Rep)**: Lead generation and qualification
   - **💼 AE (Account Executive)**: Deal management and closing
   - **🤝 CSM (Customer Success Manager)**: Post-sale relationship management
   - **📈 Account Manager**: Upsell and cross-sell
   - **🛠️ Support Engineer**: Customer support
   - **🔬 Product/Engineering**: Limited customer insight access
   - **📢 Marketing**: Campaign and lead management
   - **👔 Executive**: High-level overview
   - **👑 Admin**: Full system access

5. **Save User**:
   - Click **"Create User"**
   - User will be created with role-based permissions automatically assigned

### **Method 2: Using API (Advanced)**

For bulk user creation or integration with other systems:

```bash
# Create user via API
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@company.com",
    "password": "securepassword123",
    "role": "ae",
    "department": "Sales",
    "territory": "North America",
    "quota": 50000,
    "commissionRate": 5.5
  }'
```

### **Method 3: Direct Database Script (Development)**

For development or initial setup, you can create users directly:

```javascript
// Create additional users script
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User');

async function createUser() {
  await mongoose.connect('mongodb://localhost:27017/crm');
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  const user = new User({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@company.com',
    password: hashedPassword,
    role: 'sdr',
    department: 'Sales',
    permissions: ['leads.read', 'leads.write', 'contacts.read', 'contacts.write'],
    isActive: true
  });
  
  await user.save();
  console.log('User created successfully');
  process.exit(0);
}

createUser();
"
```

## 🎯 Role-Based Permissions

Each role automatically gets specific permissions:

### **Admin** 👑
- **Access**: Everything
- **Permissions**: All CRUD operations on all modules
- **Special**: Can manage users, system settings

### **SDR** 🎯
- **Access**: Companies (prospects), Contacts (leads), Deals (limited), Campaigns (lead gen)
- **Focus**: Lead generation, qualification, demo booking
- **Restrictions**: No access to subscriptions, tickets, settings

### **AE** 💼
- **Access**: Their assigned companies, contacts, full deal pipeline
- **Focus**: Deal management from demo to close
- **Restrictions**: No user management, limited analytics

### **CSM** 🤝
- **Access**: Customer companies, subscriptions, tickets, health scores
- **Focus**: Post-sale relationship, renewals, expansions
- **Restrictions**: No new business deals, no campaigns

### **Account Manager** 📈
- **Access**: Existing customers, expansion deals, subscriptions
- **Focus**: Upsell, cross-sell, account growth
- **Restrictions**: No new business, no support tickets

### **Support Engineer** 🛠️
- **Access**: Customer details (read-only), full ticket management
- **Focus**: Customer support, issue resolution
- **Restrictions**: No deals, no campaigns, no user management

### **Product/Engineering** 🔬
- **Access**: High-value accounts (read-only), feature requests, bugs
- **Focus**: Customer feedback, product development
- **Restrictions**: Very limited access, no financial data

### **Marketing** 📢
- **Access**: Prospects, leads, campaigns, marketing analytics
- **Focus**: Campaign management, lead generation
- **Restrictions**: No deal values, no customer data

### **Executive** 👔
- **Access**: All data (read-only), executive dashboards
- **Focus**: High-level overview, strategic insights
- **Restrictions**: No editing capabilities, no user management

## 🔧 User Management Features

### **Edit Users**:
- Update user information
- Change roles and permissions
- Activate/deactivate accounts
- Update quotas and territories

### **Reset Passwords**:
- Admin can reset any user's password
- User receives new temporary password
- Force password change on next login

### **Delete Users**:
- Permanently remove users from system
- Cannot delete your own admin account
- Confirmation required for safety

### **User Status**:
- **Active**: User can login and access system
- **Inactive**: User account disabled, cannot login

## 📊 User Analytics

Track user activity and performance:
- Login frequency
- Last login date
- Actions performed
- Quota attainment (for sales roles)
- Ticket resolution (for support roles)

## 🔒 Security Features

### **Password Requirements**:
- Minimum 6 characters
- Automatically hashed and encrypted
- Admin can reset passwords

### **Role-Based Security**:
- Users only see data they have permission to access
- API endpoints validate permissions
- Audit trails for all user actions

### **Session Management**:
- JWT tokens for authentication
- Automatic session timeout
- Refresh token rotation

## 🚀 Quick Start Examples

### **Add a Sales Team**:

1. **SDR** - Lead Generation:
   ```
   Name: Sarah Johnson
   Email: sarah.johnson@company.com
   Role: SDR
   Department: Sales
   Territory: North America
   Quota: $30,000/month
   ```

2. **AE** - Deal Closing:
   ```
   Name: Mike Davis
   Email: mike.davis@company.com
   Role: AE
   Department: Sales
   Territory: Enterprise
   Quota: $100,000/month
   Commission: 6%
   ```

3. **CSM** - Customer Success:
   ```
   Name: Lisa Chen
   Email: lisa.chen@company.com
   Role: CSM
   Department: Customer Success
   Territory: West Coast
   ```

### **Add Support Team**:

1. **Support Engineer**:
   ```
   Name: Tom Wilson
   Email: tom.wilson@company.com
   Role: Support Engineer
   Department: Support
   ```

### **Add Marketing Team**:

1. **Marketing Manager**:
   ```
   Name: Emma Brown
   Email: emma.brown@company.com
   Role: Marketing
   Department: Marketing
   ```

## 🎯 Best Practices

1. **Use Descriptive Emails**: Use company domain emails
2. **Set Appropriate Roles**: Match role to job function
3. **Define Territories**: Assign geographic or account territories
4. **Set Realistic Quotas**: Based on market and experience
5. **Regular Reviews**: Periodically review user access and roles
6. **Deactivate vs Delete**: Deactivate users instead of deleting for audit trails

## 🔧 Troubleshooting

### **Common Issues**:

1. **"User already exists"**: Email must be unique
2. **"Access denied"**: Only admins can manage users
3. **"Invalid role"**: Select from predefined roles only
4. **"Password too short"**: Minimum 6 characters required

### **Solutions**:
- Check email uniqueness
- Ensure you're logged in as admin
- Use valid role values
- Meet password requirements

---

## 🎉 You're Ready!

Your Software CRM now has comprehensive user management! You can:
- ✅ Add team members with appropriate roles
- ✅ Manage permissions automatically
- ✅ Track user activity and performance
- ✅ Maintain security and access control

**Start building your team today!** 🚀