# K-CAMP

> A comprehensive platform for discovering and managing university camps and events at KMITL

K-CAMP streamlines the process of organizing camps by providing ready-to-use templates for registration websites and forms, while creating a centralized discovery hub for students seeking opportunities across all faculties.

K-CAMP ช่วยอำนวยความสะดวกในการจัดค่าย โดยมีแบบฟอร์มและเทมเพลตเว็บไซต์ลงทะเบียนพร้อมใช้งาน อีกทั้งยังเป็น ศูนย์กลางกลางในการค้นหาข้อมูลค่าย สำหรับนักศึกษาที่ต้องการโอกาสเข้าร่วมกิจกรรมจากทุกคณะอย่างสะดวกและครบถ้วน

## ✨ Project Preview
### Video 🎬

<p align="center" width="100%">
<video src="https://github.com/user-attachments/assets/88f7108f-abfd-45a8-b697-5293ef08ee59" width="80%" controls></video>
</p>

### Image 🖼️
![alt text](./preview/imagemain.png)
![alt text](./preview/image20.png)
![alt text](./preview/image1.png)
![alt text](./preview/imagecreate.png)
![alt text](./preview/imagedash.png)


\## ✨ Features

- 🔍 **AI-Powered Search** - Semantic search to find camps by meaning, not just keywords
- 📝 **Camp Management** - Create and manage camps with a powerful dashboard
- 👥 **Registration System** - Handle participant registrations with status tracking
- 📊 **Analytics Dashboard** - Track views, registrations, and conversion rates
- 🎨 **Beautiful UI** - Modern design with shadcn-svelte components
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🔐 **Authentication** - Secure login with PocketBase

## 🛠 Tech Stack

**Frontend:**
- [SvelteKit](https://kit.svelte.dev/) - Web framework
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [shadcn-svelte](https://www.shadcn-svelte.com/) - UI components
- [Lucide Icons](https://lucide.dev/) - Icon library

**Backend:**
- [PocketBase](https://pocketbase.io/) - Database & Authentication
- SvelteKit Server Actions - API endpoints

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher)
- **npm** or **pnpm** or **yarn**
- **PocketBase** (for the backend)

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/SICout9010/K-Camp.git
cd K-Camp
```

### 2. Install dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
```

### 4. Start PocketBase

Download and run PocketBase:

```bash
# Download PocketBase from https://pocketbase.io/docs/
# Then run:
./pocketbase serve
```

PocketBase will be available at `http://127.0.0.1:8090/_/`

### 5. Configure PocketBase Schema

Refer to `docs/POCKETBASE_SCHEMA.md` for the complete database schema setup.

### 6. Start the development server

```bash
npm run dev
# or with auto-open
npm run dev -- --open
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
k-camp/
├── src/
│   ├── lib/
│   │   ├── components/      # Reusable components
│   │   │   ├── ui/         # shadcn-svelte components
│   │   │   ├── CampCatalog.svelte
│   │   │   ├── Header.svelte
│   │   │   └── ...
│   │   └── utils.ts        # Utility functions
│   ├── routes/
│   │   ├── +page.svelte                    # Homepage
│   │   ├── auth/                           # Authentication
│   │   ├── camp/
│   │   │   └── [slug]/
│   │   │       ├── +page.svelte           # Camp detail page
│   │   │       ├── dashboard/             # Organizer dashboard
│   │   │       └── register/              # Registration form
│   │   └── create-camp/                   # Camp creation
│   ├── app.css             # Global styles & theme
│   ├── app.html            # HTML template
│   └── hooks.server.ts     # Server hooks (auth, PocketBase)
├── docs/                   # Documentation
│   ├── CONTEXT.md         # Project context & roadmap
│   └── POCKETBASE_SCHEMA.md # Database schema
├── static/                 # Static assets
└── package.json
```
## 🎯 Key Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage with featured camps |
| `/camps` | Browse all camps |
| `/camp/[slug]` | Camp detail page |
| `/camp/[slug]/register` | Registration form |
| `/camp/[slug]/dashboard` | Organizer dashboard (auth required) |
| `/create-camp` | Create new camp (auth required) |
| `/auth` | Login/Register page |

## 🎨 Styling & Theming

The app uses a custom color palette defined in `src/app.css`:
- **Primary**: Orange (#FF6B35)
- **Accent**: Teal (#4ECDC4)
- **Background**: Light/Dark mode support
- **Fonts**: Montserrat (sans), Merriweather (serif), Ubuntu Mono (mono)

Customize colors by editing the CSS variables in `app.css`.

## 👨‍💻 Development Workflow

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## 🔐 Authentication Flow

1. User visits `/auth`
2. Login/Register with email & password
3. PocketBase handles authentication
4. Session stored in cookies
5. Protected routes check `locals.user`

## 📊 Dashboard Features

Organizers can access their camp dashboard at `/camp/[slug]/dashboard`:

- **Overview Tab** - Statistics and recent registrations
- **Registrations Tab** - Manage all applicants with filters
- **Settings Tab** - Edit camp details and contact info
- **Analytics Tab** - View performance metrics

### Registration Status Flow
```
pending → reviewing → accepted ✓
                   → rejected ✗
                   → waitlist 📋
                   → cancelled ❌
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PUBLIC_POCKETBASE_URL` | PocketBase API URL | `http://127.0.0.1:8090` |

## 🐛 Troubleshooting

### PocketBase Connection Issues
- Ensure PocketBase is running on port 8090
- Check `PUBLIC_POCKETBASE_URL` in `.env`
- Verify CORS settings in PocketBase

### Build Errors
- Clear `.svelte-kit` folder: `rm -rf .svelte-kit`
- Reinstall dependencies: `npm install`
- Check Node.js version (v18+)

### Authentication Issues
- Clear browser cookies
- Check PocketBase admin panel for user records
- Verify email is confirmed (if required)

## 📚 Documentation

- [Project Context](docs/CONTEXT.md) - Full project overview and roadmap
- [Database Schema](docs/POCKETBASE_SCHEMA.md) - Complete PocketBase setup

## 📄 License

This project is part of KMITL university initiative.

## 🙏 Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- UI components from [shadcn-svelte](https://www.shadcn-svelte.com/)
- Backend powered by [PocketBase](https://pocketbase.io/)

---

**Developed with ❤️ for KMITL Community**

