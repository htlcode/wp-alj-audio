/**
 * [audioclip] inline MP3 player.
 *
 * The Audio object is created on the first click, so a page with many players
 * downloads nothing until the visitor asks for a sound. Only one sound plays at a time.
 */
(function () {
	'use strict';

	let activePlayer = null;

	function setupPlayer(root) {
		const source = root.getAttribute('data-audioclip-src');
		const toggleButton = root.querySelector('.audioclip_toggle');
		const panel = root.querySelector('.audioclip_panel');
		const playButton = root.querySelector('.audioclip_play');
		const speedButtons = root.querySelectorAll('.audioclip_speed');
		const initialSpeedButton = root.querySelector('.audioclip_speed[aria-pressed="true"]');
		const initialRate = initialSpeedButton.getAttribute('data-audioclip-rate');

		let audio = null;
		let rate = parseFloat(initialRate);
		let isOpen = false;
		let progressFrame = null;

		const player = { stop: stop };

		function updateProgress() {
			let ratio = 0;
			if (audio !== null && audio.duration > 0) {
				ratio = audio.currentTime / audio.duration;
			}
			const percent = Math.min(ratio * 100, 100);
			const progressValue = percent + '%';
			root.style.setProperty('--audioclip-progress', progressValue);
		}

		function trackProgress() {
			updateProgress();
			if (audio.paused) {
				progressFrame = null;
				return;
			}
			progressFrame = requestAnimationFrame(trackProgress);
		}

		function startProgress() {
			if (progressFrame !== null) {
				return;
			}
			progressFrame = requestAnimationFrame(trackProgress);
		}

		function resetProgress() {
			root.style.setProperty('--audioclip-progress', '0%');
		}

		function syncPlayButton() {
			const isPlaying = audio !== null && !audio.paused;
			let label = 'Lecture';
			if (isPlaying) {
				label = 'Pause';
			}
			playButton.setAttribute('aria-label', label);
			root.setAttribute('data-audioclip-playing', String(isPlaying));
		}

		function handleError() {
			root.setAttribute('data-audioclip-error', 'true');
			playButton.disabled = true;
			playButton.setAttribute('aria-label', 'Audio indisponible');
		}

		function getAudio() {
			if (audio !== null) {
				return audio;
			}

			audio = new Audio(source);
			audio.preservesPitch = true;
			audio.webkitPreservesPitch = true;
			audio.addEventListener('play', syncPlayButton);
			audio.addEventListener('play', startProgress);
			audio.addEventListener('pause', syncPlayButton);
			audio.addEventListener('ended', resetProgress);
			audio.addEventListener('error', handleError);

			return audio;
		}

		function play(fromStart) {
			if (activePlayer !== null && activePlayer !== player) {
				activePlayer.stop();
			}
			activePlayer = player;

			const element = getAudio();
			if (fromStart) {
				element.currentTime = 0;
			}
			element.playbackRate = rate;

			const playPromise = element.play();
			playPromise.catch(function (error) {
				if (error.name !== 'AbortError') {
					handleError();
				}
			});
		}

		function setOpen(open) {
			isOpen = open;
			panel.hidden = !open;
			toggleButton.setAttribute('aria-expanded', String(open));
		}

		function stop() {
			if (audio !== null) {
				audio.pause();
			}
			setOpen(false);
		}

		toggleButton.addEventListener('click', function () {
			if (isOpen) {
				stop();
				return;
			}

			setOpen(true);
			play(true);
		});

		playButton.addEventListener('click', function () {
			const isPlaying = audio !== null && !audio.paused;
			if (isPlaying) {
				audio.pause();
				return;
			}

			play(false);
		});

		speedButtons.forEach(function (speedButton) {
			speedButton.addEventListener('click', function () {
				const selectedRate = speedButton.getAttribute('data-audioclip-rate');
				rate = parseFloat(selectedRate);
				speedButtons.forEach(function (otherButton) {
					const isSelected = otherButton === speedButton;
					otherButton.setAttribute('aria-pressed', String(isSelected));
				});
				play(true);
			});
		});

		syncPlayButton();
	}

	function init() {
		const roots = document.querySelectorAll('.audioclip');
		roots.forEach(setupPlayer);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
