# Admin Panel Setup Guide

## Overview

The admin panel has been successfully implemented with the following structure:

```
/src/app/admin/
├── layout.tsx          # Admin-specific layout with navigation
├── page.tsx           # Admin dashboard with metrics
├── login/
│   └── page.tsx       # Admin login page
└── pedidos/
    └── page.tsx       # Orders management page
```

## Features Implemented

### 1. Authentication & Authorization
- **Admin-only access**: Only users with `role=ADMIN` can access the admin panel
- **Protected routes**: Middleware automatically redirects non-admin users
- **Session management**: Uses existing cookie-based authentication system

### 2. Admin Dashboard (`/admin`)
- **Metrics Cards**: Total orders, pending orders, completed today, revenue
- **Quick Actions**: Links to view orders, process pending orders, reports
- **Modern design**: Clean, professional interface with TailwindCSS

### 3. Orders Management (`/admin/pedidos`)
- **Orders listing**: Table view with pagination
- **Filtering**: Status filter (Pending, Processing, Ready, Delivered)
- **Search**: By CPF/CNPJ, name, or email
- **Status badges**: Visual indicators for order status
- **Responsive design**: Works on desktop and mobile

### 4. Admin Layout
- **Custom header**: Admin branding with role indicator
- **Navigation**: Links to dashboard and orders
- **User info**: Shows logged-in admin name/email
- **Logout**: Quick access to logout functionality

## Getting Started

### 1. Create Admin User

Run one of the following commands to create an admin user:

```bash
# Option 1: Use the test script
bun run ./test-admin.ts

# Option 2: Use database seed
bun run prisma db seed
```

### 2. Admin Credentials

After running the setup, use these credentials:

- **Email**: `admin@querodocumento.com`
- **Password**: `admin123456`

### 3. Access Admin Panel

1. Start the development server:
```bash
# With Docker
docker-compose -f docker-compose.dev.yml up

# Without Docker
bun run dev
```

2. Navigate to: `http://localhost:3009/admin`

3. You'll be redirected to `/admin/login` if not authenticated

4. Login with admin credentials to access the dashboard

## Admin Panel Routes

| Route | Description | Access Level |
|-------|-------------|--------------|
| `/admin` | Admin dashboard with metrics | ADMIN only |
| `/admin/login` | Admin login page | Public (redirects if already admin) |
| `/admin/pedidos` | Orders management | ADMIN only |
| `/api/admin/session` | Admin session verification | ADMIN only |

## Security Features

### Middleware Protection
- All `/admin/*` routes require authentication
- Users without ADMIN role are redirected to main dashboard
- Session validation on every request
- Automatic logout on session expiry

### Role-Based Access
```typescript
// Example: Check if user is admin
const response = await fetch('/api/admin/session')
const { isAdmin, user } = await response.json()

if (!isAdmin) {
  // Redirect or show error
}
```

## Database Schema

The admin system uses the existing User model with roles:

```prisma
enum UserRole {
  USER      # Regular users
  ADMIN     # System administrators  
  SUPPORT   # Support team (future use)
}

model User {
  id       String   @id @default(cuid())
  email    String   @unique
  name     String?
  role     UserRole @default(USER)
  // ... other fields
}
```

## Customization

### Adding New Admin Pages
1. Create page under `/src/app/admin/`
2. Update navigation in `layout.tsx`
3. Add route protection in `middleware.ts` if needed

### Modifying Dashboard Metrics
Edit `/src/app/admin/page.tsx` and update the `loadMetrics()` function to fetch real data from your API.

### Styling
The admin panel uses TailwindCSS with the project's existing design system. Modify colors and styling in the component files as needed.

## Production Considerations

### 1. Security
- Change default admin password immediately
- Use environment variables for sensitive data
- Implement proper rate limiting
- Add CSRF protection for admin actions

### 2. Real Data Integration
- Replace mock data in dashboard with real metrics from database
- Implement actual order management functionality
- Add proper error handling and loading states

### 3. Additional Features
- User management (create/edit/delete users)
- System settings and configuration
- Audit logs and activity tracking
- Report generation and export

## Troubleshooting

### Common Issues

1. **Cannot access admin panel**
   - Ensure user has `role=ADMIN` in database
   - Check session cookie is valid
   - Verify middleware is working correctly

2. **Redirect loops**
   - Clear browser cookies
   - Check middleware logic
   - Verify session API endpoint

3. **Styling issues**
   - Ensure TailwindCSS is properly configured
   - Check for conflicting styles
   - Verify CSS imports in layout

### Debug Commands

```bash
# Check admin user exists
bun run ./test-admin.ts

# Reset database and seed
bun run prisma db reset
bun run prisma db seed

# Check session API
curl http://localhost:3009/api/admin/session
```

## Next Steps

The admin panel foundation is complete. Consider adding:

- Real order processing functionality
- User management interface
- System configuration settings
- Advanced reporting and analytics
- Bulk operations for orders
- Email template management
- API rate limiting dashboard