export function isVideo(url: string | undefined | null): boolean {
  if (!url) return false;
  // Get the path part before any query strings or hashes
  const path = url.split('?')[0].split('#')[0];
  const extension = path.split('.').pop()?.toLowerCase();
  
  return ['mp4', 'webm', 'mov', 'ogg'].includes(extension || '');
}
