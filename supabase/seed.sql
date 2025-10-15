-- Seed data for development
-- This file contains sample data to help with development and testing

-- Insert sample categories
INSERT INTO public.categories (name, description) VALUES
('History', 'Questions about historical events, figures, and periods'),
('Science', 'Questions about scientific facts, discoveries, and principles'),
('Literature', 'Questions about books, authors, and literary works'),
('Geography', 'Questions about countries, cities, and geographical features'),
('Sports', 'Questions about athletes, teams, and sporting events'),
('Movies', 'Questions about films, actors, and cinema'),
('Music', 'Questions about songs, artists, and musical genres'),
('Art', 'Questions about paintings, artists, and artistic movements'),
('Food & Drink', 'Questions about cuisine, beverages, and culinary traditions'),
('Technology', 'Questions about computers, software, and technological innovations');

-- Insert sample questions for each category
-- History questions
INSERT INTO public.questions (category_id, question_text, correct_answer, answer_variants, point_value, difficulty, source) VALUES
((SELECT id FROM public.categories WHERE name = 'History'), 'This ancient wonder was a lighthouse built in Alexandria, Egypt', 'The Lighthouse of Alexandria', ARRAY['Lighthouse of Alexandria', 'Alexandria Lighthouse', 'Pharos'], 200, 'easy', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'History'), 'This war ended in 1945 with the dropping of atomic bombs', 'World War II', ARRAY['WWII', 'Second World War', 'World War 2'], 400, 'medium', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'History'), 'This Roman emperor built a wall across northern England', 'Hadrian', ARRAY['Emperor Hadrian', 'Hadrian''s Wall'], 600, 'hard', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'History'), 'This French queen was executed during the French Revolution', 'Marie Antoinette', ARRAY['Queen Marie Antoinette'], 800, 'medium', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'History'), 'This ancient city was destroyed by Mount Vesuvius in 79 AD', 'Pompeii', ARRAY['City of Pompeii'], 1000, 'hard', 'J-Archive');

-- Science questions
INSERT INTO public.questions (category_id, question_text, correct_answer, answer_variants, point_value, difficulty, source) VALUES
((SELECT id FROM public.categories WHERE name = 'Science'), 'This gas makes up about 78% of Earth''s atmosphere', 'Nitrogen', ARRAY['N2', 'N₂'], 200, 'easy', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Science'), 'This is the chemical symbol for gold', 'Au', ARRAY['Gold'], 400, 'medium', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Science'), 'This is the speed of light in a vacuum', '299,792,458 meters per second', ARRAY['3 x 10^8 m/s', '300,000 km/s', '186,000 miles per second'], 600, 'hard', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Science'), 'This is the hardest natural substance on Earth', 'Diamond', ARRAY['Diamonds'], 800, 'medium', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Science'), 'This is the process by which plants convert sunlight into energy', 'Photosynthesis', ARRAY['Photosynthetic process'], 1000, 'hard', 'J-Archive');

-- Literature questions
INSERT INTO public.questions (category_id, question_text, correct_answer, answer_variants, point_value, difficulty, source) VALUES
((SELECT id FROM public.categories WHERE name = 'Literature'), 'This author wrote "To Kill a Mockingbird"', 'Harper Lee', ARRAY['Lee Harper'], 200, 'easy', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Literature'), 'This is the first book in J.K. Rowling''s Harry Potter series', 'Harry Potter and the Philosopher''s Stone', ARRAY['Harry Potter and the Sorcerer''s Stone', 'Philosopher''s Stone'], 400, 'medium', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Literature'), 'This Shakespeare play features the character Hamlet', 'Hamlet', ARRAY['The Tragedy of Hamlet'], 600, 'easy', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Literature'), 'This author wrote "1984"', 'George Orwell', ARRAY['Eric Blair'], 800, 'medium', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Literature'), 'This is the longest novel ever written', 'In Search of Lost Time', ARRAY['À la recherche du temps perdu', 'Remembrance of Things Past'], 1000, 'hard', 'J-Archive');

-- Geography questions
INSERT INTO public.questions (category_id, question_text, correct_answer, answer_variants, point_value, difficulty, source) VALUES
((SELECT id FROM public.categories WHERE name = 'Geography'), 'This is the largest country in the world by area', 'Russia', ARRAY['Russian Federation'], 200, 'easy', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Geography'), 'This is the longest river in the world', 'The Nile', ARRAY['Nile River', 'Nile'], 400, 'medium', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Geography'), 'This is the smallest country in the world', 'Vatican City', ARRAY['Vatican', 'Holy See'], 600, 'medium', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Geography'), 'This is the highest mountain in the world', 'Mount Everest', ARRAY['Everest'], 800, 'easy', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Geography'), 'This is the deepest ocean trench in the world', 'Mariana Trench', ARRAY['Mariana Trench', 'Challenger Deep'], 1000, 'hard', 'J-Archive');

-- Sports questions
INSERT INTO public.questions (category_id, question_text, correct_answer, answer_variants, point_value, difficulty, source) VALUES
((SELECT id FROM public.categories WHERE name = 'Sports'), 'This sport is played on a court with a net', 'Tennis', ARRAY['Tennis'], 200, 'easy', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Sports'), 'This is the number of players on a basketball team', 'Five', ARRAY['5', '5 players'], 400, 'easy', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Sports'), 'This is the distance of a marathon in miles', '26.2', ARRAY['26.2 miles', '26.2'], 600, 'medium', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Sports'), 'This is the most popular sport in the world', 'Soccer', ARRAY['Football', 'Association Football'], 800, 'medium', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Sports'), 'This is the only sport played on the moon', 'Golf', ARRAY['Golf'], 1000, 'hard', 'J-Archive');

-- Movies questions
INSERT INTO public.questions (category_id, question_text, correct_answer, answer_variants, point_value, difficulty, source) VALUES
((SELECT id FROM public.categories WHERE name = 'Movies'), 'This movie features the line "May the Force be with you"', 'Star Wars', ARRAY['Star Wars', 'Star Wars: A New Hope'], 200, 'easy', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Movies'), 'This is the highest-grossing movie of all time', 'Avatar', ARRAY['Avatar'], 400, 'medium', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Movies'), 'This director made "Citizen Kane"', 'Orson Welles', ARRAY['Welles'], 600, 'hard', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Movies'), 'This is the first animated feature film', 'Snow White and the Seven Dwarfs', ARRAY['Snow White'], 800, 'medium', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Movies'), 'This is the only silent film to win Best Picture', 'The Artist', ARRAY['Artist'], 1000, 'hard', 'J-Archive');

-- Music questions
INSERT INTO public.questions (category_id, question_text, correct_answer, answer_variants, point_value, difficulty, source) VALUES
((SELECT id FROM public.categories WHERE name = 'Music'), 'This is the most streamed song on Spotify', 'Blinding Lights', ARRAY['Blinding Lights by The Weeknd'], 200, 'medium', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Music'), 'This is the best-selling album of all time', 'Thriller', ARRAY['Thriller by Michael Jackson'], 400, 'easy', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Music'), 'This is the most Grammy Awards won by a single artist', '32', ARRAY['32 Grammys', '32 awards'], 600, 'hard', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Music'), 'This is the longest song ever recorded', 'The Rise and Fall of Bossanova', ARRAY['Bossanova'], 800, 'hard', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Music'), 'This is the most expensive musical instrument ever sold', 'Stradivarius violin', ARRAY['Stradivarius', 'Stradivari violin'], 1000, 'hard', 'J-Archive');

-- Art questions
INSERT INTO public.questions (category_id, question_text, correct_answer, answer_variants, point_value, difficulty, source) VALUES
((SELECT id FROM public.categories WHERE name = 'Art'), 'This artist painted the Mona Lisa', 'Leonardo da Vinci', ARRAY['Da Vinci', 'Leonardo'], 200, 'easy', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Art'), 'This is the most expensive painting ever sold', 'Salvator Mundi', ARRAY['Salvator Mundi by Leonardo da Vinci'], 400, 'hard', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Art'), 'This artist painted "The Starry Night"', 'Vincent van Gogh', ARRAY['Van Gogh'], 600, 'easy', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Art'), 'This is the most visited art museum in the world', 'The Louvre', ARRAY['Louvre Museum', 'Louvre'], 800, 'medium', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Art'), 'This is the oldest known cave painting', 'Chauvet Cave', ARRAY['Chauvet Cave paintings'], 1000, 'hard', 'J-Archive');

-- Food & Drink questions
INSERT INTO public.questions (category_id, question_text, correct_answer, answer_variants, point_value, difficulty, source) VALUES
((SELECT id FROM public.categories WHERE name = 'Food & Drink'), 'This is the most consumed beverage in the world', 'Water', ARRAY['Water'], 200, 'easy', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Food & Drink'), 'This is the most expensive spice in the world', 'Saffron', ARRAY['Saffron'], 400, 'medium', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Food & Drink'), 'This is the most popular pizza topping in the world', 'Pepperoni', ARRAY['Pepperoni'], 600, 'easy', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Food & Drink'), 'This is the most expensive coffee in the world', 'Kopi Luwak', ARRAY['Civet coffee', 'Luwak coffee'], 800, 'hard', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Food & Drink'), 'This is the most expensive wine ever sold', 'Domaine de la Romanée-Conti', ARRAY['DRC', 'Romanée-Conti'], 1000, 'hard', 'J-Archive');

-- Technology questions
INSERT INTO public.questions (category_id, question_text, correct_answer, answer_variants, point_value, difficulty, source) VALUES
((SELECT id FROM public.categories WHERE name = 'Technology'), 'This is the most popular programming language', 'JavaScript', ARRAY['JS', 'JavaScript'], 200, 'medium', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Technology'), 'This is the largest social media platform', 'Facebook', ARRAY['Meta', 'Facebook'], 400, 'easy', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Technology'), 'This is the most valuable company in the world', 'Apple', ARRAY['Apple Inc.'], 600, 'medium', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Technology'), 'This is the first search engine', 'Archie', ARRAY['Archie search engine'], 800, 'hard', 'J-Archive'),
((SELECT id FROM public.categories WHERE name = 'Technology'), 'This is the most expensive domain name ever sold', 'CarInsurance.com', ARRAY['CarInsurance.com'], 1000, 'hard', 'J-Archive');
