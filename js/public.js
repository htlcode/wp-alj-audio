// Audio loads on demand; only one player can play at a time.
(function () {
	'use strict';

	let activePlayer = null;

	function setupPlayer(root) {
		const source = root.getAttribute('data-audioclip-src');
		const toggleButton = root.querySelector('.audioclip_toggle');
		const panel = root.querySelector('.audioclip_panel');
		const playButton = root.querySelector('.audioclip_play');
		const speedToggle = root.querySelector('.audioclip_speed');
		const mode = root.getAttribute('data-audioclip-mode');
        let isLight = false;
        if (mode === 'light') {
            isLight = true;
        } else {
            isLight = false;
        }
        let normalRate = 1;
        let slowRate = 1;
        if (isLight === false) {
            const normalRateValue = speedToggle.getAttribute('data-audioclip-normal-rate');
            const slowRateValue = speedToggle.getAttribute('data-audioclip-slow-rate');
            normalRate = parseFloat(normalRateValue);
            slowRate = parseFloat(slowRateValue);
        }

		let audio = null;
		let rate = normalRate;
		let isOpen = false;
		let progressFrame = null;

		const player = { stop: stop };

		function updateProgress() {
			let ratio = 0;
			if (audio !== null) {
				if (audio.duration > 0) {
					ratio = audio.currentTime / audio.duration;
				}
			}
			const progressPercent = ratio * 100;
			const percent = Math.min(progressPercent, 100);
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

		function isAudioPlaying() {
			if (audio === null) {
				return false;
			}
			const isPlaying = audio.paused === false;
			return isPlaying;
		}

		function syncPlayButton() {
			const isPlaying = isAudioPlaying();
			let label = 'Lecture';
            if (isLight === true) {
                label = playButton.getAttribute('data-audioclip-label');
                if (isPlaying === true) {
                    label = 'Arrêter';
                }
                const pressedValue = String(isPlaying);
                playButton.setAttribute('aria-pressed', pressedValue);
                playButton.setAttribute('title', label);
            } else {
                if (isPlaying === true) {
                    label = 'Pause';
                }
            }
			playButton.setAttribute('aria-label', label);
			const playingValue = String(isPlaying);
			root.setAttribute('data-audioclip-playing', playingValue);
		}

		function showLoading() {
			root.setAttribute('data-audioclip-loading', 'true');
		}

		function hideLoading() {
			root.setAttribute('data-audioclip-loading', 'false');
		}

		function handleError() {
			hideLoading();
			root.setAttribute('data-audioclip-error', 'true');
			playButton.disabled = true;
			playButton.setAttribute('aria-label', 'Audio indisponible');
		}

		function getAudio() {
			if (audio !== null) {
				return audio;
			}

            audio = root.querySelector('audio');
            if (audio === null) {
                audio = new Audio(source);
            }
			audio.preservesPitch = true;
			audio.webkitPreservesPitch = true;
			audio.addEventListener('play', syncPlayButton);
            if (isLight === false) {
                audio.addEventListener('play', startProgress);
            }
			audio.addEventListener('pause', syncPlayButton);
			audio.addEventListener('ended', resetProgress);
            audio.addEventListener('ended', syncPlayButton);
			audio.addEventListener('error', handleError);
			audio.addEventListener('waiting', showLoading);
			audio.addEventListener('playing', hideLoading);
			audio.addEventListener('pause', hideLoading);
			audio.addEventListener('ended', hideLoading);

			return audio;
		}

		function play(fromStart) {
			if (activePlayer !== null) {
				if (activePlayer !== player) {
					activePlayer.stop();
				}
			}
			activePlayer = player;

			const element = getAudio();
			if (fromStart) {
				element.currentTime = 0;
			}
			element.playbackRate = rate;

			const hasEnoughData = element.readyState >= element.HAVE_FUTURE_DATA;
			if (! hasEnoughData) {
				showLoading();
			}

			const playPromise = element.play();
			playPromise.catch(function (error) {
				if (error.name !== 'AbortError') {
					handleError();
				}
			});
		}

		function setOpen(open) {
            if (isLight === true) {
                return;
            }
			isOpen = open;
			panel.hidden = !open;
			const expandedValue = String(open);
			toggleButton.setAttribute('aria-expanded', expandedValue);
		}

		function stop() {
			if (audio !== null) {
				audio.pause();
                if (isLight === true) {
                    audio.currentTime = 0;
                }
			}
			setOpen(false);
		}

        if (isLight === false) {
		toggleButton.addEventListener('click', function () {
			if (isOpen) {
				stop();
				return;
			}

			setOpen(true);
			play(true);
		});

        }

		playButton.addEventListener('click', function () {
			const isPlaying = isAudioPlaying();
            if (isLight === true) {
                if (isPlaying === true) {
                    stop();
                } else {
                    play(true);
                }
                return;
            }
			if (isPlaying === true) {
				audio.pause();
				return;
			}

			play(false);
		});

        if (isLight === false) {
		speedToggle.addEventListener('click', function () {
			const isSlow = rate === normalRate;
			rate = normalRate;
			if (isSlow) {
				rate = slowRate;
			}
			const checkedValue = String(isSlow);
			speedToggle.setAttribute('aria-checked', checkedValue);
			play(true);
		});

        }

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
