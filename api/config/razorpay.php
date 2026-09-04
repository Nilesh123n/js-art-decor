<?php
// Protected Server-Side Razorpay Keys
// CRITICAL: Secret Key MUST REMAIN ONLY on server-side PHP scripts!
define('RAZORPAY_KEY_ID', getenv('RAZORPAY_KEY_ID') ?: '');
define('RAZORPAY_KEY_SECRET', getenv('RAZORPAY_KEY_SECRET') ?: '');
?>
