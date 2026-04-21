# frozen_string_literal: true

class SessionsController < InertiaController
  skip_before_action :authenticate, only: %i[ new create ]
  before_action :require_no_authentication, only: %i[ new create ]
  before_action :set_session, only: :destroy

  def new
  end

  def create
    if user = User.authenticate_by(email: params[:email], password: params[:password])
      @session = user.sessions.create!
      cookies.signed.permanent[:session_token] = {value: @session.id, httponly: true}

      if native_request?
        # Native clients can't reliably capture headers from 302 responses
        # (React Native fetch with redirect:'manual' may return opaque redirects).
        # Return a 200 JSON with the token and redirect destination instead.
        render json: {session_token: @session.id, location: dashboard_path}
        return
      end

      redirect_to dashboard_path, notice: "Signed in successfully"
    else
      if native_request?
        render json: {errors: {email: "That email or password is incorrect"}}, status: :unprocessable_entity
        return
      end

      redirect_to sign_in_path, alert: "That email or password is incorrect"
    end
  end

  def destroy
    @session.destroy!
    Current.session = nil
    redirect_to settings_sessions_path, notice: "That session has been logged out", inertia: {clear_history: true}
  end

  private

  def set_session
    @session = Current.user.sessions.find(params[:id])
  end
end
