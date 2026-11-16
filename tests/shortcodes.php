<?php
use WpAudioClip\CoreController;

$shortcodes = array();
$checks = 0;
function add_shortcode($tag, $callback): void { global $shortcodes; $shortcodes[$tag] = $callback; }
function add_action($tag, $callback): void {}
function shortcode_atts($defaults, $attributes): array { return array_merge($defaults, $attributes); }
function esc_url_raw($url, $protocols): string
{
    $scheme = parse_url($url, PHP_URL_SCHEME);
    if ($scheme !== 'https') { return ''; }
    return $url;
}
function esc_url($url): string { return htmlspecialchars($url, ENT_QUOTES); }
function esc_attr($value): string { return htmlspecialchars($value, ENT_QUOTES); }
function wp_enqueue_script($handle): void {}
function wp_enqueue_style($handle): void {}
function check($actual, $expected, $label): void
{
    global $checks;
    if ($actual !== $expected) { throw new RuntimeException($label); }
    $checks++;
}
require __DIR__ . '/../app/controller/CoreController.php';
$core = CoreController::get_instance();
$core->add_hooks();
$hasLight = array_key_exists('audioclip-light', $shortcodes);
check($hasLight, true, 'Compact shortcode is registered');
$attributes = array('src' => 'https://example.test/test.mp3', 'label' => 'Écouter "bonjour"');
$light = $core->render_audio($attributes, null, 'audioclip-light');
$buttons = substr_count($light, '<button');
check($buttons, 1, 'Compact output contains exactly one button');
$hasSpeed = str_contains($light, 'audioclip_speed');
check($hasSpeed, false, 'Compact output has no speed control');
$hasPanel = str_contains($light, 'audioclip_panel');
check($hasPanel, false, 'Compact output has no panel');
$escaped = str_contains($light, '&quot;bonjour&quot;');
check($escaped, true, 'Custom label is escaped');
$pressed = str_contains($light, 'aria-pressed="false"');
check($pressed, true, 'Compact button exposes its state');
$full = $core->render_audio($attributes);
$buttons = substr_count($full, '<button');
check($buttons, 3, 'Full player retains its controls');
$hasSpeed = str_contains($full, 'audioclip_speed');
check($hasSpeed, true, 'Full player retains speed control');
$invalid = array('src' => 'http://example.test/test.mp3');
$result = $core->render_audio($invalid, null, 'audioclip-light');
check($result, '', 'Insecure source is rejected');
$invalid = array('src' => 'https://example.test/test.wav');
$result = $core->render_audio($invalid, null, 'audioclip-light');
check($result, '', 'Non-MP3 source is rejected');
$nativeAudio = str_contains($light, '<audio preload="none"');
check($nativeAudio, true, 'Compact player exposes a native audio without preloading');
$schema = str_contains($light, 'itemtype="https://schema.org/AudioObject"');
check($schema, true, 'Audio semantics identify the media object');
$media = str_contains($light, 'itemprop="contentUrl"');
check($media, true, 'MP3 URL is present in structured metadata');
$identifier = str_contains($light, 'audioclip_identifier');
check($identifier, true, 'Speaker identifier precedes the play button');
$message = $checks . " shortcode checks passed\n";
echo $message;
