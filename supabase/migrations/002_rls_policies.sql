-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buzzer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories table policies
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert categories" ON public.categories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Questions table policies
CREATE POLICY "Anyone can view questions" ON public.questions
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert questions" ON public.questions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Game sessions table policies
CREATE POLICY "Players can view their games" ON public.game_sessions
    FOR SELECT USING (
        auth.uid() = player1_id OR 
        auth.uid() = player2_id
    );

CREATE POLICY "Players can update their games" ON public.game_sessions
    FOR UPDATE USING (
        auth.uid() = player1_id OR 
        auth.uid() = player2_id
    );

CREATE POLICY "Authenticated users can create games" ON public.game_sessions
    FOR INSERT WITH CHECK (
        auth.uid() = player1_id OR 
        auth.uid() = player2_id
    );

-- Game questions table policies
CREATE POLICY "Players can view game questions" ON public.game_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.game_sessions 
            WHERE id = game_session_id 
            AND (player1_id = auth.uid() OR player2_id = auth.uid())
        )
    );

CREATE POLICY "Players can update game questions" ON public.game_questions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.game_sessions 
            WHERE id = game_session_id 
            AND (player1_id = auth.uid() OR player2_id = auth.uid())
        )
    );

CREATE POLICY "Authenticated users can insert game questions" ON public.game_questions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.game_sessions 
            WHERE id = game_session_id 
            AND (player1_id = auth.uid() OR player2_id = auth.uid())
        )
    );

-- Buzzer events table policies
CREATE POLICY "Players can view buzzer events" ON public.buzzer_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.game_sessions 
            WHERE id = game_session_id 
            AND (player1_id = auth.uid() OR player2_id = auth.uid())
        )
    );

CREATE POLICY "Players can insert buzzer events" ON public.buzzer_events
    FOR INSERT WITH CHECK (
        auth.uid() = player_id AND
        EXISTS (
            SELECT 1 FROM public.game_sessions 
            WHERE id = game_session_id 
            AND (player1_id = auth.uid() OR player2_id = auth.uid())
        )
    );

-- Match history table policies
CREATE POLICY "Players can view their match history" ON public.match_history
    FOR SELECT USING (
        auth.uid() = player1_id OR 
        auth.uid() = player2_id
    );

CREATE POLICY "System can insert match history" ON public.match_history
    FOR INSERT WITH CHECK (true);

-- Matchmaking queue table policies
CREATE POLICY "Users can view matchmaking queue" ON public.matchmaking_queue
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own queue entry" ON public.matchmaking_queue
    FOR ALL USING (auth.uid() = user_id);

-- Create function to check if user is in a game
CREATE OR REPLACE FUNCTION is_user_in_game(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.game_sessions 
        WHERE (player1_id = user_id OR player2_id = user_id)
        AND status IN ('waiting', 'in_progress')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's current game
CREATE OR REPLACE FUNCTION get_user_current_game(user_id UUID)
RETURNS UUID AS $$
DECLARE
    game_id UUID;
BEGIN
    SELECT id INTO game_id
    FROM public.game_sessions 
    WHERE (player1_id = user_id OR player2_id = user_id)
    AND status IN ('waiting', 'in_progress')
    ORDER BY created_at DESC
    LIMIT 1;
    
    RETURN game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
