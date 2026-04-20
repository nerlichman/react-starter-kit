# frozen_string_literal: true

class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern, if: -> { !native_request? }

  # Native requests use Bearer tokens, not cookies — CSRF doesn't apply
  skip_forgery_protection if: -> { native_request? }

  before_action :set_current_request_details
  before_action :authenticate

  private

  def authenticate
    redirect_to sign_in_path unless perform_authentication
  end

  def require_no_authentication
    return unless perform_authentication

    flash[:notice] = "You are already signed in"
    redirect_to root_path
  end

  def perform_authentication
    Current.session ||= Session.find_by_id(cookies.signed[:session_token])
    Current.session ||= authenticate_with_bearer_token
  end

  def authenticate_with_bearer_token
    token = request.headers["Authorization"]&.delete_prefix("Bearer ")
    Session.find_by_id(token) if token.present?
  end

  def native_request?
    request.headers["X-Inertia-Native"].present?
  end

  def set_current_request_details
    Current.user_agent = request.user_agent
    Current.ip_address = request.ip
  end
end
