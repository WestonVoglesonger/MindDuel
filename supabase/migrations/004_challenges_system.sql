-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create challenge status enum
CREATE TYPE challenge_status AS ENUM ('pending', 'accepted', 'declined', 'expired', 'cancelled');

-- Challenges table
CREATE TABLE public.challenges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challenger_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    challenged_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    status challenge_status DEFAULT 'pending' NOT NULL,
    message TEXT,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 minutes') NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT different_users CHECK (challenger_id != challenged_id),
    CONSTRAINT message_length CHECK (char_length(message) <= 500)
);

-- Create indexes for performance
CREATE INDEX idx_challenges_challenger_id ON public.challenges(challenger_id);
CREATE INDEX idx_challenges_challenged_id ON public.challenges(challenged_id);
CREATE INDEX idx_challenges_status ON public.challenges(status);
CREATE INDEX idx_challenges_expires_at ON public.challenges(expires_at);
CREATE INDEX idx_challenges_created_at ON public.challenges(created_at);

-- Create unique constraint to prevent duplicate active challenges between same users
CREATE UNIQUE INDEX idx_challenges_unique_active 
ON public.challenges(challenger_id, challenged_id) 
WHERE status = 'pending';

-- Enable Row Level Security
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenges
CREATE POLICY "Users can view challenges where they are challenger or challenged" ON public.challenges
    FOR SELECT USING (
        auth.uid() = challenger_id OR 
        auth.uid() = challenged_id
    );

CREATE POLICY "Users can insert challenges where they are the challenger" ON public.challenges
    FOR INSERT WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Users can update challenges where they are the challenged" ON public.challenges
    FOR UPDATE USING (
        auth.uid() = challenged_id AND 
        status = 'pending'
    );

CREATE POLICY "Users can update their own challenges for cancellation" ON public.challenges
    FOR UPDATE USING (
        auth.uid() = challenger_id AND 
        status = 'pending'
    );

-- Create function to check if user can challenge another user
CREATE OR REPLACE FUNCTION can_challenge_user(
    p_challenger_id UUID,
    p_challenged_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    challenger_in_game BOOLEAN;
    challenged_in_game BOOLEAN;
    existing_challenge_count INTEGER;
BEGIN
    -- Check if challenger is in an active game
    SELECT EXISTS (
        SELECT 1 FROM public.game_sessions 
        WHERE (player1_id = p_challenger_id OR player2_id = p_challenger_id)
        AND status IN ('waiting', 'in_progress')
    ) INTO challenger_in_game;
    
    -- Check if challenged user is in an active game
    SELECT EXISTS (
        SELECT 1 FROM public.game_sessions 
        WHERE (player1_id = p_challenged_id OR player2_id = p_challenged_id)
        AND status IN ('waiting', 'in_progress')
    ) INTO challenged_in_game;
    
    -- Check if there's already a pending challenge between these users
    SELECT COUNT(*) INTO existing_challenge_count
    FROM public.challenges 
    WHERE ((challenger_id = p_challenger_id AND challenged_id = p_challenged_id) OR
           (challenger_id = p_challenged_id AND challenged_id = p_challenger_id))
    AND status = 'pending';
    
    -- Can challenge if neither user is in a game and no pending challenge exists
    RETURN NOT challenger_in_game AND NOT challenged_in_game AND existing_challenge_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's pending challenges
CREATE OR REPLACE FUNCTION get_user_pending_challenges(p_user_id UUID)
RETURNS TABLE(
    challenge_id UUID,
    challenger_id UUID,
    challenged_id UUID,
    status challenge_status,
    message TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    challenger_username TEXT,
    challenger_display_name TEXT,
    challenger_avatar_url TEXT,
    challenger_elo_rating INTEGER,
    challenged_username TEXT,
    challenged_display_name TEXT,
    challenged_avatar_url TEXT,
    challenged_elo_rating INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.challenger_id,
        c.challenged_id,
        c.status,
        c.message,
        c.expires_at,
        c.created_at,
        cu.username,
        cu.display_name,
        cu.avatar_url,
        cu.elo_rating,
        cdu.username,
        cdu.display_name,
        cdu.avatar_url,
        cdu.elo_rating
    FROM public.challenges c
    JOIN public.users cu ON cu.id = c.challenger_id
    JOIN public.users cdu ON cdu.id = c.challenged_id
    WHERE (c.challenger_id = p_user_id OR c.challenged_id = p_user_id)
    AND c.status = 'pending'
    ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to accept a challenge and create game session
CREATE OR REPLACE FUNCTION accept_challenge(p_challenge_id UUID, p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    challenge_record RECORD;
    game_session_id UUID;
BEGIN
    -- Get challenge details
    SELECT * INTO challenge_record
    FROM public.challenges
    WHERE id = p_challenge_id
    AND challenged_id = p_user_id
    AND status = 'pending'
    AND expires_at > NOW();
    
    -- Check if challenge exists and is valid
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Challenge not found or expired';
    END IF;
    
    -- Check if users can still play (not in other games)
    IF NOT can_challenge_user(challenge_record.challenger_id, challenge_record.challenged_id) THEN
        RAISE EXCEPTION 'One or both users are already in a game';
    END IF;
    
    -- Create game session
    INSERT INTO public.game_sessions (player1_id, player2_id, status)
    VALUES (challenge_record.challenger_id, challenge_record.challenged_id, 'waiting')
    RETURNING id INTO game_session_id;
    
    -- Update challenge status
    UPDATE public.challenges
    SET status = 'accepted',
        responded_at = NOW(),
        updated_at = NOW()
    WHERE id = p_challenge_id;
    
    -- Remove both users from matchmaking queue if they're in it
    DELETE FROM public.matchmaking_queue 
    WHERE user_id IN (challenge_record.challenger_id, challenge_record.challenged_id);
    
    RETURN game_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to expire old challenges
CREATE OR REPLACE FUNCTION expire_old_challenges()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE public.challenges 
    SET status = 'expired',
        updated_at = NOW()
    WHERE status = 'pending' 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to cleanup expired challenges
CREATE OR REPLACE FUNCTION cleanup_expired_challenges()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.challenges 
    WHERE status = 'expired' 
    AND updated_at < NOW() - INTERVAL '1 hour';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at
CREATE TRIGGER update_challenges_updated_at 
    BEFORE UPDATE ON public.challenges 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
