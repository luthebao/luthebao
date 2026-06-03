# Local preview only — GitHub Pages builds the site with its own pinned
# toolchain, so this file is excluded from the build (see _config.yml).
#
#   bundle install
#   bundle exec jekyll serve
#
source "https://rubygems.org"

# Matches the GitHub Pages build environment (Jekyll 3.9.x + allowlisted plugins).
gem "github-pages", group: :jekyll_plugins

# Plugins used by the theme (also provided by github-pages, listed for clarity).
group :jekyll_plugins do
  gem "jekyll-seo-tag"
  gem "jekyll-sitemap"
  gem "jekyll-feed"
end

# Windows / JRuby timezone data.
gem "tzinfo-data", platforms: [:mingw, :mswin, :x64_mingw, :jruby]
