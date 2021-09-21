Select t1.*, channels.raw->>'num_members' as memb, (count_id + t1.sum)/CAST(channels.raw->>'num_members' as integer) from (
SELECT channel_id, channels.name, count(channel_history.id) as count_id, sum(coalesce(channel_history.reply_count, 0))
	FROM public.channel_history
	join channels on channels.id = channel_id
	group by channel_id, channels.name ) as t1
	join channels on channels.id = channel_id
	order by count_id desc