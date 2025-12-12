-- Function: aggregate_word_percentages
-- Description: Aggregate word percentages for a given time period, sources, and search term

CREATE OR REPLACE FUNCTION aggregate_word_percentages(start_date timestamp with time zone, end_date timestamp with time zone, sources text[], search_term text)
RETURNS TABLE (word text, frequency numeric, rank bigint, articles jsonb)
LANGUAGE sql
AS $$
BEGIN
  with filtered_articles as (
    select * from filter_articles_by_criteria(start_date, end_date, sources, search_term)
  ),
  source_totals as (
    select
      source,
      count(distinct id) as total_articles
    from filtered_articles
    group by source
  ),
  word_by_source as (
    select
      aw.word,
      fa.source,
      count(distinct fa.id) as articles_with_word,
      st.total_articles,
      (count(distinct fa.id)::numeric / st.total_articles * 100) as percent_mentioning
    from article_words as aw
    join filtered_articles fa on aw.article_id = fa.id
    join source_totals st on fa.source = st.source
    group by aw.word, fa.source, st.total_articles
  ),
  averaged_percentages as (
    select
      word,
      avg(percent_mentioning) as avg_percent
    from word_by_source
    group by word
  ),
  aggregated as (
    select
      aw.word,
      ap.avg_percent,
      jsonb_agg(
        json_build_object(
          'id', fa.id,
          'url', fa.url,
          'source', fa.source,
          'headline', fa.headline,
          'published_date', fa.published_date
        )
      ) as articles
    from article_words as aw
    join filtered_articles fa on aw.article_id = fa.id
    join averaged_percentages ap on aw.word = ap.word
    group by aw.word, ap.avg_percent
  )
  select
    word,
    avg_percent as frequency,
    rank() over (order by avg_percent desc) as rank,
    articles
  from aggregated
  order by avg_percent desc
END;
$$;
