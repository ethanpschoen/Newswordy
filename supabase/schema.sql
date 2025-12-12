-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.article_words (
  id integer NOT NULL DEFAULT nextval('article_words_id_seq'::regclass),
  article_id integer NOT NULL,
  word character varying NOT NULL,
  frequency integer NOT NULL,
  created_date timestamp without time zone,
  CONSTRAINT article_words_pkey PRIMARY KEY (id),
  CONSTRAINT article_words_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id)
);
CREATE TABLE public.articles (
  id integer NOT NULL DEFAULT nextval('articles_id_seq'::regclass),
  source character varying NOT NULL,
  headline text NOT NULL,
  url character varying NOT NULL UNIQUE,
  published_date timestamp with time zone,
  scraped_date timestamp with time zone,
  content text,
  CONSTRAINT articles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.associate_games (
  id text NOT NULL DEFAULT gen_random_uuid(),
  score integer NOT NULL DEFAULT 0,
  completed_at timestamp without time zone,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  max_guesses integer NOT NULL DEFAULT 3,
  scoreboard_size integer NOT NULL DEFAULT 10,
  time_period text NOT NULL,
  user_id text,
  sources ARRAY,
  guessed_words ARRAY,
  remaining_guesses integer,
  is_completed boolean,
  word text,
  CONSTRAINT associate_games_pkey PRIMARY KEY (id),
  CONSTRAINT associate_games_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.associate_guesses (
  id text NOT NULL,
  word text NOT NULL,
  frequency integer NOT NULL DEFAULT 0,
  score integer NOT NULL DEFAULT 0,
  rank integer,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  game_id text NOT NULL,
  user_id text,
  CONSTRAINT associate_guesses_pkey PRIMARY KEY (id),
  CONSTRAINT associate_guesses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT associate_guesses_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.associate_games(id)
);
CREATE TABLE public.compare_associate_games (
  id text NOT NULL DEFAULT gen_random_uuid(),
  score integer NOT NULL DEFAULT 0,
  completed_at timestamp without time zone,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  max_guesses integer NOT NULL DEFAULT 3,
  scoreboard_size integer NOT NULL DEFAULT 10,
  time_period text NOT NULL,
  user_id text,
  sources_group_a ARRAY,
  guessed_words_group_a ARRAY,
  remaining_guesses integer,
  is_completed boolean,
  sources_group_b ARRAY,
  guessed_words_group_b ARRAY,
  word text NOT NULL,
  CONSTRAINT compare_associate_games_pkey PRIMARY KEY (id),
  CONSTRAINT compare_associate_games_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.compare_associate_guesses (
  id text NOT NULL,
  word text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  rank integer,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  game_id text NOT NULL,
  user_id text,
  CONSTRAINT compare_associate_guesses_pkey PRIMARY KEY (id),
  CONSTRAINT compare_associate_guesses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT compare_associate_guesses_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.compare_associate_games(id)
);
CREATE TABLE public.compare_games (
  id text NOT NULL DEFAULT gen_random_uuid(),
  score integer NOT NULL DEFAULT 0,
  completed_at timestamp without time zone,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  max_guesses integer NOT NULL DEFAULT 3,
  scoreboard_size integer NOT NULL DEFAULT 10,
  time_period text NOT NULL,
  user_id text,
  sources_group_a ARRAY,
  guessed_words_group_a ARRAY,
  remaining_guesses integer,
  is_completed boolean,
  sources_group_b ARRAY,
  guessed_words_group_b ARRAY,
  CONSTRAINT compare_games_pkey PRIMARY KEY (id),
  CONSTRAINT compare_games_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.compare_guesses (
  id text NOT NULL,
  word text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  rank integer,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  game_id text NOT NULL,
  user_id text,
  CONSTRAINT compare_guesses_pkey PRIMARY KEY (id),
  CONSTRAINT compare_guesses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT compare_guesses_game_id_fkey1 FOREIGN KEY (game_id) REFERENCES public.compare_games(id)
);
CREATE TABLE public.games (
  id text NOT NULL DEFAULT gen_random_uuid(),
  score integer NOT NULL DEFAULT 0,
  completed_at timestamp without time zone,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  max_guesses integer NOT NULL DEFAULT 3,
  scoreboard_size integer NOT NULL DEFAULT 10,
  time_period text NOT NULL,
  user_id text,
  sources ARRAY,
  guessed_words ARRAY,
  remaining_guesses integer,
  is_completed boolean,
  CONSTRAINT games_pkey PRIMARY KEY (id),
  CONSTRAINT games_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.guesses (
  id text NOT NULL,
  word text NOT NULL,
  frequency integer NOT NULL DEFAULT 0,
  score integer NOT NULL DEFAULT 0,
  rank integer,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  game_id text NOT NULL,
  user_id text,
  CONSTRAINT guesses_pkey PRIMARY KEY (id),
  CONSTRAINT guesses_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id),
  CONSTRAINT guesses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.scraping_logs (
  id integer NOT NULL DEFAULT nextval('scraping_logs_id_seq'::regclass),
  source character varying NOT NULL,
  status character varying NOT NULL,
  articles_scraped integer,
  error_message text,
  start_time timestamp without time zone,
  end_time timestamp without time zone,
  duration_seconds double precision,
  CONSTRAINT scraping_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id text NOT NULL,
  email text NOT NULL,
  username text NOT NULL,
  average_score double precision NOT NULL DEFAULT 0,
  best_score integer NOT NULL DEFAULT 0,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_games integer NOT NULL DEFAULT 0,
  total_score integer NOT NULL DEFAULT 0,
  updated_at timestamp without time zone NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
