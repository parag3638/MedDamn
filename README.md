# MedDamn AI Powered Healthcare


MedDamn is an intelligent, end-to-end healthcare platform that streamlines clinical workflows and enhances diagnostic accuracy using AI. It empowers doctors with automated patient intake summaries, SOAP notes, differential diagnoses, and ICD-10 mappings, while providing patients a seamless digital experience from consultation to closure.

🚀 Core Features

AI-Assisted Intake: Converts patient conversations or form inputs into structured clinical summaries.

Smart Dashboards: Track patient cases with real-time status, review notes, and alerts.

Doctor Workflow Automation: Generates differential diagnoses, red-flag warnings, and treatment insights.

Template & Notes System: Organize clinical templates, reusable notes, and documentation.

Secure & Scalable Stack: Built with Next.js + Supabase + FastAPI, ensuring HIPAA-grade data security and performance.

💡 Vision

To transform clinical decision-making by blending human empathy with AI precision — making healthcare faster, smarter, and more accessible.



## Tech Stack
- **Next.js 14 + React**
- **TailwindCSS for UI**
- **NextAuth.js for Authentication**
- **Resend for Email MFA**
- **Axios for API Requests**
- **Session-Based Authentication**
- **CORS Protection** (Only allowed origins can access the backend)

## Folder Structure
```
frontend/
│── src/
│   ├── components/     # Reusable UI Components
│   ├── pages/          # Next.js Pages & Routes
│   ├── hooks/          # Custom Hooks
│   ├── lib/            # Authentication & API Logic
│   ├── styles/         # Global Styles
│── public/             # Static Assets
│── .env.local          # Environment Variables
│── package.json        # Dependencies
│── README.md           # Documentation
```

## Setup
### Prerequisites
- **Node.js v18+**
- **Backend running at `http://localhost:5000`**
- **Docker (Optional for Deployment)**

### Installation
1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/secure-file-sharing.git
cd secure-file-sharing/frontend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Start the Frontend**
```bash
npm run dev
```
The frontend will run at `http://localhost:3000`

## Authentication Flow
### Admin Authentication
- Admins **only use Passkey Authentication**.
- Admins can **create users**, but **not other admins**.
- Admins have access to the **User Management Panel**.

### User Authentication
- Users authenticate via **email & password**.
- Users must enter an **OTP sent via email (MFA using Resend)**.
- Users **do not** have access to the **Create User** tab.

## Features
- **Role-Based Access Control (RBAC)**
- **Session-Based Authentication** for better security.
- **CORS Protection** – Only the allowed frontend can send requests to the backend.
- **Secure File Upload & Download UI**

## Contact
For any questions, feel free to **open an issue** or contact me at:
📧 parag.singh528@gmail.com

