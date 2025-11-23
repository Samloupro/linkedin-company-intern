export async function validateApiKey(rawApiKey, env) {
  if (!env.AUTH_VALIDATION_WORKER) {
    console.error("[authWorkerValidation] AUTH_VALIDATION_WORKER binding not configured.");
    return { isValid: false, error: "AUTH_VALIDATION_WORKER binding not configured." };
  }

  console.log(`[authWorkerValidation] Validating API key via AUTH_VALIDATION_WORKER binding: ${rawApiKey.substring(0, 10)}...`);

  try {
    const authRequest = new Request(`https://auth-service/Authorization`, {
      method: 'GET',
      headers: {
        'Authorization': rawApiKey,
        'X-Calling-Service': 'nwita-linkedin-company' // Updated for this service
      }
    });

    const authResponse = await env.AUTH_VALIDATION_WORKER.fetch(authRequest);
    console.log(`[authWorkerValidation] Sent request to AUTH_VALIDATION_WORKER binding.`);
    console.log(`[authWorkerValidation] Auth Worker Response Status: ${authResponse.status} ${authResponse.statusText}`);

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error(`[authWorkerValidation] Auth Worker returned error: ${errorText}`);
      return {
        isValid: false,
        error: `Authorization failed: ${errorText}`
      };
    }

    const authResult = await authResponse.json();
    console.log(`[authWorkerValidation] Auth Worker Response Body: ${JSON.stringify(authResult)}`);

    if (authResult.success) {
      return { isValid: true, rawApiKey: rawApiKey, remainingRequests: authResult.remainingRequests };
    } else {
      return {
        isValid: false,
        error: authResult.message || 'Invalid API key'
      };
    }

  } catch (error) {
    console.error(`[authWorkerValidation] Error communicating with AUTH_VALIDATION_WORKER: ${error.message}`);
    return { isValid: false, error: `Failed to communicate with authentication service: ${error.message}` };
  }
}
