export const fetcher = <T>(url: string): Promise<T> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  });
