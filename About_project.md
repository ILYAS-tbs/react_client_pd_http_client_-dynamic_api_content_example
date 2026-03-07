# 📄 About PedaConnect

## 📝 Project Overview
PedaConnect is a robust educational management ecosystem designed to streamline administrative tasks and improve communication within educational institutions. The platform caters to three primary user groups: Schools, Teachers, and Parents, each with a tailored experience and set of tools.

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router Dom v6](https://reactrouter.com/)
- **State/Context**: React Context API

### Backend (External)
- **Framework**: [Django](https://www.djangoproject.com/)
- **API**: [Django REST Framework](https://www.django-rest-framework.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)

---

## 📂 Project Structure

```text
pedaconnect_frontend/
├── public/                 # Static assets (images, favicon)
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── school/         # School administrative components
│   │   ├── teacher/        # Teacher-specific tools
│   │   ├── parent/         # Parent portal components
│   │   └── shared/         # Common UI elements (Buttons, Inputs, etc.)
│   ├── contexts/           # React Contexts (Auth, UI state)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries and configurations
│   ├── models/             # TypeScript interfaces for data entities
│   ├── pages/              # Main page components and Layouts
│   │   └── dashboards/     # Entry points for the 3 dashboards
│   ├── services/           # API integration logic
│   │   └── http_api/       # HTTP client and endpoint definitions
│   ├── types/              # Global TypeScript type definitions
│   ├── utils/              # Helper functions
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Entry point
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies and scripts
```

---

## 🏛️ Core Modules

### 1. School Administration
Focused on high-level management:
- Teacher & Student enrollment.
- Class and schedule organization.
- Institution-wide announcements.

### 2. Teacher Workspace
Focuses on classroom performance:
- Grade management and reporting.
- Attendance tracking.
- Resource sharing with students/parents.

### 3. Parent Portal
Focused on child monitoring:
- Real-time performance tracking.
- Absence alerts.
- Direct communication channel with the school.

---
*This file is intended to provide a comprehensive understanding of the project's architecture and scope.*
