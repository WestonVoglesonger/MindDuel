'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DeployedDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const debugDeployed = async () => {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      // Get session info
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // Test database connection
      let dbTest = null
      try {
        const { data, error } = await supabase
          .from('users')
          .select('count')
          .limit(1)
        dbTest = { data, error }
      } catch (e) {
        dbTest = { error: e }
      }

      // Get environment info (what the client can see)
      const envInfo = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        // Try to decode the JWT to see project info
        jwtPayload: (() => {
          try {
            if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
              return JSON.parse(atob(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.split('.')[1]))
            }
          } catch (e) {
            return { error: 'Could not decode JWT' }
          }
          return null
        })()
      }

      setDebugInfo({
        user,
        userError,
        session,
        sessionError,
        dbTest,
        envInfo,
        timestamp: new Date().toISOString()
      })
      setLoading(false)
    }

    debugDeployed()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Deployed App Debug Info</h1>
        
        <div className="space-y-6">
          {/* Environment Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
            <div className="space-y-2 font-mono text-sm">
              <p><strong>Supabase URL:</strong> {debugInfo?.envInfo?.supabaseUrl}</p>
              <p><strong>Has Anon Key:</strong> {debugInfo?.envInfo?.hasAnonKey ? 'Yes' : 'No'}</p>
              <p><strong>Anon Key Length:</strong> {debugInfo?.envInfo?.anonKeyLength} characters</p>
              {debugInfo?.envInfo?.jwtPayload && (
                <div>
                  <strong>JWT Payload:</strong>
                  <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                    {JSON.stringify(debugInfo.envInfo.jwtPayload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Current User</h2>
            {debugInfo?.userError ? (
              <p className="text-red-600">Error: {debugInfo.userError.message}</p>
            ) : debugInfo?.user ? (
              <div className="space-y-2">
                <p><strong>Email:</strong> {debugInfo.user.email}</p>
                <p><strong>ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{debugInfo.user.id}</code></p>
                <p><strong>Created:</strong> {new Date(debugInfo.user.created_at).toLocaleString()}</p>
                <p><strong>Last Sign In:</strong> {new Date(debugInfo.user.last_sign_in_at).toLocaleString()}</p>
              </div>
            ) : (
              <p className="text-gray-600">No user authenticated</p>
            )}
          </div>

          {/* Session Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Session Info</h2>
            {debugInfo?.sessionError ? (
              <p className="text-red-600">Error: {debugInfo.sessionError.message}</p>
            ) : debugInfo?.session ? (
              <div className="space-y-2">
                <p><strong>User Email:</strong> {debugInfo.session.user.email}</p>
                <p><strong>Expires At:</strong> {new Date(debugInfo.session.expires_at! * 1000).toLocaleString()}</p>
                <p><strong>Access Token Length:</strong> {debugInfo.session.access_token?.length || 0} characters</p>
                <p><strong>Refresh Token Length:</strong> {debugInfo.session.refresh_token?.length || 0} characters</p>
              </div>
            ) : (
              <p className="text-gray-600">No active session</p>
            )}
          </div>

          {/* Database Test */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Database Connection Test</h2>
            {debugInfo?.dbTest?.error ? (
              <p className="text-red-600">Error: {debugInfo.dbTest.error.message || debugInfo.dbTest.error}</p>
            ) : (
              <p className="text-green-600">Database connection successful</p>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <strong>Next Steps:</strong>
            <ol className="mt-2 list-decimal list-inside space-y-1">
              <li>Check the JWT payload above - it shows which Supabase project this is connecting to</li>
              <li>Look at the "ref" field in the JWT - this should match your current project ID</li>
              <li>If it's wrong, your Vercel environment variables need to be updated</li>
              <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
              <li>Update NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              <li>Redeploy your app</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
