-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE game_status AS ENUM ('waiting', 'in_progress', 'completed', 'abandoned');
CREATE TYPE question_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE queue_status AS ENUM ('waiting', 'matched', 'cancelled');

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    elo_rating INTEGER DEFAULT 1200 NOT NULL,
    games_played INTEGER DEFAULT 0 NOT NULL,
    games_won INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$'),
    CONSTRAINT elo_rating_range CHECK (elo_rating >= 0 AND elo_rating <= 3000),
    CONSTRAINT games_played_non_negative CHECK (games_played >= 0),
    CONSTRAINT games_won_non_negative CHECK (games_won >= 0),
    CONSTRAINT games_won_not_greater CHECK (games_won <= games_played)
);

-- Categories table
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

-- Questions table
CREATE TABLE public.questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    answer_variants TEXT[] DEFAULT '{}' NOT NULL,
    point_value INTEGER NOT NULL,
    difficulty question_difficulty DEFAULT 'medium' NOT NULL,
    air_date DATE,
    source TEXT DEFAULT 'J-Archive' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT question_text_length CHECK (char_length(question_text) >= 10 AND char_length(question_text) <= 1000),
    CONSTRAINT correct_answer_length CHECK (char_length(correct_answer) >= 1 AND char_length(correct_answer) <= 200),
    CONSTRAINT point_value_valid CHECK (point_value IN (200, 400, 600, 800, 1000))
);

-- Game sessions table
CREATE TABLE public.game_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player1_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    player2_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    status game_status DEFAULT 'waiting' NOT NULL,
    player1_score INTEGER DEFAULT 0 NOT NULL,
    player2_score INTEGER DEFAULT 0 NOT NULL,
    current_turn_player_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    board_state JSONB DEFAULT '{}' NOT NULL,
    winner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT different_players CHECK (player1_id != player2_id),
    CONSTRAINT scores_non_negative CHECK (player1_score >= 0 AND player2_score >= 0),
    CONSTRAINT current_turn_valid CHECK (
        current_turn_player_id IS NULL OR 
        current_turn_player_id = player1_id OR 
        current_turn_player_id = player2_id
    ),
    CONSTRAINT winner_valid CHECK (
        winner_id IS NULL OR 
        winner_id = player1_id OR 
        winner_id = player2_id
    )
);

-- Game questions junction table
CREATE TABLE public.game_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    position INTEGER NOT NULL,
    answered_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_correct BOOLEAN,
    answered_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT position_range CHECK (position >= 0 AND position <= 24),
    CONSTRAINT unique_position_per_game UNIQUE (game_session_id, position),
    CONSTRAINT unique_question_per_game UNIQUE (game_session_id, question_id)
);

-- Buzzer events table
CREATE TABLE public.buzzer_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    buzz_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    was_first BOOLEAN,
    
    CONSTRAINT unique_buzz_per_question UNIQUE (game_session_id, question_id, player_id)
);

-- Match history table
CREATE TABLE public.match_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
    player1_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    player2_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    player1_score INTEGER NOT NULL,
    player2_score INTEGER NOT NULL,
    player1_elo_before INTEGER NOT NULL,
    player1_elo_after INTEGER NOT NULL,
    player2_elo_before INTEGER NOT NULL,
    player2_elo_after INTEGER NOT NULL,
    winner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    CONSTRAINT different_players_history CHECK (player1_id != player2_id),
    CONSTRAINT scores_non_negative_history CHECK (player1_score >= 0 AND player2_score >= 0),
    CONSTRAINT elo_ratings_valid CHECK (
        player1_elo_before >= 0 AND player1_elo_before <= 3000 AND
        player1_elo_after >= 0 AND player1_elo_after <= 3000 AND
        player2_elo_before >= 0 AND player2_elo_before <= 3000 AND
        player2_elo_after >= 0 AND player2_elo_after <= 3000
    ),
    CONSTRAINT winner_valid_history CHECK (
        winner_id IS NULL OR 
        winner_id = player1_id OR 
        winner_id = player2_id
    )
);

-- Matchmaking queue table
CREATE TABLE public.matchmaking_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    elo_rating INTEGER NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    status queue_status DEFAULT 'waiting' NOT NULL,
    
    CONSTRAINT elo_rating_range_queue CHECK (elo_rating >= 0 AND elo_rating <= 3000),
    CONSTRAINT unique_user_in_queue UNIQUE (user_id)
);

-- Create indexes for performance
CREATE INDEX idx_users_elo_rating ON public.users(elo_rating);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_questions_category_id ON public.questions(category_id);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX idx_questions_point_value ON public.questions(point_value);
CREATE INDEX idx_game_sessions_status ON public.game_sessions(status);
CREATE INDEX idx_game_sessions_player1_id ON public.game_sessions(player1_id);
CREATE INDEX idx_game_sessions_player2_id ON public.game_sessions(player2_id);
CREATE INDEX idx_game_questions_game_session_id ON public.game_questions(game_session_id);
CREATE INDEX idx_game_questions_position ON public.game_questions(position);
CREATE INDEX idx_buzzer_events_game_session_id ON public.buzzer_events(game_session_id);
CREATE INDEX idx_buzzer_events_question_id ON public.buzzer_events(question_id);
CREATE INDEX idx_match_history_player1_id ON public.match_history(player1_id);
CREATE INDEX idx_match_history_player2_id ON public.match_history(player2_id);
CREATE INDEX idx_match_history_completed_at ON public.match_history(completed_at);
CREATE INDEX idx_matchmaking_queue_status ON public.matchmaking_queue(status);
CREATE INDEX idx_matchmaking_queue_elo_rating ON public.matchmaking_queue(elo_rating);
CREATE INDEX idx_matchmaking_queue_joined_at ON public.matchmaking_queue(joined_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
