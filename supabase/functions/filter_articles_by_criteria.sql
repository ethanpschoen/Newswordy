-- Function: filter_articles_by_criteria
-- Description: Filter articles for specified time period, sources, and search term

CREATE OR REPLACE FUNCTION filter_articles_by_criteria(start_date timestamp with time zone, end_date timestamp with time zone, sources text[], search_term text)
RETURNS TABLE (id bigint, source text, headline text, url text, published_date timestamp with time zone)
LANGUAGE sql
AS $$
BEGIN
  select id, source, headline, url, published_date
  from articles a
  where a.published_date >= start_date
    and a.published_date < end_date
    and (sources is null or a.source = any(sources))
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
