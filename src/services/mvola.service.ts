import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const baseURL = process.env.MVOLA_BASE_URL;
const consumerKey = process.env.MVOLA_CONSUMER_KEY;
const consumerSecret = process.env.MVOLA_CONSUMER_SECRET;

let accessToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  const now = Date.now();

  if (accessToken && now < tokenExpiresAt) {
    return accessToken;
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    'base64',
  );

  try {
    const response = await axios.post(
      `${baseURL}/token`,
      'grant_type=client_credentials',

      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    accessToken = response.data.access_token;
    tokenExpiresAt = now + response.data.expires_in * 1000 - 60000;
    if (accessToken === null) {
      throw new Error('Access token is null');
    }
    return accessToken;
  } catch (error: any) {
    console.error(
      'Erreur getAccessToken:',
      error.response?.data || error.message,
    );
    throw new Error('Erreur d’authentification MVola');
  }
}

async function makeApiCall(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: any,
) {
  console.log('Début de makeApiCall');
  console.log('Requête vers :', `${baseURL}${path}`);
  console.log('Méthode :', method);
  if (data) {
    console.log('Données envoyées :', JSON.stringify(data, null, 2));
  }

  try {
    const token = await getAccessToken();
    console.log("Token d'accès obtenu :", token);

    const response = await axios({
      url: `${baseURL}${path}`,
      method,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Request-Id': uuidv4(),
        'X-Callback-Url': 'http://localhost:5000/api/mvola/callback',
      },
    });

    console.log('Réponse reçue:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error: any) {
    console.error('Erreur API MVola:', error.response?.data || error.message);
    throw error;
  }
}

export { getAccessToken, makeApiCall };
