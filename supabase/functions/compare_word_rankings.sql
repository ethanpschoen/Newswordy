-- Function: compare_word_rankings
-- Description: Compare word rankings for two groups of sources

CREATE OR REPLACE FUNCTION compare_word_rankings(start_date timestamp with time zone, end_date timestamp with time zone, sources_group_a text[], sources_group_b text[], search_term text, size integer)
RETURNS TABLE (group_name text, word text, avg_percent_group_a numeric, avg_percent_group_b numeric, leaderboard_rank bigint, articles_group_a jsonb, articles_group_b jsonb)
LANGUAGE sql
AS $$
BEGIN
  with word_ranks_a as (
    select * from aggregate_word_percentages(start_date, end_date, sources_group_a, search_term)
  ),
  word_ranks_b as (
    select * from aggregate_word_percentages(start_date, end_date, sources_group_b, search_term)
  ),
  combined_rankings as (
    select
      coalesce(a.word, b.word) as word,
      case
        when a.frequency is null then 0
        else a.frequency
      end as percent_a,
      case
        when b.frequency is null then 0
        else b.frequency
      end as percent_b,
      coalesce(a.articles, '[]'::jsonb) as articles_a,
      coalesce(b.articles, '[]'::jsonb) as articles_b
    from word_ranks_a a
    full outer join word_ranks_b b on a.word = b.word
  ),
  with_metrics as (
    select
      word,
      percent_a::numeric as avg_percent_group_a,
      percent_b::numeric as avg_percent_group_b,
      percent_b - percent_a as percent_difference,
      articles_a,
      articles_b
    from combined_rankings
  ),
  group_a_leaders as (
    select
      'Group A' as group_name,
      word,
      avg_percent_group_a,
      avg_percent_group_b,
      rank() over (order by percent_difference asc) as leaderboard_rank,
      articles_a as articles_group_a,
      articles_b as articles_group_b
    from with_metrics
    where percent_difference < 0
    order by percent_difference asc
    limit size
  ),
  group_b_leaders as (
    select
      'Group B' as group_name,
      word,
      avg_percent_group_a,
      avg_percent_group_b,
      rank() over (order by percent_difference desc) as leaderboard_rank,
      articles_a as articles_group_a,
      articles_b as articles_group_b
    from with_metrics
    where percent_difference > 0
    order by percent_difference desc
    limit size
  )
  select * from group_a_leaders
  union all
  select * from group_b_leaders
  order by group_name, leaderboard_rank
END;
$$;
