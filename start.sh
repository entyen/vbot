echo 'Starting vk bot...'

	tmux new -s VKBot -d 'npm run dev'
	sleep 1
	while [ $(screen -ls | grep -c 'No Sockets found in') -ge 1 ]; do
		echo 'Waiting for 5 seconds to start server...'
		sleep 5
		tmux new -s VKBot -d 'npm run dev'
	done

echo 'VK Bot started.'
