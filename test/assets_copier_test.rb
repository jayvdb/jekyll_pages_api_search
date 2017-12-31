require_relative '../lib/jekyll_pages_api_search/assets'

require 'jekyll'
require 'fileutils'
require 'minitest/autorun'
require 'tmpdir'

module JekyllPagesApiSearch
  class DummySite
    attr_accessor :static_files

    def initialize
      @static_files = []
    end

    def config
      {}
    end

    def frontmatter_defaults
      Jekyll::FrontmatterDefaults.new(self)
    end
  end

  def self.expected_bundle_files(output_dir)
    expected = [
      File.join(Assets::JAVASCRIPT_DIR, 'search-bundle.js'),
      File.join(Assets::JAVASCRIPT_DIR, 'search-bundle.js.gz'),
      File.join('assets', 'png', 'search.png'),
      File.join('assets', 'svg', 'search.svg'),
    ]
    expected.map{|f| File.join(output_dir, f)}.sort()
  end

  class AssetsCopyToSiteTest < ::Minitest::Test
    def test_copy_to_site
      site = DummySite.new
      Assets::copy_to_site(site)

      # StaticFile.path() returns the original path of the file, not the
      # destiation path.
      assert_equal(JekyllPagesApiSearch::expected_bundle_files(Assets::SOURCE),
        site.static_files.map{|f| f.path() }.sort())
    end
  end

  class AssetsCopyToBasedirTest < ::Minitest::Test
    attr_reader :basedir

    def setup
      @basedir = Dir.mktmpdir
    end

    def teardown
      FileUtils.remove_entry self.basedir
    end

    def test_copy_to_basedir
      Assets::copy_to_basedir(self.basedir)
      assert_equal(JekyllPagesApiSearch::expected_bundle_files(self.basedir),
        Dir[File.join(self.basedir, 'assets', '**', '*.*')].sort())
    end
  end
end
