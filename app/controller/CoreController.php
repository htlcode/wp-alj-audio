<?php

namespace WpAudioClip;

class CoreController
{
    private const SHORTCODE_TAG = 'audioclip';
    private const ASSET_HANDLE = 'wp-audio-clip';
    private const SOURCE_EXTENSION = '.mp3';
    private const SLOW_RATE = '0.7';
    private const NORMAL_RATE = '1';
    private const ICON_SPEAKER = '<svg class="audioclip_icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z"/></svg>';
    private const ICON_PLAY = '<svg class="audioclip_icon audioclip_icon_play" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
    private const ICON_PAUSE = '<svg class="audioclip_icon audioclip_icon_pause" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';

    private static ?CoreController $instance = null;

    public static function get_instance(): CoreController
    {
        if (self::$instance === null) {
            self::$instance = new CoreController();
        }

        return self::$instance;
    }

    public function add_hooks(): void
    {
        $shortcodeTag = self::SHORTCODE_TAG;
        $shortcodeCallback = array($this, 'render_audio');
        add_shortcode($shortcodeTag, $shortcodeCallback);

        $assetsCallback = array($this, 'register_assets');
        add_action('wp_enqueue_scripts', $assetsCallback);
    }

    public function register_assets(): void
    {
        $pluginDirectory = plugin_dir_path(WP_AUDIO_CLIP);
        $pluginUrl = plugin_dir_url(WP_AUDIO_CLIP);
        $handle = self::ASSET_HANDLE;
        $dependencies = array();

        $scriptPath = $pluginDirectory . 'js/public.js';
        $scriptUrl = $pluginUrl . 'js/public.js';
        $scriptVersion = filemtime($scriptPath);
        wp_register_script($handle, $scriptUrl, $dependencies, $scriptVersion, true);

        $stylePath = $pluginDirectory . 'css/public.css';
        $styleUrl = $pluginUrl . 'css/public.css';
        $styleVersion = filemtime($stylePath);
        wp_register_style($handle, $styleUrl, $dependencies, $styleVersion);
    }

    public function render_audio($attributes): string
    {
        $defaultAttributes = array(
            'src' => '',
            'label' => 'Écouter',
        );
        $parameters = shortcode_atts($defaultAttributes, $attributes);

        $allowedProtocols = array('https');
        $source = $parameters['src'];
        $sourceUrl = esc_url_raw($source, $allowedProtocols);
        $lowerSourceUrl = strtolower($sourceUrl);
        $hasMp3Extension = str_ends_with($lowerSourceUrl, self::SOURCE_EXTENSION);
        if (! $hasMp3Extension) {
            return '';
        }

        $handle = self::ASSET_HANDLE;
        wp_enqueue_script($handle);
        wp_enqueue_style($handle);

        $safeSourceUrl = esc_url($sourceUrl);
        $label = $parameters['label'];
        $safeLabel = esc_attr($label);
        $speakerIcon = self::ICON_SPEAKER;
        $playIcon = self::ICON_PLAY;
        $pauseIcon = self::ICON_PAUSE;
        $slowRate = self::SLOW_RATE;
        $normalRate = self::NORMAL_RATE;

        $markup = <<<HTML
        <span class="audioclip" data-audioclip-src="$safeSourceUrl">
            <button type="button" class="audioclip_toggle" aria-label="$safeLabel" title="$safeLabel" aria-expanded="false">$speakerIcon</button>
            <span class="audioclip_panel" hidden>
                <button type="button" class="audioclip_play" aria-label="Lecture">$playIcon$pauseIcon</button>
                <button type="button" class="audioclip_speed" role="switch" aria-label="Lecture lente" aria-checked="false" data-audioclip-slow-rate="$slowRate" data-audioclip-normal-rate="$normalRate">
                    <span class="audioclip_speed_label audioclip_speed_normal" aria-hidden="true">Normal</span>
                    <span class="audioclip_speed_label audioclip_speed_slow" aria-hidden="true">Lent</span>
                </button>
            </span>
        </span>
        HTML;

        return $markup;
    }
}
