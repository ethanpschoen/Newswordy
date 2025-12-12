-- Function: aggregate_word_frequencies
-- Description: Aggregate word frequencies for a given time period, sources, and search term

CREATE OR REPLACE FUNCTION aggregate_word_frequencies(start_date timestamp with time zone, end_date timestamp with time zone, sources text[], search_term text)
RETURNS TABLE (word text, frequency bigint, rank bigint, articles jsonb)
LANGUAGE sql
AS $$
BEGIN
  with filtered_articles as (
    select * from filter_articles_by_criteria(start_date, end_date, sources, search_term)
  ),
  aggregated as (
    select
      aw.word,
      sum(aw.frequency) as frequency,
      jsonb_agg(
        jsonb_build_object(
          'id', fa.id,
          'url', fa.url,
          'source', fa.source,
          'headline', fa.headline,
          'published_date', fa.published_date
        )
      ) as articles
    from article_words as aw
    join filtered_articles fa on aw.article_id = fa.id
    group by aw.word
  )
  select
    word,
    frequency,
    rank() over (order by frequency desc) as rank,
    articles
  from aggregated
  order by frequency desc
END;
$$;
