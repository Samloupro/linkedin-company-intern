import { validateApiKey as validateApiKeyWithAuthService } from './authWorkerValidation.js'; // Added .js extension

export async function validateApiKey(request, env) {
  const rawApiKey = request.headers.get('Authorization')?.trim() || '';
  if (!rawApiKey) {
    return {
      error: new Response(
        JSON.stringify([{ error: 'Missing Authorization header' }]),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  const authResult = await validateApiKeyWithAuthService(rawApiKey, env);

  if (!authResult.isValid) {
    return {
      error: new Response(
        JSON.stringify([{ error: authResult.error || 'Authentication failed' }]),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }

  // Returning rawApiKey and remainingRequests if needed downstream
  return { rawApiKey, remainingRequests: authResult.remainingRequests };
}
