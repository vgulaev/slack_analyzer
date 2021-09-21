SELECT mention, users.real_name, count(mention) as count_m
	FROM mentions
	join users on mentions.mention = users.id
	group by mention, users.real_name
	order by count_m desc