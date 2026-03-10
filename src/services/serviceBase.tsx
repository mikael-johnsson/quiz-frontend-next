export const getData = async (
  url: string,
  themesUrl: string,
  difficultiesUrl: string,
) => {
  return fetch(`${url}${themesUrl}${difficultiesUrl}`);
};

/**
 * Sends a POST request to the given URL with the provided body serialised as JSON.
 * @param url - The API endpoint to post to
 * @param body - The data to send in the request body (will be JSON.stringify'd)
 */
export const postData = async (url: string, body: unknown) => {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};
