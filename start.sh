echo 'Starting vk bot...'

	screen -dmS "VKBot" npm run dev
	sleep 1
	while [ $(screen -ls | grep -c 'No Sockets found in') -ge 1 ]; do
		echo 'Waiting for 5 seconds to start server...'
		sleep 5
		screen -dmS "VKBot" npm run dev
	done

echo 'VK Bot started.'
