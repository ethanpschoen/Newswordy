-- Function: get_word_count
-- Description: Get the word count for a given time period, sources, and search term

CREATE OR REPLACE FUNCTION get_word_count(start_date timestamp with time zone, end_date timestamp with time zone, search_term text, sources text[])
RETURNS bigint
LANGUAGE sql
AS $$
BEGIN
  select count(*)
  from articles a
  where a.published_date >= start_date
    and a.published_date < end_date
    and (sources is null or source = any(sources))
    and (
      search_term is null
      or exists (
        select 1
        from article_words w
        where w.article_id = a.id
          and lower(w.word) = lower(search_term)
      )
    )
END;
$$;
