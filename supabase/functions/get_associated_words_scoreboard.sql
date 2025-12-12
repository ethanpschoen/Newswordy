-- Function: get_associated_words_scoreboard
-- Description: Get the top words scoreboard for a given time period, sources, and search term

CREATE OR REPLACE FUNCTION get_associated_words_scoreboard(start_date timestamp with time zone, end_date timestamp with time zone, search_term text, sources text[], size integer)
RETURNS TABLE (word text, frequency bigint, rank bigint, articles jsonb)
LANGUAGE sql
AS $$
BEGIN
  select word, frequency, rank, articles
  from aggregate_word_frequencies(start_date, end_date, sources, search_term)
  where lower(word) != lower(search_term)
  limit size
END;
$$;
