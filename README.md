# WP Audio Clip

Speaker icon shortcode that opens an inline MP3 player with slow and normal speed.

## Usage

```
[audioclip src="https://example.com/audio/sample.mp3"]
[audioclip src="https://example.com/audio/sample.mp3" label="Écouter la phrase"]
```

| Attribute | Required | Default   | Notes                                   |
|-----------|----------|-----------|-----------------------------------------|
| `src`     | yes      |           | `https` URL ending in `.mp3`            |
| `label`   | no       | `Écouter` | Accessible name of the speaker button   |

An invalid `src` (not `https`, not `.mp3`, empty) renders nothing.

## Behavior

- Clicking the speaker opens an inline panel and starts playback from the beginning.
- The panel has play/pause, `Lent` (0.7x) and `Normal` (1x). Changing speed restarts the sound.
- Pitch is preserved at every speed (`preservesPitch`).
- The `Audio` object is created on the first click: a page with many players downloads nothing until a sound is requested.
- Only one sound plays at a time.
- The play button fills yellow as the sound progresses.
- A spinner replaces the play icon while the MP3 is not yet streamable (first load, speed change, stall).
- The player keeps its own font and size inside any parent tag (headings, `strong`, `code`).

No library, no build step. Assets are enqueued only on pages that contain the shortcode.

## Audio files

The shortcode takes a URL, not a media ID: the WordPress installs have separate databases.
Upload the MP3 to the media library first, then paste its URL.

## Files

```
loader.php                          plugin header, bootstrap
app/controller/CoreController.php   shortcode, assets, markup
js/public.js                        player behavior
css/public.css                      player style
```

## Requirements

- WordPress with PHP 8.0 or later (`str_ends_with`).
- Modern browser with `HTMLMediaElement.playbackRate`.
