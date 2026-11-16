# WP Audio Clip

Inline MP3 playback with a full player or a compact play/stop button.

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
- The panel has play/pause and a single segmented `Normal` (1x) / `Lent` (0.7x) toggle, with the active option framed and initially normal. Changing speed restarts the sound.
- The speed switch supports touch, Enter and Space, with its slow state exposed through `aria-checked`. Touch controls have a minimum 44px target.
- Pitch is preserved at every speed (`preservesPitch`).
- The `Audio` object is created on the first click: a page with many players downloads nothing until a sound is requested.
- Only one sound plays at a time.
- The play button fills yellow as the sound progresses.
- A spinner replaces the play icon while the MP3 is not yet streamable (first load, speed change, stall).
- The player keeps its own font and size inside any parent tag (headings, `strong`, `code`).

No library, no build step. Assets are enqueued only on pages that contain the shortcode.

## Compact player

The `audioclip-light` shortcode accepts the same `src` and `label` attributes. It renders one accessible gray button labeled `Audio`, followed by the play/stop icon inside the same button at normal speed, without a panel or speed controls. Place it next to the expression in article content, outside headings. The MP3 is exposed through a native audio element with `preload="none"` and [Schema.org `AudioObject`](https://schema.org/AudioObject) microdata (`name`, `contentUrl`, `encodingFormat`, `inLanguage`). The shared engine reuses the native element; it does not create a second audio player. Metadata describes the media and does not guarantee a search appearance. Stopping resets playback to the beginning. The compact and full players share one playback coordinator, so starting either stops the previous player. Audio is requested only after a click. Touch targets remain at least 44px.

## Checks

Run `php tests/shortcodes.php` and `node tests/playback.js`.

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
