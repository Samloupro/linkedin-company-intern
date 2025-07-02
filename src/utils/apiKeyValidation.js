// In your worker's main file (e.g., index.js or worker.js)

// Function to validate API key with the Authorization Worker
export async function validateApiKey(request, env) {
  const rawApiKey = request.headers.get('Authorization')?.trim() || '';

  if (!rawApiKey) {
    return {
      error: new Response(
        JSON.stringify({ success: false, message: 'Missing Authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  try {
    const authWorkerUrl = env.AUTH_WORKER_URL; // Get the Authorization Worker URL from env

    if (!authWorkerUrl) {
      return {
        error: new Response(
          JSON.stringify({ success: false, message: 'Authorization Worker URL not configured' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      };
    }

    const authResponse = await fetch(`${authWorkerUrl}/Authorization`, {
      headers: {
        'Authorization': rawApiKey, // Send the key to our Authorization worker
        'X-Calling-Service': 'nwita-linkedin-company' // Identify your calling service
      }
    });

    const authResult = await authResponse.json();

    if (authResult.success) {
      // API Key is valid and credits are available
      return { isValid: true, rawApiKey: rawApiKey, remainingRequests: authResult.remainingRequests };
    } else {
      // API Key invalid or other error from Authorization Worker
      return {
        error: new Response(
          JSON.stringify({ success: false, message: authResult.message || 'Invalid API key' }),
          { status: authResponse.status || 403, headers: { 'Content-Type': 'application/json' } }
        )
      };
    }

  } catch (e) {
    console.error("Error during API key validation fetch:", e);
    return {
      error: new Response(
        JSON.stringify({ success: false, message: 'Internal server error during API key validation' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }
}
