<?php
/*
Plugin Name: Dan Q's Geocaching.com Reposter
Description: Copies checkins from geocaching.com to WordPress+IndieWeb Post Kinds.
Author: Dan Q
Version: 0.5
Author URI: https://danq.me/
License: GPLv3
*/

defined( 'ABSPATH' ) or die( 'Nothing for you to see here.' );

/* Add backend menu */
add_action( 'admin_menu', 'danq_gc_reposter_menu' );
function danq_gc_reposter_menu() {
  add_menu_page('Run Geocaching Reposter', 'Geocaching Reposter', 'publish_posts', 'run-gc-reposter', 'run_gc_reposter');
}

function run_gc_reposter() {
  if($_POST['logdata']){
    $logdata = json_decode(stripslashes($_POST['logdata']), true);

    $content = $logdata['logText'];
    if($logdata['logImg'] && $logdata['logImg'] != '') $content .= "<p style=\"text-align: center\"><img src=\"" . $logdata['logImg'] . "\" /></p>";
    // Create post
    $nowtime = date('H:i');
    $post_data = array(
      'post_date'     => $logdata['date'] . ' ' . $nowtime,
      'post_date_gmt' => $logdata['date'] . ' ' . $nowtime,
      'post_content'  => $content,
      'post_title'    => $logdata['logTitle'],
      'post_status'   => 'draft',
      'tags_input'    => ['cache log', 'geocaching'],
      'tax_input'     => array( 'kind' => 'checkin' ),
      'meta_input'    => array(          'checkin_type' => $logdata['type'],
                                     'checkin_latitude' => $logdata['lat'],
                                    'checkin_longitude' => $logdata['lng'],
                                'checkin_location_name' => $logdata['gcCode'] . " " . $logdata['gcTitle'],
                          'checkin_location_short_name' => $logdata['gcCode'],
                                 'checkin_location_url' => $logdata['gcUrl'],
                         ($logdata['source'] . '_LUID') => $logdata['logId'],
                                        'imported_from' => $logdata['source']
                              )
    );
    $post_id = wp_insert_post($post_data, true);
    // Show result
    if(is_wp_error($post_id)){
      echo "<p>An error occurred importing #", " - ", $logdata['logId'], ": ", $post_id->get_error_message();
      print_r($post_data);
      echo "</p>";
    } else {
      $nextUrl = "/wp-admin/post.php?action=edit&post=" . $post_id;
      echo "<script>window.location.href = '$nextUrl';</script>";
    }
  } else {
    ?>
    <div class="wrap">
      <h2>Dan's Geocaching.com Reposter</h2>
      <p>
        Drag this bookmarklet to your bookmarks:
        <a href="javascript:(function(){let s=document.createElement('script');s.src=`<?php echo get_site_url(NULL, "/?danq_gc_js"); ?>&${new Date().getTime()}`;document.body.appendChild(s);})()">Import My Finds</a>
      </p>
      <p>
        Run it on your logs list page, e.g.:
      </p>
      <ul>
        <li><a href="https://www.geocaching.com/my/logs.aspx">https://www.geocaching.com/my/logs.aspx</a> or related pages</li>
        <li><a href="https://opencache.uk/my_logs.php">https://opencache.uk/my_logs.php</a></li>
      </ul>
    </div>
    <?php
  }
}

// If we request /?danq_gc_js, get the magic JS
add_action('template_redirect', 'danq_gc_js');
function danq_gc_js() {
  if(!isset($_GET['danq_gc_js'])) return;
  global $wpdb;
  header('Content-type: application/javascript');
  echo "(()=>{\n\n";
  $geocaching_com_logids = array_map(function($r){return $r[0];}, $wpdb->get_results("SELECT DISTINCT meta_value FROM wp_postmeta WHERE meta_key='geocaching_com_LUID'", ARRAY_N));
  $opencache_uk_logids = array_map(function($r){return $r[0];}, $wpdb->get_results("SELECT DISTINCT meta_value FROM wp_postmeta WHERE meta_key='opencache_uk_LUID'", ARRAY_N));
  echo "const wp_url='", get_site_url(NULL, "/wp-admin/admin.php?page=run-gc-reposter"), "';\n";
  echo "const geocaching_com_logids=", json_encode($geocaching_com_logids), ";\n";
  echo "const opencache_uk_logids=", json_encode($opencache_uk_logids), ";\n";
  include('bookmarklet.js');
  echo "\n})();\n";
  exit();
}


/**
 * Shortcodes
 */
function danq_gc_stats($atts, $content = null) {
  $finds_sql = <<<END_OF_SQL
    SELECT COUNT(wp_posts.ID), MIN(wp_posts.post_date), MAX(wp_posts.post_date)
    FROM wp_posts
    LEFT JOIN wp_postmeta expedition_result ON wp_posts.ID = expedition_result.post_id AND expedition_result.meta_key = 'checkin_type'
    LEFT JOIN wp_term_relationships ON wp_posts.ID = wp_term_relationships.object_id
    LEFT JOIN wp_term_taxonomy ON wp_term_relationships.term_taxonomy_id = wp_term_taxonomy.term_taxonomy_id
    LEFT JOIN wp_terms ON wp_term_taxonomy.term_id = wp_terms.term_id
    WHERE wp_posts.post_type = 'post' AND wp_posts.post_status = 'publish'
    AND wp_term_taxonomy.taxonomy = 'kind'
    AND wp_terms.slug = 'checkin'
    AND expedition_result.meta_value IN ('Found it', 'found');
END_OF_SQL;
  $finds = $GLOBALS['wpdb']->get_results($finds_sql, ARRAY_N)[0];
  $first = date('j F Y', strtotime($finds[1]));
  $last = date('j F Y', strtotime($finds[2]));

  $result = <<<END_OF_HTML
    <p>
      Geocache finds: <strong>{$finds[0]}</strong>, between {$first} and {$last}.
    </p>
END_OF_HTML;
  return $result;
}
add_shortcode('danq_gc_stats', 'danq_gc_stats');


?>