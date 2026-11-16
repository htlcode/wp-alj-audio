<?php
/*
Plugin Name: WP Audio Clip
Description: Inline MP3 players with full controls or a compact play/stop button
Version: 1.1.2
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
