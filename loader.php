<?php
/*
Plugin Name: WP Audio Clip
Description: Speaker icon shortcode that opens an inline MP3 player with slow and normal speed
Version: 1.0
*/

use WpAudioClip\CoreController;

if (! defined('ABSPATH')) {
    exit;
}

define('WP_AUDIO_CLIP', __FILE__);

$controllerPath = __DIR__ . '/app/controller/CoreController.php';
require_once $controllerPath;

$core = CoreController::get_instance();
$core->add_hooks();
