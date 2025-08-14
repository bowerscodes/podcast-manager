# 🎧 Podcast Manager

A modern, full-stack podcast management platform built with Next.js 14, featuring comprehensive podcast creation, episode management, and RSS feed generation.

## ✨ Key Features

- **🎙️ Podcast Creation & Management** - Complete CRUD operations with metadata and artwork URL management
- **📱 Episode Management** - Episode creation with external audio URL linking and content organization  
- **📡 RSS Feed Generation** - Standards-compliant RSS feeds with platform detection (Apple Podcasts, Spotify, etc.)
- **🔐 Authentication** - Social login (Google, GitHub) and email/password authentication
- **📊 Analytics** - Real-time podcast and episode analytics with platform tracking
- **🎨 Modern UI** - Clean interface with HeroUI components and Tailwind CSS

## 🛠️ Tech Stack

**Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, HeroUI  
**Backend:** Next.js API Routes, Supabase (PostgreSQL)  
**Authentication:** Supabase Auth with OAuth providers  
**Testing:** Jest, React Testing Library  
**External Assets:** URL-based linking for audio files and podcast artwork

## 📊 Project Highlights

- **🏗️ Clean Architecture** - Well-structured components with proper separation of concerns
- **⚡ Performance Optimized** - Fast loading with optimized images and efficient data fetching
- **🔒 Database Security** - Protected database operations through Supabase's built-in security layer
- **📱 Responsive Layout** - Adaptive grid layouts that work across different screen sizes

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/bowerscodes/podcast-manager.git
cd podcast-manager
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials

# Run development server
npm run dev

# Run tests
npm test
```

## 🧪 Testing

Comprehensive test suite covering:
- Authentication flows and user management
- Form validation and submission
- Component rendering and interactions  
- API endpoints and database operations
- RSS feed generation and platform detection

```bash
npm test              # Run all tests
npm test -- --coverage  # Generate coverage report
```

## 📁 Project Structure

```
src/
├── app/              # Next.js 14 App Router
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and configurations
└── types/           # TypeScript type definitions
```

---

**Live Demo:** [Coming Soon]  
**Built by:** [James Bowers](https://github.com/bowerscodes)  
**License:** MIT
