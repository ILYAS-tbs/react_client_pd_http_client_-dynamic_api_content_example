# Platform Admin Dashboard Documentation

## Overview

The Platform Admin Dashboard is a comprehensive management system for the PedaConnect platform administrators. It provides full control over schools, users, reports, announcements, and subscriptions through an intuitive web interface connected to the Platform Admin API.

## Directory Structure

```
src/
├── components/AdminDashboard/
│   ├── OverviewTab.tsx              # Dashboard overview with stats and analytics
│   ├── UsersManagement.tsx          # User management interface
│   ├── SchoolsManagement.tsx        # School management interface
│   ├── ReportsManagement.tsx        # Absence & behaviour reports management
│   ├── AnnouncementsManagement.tsx  # Platform announcements management
│   ├── MembershipsManagement.tsx    # Subscription management
│   ├── StatsCard.tsx                # Reusable stats card component
│   ├── ui.tsx                       # UI utility components
│   └── index.ts                     # Component exports
├── pages/dashboards/
│   └── AdminDashboard.tsx           # Main dashboard container
└── services/http_api/platform-admin/
    ├── admin_api_client.ts          # API client implementation
    ├── admin_types.ts               # TypeScript type definitions
    └── index.ts                     # Service exports
```

## Features

### 1. Overview Dashboard
Displays high-level metrics and platform health:
- Total schools, teachers, parents, and subscriptions
- Growth trends and analytics
- Pending actions and notifications
- Platform uptime and performance metrics

### 2. School Management
- List all schools with filtering and search
- Filter by school level (Primary, Middle, High)
- Filter by type (Public, Private)
- Activate/Suspend schools
- View detailed school information

### 3. User Management
- Browse all users (Schools, Teachers, Parents, Students)
- Filter by role and status
- Search by name or email
- Activate/Deactivate user accounts

### 4. Report Management
- **Absence Reports**: Track absence submissions and approvals
  - List pending/approved/rejected reports
  - Approve with optional comments
  - Reject with mandatory reason
  
- **Behaviour Reports**: Monitor student behaviour reports
  - View severity levels
  - Track reported incidents
  - Filter by status

### 5. Announcements Management
- Create platform-wide announcements
- Target specific audiences (Students, Parents, Everyone)
- Set priority levels (Low, Medium, High)
- Publish/Archive announcements
- Pin important announcements

### 6. Subscription Management
- Monitor active subscriptions
- Filter by subscription type (Free, Sub 200, Sub 500)
- Track expiration dates
- Identify expiring subscriptions (< 30 days)
- Extend subscriptions with reasons

## Usage

### Basic Setup

1. **Import the components:**
```typescript
import AdminDashboard from "src/pages/dashboards/AdminDashboard";

// Or import individual components
import {
  UsersManagement,
  SchoolsManagement,
  ReportsManagement,
} from "src/components/AdminDashboard";
```

2. **Use the admin API client:**
```typescript
import { adminApiClient } from "src/services/http_api/platform-admin";

// List schools
const schools = await adminApiClient.listSchools(1, 20, {
  school_level: "PRIMARY",
  search: "Cairo"
});

// Approve report
await adminApiClient.approveReport("report-id", "Approved - valid reason");

// Create announcement
await adminApiClient.createAnnouncement({
  title: "New System Update",
  content: "...",
  target_group: "EVERYONE",
  priority: "high"
});
```

### Component API

#### OverviewTab
```typescript
interface OverviewTabProps {
  onRefresh?: () => void;
}

// Shows dashboard stats, pending actions, and analytics
<OverviewTab onRefresh={() => console.log('Refreshed')} />
```

#### UsersManagement
```typescript
interface UsersManagementProps {
  onUserSelect?: (user: User) => void;
}

<UsersManagement onUserSelect={(user) => navigateTo(`/admin/users/${user.id}`)} />
```

#### SchoolsManagement
```typescript
interface SchoolsManagementProps {
  onSchoolSelect?: (school: School) => void;
}

<SchoolsManagement onSchoolSelect={(school) => showDetails(school)} />
```

#### ReportsManagement
```typescript
interface ReportsManagementProps {
  reportType?: "absence" | "behaviour";
}

<ReportsManagement reportType="absence" />
```

#### AnnouncementsManagement
```typescript
// No props required
<AnnouncementsManagement />
```

#### MembershipsManagement
```typescript
// No props required
<MembershipsManagement />
```

### Styling

All components use Tailwind CSS with:
- Dark mode support (`dark:` prefix)
- Primary color scheme (customizable via CSS variables)
- Responsive design
- Lucide icons for UI elements

### Error Handling

Components include built-in error handling with:
- Error alerts with dismissible messages
- Success notifications
- Loading states with spinners
- Retry mechanisms on failed requests

```typescript
// Components automatically handle:
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState<string | null>(null);

// Display errors
{error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

// Display success
{success && <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />}
```

## API Client Reference

### Class: adminApiClient

#### Admin Management
```typescript
// List admins
listAdmins(page, pageSize, { role, is_active, search, ordering })

// Get admin details
getAdmin(id)

// Create admin
createAdmin(data)

// Update admin
updateAdmin(id, data)

// Deactivate/Reactivate
deactivateAdmin(id)
reactivateAdmin(id)
```

#### School Management
```typescript
// List schools
listSchools(page, pageSize, { school_level, type, search, ordering })

// Get school details
getSchool(id)

// Update school
updateSchool(id, data)

// Activate/Suspend
activateSchool(id)
suspendSchool(id)
```

#### User Management
```typescript
// List users
listUsers(page, pageSize, { role, is_active, search, ordering })

// Get user details
getUser(id)

// Activate/Deactivate
deactivateUser(userId)
reactivateUser(userId)
```

#### Report Management
```typescript
// List reports
listReports(page, pageSize, { report_type, status, school, search, ordering })

// Get report details
getReport(id, reportType)

// Approve/Reject
approveReport(reportId, comment)
rejectReport(reportId, reason)
```

#### Announcement Management
```typescript
// List announcements
listAnnouncements(page, pageSize, { category, targetGroup, pinned, search, ordering })

// Get announcement
getAnnouncement(id)

// Create/Update
createAnnouncement(data)
updateAnnouncement(id, data)

// Publish/Archive
publishAnnouncement(id)
archiveAnnouncement(id)
```

#### Membership Management
```typescript
// List memberships
listMemberships(page, pageSize, { type, is_active, search, ordering })

// Get membership
getMembership(id)

// Extend subscription
extendMembership(id, months, reason)
```

## Type Definitions

All types are exported from `admin_types.ts`:

```typescript
interface School {
  id: string;
  name: string;
  email: string;
  school_level: "PRIMARY" | "MIDDLE" | "HIGH";
  type: "PUBLIC" | "PRIVATE";
  is_active: boolean;
  total_students: number;
  total_teachers: number;
  // ... more fields
}

interface User {
  id: number;
  username: string;
  email: string;
  role: "school" | "teacher" | "parent" | "student";
  is_active: boolean;
  // ... more fields
}

// All types documented in admin_types.ts
```

## Authentication

The API client automatically handles session-based authentication via:
- HTTP-only session cookies
- Credentials included in all requests
- Session validation by backend

No manual authentication headers required.

## Pagination

All list endpoints support pagination:
```typescript
// Get page 2 with 30 items per page
const response = await adminApiClient.listUsers(2, 30, filters);

// Response structure
{
  count: 150,        // Total items
  next: "url",       // Next page URL
  previous: "url",   // Previous page URL
  results: [...]     // Page results
}
```

## Filtering and Sorting

Each endpoint supports specific filters:

```typescript
// Example: List schools with filters
await adminApiClient.listSchools(1, 20, {
  school_level: "PRIMARY",
  type: "PUBLIC",
  search: "Cairo",
  ordering: "-created_at"  // - for descending
});
```

## Best Practices

1. **Error Handling**: Always wrap API calls in try-catch
2. **Loading States**: Show spinners while fetching data
3. **Pagination**: Don't load all items at once
4. **Validation**: Validate input before API calls
5. **User Feedback**: Show success/error messages for actions
6. **Responsive Design**: Test on mobile and tablet devices
7. **Accessibility**: Use semantic HTML and ARIA labels

## Example: Complete Admin User Flow

```typescript
import { UsersManagement } from "src/components/AdminDashboard";
import { User } from "src/services/http_api/platform-admin";

function AdminUsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div>
      <UsersManagement onUserSelect={setSelectedUser} />
      
      {selectedUser && (
        <UserDetailsModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
```

## Performance Optimization

- Components use pagination to handle large datasets
- Lazy loading of data on demand
- Memoization of components with React.memo (when needed)
- Efficient state management with useState hooks
- Debounced search input (can be added)

## Future Enhancements

- [ ] Add real-time websocket updates for admin notifications
- [ ] Implement advanced analytics dashboard
- [ ] Add bulk operations for admins
- [ ] Create custom report builder
- [ ] Add audit log viewer
- [ ] Implement role-based access control UI
- [ ] Add payment processing interface
- [ ] Create admin activity timeline

## Support

For API documentation, see: [PLATFORM_ADMIN_API_DOCUMENTATION.md](../../PLATFORM_ADMIN_API_DOCUMENTATION.md)

For issues or questions, contact the development team.
