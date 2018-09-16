# Dan's Geocaching Reposter

## Nutshell

A WordPress plugin that streamlines the import of personal logs from GPS gaming sites into a self-hosted
[WordPress](https://wordpress.org/) installation with the IndieWeb
[Post Kinds](https://wordpress.org/plugins/indieweb-post-kinds/) plugin, as "checkins". Likely to require some
modification for compatibility with your site and theme, and probably suitable for adaptation/as a jumping-off point
for other sites/CMS platforms.

For a more in-depth examination of the concept, including screenshots and diagrams, see https://danq.me/2018/09/16/importing-geocaching-logs-into-wordpress/

## Concept

GPS games like geocaching and geohashing require that you attend specific locations on the Earth's surface (possibly
at specific times), and encourage you to post "logs" describing that attendance via siloed websites like
[geocaching.com](https://www.geocaching.com/), [wiki.xkcd.com/geohashing](http://wiki.xkcd.com/geohashing/),
[terracaching.com](https://www.terracaching.com/), or [opencache.uk](https://opencache.uk/). In accordance with
[IndieWeb](https://indieweb.org/) concepts of owning my own data, I prefer to maintain a copy of these logs on my own
domain.

The ease-of-use of the highly job-specific mobile apps commonly used to post to these silos combined with the
diversity (and mutual incompatibility) of the various silos, all of which might be used by an individual, makes
[POSSE](https://indieweb.org/POSSE) a far more-challenging task. Furthermore, many geocachers may have hundreds or even
thousands of siloed log entries going back decades, so a [PESOS](https://indieweb.org/PESOS) approach is taken.

## History

Earlier versions of this tool used automated background screen-scraping using first
[Nokogiri](http://www.nokogiri.org/) and later
[Headless Chromium](https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md). However, increased
pressure by the dominant silo against automated bots (both in the terms of use and in arbritrary interstatial checks
e.g. that the user's email is valid) have made this impractical in the long run.

The current approach, therefore, is only semi-automated. It uses a bookmarklet to inject a dynamically-generated
Javascript file into a "list of my logs" page on a geocaching silo site. This Javascript code screen-scrapes the logs,
compares them to a list of those already-imported into your WordPress installation, and provides "Import" links for
those which have not. Clicking such a link collates the necessary data for the log and transmits it to your blog, which
creates a draft post. It then opens the editor for this draft post in a new tab/window, where you can edit or publish
it.

A "universal" solution is preferable, so this approach is used even on sites that _do_ offer an API.

## Setup

You'll want the [Post Kinds plugin](https://wordpress.org/plugins/indieweb-post-kinds/) installed and activated first,
or else to reimplement in a way that doesn't expect it.

Check out the code into your plugins folder i.e. at `/wp-content/plugins/danq-geocaching-reposter/` and activate the
plugin.

When checkins are imported they'll have a number of metadata fields representing the geolocation, log and cache IDs,
etc. If you're publishing your checkins publicly you'll probably want to adapt your theme to show these; for example
on [my blog](https://danq.me/)
([example](https://danq.me/2018/07/24/dan-q-found-glwg7t19-blind-house-lacock-revisited/)), I include a header to
describe the _kind_ of checkin being viewed and a map illustrating the published location of the cache (not the actual
location in case e.g. it's a puzzle cache and I've tweaked the coordinates, in order to prevent spoilers). You can
easily do this later, though.

Click the Geocaching Reposter item in your WordPress admin menu. Drag the "Import My Finds" bookmarklet to your
bookmarks (e.g. bookmarks toolbar).

## Usage

Visit a geocaching log listing page and click the bookmark. It'll take a few seconds to run (it needs to fetch a list
of already-imported logs from your blog and run a script across the DOM of the loaded page). You can use the listing
page's own filtering tools to show only particular kinds of logs (e.g. finds) if you prefer.

Click the "Import" link adjacent to the log entry to import. After a second or two, the entire log details will be
copied into a new draft blog post (of "kind" _[checkin](https://indieweb.org/checkin)_) amd a new tab/window will be
opened to show you it.

## Compatability

Right now, the compatibility is limited to the following providers:

* Geocaching.com "my logs" pages
* Opencache.uk "my logs" pages (but it could probably be easily adapted to support other Opencache-network sites)

## Limitations

* Associated images are found, but are cross-referenced rather than imported into WordPress (it's up to you whether
  you want to do this manually or not).
* No effort is made to unify the language used by different sites, e.g. "found it" vs. "found", when importing.

## Future Development

Anticipated future developments include:

* Terracaching.com support
* Support for Geohashing (but with imports from a Geohashing wiki expedition page, as there's no uniform format
  for lists on the Geohashing wiki)
* A mechanism (probably via WordPress shortcode) to produce a centralised stats page, showing geocaching (and hashing?)
  stats from across the various platforms in a single place in the format of your choosing
* Userscript-driven (instead of, or in addition to) bookmarklet launch
* Fully-automated mode, so that (once you've logged in and passed any annoying humanity checks) you can (respectfully,
  non-server-hammering) more-easily bulk-import your finds

## License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public
License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see
[https://www.gnu.org/licenses/](https://www.gnu.org/licenses/).
