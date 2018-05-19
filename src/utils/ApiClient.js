import { decrypt, deriveSecretKeyBytes, encrypt, fromHex, toHex } from './shared-api/cipher';

const Messages = {
  PairingFailed: 'Pairing Failed — please try again',
  ErrorResponse: 'Response error',
  // Checking response shape (programming errors) for now. TODO: probably remove
  UnexpectedResponse: 'Unexpected Response',
};

const isRequestError = resp => (/^4/.test(resp.status));

const respError = (resp, friendlyMessage) => {
  const baseError = new Error(Messages.ErrorResponse);
  if (isRequestError(resp)) {
    // Create a user-friendly display error
    baseError.friendlyMessage = friendlyMessage;
    baseError.stack = null;
    return baseError;
  }
  if (!resp.ok) {
    return baseError;
  }
  return null;
};


/**
 *
 */
class ApiClient {
  constructor(apiUrl) {
    this.apiUrl = apiUrl.replace(/\/$/, '');
  }

  /**
   * Get a new pairing code
   * @async
   * @return {Object} data
   * @return {Object.string} data.pairingRequestId
   * @return {Object.string} data.salt
   * @throws {Error}
   */
  requestPairing() {
    return fetch(`${this.apiUrl}/devices/new`)
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(Messages.ErrorResponse);
        }
        return resp.json();
      })
      .then((json) => {
        if (!json.data || !json.data.pairingRequestId || !json.data.salt) {
          throw new Error(Messages.UnexpectedResponse);
        }
        return json.data;
      });
  }

  /**
   * Second step in pairing process
   * @param  {string} pairingCode User-entered (GUI)
   * @param  {string} pairingRequestId from the requestPairing() response
   * @param  {string} pairingRequestSalt from the requestPairing() response
   * @async
   * @return {Object} device
   * @return {string} device.id
   * @throws {Error}
   */
  confirmPairing(pairingCode, pairingRequestId, pairingRequestSalt, deviceName = '') {
    const saltBytes = fromHex(pairingRequestSalt);
    const secretBytes = deriveSecretKeyBytes(pairingCode, saltBytes);
    const secretHex = toHex(secretBytes);

    const plaintext = JSON.stringify({
      pairingRequestId,
      pairingCode,
      deviceName,
    });

    const encryptedMessage = encrypt(plaintext, secretHex);

    return fetch(`${this.apiUrl}/devices`,
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          message: encryptedMessage,
        }),
      })
      .then((resp) => {
        if (!resp.ok) { throw respError(resp, Messages.PairingFailed); }
        return resp.json();
      })
      .then(json => decrypt(json.data.message, secretHex))
      .then(JSON.parse)
      .then((decryptedData) => {
        if (!decryptedData.device || !decryptedData.device.id) {
          throw new Error(Messages.UnexpectedResponse);
        }
        return decryptedData.device;
      });
  }

  /**
   * @async
   * @return {Array} protocols
   * @throws {Error}
   */
  getProtocols() {
    return fetch(`${this.apiUrl}/protocols`)
      .then((resp) => {
        if (!resp.ok) { throw new Error(Messages.ErrorResponse); }
        return resp.json();
      })
      .then((json) => {
        if (!json || !Array.isArray(json.data)) {
          throw new Error(Messages.UnexpectedResponse);
        }
        return json.data;
      });
  }
}

export default ApiClient;