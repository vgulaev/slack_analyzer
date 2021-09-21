SELECT "user", users.real_name, count(distinct mention) as count_m
	FROM mentions
	join users on mentions.user = users.id
	group by "user", users.real_name
	order by count_m desc