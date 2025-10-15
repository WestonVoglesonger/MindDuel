import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section */}
      <section className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-6">
            <span className="text-sm text-slate-400 uppercase tracking-wide">
              Real-Time Trivia Battles
            </span>
          </div>
          
          <h1 className="text-display mb-8">
            Test Your Knowledge in{' '}
            <span className="text-cyan-400">MindDuel</span>
          </h1>
          
          <p className="text-body text-slate-400 mb-12 max-w-2xl mx-auto">
            Compete in head-to-head trivia battles with real-time gameplay, 
            ELO rankings, and thousands of questions from Jeopardy archives.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href="/lobby">
                <button className="btn-primary text-lg px-8 py-6">
                  Start Playing
                </button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <button className="btn-primary text-lg px-8 py-6">
                    Get Started
                  </button>
                </Link>
                <Link href="/login">
                  <button className="btn-secondary text-lg px-8 py-6">
                    Sign In
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-heading mb-4">
              Why Choose MindDuel?
            </h2>
            <p className="text-body text-slate-400 max-w-2xl mx-auto">
              Experience the thrill of competitive trivia with features designed for serious players.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="mb-4">
                <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  Real-Time Gameplay
                </h3>
              </div>
              <p className="text-slate-400">
                Experience lightning-fast buzzer mechanics and instant score updates 
                powered by WebSocket technology.
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-xl">🏆</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  ELO Rankings
                </h3>
              </div>
              <p className="text-slate-400">
                Climb the leaderboards with our sophisticated ELO rating system 
                that matches you with players of similar skill.
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="mb-4">
                <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-xl">🧠</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  Massive Question Bank
                </h3>
              </div>
              <p className="text-slate-400">
                Access over 200,000 questions from Jeopardy archives across 
                diverse categories and difficulty levels.
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="mb-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  Smart Matchmaking
                </h3>
              </div>
              <p className="text-slate-400">
                Our intelligent matchmaking system finds opponents with similar 
                skill levels for fair and competitive games.
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-xl">⏱️</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  Quick Games
                </h3>
              </div>
              <p className="text-slate-400">
                Complete games in just 10-15 minutes with our streamlined 
                5x5 question board format.
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="mb-4">
                <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-xl">👥</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  Community Features
                </h3>
              </div>
              <p className="text-slate-400">
                Track your progress, view match history, and compete with 
                players from around the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-heading mb-6">
            Ready to Test Your Knowledge?
          </h2>
          <p className="text-body text-slate-400 mb-12">
            Join thousands of players competing in real-time trivia battles. 
            Your next challenge awaits!
          </p>
          
          {user ? (
            <Link href="/lobby">
              <button className="btn-primary text-lg px-8 py-6">
                Start Playing Now
              </button>
            </Link>
          ) : (
            <Link href="/register">
              <button className="btn-primary text-lg px-8 py-6">
                Join MindDuel
              </button>
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}