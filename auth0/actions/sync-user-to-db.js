/**
 * Auth0 Post-Login Action: Sync User to Database
 * ===============================================
 *
 * This action executes after every successful user login and syncs
 * MFA and email verification status to the application database.
 *
 * Purpose:
 * - Capture current MFA enrollment status for the user
 * - Capture email verification status
 * - Send updates to backend webhook for database persistence
 * - Enable admin visibility without polling Auth0 Management API
 *
 * Required Secrets (configured in Auth0 Dashboard):
 * - API_URL: Backend webhook endpoint (e.g., https://api.your-app.com/api/webhooks/auth0/user-update)
 * - API_SECRET: Webhook authentication secret (must match AUTH0_WEBHOOK_SECRET in backend)
 *
 * @param {Event} event - Auth0 event object containing user and context info
 * @param {API} api - Auth0 API object for modifying the login flow
 */
exports.onExecutePostLogin = async (event, api) => {
  const fetch = require('node-fetch');

  // Skip if secrets are not configured
  if (!event.secrets.API_URL || !event.secrets.API_SECRET) {
    console.log('Webhook secrets not configured, skipping user sync');
    return;
  }

  // Determine MFA status from authentication methods
  // event.authentication.methods contains the authentication methods used in this login
  const authMethods = event.authentication?.methods || [];
  const mfaMethod = authMethods.find(
    method => method.name === 'mfa' || method.name === 'otp',
  );

  // Check if user has MFA enrolled via multifactor array
  const enrolledFactors = event.user.multifactor || [];
  const mfaEnabled = enrolledFactors.length > 0 || !!mfaMethod;

  // Determine primary MFA type
  let mfaType = null;
  if (mfaEnabled) {
    if (enrolledFactors.length > 0) {
      // Use the first enrolled factor as primary type
      mfaType = enrolledFactors[0];
    } else if (mfaMethod) {
      mfaType = mfaMethod.name;
    }
  }

  // Prepare webhook payload
  const payload = {
    user_id: event.user.user_id,
    email: event.user.email,
    email_verified: event.user.email_verified || false,
    mfa_enabled: mfaEnabled,
    mfa_type: mfaType,
  };

  try {
    const response = await fetch(event.secrets.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': event.secrets.API_SECRET,
      },
      body: JSON.stringify(payload),
      timeout: 5000, // 5 second timeout
    });

    if (!response.ok) {
      console.log(
        `Webhook returned status ${response.status}: ${response.statusText}`,
      );
    }
  } catch (error) {
    // Log error but don't block the login flow
    console.log(`Failed to sync user to database: ${error.message}`);
  }

  // Don't block login even if webhook fails
  // The sync is best-effort and will be retried on next login
};
