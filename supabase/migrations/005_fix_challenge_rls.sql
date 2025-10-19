-- Fix RLS policies for challenges table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can update challenges where they are the challenged" ON public.challenges;
DROP POLICY IF EXISTS "Users can update their own challenges for cancellation" ON public.challenges;

-- Create more permissive update policies
CREATE POLICY "Challenged users can update challenges" ON public.challenges
    FOR UPDATE USING (
        auth.uid() = challenged_id
    );

CREATE POLICY "Challengers can update their challenges" ON public.challenges
    FOR UPDATE USING (
        auth.uid() = challenger_id
    );

-- Allow users to delete their own challenges (for cancellation)
CREATE POLICY "Users can delete their own challenges" ON public.challenges
    FOR DELETE USING (
        auth.uid() = challenger_id OR auth.uid() = challenged_id
    );
