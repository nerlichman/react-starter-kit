# frozen_string_literal: true

InertiaRails.configure do |config|
  config.version = ViteRuby.digest
  config.encrypt_history = Rails.env.production?
  config.always_include_errors_hash = true
  config.use_script_element_for_initial_page = true
  config.use_data_inertia_head_attribute = true

  config.parent_controller = "::InertiaController"
end

# Native clients can't do full-page reloads, so the Inertia version conflict
# mechanism (409 → hard reload) is meaningless and causes an infinite loop.
# Skip the version staleness check for native requests.
InertiaRails::Middleware::InertiaRailsRequest.prepend(Module.new do
  private

  def version_stale?
    return false if @env["HTTP_X_INERTIA_NATIVE"].present?
    super
  end
end)
