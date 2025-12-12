-- Function: get_comparative_words_scoreboard
-- Description: Get the comparative words scoreboard for a given time period and groups of sources

CREATE OR REPLACE FUNCTION get_comparative_words_scoreboard(start_date timestamp with time zone, end_date timestamp with time zone, sources_group_a text[], sources_group_b text[], size integer)
RETURNS TABLE (group_name text, word text, avg_percent_group_a numeric, avg_percent_group_b numeric, leaderboard_rank bigint, articles_group_a jsonb, articles_group_b jsonb)
LANGUAGE sql
AS $$
BEGIN
  select * from compare_word_rankings(
    start_date,
    end_date,
    sources_group_a,
    sources_group_b,
    null,
    size
  )
END;
$$;
