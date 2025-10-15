-- Create function to calculate ELO rating changes
CREATE OR REPLACE FUNCTION calculate_elo_change(
    player_rating INTEGER,
    opponent_rating INTEGER,
    actual_score DECIMAL,
    k_factor INTEGER DEFAULT 32
)
RETURNS INTEGER AS $$
DECLARE
    expected_score DECIMAL;
    rating_change INTEGER;
BEGIN
    -- Calculate expected score using ELO formula
    expected_score := 1.0 / (1.0 + POWER(10, (opponent_rating - player_rating) / 400.0));
    
    -- Calculate rating change
    rating_change := ROUND(k_factor * (actual_score - expected_score));
    
    RETURN rating_change;
END;
$$ LANGUAGE plpgsql;

-- Create function to determine K-factor based on games played
CREATE OR REPLACE FUNCTION get_k_factor(games_played INTEGER)
RETURNS INTEGER AS $$
BEGIN
    IF games_played < 30 THEN
        RETURN 32;
    ELSIF games_played < 100 THEN
        RETURN 24;
    ELSE
        RETURN 16;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to update ELO ratings after a game
CREATE OR REPLACE FUNCTION update_elo_ratings(
    p_player1_id UUID,
    p_player2_id UUID,
    p_winner_id UUID
)
RETURNS TABLE(
    player1_new_rating INTEGER,
    player2_new_rating INTEGER,
    player1_change INTEGER,
    player2_change INTEGER
) AS $$
DECLARE
    player1_rating INTEGER;
    player2_rating INTEGER;
    player1_games INTEGER;
    player2_games INTEGER;
    player1_k_factor INTEGER;
    player2_k_factor INTEGER;
    player1_score DECIMAL;
    player2_score DECIMAL;
    player1_change INTEGER;
    player2_change INTEGER;
    player1_new_rating INTEGER;
    player2_new_rating INTEGER;
BEGIN
    -- Get current ratings and games played
    SELECT elo_rating, games_played 
    INTO player1_rating, player1_games
    FROM public.users WHERE id = p_player1_id;
    
    SELECT elo_rating, games_played 
    INTO player2_rating, player2_games
    FROM public.users WHERE id = p_player2_id;
    
    -- Determine actual scores (1 for win, 0 for loss, 0.5 for draw)
    IF p_winner_id = p_player1_id THEN
        player1_score := 1.0;
        player2_score := 0.0;
    ELSIF p_winner_id = p_player2_id THEN
        player1_score := 0.0;
        player2_score := 1.0;
    ELSE
        player1_score := 0.5;
        player2_score := 0.5;
    END IF;
    
    -- Get K-factors
    player1_k_factor := get_k_factor(player1_games);
    player2_k_factor := get_k_factor(player2_games);
    
    -- Calculate rating changes
    player1_change := calculate_elo_change(player1_rating, player2_rating, player1_score, player1_k_factor);
    player2_change := calculate_elo_change(player2_rating, player1_rating, player2_score, player2_k_factor);
    
    -- Calculate new ratings
    player1_new_rating := GREATEST(0, player1_rating + player1_change);
    player2_new_rating := GREATEST(0, player2_rating + player2_change);
    
    -- Update user ratings and game counts
    UPDATE public.users 
    SET elo_rating = player1_new_rating,
        games_played = games_played + 1,
        games_won = CASE WHEN p_winner_id = id THEN games_won + 1 ELSE games_won END,
        updated_at = NOW()
    WHERE id = p_player1_id;
    
    UPDATE public.users 
    SET elo_rating = player2_new_rating,
        games_played = games_played + 1,
        games_won = CASE WHEN p_winner_id = id THEN games_won + 1 ELSE games_won END,
        updated_at = NOW()
    WHERE id = p_player2_id;
    
    -- Return the results
    RETURN QUERY SELECT player1_new_rating, player2_new_rating, player1_change, player2_change;
END;
$$ LANGUAGE plpgsql;

-- Create function to find matchmaking opponent
CREATE OR REPLACE FUNCTION find_matchmaking_opponent(
    p_user_id UUID,
    p_elo_range INTEGER DEFAULT 100
)
RETURNS UUID AS $$
DECLARE
    user_elo INTEGER;
    opponent_id UUID;
BEGIN
    -- Get user's ELO rating
    SELECT elo_rating INTO user_elo
    FROM public.users WHERE id = p_user_id;
    
    -- Find opponent within ELO range
    SELECT mq.user_id INTO opponent_id
    FROM public.matchmaking_queue mq
    JOIN public.users u ON u.id = mq.user_id
    WHERE mq.user_id != p_user_id
    AND mq.status = 'waiting'
    AND ABS(u.elo_rating - user_elo) <= p_elo_range
    ORDER BY ABS(u.elo_rating - user_elo), mq.joined_at
    LIMIT 1;
    
    RETURN opponent_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up abandoned games
CREATE OR REPLACE FUNCTION cleanup_abandoned_games()
RETURNS INTEGER AS $$
DECLARE
    abandoned_count INTEGER;
BEGIN
    -- Mark games as abandoned if they've been waiting for more than 5 minutes
    UPDATE public.game_sessions 
    SET status = 'abandoned'
    WHERE status = 'waiting' 
    AND created_at < NOW() - INTERVAL '5 minutes';
    
    GET DIAGNOSTICS abandoned_count = ROW_COUNT;
    
    -- Remove users from matchmaking queue if they've been waiting too long
    DELETE FROM public.matchmaking_queue 
    WHERE status = 'waiting' 
    AND joined_at < NOW() - INTERVAL '10 minutes';
    
    RETURN abandoned_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get game statistics
CREATE OR REPLACE FUNCTION get_user_game_stats(p_user_id UUID)
RETURNS TABLE(
    total_games INTEGER,
    games_won INTEGER,
    win_rate DECIMAL,
    current_elo INTEGER,
    elo_tier TEXT
) AS $$
DECLARE
    user_games INTEGER;
    user_wins INTEGER;
    user_elo INTEGER;
    win_percentage DECIMAL;
    tier_name TEXT;
BEGIN
    -- Get user stats
    SELECT games_played, games_won, elo_rating
    INTO user_games, user_wins, user_elo
    FROM public.users WHERE id = p_user_id;
    
    -- Calculate win rate
    IF user_games > 0 THEN
        win_percentage := (user_wins::DECIMAL / user_games::DECIMAL) * 100;
    ELSE
        win_percentage := 0;
    END IF;
    
    -- Determine ELO tier
    IF user_elo < 1000 THEN
        tier_name := 'Novice';
    ELSIF user_elo < 1200 THEN
        tier_name := 'Bronze';
    ELSIF user_elo < 1400 THEN
        tier_name := 'Silver';
    ELSIF user_elo < 1600 THEN
        tier_name := 'Gold';
    ELSIF user_elo < 1800 THEN
        tier_name := 'Platinum';
    ELSIF user_elo < 2000 THEN
        tier_name := 'Diamond';
    ELSE
        tier_name := 'Master';
    END IF;
    
    RETURN QUERY SELECT user_games, user_wins, win_percentage, user_elo, tier_name;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create user profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to validate buzzer timing
CREATE OR REPLACE FUNCTION validate_buzzer_timing(
    p_game_session_id UUID,
    p_question_id UUID,
    p_player_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    game_status TEXT;
    question_position INTEGER;
    buzzer_count INTEGER;
BEGIN
    -- Check if game is in progress
    SELECT status INTO game_status
    FROM public.game_sessions 
    WHERE id = p_game_session_id;
    
    IF game_status != 'in_progress' THEN
        RETURN FALSE;
    END IF;
    
    -- Check if question exists in this game
    SELECT position INTO question_position
    FROM public.game_questions 
    WHERE game_session_id = p_game_session_id 
    AND question_id = p_question_id;
    
    IF question_position IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if player has already buzzed for this question
    SELECT COUNT(*) INTO buzzer_count
    FROM public.buzzer_events 
    WHERE game_session_id = p_game_session_id 
    AND question_id = p_question_id 
    AND player_id = p_player_id;
    
    IF buzzer_count > 0 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
