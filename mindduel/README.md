# MindDuel - Real-Time Trivia Game

A competitive 1v1 trivia game built with Next.js, Supabase, and real-time WebSocket technology. Challenge your knowledge against players worldwide with ELO-based matchmaking and leaderboards.

## 🎯 Features

- **Real-Time Gameplay**: Lightning-fast buzzer mechanics with WebSocket synchronization
- **ELO Rating System**: Sophisticated skill-based matchmaking and rankings
- **Massive Question Bank**: 200,000+ questions from Jeopardy archives
- **Smart Matchmaking**: Find opponents with similar skill levels
- **Quick Games**: Complete games in 10-15 minutes with 5x5 question grids
- **Community Features**: Track progress, view match history, and compete globally

## 🚀 Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Real-time**: Supabase Realtime for WebSocket communication
- **Deployment**: Vercel (frontend) + Supabase Cloud (backend)

## 📁 Project Structure

```
mindduel/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (game)/            # Game-related pages
│   │   ├── profile/           # User profile pages
│   │   └── leaderboard/       # Leaderboard page
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── game/              # Game-specific components
│   │   ├── lobby/             # Lobby components
│   │   └── layout/            # Layout components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── supabase/          # Supabase client configuration
│   │   ├── services/          # Business logic services
│   │   ├── db/                # Database layer functions
│   │   └── utils/             # Utility functions
│   ├── types/                 # TypeScript type definitions
│   └── constants/             # Application constants
├── supabase/                  # Database migrations and functions
├── scripts/                   # Utility scripts
└── public/                    # Static assets
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mindduel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up Supabase database**
   ```bash
   # Run migrations
   supabase db push
   
   # Import sample questions
   npm run import-questions
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Play

1. **Sign Up**: Create an account or sign in with Google
2. **Find Match**: Enter the matchmaking queue to find an opponent
3. **Select Questions**: Choose from a 5x5 grid of trivia questions
4. **Buzz In**: Be the first to buzz when the question is revealed
5. **Answer**: Submit your answer within 5 seconds
6. **Score Points**: Earn points for correct answers, lose points for incorrect ones
7. **Climb Rankings**: Win games to increase your ELO rating

## 🏗️ Architecture

### Database Schema

- **users**: User profiles with ELO ratings and game statistics
- **categories**: Question categories (History, Science, etc.)
- **questions**: Trivia questions with answers and difficulty levels
- **game_sessions**: Active and completed games
- **game_questions**: Questions selected for each game
- **buzzer_events**: Real-time buzzer press events
- **match_history**: Completed game records with ELO changes
- **matchmaking_queue**: Players waiting for matches

### Real-Time Features

- **WebSocket Subscriptions**: Live game state synchronization
- **Buzzer System**: Server-side timing validation prevents cheating
- **Score Updates**: Instant score changes across all clients
- **Matchmaking**: Real-time opponent finding and game creation

### ELO Rating System

- **K-Factor Strategy**: 
  - K=32 for players with <30 games (high volatility)
  - K=24 for players with 30-99 games
  - K=16 for players with 100+ games (stable ratings)
- **Fair Matchmaking**: Find opponents within ±100 ELO range
- **Expanding Search**: Gradually increase range if no match found

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run import-questions  # Import sample questions
```

### Key Components

- **GameBoard**: Interactive 5x5 question grid
- **BuzzerButton**: Real-time buzzer with timing validation
- **ScoreDisplay**: Live score updates and player information
- **MatchmakingQueue**: ELO-based opponent finding
- **QuestionCard**: Full-screen question display with answer input

### Custom Hooks

- **useRealtimeGame**: Manages game state and WebSocket subscriptions
- **useBuzzer**: Handles buzzer timing and answer submission
- **useMatchmaking**: Manages matchmaking queue and opponent finding
- **useGameState**: Local game state management

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set environment variables** in Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Supabase Setup

1. **Create Supabase project**
2. **Run migrations**
3. **Enable Realtime** for game tables
4. **Configure RLS policies**
5. **Import question database**

## 📊 Performance

- **Real-time Latency**: <100ms for buzzer events
- **Database Queries**: Optimized with proper indexing
- **Bundle Size**: Optimized with Next.js code splitting
- **Caching**: Supabase edge caching for static data

## 🔒 Security

- **Row Level Security**: Database-level access control
- **Server-side Validation**: All game actions validated server-side
- **Buzzer Timing**: Server timestamps prevent client manipulation
- **Rate Limiting**: Prevents spam and abuse

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **J-Archive**: Source of trivia questions
- **Supabase**: Backend infrastructure
- **Vercel**: Deployment platform
- **shadcn/ui**: UI component library

## 📞 Support

For support, email support@mindduel.com or join our Discord community.

---

Built with ❤️ by the MindDuel team